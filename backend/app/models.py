from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    data_sharing_consent = Column(Boolean, default=False)

    # Subscription - ADD THESE LINES
    is_premium = Column(Boolean, default=False)
    premium_expires_at = Column(DateTime, nullable=True)

    # Relationships
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    presence = relationship("UserPresence", back_populates="user", cascade="all, delete-orphan", uselist=False)

# Job Model
class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Job Details
    company_name = Column(String, nullable=False)
    position = Column(String, nullable=False)
    job_description = Column(Text, nullable=True)
    job_url = Column(String, nullable=True)
    location = Column(String, nullable=True)
    salary_range = Column(String, nullable=True)

    # Application Status
    status = Column(String, default="saved")

    # Dates
    applied_date = Column(DateTime, nullable=True)
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Notes
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="jobs")
    cover_letters = relationship("CoverLetter", back_populates="job", cascade="all, delete-orphan")


# Cover Letter Model
class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)

    # Content
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)

    # Settings
    tone = Column(String, default="professional")  # professional, enthusiastic, formal, creative

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="cover_letters")
    job = relationship("Job", back_populates="cover_letters")


# Resume Model
class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # File Info
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, docx, txt

    # Parsed Content
    parsed_text = Column(Text, nullable=True)

    # Metadata
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")


# Market Insight Model (for caching salary/skills data)
class MarketInsight(Base):
    __tablename__ = "market_insights"

    id = Column(Integer, primary_key=True, index=True)

    # Insight Type
    insight_type = Column(String, nullable=False)  # salary, skills, trends

    # Data
    position = Column(String, nullable=True)
    location = Column(String, nullable=True)
    data = Column(Text, nullable=False)  # JSON data

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    auth_provider = Column(String, nullable=False, default="password")
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="sessions")


class UserPresence(Base):
    __tablename__ = "user_presence"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow, index=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="presence")


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_username = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    target_user_email = Column(String, nullable=True, index=True)
    request_ip = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
