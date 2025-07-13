from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.strava_service import StravaService
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from typing import Dict, Any
from datetime import datetime


router = APIRouter(prefix="/auth", tags=["authentication"])
strava_service = StravaService()


@router.get("/strava/authorize")
async def authorize_strava():
    """Genera l'URL di autorizzazione per Strava"""
    try:
        auth_url = strava_service.get_authorization_url()
        return {"authorization_url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating authorization URL: {str(e)}")


@router.get("/strava/callback")
async def strava_callback(
    code: str = Query(..., description="Authorization code from Strava"),
    db: Session = Depends(get_db)
):
    """Gestisce il callback di autorizzazione di Strava"""
    try:
        # Scambia il codice con i token
        token_response = strava_service.exchange_code_for_token(code)
        
        # Ottieni le informazioni dell'atleta
        athlete_info = strava_service.get_athlete_info(token_response['access_token'])
        
        # Controlla se l'utente esiste già
        existing_user = db.query(User).filter(User.strava_id == athlete_info['id']).first()
        
        if existing_user:
            # Aggiorna i token dell'utente esistente
            existing_user.access_token = token_response['access_token']
            existing_user.refresh_token = token_response['refresh_token']
            existing_user.expires_at = datetime.fromtimestamp(token_response['expires_at'])
            db.commit()
            user = existing_user
        else:
            # Crea un nuovo utente
            user_data = UserCreate(
                strava_id=athlete_info['id'],
                first_name=athlete_info['firstname'],
                last_name=athlete_info['lastname'],
                profile_picture_url=athlete_info['profile'],
                access_token=token_response['access_token'],
                refresh_token=token_response['refresh_token'],
                expires_at=token_response['expires_at']
            )
            
            user = User(**user_data.dict())
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return {
            "message": "Authentication successful",
            "user_id": user.id,
            "strava_id": user.strava_id,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.get("/user/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Ottiene le informazioni di un utente"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "strava_id": user.strava_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "profile_picture_url": user.profile_picture_url,
        "last_sync_timestamp": user.last_sync_timestamp
    } 