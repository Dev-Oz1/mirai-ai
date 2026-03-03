from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, MarketInsight
from ..schemas import SalaryInsightRequest, SkillsInsightRequest, MarketInsightResponse
from ..auth import get_current_user

router = APIRouter()


@router.post("/market-insights/salary", response_model=MarketInsightResponse)
async def get_salary_insights(
        request: SalaryInsightRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get salary insights for a position"""

    # Check cache first
    cache_key = f"{request.position}_{request.location or 'global'}"
    cached = db.query(MarketInsight).filter(
        MarketInsight.insight_type == "salary",
        MarketInsight.position == request.position,
        MarketInsight.location == request.location,
        MarketInsight.expires_at > datetime.utcnow()
    ).first()

    if cached:
        return MarketInsightResponse(
            insight_type=cached.insight_type,
            position=cached.position,
            location=cached.location,
            data=json.loads(cached.data),
            created_at=cached.created_at
        )

    # Generate mock salary data (in production, call external API)
    salary_data = {
        "position": request.position,
        "location": request.location or "United States",
        "average_salary": "$85,000 - $120,000",
        "entry_level": "$65,000 - $85,000",
        "mid_level": "$85,000 - $120,000",
        "senior_level": "$120,000 - $180,000",
        "top_companies": [
            {"name": "Google", "range": "$140,000 - $200,000"},
            {"name": "Microsoft", "range": "$130,000 - $190,000"},
            {"name": "Amazon", "range": "$125,000 - $185,000"}
        ],
        "source": "Mirai AI Market Analysis",
        "last_updated": datetime.utcnow().isoformat()
    }

    # Cache the result
    db_insight = MarketInsight(
        insight_type="salary",
        position=request.position,
        location=request.location,
        data=json.dumps(salary_data),
        expires_at=datetime.utcnow() + timedelta(days=7)
    )

    db.add(db_insight)
    db.commit()

    return MarketInsightResponse(
        insight_type="salary",
        position=request.position,
        location=request.location,
        data=salary_data,
        created_at=db_insight.created_at
    )


@router.post("/market-insights/skills", response_model=MarketInsightResponse)
async def get_skills_insights(
        request: SkillsInsightRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get trending skills for a position"""

    # Check cache
    cached = db.query(MarketInsight).filter(
        MarketInsight.insight_type == "skills",
        MarketInsight.position == request.position,
        MarketInsight.expires_at > datetime.utcnow()
    ).first()

    if cached:
        return MarketInsightResponse(
            insight_type=cached.insight_type,
            position=cached.position,
            location=cached.location,
            data=json.loads(cached.data),
            created_at=cached.created_at
        )

    # Generate mock skills data
    skills_data = {
        "position": request.position,
        "trending_skills": [
            {"skill": "Python", "demand": "95%", "trend": "up"},
            {"skill": "React", "demand": "90%", "trend": "up"},
            {"skill": "TypeScript", "demand": "85%", "trend": "up"},
            {"skill": "AWS", "demand": "80%", "trend": "stable"},
            {"skill": "Docker", "demand": "75%", "trend": "up"}
        ],
        "certifications": [
            "AWS Certified Solutions Architect",
            "Google Cloud Professional",
            "Microsoft Azure Fundamentals"
        ],
        "source": "Mirai AI Skills Analysis",
        "last_updated": datetime.utcnow().isoformat()
    }

    # Cache the result
    db_insight = MarketInsight(
        insight_type="skills",
        position=request.position,
        data=json.dumps(skills_data),
        expires_at=datetime.utcnow() + timedelta(days=7)
    )

    db.add(db_insight)
    db.commit()

    return MarketInsightResponse(
        insight_type="skills",
        position=request.position,
        location=None,
        data=skills_data,
        created_at=db_insight.created_at
    )