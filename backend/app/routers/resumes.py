from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime

from ..database import get_db
from ..models import User, Resume
from ..schemas import ResumeResponse, ResumeUpdate
from ..auth import get_current_user

router = APIRouter()

# Create uploads directory
UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/resumes/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
        file: UploadFile = File(...),
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Upload a resume file"""

    # Validate file type
    allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                     "text/plain"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOCX, and TXT files are allowed"
        )

    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{current_user.id}_{timestamp}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Determine file type
    file_type_map = {
        "application/pdf": "pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "text/plain": "txt"
    }
    file_type = file_type_map.get(file.content_type, "unknown")

    # Parse resume text (basic implementation)
    parsed_text = None
    try:
        if file_type == "txt":
            with open(file_path, "r", encoding="utf-8") as f:
                parsed_text = f.read()
        # TODO: Add PDF and DOCX parsing
    except Exception as e:
        print(f"Failed to parse resume: {e}")

    # Create resume record
    db_resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_type=file_type,
        parsed_text=parsed_text,
        is_primary=False
    )

    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    return db_resume


@router.get("/resumes", response_model=List[ResumeResponse])
async def get_resumes(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get all resumes for current user"""
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).all()

    return resumes


@router.get("/resumes/{resume_id}", response_model=ResumeResponse)
async def get_resume(
        resume_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get specific resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    return resume


@router.put("/resumes/{resume_id}", response_model=ResumeResponse)
async def update_resume(
        resume_id: int,
        resume_update: ResumeUpdate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Update resume (e.g., set as primary)"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    # If setting as primary, unset other primary resumes
    if resume_update.is_primary:
        db.query(Resume).filter(
            Resume.user_id == current_user.id
        ).update({"is_primary": False})

    update_data = resume_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resume, field, value)

    db.commit()
    db.refresh(resume)

    return resume


@router.delete("/resumes/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
        resume_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Delete resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )

    # Delete file
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)

    db.delete(resume)
    db.commit()

    return None