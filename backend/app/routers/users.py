from datetime import datetime, timedelta
import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from ..auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from ..config import settings
from ..database import get_db
from ..models import User, UserPresence, UserSession
from ..session_control import clear_forced_logout
from ..schemas import (
    OAuthExchangeRequest,
    OAuthStartResponse,
    AccountDeleteRequest,
    HeartbeatResponse,
    PasswordChangeRequest,
    SessionEntry,
    SessionInfoResponse,
    Token,
    UserCreate,
    UserLogin,
    UserProfileUpdate,
    UserResponse,
)

router = APIRouter()


def _ensure_provider_config(provider: str) -> tuple[str, str]:
    if provider == "google":
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google OAuth is not configured",
            )
        return settings.GOOGLE_CLIENT_ID, settings.GOOGLE_CLIENT_SECRET

    if provider == "github":
        if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub OAuth is not configured",
            )
        return settings.GITHUB_CLIENT_ID, settings.GITHUB_CLIENT_SECRET

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Unsupported OAuth provider",
    )


def _ip_scope(ip: str | None) -> str:
    if not ip:
        return "unknown"
    if ip.startswith("127.") or ip == "::1":
        return "local"
    if ip.startswith("10.") or ip.startswith("192.168.") or ip.startswith("172.16."):
        return "private-network"
    return "public"


def _record_session(db: Session, user: User, request: Request, provider: str) -> None:
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    session_entry = UserSession(
        user_id=user.id,
        auth_provider=provider,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(session_entry)
    db.commit()


def _touch_presence(db: Session, user: User, request: Request) -> UserPresence:
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    presence = db.query(UserPresence).filter(UserPresence.user_id == user.id).first()
    now = datetime.utcnow()

    if not presence:
        presence = UserPresence(
            user_id=user.id,
            last_seen_at=now,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(presence)
    else:
        presence.last_seen_at = now
        presence.ip_address = ip_address
        presence.user_agent = user_agent

    db.commit()
    db.refresh(presence)
    return presence


def _create_oauth_state(provider: str, redirect_uri: str) -> str:
    now = datetime.utcnow()
    expire = now + timedelta(minutes=settings.OAUTH_STATE_EXPIRE_MINUTES)
    payload = {
        "provider": provider,
        "redirect_uri": redirect_uri,
        "nonce": secrets.token_urlsafe(16),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _verify_oauth_state(state: str, provider: str) -> dict:
    try:
        payload = jwt.decode(state, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth state",
        ) from exc

    if payload.get("provider") != provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OAuth provider mismatch",
        )

    return payload


async def _exchange_google_code(code: str, redirect_uri: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange Google authorization code",
            )
        token_data = token_resp.json()

        user_resp = await client.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        if user_resp.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch Google user profile",
            )
        user_data = user_resp.json()

    email = user_data.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account does not provide an email address",
        )

    return {
        "email": email.lower(),
        "name": user_data.get("name") or email.split("@")[0],
    }


async def _exchange_github_code(code: str, redirect_uri: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        if token_resp.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange GitHub authorization code",
            )
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub token response is missing access_token",
            )

        user_resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_resp.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch GitHub user profile",
            )
        user_data = user_resp.json()

        email_resp = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if email_resp.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch GitHub user emails",
            )

    emails = email_resp.json()
    selected_email = next(
        (e.get("email") for e in emails if e.get("primary") and e.get("verified")),
        None,
    ) or next((e.get("email") for e in emails if e.get("verified")), None)

    if not selected_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verified email found in GitHub account",
        )

    return {
        "email": selected_email.lower(),
        "name": user_data.get("name") or user_data.get("login") or selected_email.split("@")[0],
    }


@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    db_user = User(
        name=user.name,
        email=user.email.lower(),
        hashed_password=get_password_hash(user.password),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/auth/login", response_model=Token)
async def login(request: Request, db: Session = Depends(get_db)):
    """Login user and return JWT token."""
    email = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            payload = await request.json()
            normalized_payload = {
                "email": payload.get("email") or payload.get("username"),
                "password": payload.get("password"),
            }
            login_data = UserLogin(**normalized_payload)
            email = login_data.email
            password = login_data.password
        except (ValidationError, ValueError) as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid login payload",
            ) from exc
    else:
        form = await request.form()
        email = form.get("username") or form.get("email")
        password = form.get("password")
        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Login requires username/email and password",
            )

    user = authenticate_user(db, email.lower(), password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    clear_forced_logout(user.id)
    _record_session(db, user, request, "password")
    _touch_presence(db, user, request)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/oauth/{provider}/start", response_model=OAuthStartResponse)
async def oauth_start(provider: str, redirect_uri: str | None = None):
    """Return provider auth URL for frontend redirect."""
    client_id, _ = _ensure_provider_config(provider)
    callback_uri = redirect_uri or f"{settings.FRONTEND_URL.rstrip('/')}/auth/oauth/callback"
    state = _create_oauth_state(provider, callback_uri)

    if provider == "google":
        params = urlencode(
            {
                "client_id": client_id,
                "redirect_uri": callback_uri,
                "response_type": "code",
                "scope": "openid email profile",
                "state": state,
                "access_type": "offline",
                "prompt": "consent",
            }
        )
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{params}"
    else:
        params = urlencode(
            {
                "client_id": client_id,
                "redirect_uri": callback_uri,
                "scope": "read:user user:email",
                "state": state,
            }
        )
        auth_url = f"https://github.com/login/oauth/authorize?{params}"

    return {"auth_url": auth_url}


@router.post("/auth/oauth/{provider}/exchange", response_model=Token)
async def oauth_exchange(
    provider: str,
    payload: OAuthExchangeRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Exchange provider code for app JWT."""
    _ensure_provider_config(provider)
    state_payload = _verify_oauth_state(payload.state, provider)

    redirect_uri = payload.redirect_uri or state_payload.get("redirect_uri")
    if not redirect_uri:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing redirect_uri for OAuth exchange",
        )
    if redirect_uri != state_payload.get("redirect_uri"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="redirect_uri does not match original OAuth state",
        )

    if provider == "google":
        profile = await _exchange_google_code(payload.code, redirect_uri)
    else:
        profile = await _exchange_github_code(payload.code, redirect_uri)

    if profile["email"] in settings.get_admin_emails():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts must use admin username/password login",
        )

    user = db.query(User).filter(User.email == profile["email"]).first()
    if not user:
        user = User(
            name=profile["name"],
            email=profile["email"],
            hashed_password=get_password_hash(secrets.token_urlsafe(32)),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    clear_forced_logout(user.id)
    _record_session(db, user, request, provider)
    _touch_presence(db, user, request)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information."""
    return current_user


@router.get("/users/me", response_model=UserResponse)
async def get_current_user_info_alias(current_user: User = Depends(get_current_user)):
    """Compatibility alias for /auth/me."""
    return current_user


@router.put("/users/privacy-settings", response_model=UserResponse)
async def update_privacy_settings(
    data_sharing: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user privacy settings."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.data_sharing_consent = data_sharing
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/heartbeat", response_model=HeartbeatResponse)
async def user_heartbeat(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Refresh user online presence timestamp."""
    presence = _touch_presence(db, current_user, request)
    return {
        "status": "ok",
        "last_seen_at": presence.last_seen_at,
        "ip_address": presence.ip_address,
    }


@router.get("/users/session-info", response_model=SessionInfoResponse)
async def get_session_info(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get recent login/session information for the current user."""
    sessions = (
        db.query(UserSession)
        .filter(UserSession.user_id == current_user.id)
        .order_by(UserSession.created_at.desc())
        .limit(10)
        .all()
    )

    current_ip = request.client.host if request.client else None
    current_ua = request.headers.get("user-agent")
    return {
        "current_ip": current_ip,
        "current_user_agent": current_ua,
        "current_ip_scope": _ip_scope(current_ip),
        "recent_sessions": [
            SessionEntry(
                created_at=s.created_at,
                ip_address=s.ip_address,
                user_agent=s.user_agent,
                auth_provider=s.auth_provider,
            )
            for s in sessions
        ],
    }


@router.put("/users/me", response_model=UserResponse)
async def update_current_user(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user profile fields."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if payload.name is not None:
        clean_name = payload.name.strip()
        if not clean_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name cannot be empty",
            )
        user.name = clean_name

    if payload.data_sharing_consent is not None:
        user.data_sharing_consent = payload.data_sharing_consent

    db.commit()
    db.refresh(user)
    return user


@router.put("/users/password")
async def change_password(
    payload: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change current user password."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect",
        )

    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password",
        )

    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()

    return {"message": "Password updated successfully"}


@router.delete("/users/me")
async def delete_current_user(
    payload: AccountDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete current user account and all related data."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if payload.confirmation_text.strip() != "DELETE MY ACCOUNT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Type "DELETE MY ACCOUNT" to confirm account deletion',
        )

    latest_session = (
        db.query(UserSession)
        .filter(UserSession.user_id == user.id)
        .order_by(UserSession.created_at.desc())
        .first()
    )
    now = datetime.utcnow()
    has_recent_reauth = (
        latest_session is not None
        and (now - latest_session.created_at)
        <= timedelta(minutes=settings.DELETE_REAUTH_MAX_AGE_MINUTES)
    )

    if not has_recent_reauth:
        if not payload.current_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "Please re-authenticate before deleting account: "
                    "log in again or provide current password."
                ),
            )
        if not verify_password(payload.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect",
            )

    db.delete(user)
    db.commit()
    return {"message": "Account deleted successfully"}
