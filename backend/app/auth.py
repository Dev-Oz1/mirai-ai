from datetime import datetime, timedelta
import logging
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import User
from .session_control import is_user_forced_logged_out
from .schemas import TokenData

# Password hashing context:
# - bcrypt_sha256 avoids bcrypt's 72-byte input limit for new hashes
# - bcrypt remains for verifying existing hashes already stored in DB
pwd_context = CryptContext(schemes=["bcrypt_sha256", "bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError as exc:
        # Compatibility fallback for legacy bcrypt hashes with >72-byte input.
        if "longer than 72 bytes" in str(exc):
            try:
                return pwd_context.verify(_truncate_password_for_bcrypt(plain_password), hashed_password)
            except Exception as fallback_exc:
                logger.error("Password verification fallback error: %s", fallback_exc)
                return False
        logger.error("Password verification error: %s", exc)
        return False
    except Exception as exc:
        logger.error("Password verification error: %s", exc)
        return False


def get_password_hash(password: str) -> str:
    """Hash a plain password."""
    try:
        return pwd_context.hash(password)
    except Exception as exc:
        logger.error("Password hashing error: %s", exc)
        raise


def _truncate_password_for_bcrypt(password: str) -> str:
    """Bcrypt only uses first 72 bytes; trim safely when over limit."""
    encoded = password.encode("utf-8")
    if len(encoded) <= 72:
        return password

    # Slice bytes and decode safely to avoid cutting in the middle of UTF-8 codepoint.
    truncated = encoded[:72]
    while truncated:
        try:
            return truncated.decode("utf-8")
        except UnicodeDecodeError:
            truncated = truncated[:-1]

    return ""


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def authenticate_user(db: Session, email: str, password: str):
    """Authenticate a user by email and password."""
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return False

    if not verify_password(password, user.hashed_password):
        return False

    return user


async def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception

        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == token_data.email).first()

    if user is None:
        raise credentials_exception
    if is_user_forced_logged_out(user.id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session was ended by admin. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_admin(token: str = Depends(oauth2_scheme)) -> dict:
    """Validate that the provided token is an admin token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Admin authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
    except JWTError:
        raise credentials_exception

    if payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    admin_username = payload.get("admin_username")
    if not admin_username:
        raise credentials_exception

    return payload
