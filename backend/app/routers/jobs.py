from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Job
from ..schemas import JobCreate, JobUpdate, JobResponse
from ..auth import get_current_user

router = APIRouter()


@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
        job: JobCreate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    Create a new job application to track
    """
    db_job = Job(
        **job.dict(),
        user_id=current_user.id
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    return db_job


@router.get("/jobs", response_model=List[JobResponse])
async def get_jobs(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
        skip: int = 0,
        limit: int = 100
):
    """
    Get all jobs for the current user
    """
    jobs = db.query(Job).filter(Job.user_id == current_user.id).offset(skip).limit(limit).all()
    return jobs


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(
        job_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    Get a specific job by ID
    """
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    return job


@router.put("/jobs/{job_id}", response_model=JobResponse)
async def update_job(
        job_id: int,
        job_update: JobUpdate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    Update a job application
    """
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Update only provided fields
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    return job


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
        job_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    Delete a job application
    """
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    db.delete(job)
    db.commit()

    return None
