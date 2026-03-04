from contextlib import asynccontextmanager
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base
from .routers import users, jobs, cover_letters, resumes, market_insights, admin

logger = logging.getLogger("mirai-api")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if settings.is_production() and (
        settings.SECRET_KEY.startswith("your-secret-key-change-this")
        or len(settings.SECRET_KEY) < 32
    ):
        raise RuntimeError("Invalid SECRET_KEY for production environment.")

    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")
    yield
    # Shutdown
    logger.info("Shutting down application.")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI-powered resume and cover letter generator with job tracking",
    lifespan=lifespan
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://mirai-ai-frontend.onrender.com",  # Add your actual frontend URL
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in ALLOWED_ORIGINS if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Mirai AI API",
        "status": "active",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT
    }


app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(admin.router, prefix="/api", tags=["admin"])
app.include_router(jobs.router, prefix="/api", tags=["jobs"])
app.include_router(cover_letters.router, prefix="/api", tags=["cover-letters"])
app.include_router(resumes.router, prefix="/api", tags=["resumes"])
app.include_router(market_insights.router, prefix="/api", tags=["market-insights"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
