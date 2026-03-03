from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from ..auth import create_access_token, get_current_admin
from ..config import settings
from ..database import get_db
from ..models import AdminAuditLog, CoverLetter, Job, Resume, User, UserPresence, UserSession
from ..session_control import mark_user_for_forced_logout, mark_users_for_forced_logout
from ..schemas import (
    AdminAuditLogsResponse,
    AdminForceLogoutAllResponse,
    AdminForceLogoutResponse,
    AdminLoginRequest,
    AdminDeleteUserResponse,
    AdminSummaryResponse,
    AdminUserListEntry,
    AdminUsersResponse,
    AdminUserSessionsResponse,
    SessionEntry,
    Token,
)

router = APIRouter()


def _assert_admin_auth_config() -> None:
    if not settings.ADMIN_USERNAME or not settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin authentication is not configured",
        )


def _ip_scope(ip: str | None) -> str:
    if not ip:
        return "unknown"
    if ip.startswith("127.") or ip == "::1":
        return "local"
    if ip.startswith("10.") or ip.startswith("192.168.") or ip.startswith("172.16."):
        return "private-network"
    return "public"


def _write_audit_log(
    db: Session,
    request: Request,
    admin_username: str,
    action: str,
    target_user_id: int | None = None,
    target_user_email: str | None = None,
    details: str | None = None,
) -> None:
    entry = AdminAuditLog(
        admin_username=admin_username,
        action=action,
        target_user_id=target_user_id,
        target_user_email=target_user_email,
        request_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        details=details,
    )
    db.add(entry)
    db.commit()


@router.post("/admin/auth/login", response_model=Token)
async def admin_login(payload: AdminLoginRequest, request: Request, db: Session = Depends(get_db)):
    """Login for admin console using dedicated username/password."""
    _assert_admin_auth_config()

    if (
        payload.username != settings.ADMIN_USERNAME
        or payload.password != settings.ADMIN_PASSWORD
    ):
        # Log failed admin login attempts for visibility.
        _write_audit_log(
            db,
            request,
            admin_username=payload.username,
            action="admin_login_failed",
            details="Invalid admin credentials",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
        )

    access_token = create_access_token(
        data={
            "role": "admin",
            "admin_username": settings.ADMIN_USERNAME,
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    _write_audit_log(
        db,
        request,
        admin_username=settings.ADMIN_USERNAME,
        action="admin_login_success",
        details="Admin logged in successfully",
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/admin/summary", response_model=AdminSummaryResponse)
async def admin_summary(
    request: Request,
    admin_payload: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Admin dashboard summary metrics and recent users."""

    users_count = db.query(func.count(User.id)).scalar() or 0
    jobs_count = db.query(func.count(Job.id)).scalar() or 0
    cover_letters_count = db.query(func.count(CoverLetter.id)).scalar() or 0
    resumes_count = db.query(func.count(Resume.id)).scalar() or 0

    since = datetime.utcnow() - timedelta(hours=24)
    sessions_last_24h = (
        db.query(func.count(UserSession.id))
        .filter(UserSession.created_at >= since)
        .scalar()
        or 0
    )

    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()
    _write_audit_log(
        db,
        request,
        admin_username=admin_payload.get("admin_username", "unknown"),
        action="view_admin_summary",
    )

    return {
        "users_count": users_count,
        "jobs_count": jobs_count,
        "cover_letters_count": cover_letters_count,
        "resumes_count": resumes_count,
        "sessions_last_24h": sessions_last_24h,
        "recent_users": recent_users,
    }


@router.get("/admin/users", response_model=AdminUsersResponse)
async def list_users_for_admin(
    request: Request,
    search: str | None = Query(default=None, max_length=120),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    admin_payload: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List users with latest session/IP information for admin management."""

    base_query = db.query(User)
    if search:
        pattern = f"%{search.lower()}%"
        base_query = base_query.filter(
            or_(
                func.lower(User.name).like(pattern),
                func.lower(User.email).like(pattern),
            )
        )

    total_users = base_query.count()
    users = (
        base_query.order_by(User.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    if not users:
        return {"total_users": total_users, "active_users": 0, "users": []}

    user_ids = [u.id for u in users]
    latest_subquery = (
        db.query(
            UserSession.user_id.label("user_id"),
            func.max(UserSession.created_at).label("latest_login_at"),
        )
        .filter(UserSession.user_id.in_(user_ids))
        .group_by(UserSession.user_id)
        .subquery()
    )

    latest_sessions = (
        db.query(UserSession)
        .join(
            latest_subquery,
            and_(
                UserSession.user_id == latest_subquery.c.user_id,
                UserSession.created_at == latest_subquery.c.latest_login_at,
            ),
        )
        .all()
    )
    latest_by_user = {session.user_id: session for session in latest_sessions}

    active_threshold = datetime.utcnow() - timedelta(
        seconds=settings.ONLINE_HEARTBEAT_WINDOW_SECONDS
    )
    presence_rows = (
        db.query(UserPresence)
        .filter(UserPresence.user_id.in_(user_ids))
        .all()
    )
    presence_by_user = {p.user_id: p for p in presence_rows}
    active_users = (
        db.query(func.count(UserPresence.id))
        .filter(UserPresence.last_seen_at >= active_threshold)
        .scalar()
        or 0
    )
    response_users: list[AdminUserListEntry] = []

    for user in users:
        latest = latest_by_user.get(user.id)
        presence = presence_by_user.get(user.id)
        is_online = bool(presence and presence.last_seen_at >= active_threshold)

        response_users.append(
            AdminUserListEntry(
                id=user.id,
                name=user.name,
                email=user.email,
                created_at=user.created_at,
                data_sharing_consent=user.data_sharing_consent,
                latest_login_at=latest.created_at if latest else None,
                latest_login_ip=latest.ip_address if latest else None,
                latest_login_ip_scope=_ip_scope(latest.ip_address if latest else None),
                latest_auth_provider=latest.auth_provider if latest else None,
                is_currently_logged_in=is_online,
                is_currently_online=is_online,
                last_seen_at=presence.last_seen_at if presence else None,
            )
        )

    _write_audit_log(
        db,
        request,
        admin_username=admin_payload.get("admin_username", "unknown"),
        action="view_admin_users",
        details=f"search={search or ''}, limit={limit}, offset={offset}",
    )

    return {
        "total_users": total_users,
        "active_users": active_users,
        "users": response_users,
    }


@router.get("/admin/users/{user_id}/sessions", response_model=AdminUserSessionsResponse)
async def admin_get_user_sessions(
    request: Request,
    user_id: int,
    limit: int = Query(default=30, ge=1, le=100),
    admin_payload: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get recent sessions for a specific user."""

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    sessions = (
        db.query(UserSession)
        .filter(UserSession.user_id == user.id)
        .order_by(UserSession.created_at.desc())
        .limit(limit)
        .all()
    )
    _write_audit_log(
        db,
        request,
        admin_username=admin_payload.get("admin_username", "unknown"),
        action="view_user_sessions",
        target_user_id=user.id,
        target_user_email=user.email,
        details=f"limit={limit}",
    )

    return {
        "user": user,
        "total_sessions": len(sessions),
        "sessions": [
            SessionEntry(
                created_at=s.created_at,
                ip_address=s.ip_address,
                user_agent=s.user_agent,
                auth_provider=s.auth_provider,
            )
            for s in sessions
        ],
    }


@router.delete("/admin/users/{user_id}", response_model=AdminDeleteUserResponse)
async def admin_delete_user(
    user_id: int,
    request: Request,
    admin_payload: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Delete a user account as admin."""

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    deleted_user_id = user.id
    deleted_email = user.email
    db.delete(user)
    db.commit()
    _write_audit_log(
        db,
        request,
        admin_username=admin_payload.get("admin_username", "unknown"),
        action="delete_user",
        target_user_id=deleted_user_id,
        target_user_email=deleted_email,
    )
    return {
        "message": "User deleted successfully",
        "deleted_user_id": deleted_user_id,
    }


@router.post("/admin/users/force-logout-all", response_model=AdminForceLogoutAllResponse)
async def admin_force_logout_all_users(
    request: Request,
    admin_payload: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Force logout all users across active sessions."""
    user_ids = [row[0] for row in db.query(User.id).all()]
    if user_ids:
        mark_users_for_forced_logout(user_ids)
        db.query(UserPresence).delete()
        db.commit()

    _write_audit_log(
        db,
        request,
        admin_username=admin_payload.get("admin_username", "unknown"),
        action="force_logout_all_users",
        details=f"affected_users={len(user_ids)}",
    )
    return {
        "message": "All users have been logged out and must sign in again",
        "affected_users": len(user_ids),
    }


@router.post("/admin/users/{user_id}/force-logout", response_model=AdminForceLogoutResponse)
async def admin_force_logout_user(
    user_id: int,
    request: Request,
    admin_payload: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Force logout a user across active sessions."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    mark_user_for_forced_logout(user.id)
    presence = db.query(UserPresence).filter(UserPresence.user_id == user.id).first()
    if presence:
        db.delete(presence)
        db.commit()

    _write_audit_log(
        db,
        request,
        admin_username=admin_payload.get("admin_username", "unknown"),
        action="force_logout_user",
        target_user_id=user.id,
        target_user_email=user.email,
    )
    return {
        "message": "User has been logged out and must sign in again",
        "user_id": user.id,
    }


@router.get("/admin/audit-logs", response_model=AdminAuditLogsResponse)
async def get_admin_audit_logs(
    request: Request,
    admin_payload: dict = Depends(get_current_admin),
    limit: int = Query(default=100, ge=1, le=500),
    action: str | None = Query(default=None, max_length=80),
    db: Session = Depends(get_db),
):
    """Get recent admin audit logs."""
    logs_query = db.query(AdminAuditLog)
    if action:
        logs_query = logs_query.filter(AdminAuditLog.action == action)

    total_logs = logs_query.count()
    logs = logs_query.order_by(AdminAuditLog.created_at.desc()).limit(limit).all()

    _write_audit_log(
        db,
        request,
        admin_username=admin_payload.get("admin_username", "unknown"),
        action="view_audit_logs",
        details=f"limit={limit}, action={action or ''}",
    )

    return {
        "total_logs": total_logs,
        "logs": logs,
    }
