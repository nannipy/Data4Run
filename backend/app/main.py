from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth_router, activities_router, mock_router
from app.db.database import engine
from app.models import Base

# Crea le tabelle del database
Base.metadata.create_all(bind=engine)

# Crea l'applicazione FastAPI
app = FastAPI(
    title=settings.app_name,
    description="API per l'analisi delle attività di corsa da Strava",
    version="1.0.0",
    debug=settings.debug
)

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # aggiungi qui il frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Includi i router
app.include_router(auth_router)
app.include_router(activities_router)
app.include_router(mock_router)  # Solo per sviluppo


@app.get("/")
async def root():
    """Endpoint di root"""
    return {
        "message": "Strava Run Analyzer API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"} 