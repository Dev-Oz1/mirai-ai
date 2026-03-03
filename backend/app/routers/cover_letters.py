from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Job, CoverLetter
from ..schemas import CoverLetterCreate, CoverLetterUpdate, CoverLetterResponse, CoverLetterGenerateRequest
from ..auth import get_current_user
from ..services.ai_service import AIService  # ADD THIS IMPORT

router = APIRouter()


@router.post("/cover-letters", response_model=CoverLetterResponse, status_code=status.HTTP_201_CREATED)
async def create_cover_letter(
        cover_letter: CoverLetterCreate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Create a new cover letter"""

    # Verify job belongs to user if job_id provided
    if cover_letter.job_id:
        job = db.query(Job).filter(
            Job.id == cover_letter.job_id,
            Job.user_id == current_user.id
        ).first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )

    db_cover_letter = CoverLetter(
        **cover_letter.dict(),
        user_id=current_user.id
    )

    db.add(db_cover_letter)
    db.commit()
    db.refresh(db_cover_letter)

    return db_cover_letter


@router.get("/cover-letters", response_model=List[CoverLetterResponse])
async def get_cover_letters(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
        skip: int = 0,
        limit: int = 100
):
    """Get all cover letters for current user"""
    cover_letters = db.query(CoverLetter).filter(
        CoverLetter.user_id == current_user.id
    ).offset(skip).limit(limit).all()

    return cover_letters


@router.get("/cover-letters/{cover_letter_id}", response_model=CoverLetterResponse)
async def get_cover_letter(
        cover_letter_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get specific cover letter"""
    cover_letter = db.query(CoverLetter).filter(
        CoverLetter.id == cover_letter_id,
        CoverLetter.user_id == current_user.id
    ).first()

    if not cover_letter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cover letter not found"
        )

    return cover_letter


@router.put("/cover-letters/{cover_letter_id}", response_model=CoverLetterResponse)
async def update_cover_letter(
        cover_letter_id: int,
        cover_letter_update: CoverLetterUpdate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Update cover letter"""
    cover_letter = db.query(CoverLetter).filter(
        CoverLetter.id == cover_letter_id,
        CoverLetter.user_id == current_user.id
    ).first()

    if not cover_letter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cover letter not found"
        )

    update_data = cover_letter_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cover_letter, field, value)

    db.commit()
    db.refresh(cover_letter)

    return cover_letter


@router.delete("/cover-letters/{cover_letter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cover_letter(
        cover_letter_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Delete cover letter"""
    cover_letter = db.query(CoverLetter).filter(
        CoverLetter.id == cover_letter_id,
        CoverLetter.user_id == current_user.id
    ).first()

    if not cover_letter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cover letter not found"
        )

    db.delete(cover_letter)
    db.commit()

    return None


@router.post("/cover-letters/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(
        request: CoverLetterGenerateRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Generate AI cover letter for a job"""

    print(f"🎯 Generating cover letter for job_id: {request.job_id}")

    # Get job details
    job = db.query(Job).filter(
        Job.id == request.job_id,
        Job.user_id == current_user.id
    ).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    print(f"📝 Job: {job.position} at {job.company_name}")

    # Build the prompt
    tone_instructions = {
        "professional": "Use a professional, confident tone. Be clear and direct.",
        "enthusiastic": "Use an enthusiastic, energetic tone. Show genuine excitement.",
        "formal": "Use a formal, traditional business tone. Be respectful and conservative.",
        "creative": "Use a creative, unique tone. Stand out while remaining professional."
    }

    prompt = f"""Write a compelling cover letter for this job application:

Job Details:
- Company: {job.company_name}
- Position: {job.position}
- Location: {job.location or 'Not specified'}
- Salary Range: {job.salary_range or 'Not specified'}

Job Description:
{job.job_description or 'No description provided'}

Applicant:
- Name: {current_user.name}

Additional Information:
{request.additional_info or 'None provided'}

Instructions:
- Tone: {tone_instructions.get(request.tone.value, tone_instructions['professional'])}
- Length: 300-400 words
- Include: Strong opening, relevant skills/experience connection, enthusiasm for role, clear call to action
- Format: Professional business letter format
- Do NOT include placeholder text like [Your Experience] - be specific but general enough to be customizable
- Start with "Dear Hiring Manager,"
- End with "Sincerely,\n{current_user.name}"

Write the complete cover letter now:"""

    try:
        print(f"🤖 Starting AI generation with tone: {request.tone.value}")

        # Call AI service (uses Ollama with gemma2:2b)
        generated_content = AIService.generate_text(
            prompt=prompt,
            max_tokens=1500,
            temperature=0.7,
            use_premium=current_user.is_premium
        )

        print(f"✅ Generated cover letter: {len(generated_content)} characters")

    except Exception as e:
        print(f"❌ AI generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate cover letter: {str(e)}"
        )

    # Create cover letter in database
    db_cover_letter = CoverLetter(
        user_id=current_user.id,
        job_id=job.id,
        title=f"Cover Letter - {job.company_name} {job.position}",
        content=generated_content,
        tone=request.tone.value
    )

    db.add(db_cover_letter)
    db.commit()
    db.refresh(db_cover_letter)

    print(f"💾 Saved cover letter with ID: {db_cover_letter.id}")

    return db_cover_letter