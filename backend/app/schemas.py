from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# Enums
class JobStatus(str, Enum):
    SAVED = "saved"
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ToneType(str, Enum):
    PROFESSIONAL = "professional"
    ENTHUSIASTIC = "enthusiastic"
    FORMAL = "formal"
    CREATIVE = "creative"


class DocumentType(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"


# ============================================
# USER SCHEMAS
# ============================================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    data_sharing_consent: bool = False

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class OAuthStartResponse(BaseModel):
    auth_url: str


class OAuthExchangeRequest(BaseModel):
    code: str
    state: str
    redirect_uri: Optional[str] = None


class TokenData(BaseModel):
    email: Optional[str] = None


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    data_sharing_consent: Optional[bool] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class AccountDeleteRequest(BaseModel):
    confirmation_text: str
    current_password: Optional[str] = None


class SessionEntry(BaseModel):
    created_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    auth_provider: str


class SessionInfoResponse(BaseModel):
    current_ip: Optional[str] = None
    current_user_agent: Optional[str] = None
    current_ip_scope: str = "unknown"
    recent_sessions: list[SessionEntry] = []


class HeartbeatResponse(BaseModel):
    status: str
    last_seen_at: datetime
    ip_address: Optional[str] = None


class AdminSummaryResponse(BaseModel):
    users_count: int
    jobs_count: int
    cover_letters_count: int
    resumes_count: int
    sessions_last_24h: int
    recent_users: list[UserResponse] = []


class AdminUserListEntry(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    data_sharing_consent: bool = False
    latest_login_at: Optional[datetime] = None
    latest_login_ip: Optional[str] = None
    latest_login_ip_scope: str = "unknown"
    latest_auth_provider: Optional[str] = None
    is_currently_logged_in: bool = False
    is_currently_online: bool = False
    last_seen_at: Optional[datetime] = None


class AdminUsersResponse(BaseModel):
    total_users: int
    active_users: int
    users: list[AdminUserListEntry] = []


class AdminUserSessionsResponse(BaseModel):
    user: UserResponse
    total_sessions: int
    sessions: list[SessionEntry] = []


class AdminDeleteUserResponse(BaseModel):
    message: str
    deleted_user_id: int


class AdminForceLogoutResponse(BaseModel):
    message: str
    user_id: int


class AdminForceLogoutAllResponse(BaseModel):
    message: str
    affected_users: int


class AdminAuditLogEntry(BaseModel):
    id: int
    admin_username: str
    action: str
    target_user_id: Optional[int] = None
    target_user_email: Optional[str] = None
    request_ip: Optional[str] = None
    user_agent: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AdminAuditLogsResponse(BaseModel):
    total_logs: int
    logs: list[AdminAuditLogEntry] = []


# ============================================
# JOB SCHEMAS
# ============================================

class JobCreate(BaseModel):
    company_name: str
    position: str
    job_description: Optional[str] = None
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    status: JobStatus = JobStatus.SAVED
    applied_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    notes: Optional[str] = None


class JobUpdate(BaseModel):
    company_name: Optional[str] = None
    position: Optional[str] = None
    job_description: Optional[str] = None
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    status: Optional[JobStatus] = None
    applied_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    notes: Optional[str] = None


class JobResponse(BaseModel):
    id: int
    user_id: int
    company_name: str
    position: str
    job_description: Optional[str] = None
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    status: str
    applied_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================
# COVER LETTER SCHEMAS
# ============================================

class CoverLetterCreate(BaseModel):
    job_id: Optional[int] = None
    title: str
    content: str
    tone: ToneType = ToneType.PROFESSIONAL


class CoverLetterUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tone: Optional[ToneType] = None


class CoverLetterResponse(BaseModel):
    id: int
    user_id: int
    job_id: Optional[int] = None
    title: str
    content: str
    tone: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CoverLetterGenerateRequest(BaseModel):
    job_id: int
    tone: ToneType = ToneType.PROFESSIONAL
    additional_info: Optional[str] = None


# ============================================
# RESUME SCHEMAS
# ============================================

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_type: str
    parsed_text: Optional[str] = None
    is_primary: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumeUpdate(BaseModel):
    is_primary: Optional[bool] = None


# ============================================
# MARKET INSIGHTS SCHEMAS
# ============================================

class SalaryInsightRequest(BaseModel):
    position: str
    location: Optional[str] = None


class SkillsInsightRequest(BaseModel):
    position: str


class MarketInsightResponse(BaseModel):
    insight_type: str
    position: Optional[str] = None
    location: Optional[str] = None
    data: dict
    created_at: datetime

    class Config:
        from_attributes = True
