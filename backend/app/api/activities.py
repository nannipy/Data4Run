from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from datetime import datetime, timedelta
from typing import List, Optional
from app.db.database import get_db
from app.services.strava_service import StravaService
from app.models.user import User
from app.models.activity import Activity, Lap
from app.schemas.activity import Activity as ActivitySchema, ActivityWithLaps
from app.schemas.user import User as UserSchema

router = APIRouter(prefix="/activities", tags=["activities"])
strava_service = StravaService()


@router.post("/sync/{user_id}")
async def sync_activities(
    user_id: int,
    after_date: Optional[datetime] = Query(None, description="Sync activities after this date"),
    db: Session = Depends(get_db)
):
    """Sincronizza le attività di un utente da Strava"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Aggiorna il token se necessario
        if not strava_service.refresh_access_token(user):
            raise HTTPException(status_code=401, detail="Failed to refresh access token")
        
        # Sincronizza le attività
        sync_result = strava_service.sync_user_activities(db, user, after_date)
        
        return {
            "message": "Activities synced successfully",
            "sync_result": sync_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.post("/sync/{user_id}/smart")
async def sync_activities_smart(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Sincronizza le attività partendo dalla data dell'attività più vecchia nel database"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Aggiorna il token se necessario
        if not strava_service.refresh_access_token(user):
            raise HTTPException(status_code=401, detail="Failed to refresh access token")
        
        # Trova l'attività più vecchia nel database
        oldest_activity = db.query(Activity).filter(
            Activity.user_id == user_id
        ).order_by(Activity.start_date.asc()).first()
        
        if oldest_activity:
            # Sincronizza a partire dalla data dell'attività più vecchia
            after_date = oldest_activity.start_date
            sync_result = strava_service.sync_user_activities(db, user, after_date)
            
            return {
                "message": f"Activities synced from {after_date.strftime('%Y-%m-%d')}",
                "sync_result": sync_result,
                "oldest_activity_date": after_date.isoformat()
            }
        else:
            # Nessuna attività nel database, sincronizza tutto
            sync_result = strava_service.sync_user_activities(db, user)
            
            return {
                "message": "No existing activities found. Syncing all activities.",
                "sync_result": sync_result
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Smart sync failed: {str(e)}")


@router.post("/sync/{user_id}/extend")
async def sync_activities_extend(
    user_id: int,
    months_back: int = Query(12, description="How many months back to sync"),
    db: Session = Depends(get_db)
):
    """Sincronizza le attività estendendo il periodo di X mesi indietro"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Aggiorna il token se necessario
        if not strava_service.refresh_access_token(user):
            raise HTTPException(status_code=401, detail="Failed to refresh access token")
        
        # Trova l'attività più vecchia nel database
        oldest_activity = db.query(Activity).filter(
            Activity.user_id == user_id
        ).order_by(Activity.start_date.asc()).first()
        
        if oldest_activity:
            # Calcola la data X mesi prima dell'attività più vecchia
            from datetime import timedelta
            extended_date = oldest_activity.start_date - timedelta(days=months_back * 30)
            sync_result = strava_service.sync_user_activities(db, user, extended_date)
            
            return {
                "message": f"Activities synced from {extended_date.strftime('%Y-%m-%d')} (extending {months_back} months back)",
                "sync_result": sync_result,
                "oldest_activity_date": oldest_activity.start_date.isoformat(),
                "extended_from_date": extended_date.isoformat()
            }
        else:
            # Nessuna attività nel database, sincronizza tutto
            sync_result = strava_service.sync_user_activities(db, user)
            
            return {
                "message": "No existing activities found. Syncing all activities.",
                "sync_result": sync_result
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extend sync failed: {str(e)}")


@router.get("/{user_id}")
async def get_user_activities(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    start_date: Optional[datetime] = Query(None, description="Filter activities after this date"),
    end_date: Optional[datetime] = Query(None, description="Filter activities before this date"),
    sort_by: str = Query("start_date", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    db: Session = Depends(get_db)
):
    """Ottiene le attività di un utente con filtri e paginazione"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Costruisci la query
    query = db.query(Activity).filter(Activity.user_id == user_id)
    
    # Applica filtri
    if activity_type:
        query = query.filter(Activity.type == activity_type)
    
    if start_date:
        query = query.filter(Activity.start_date >= start_date)
    
    if end_date:
        query = query.filter(Activity.start_date <= end_date)
    
    # Applica ordinamento
    if hasattr(Activity, sort_by):
        sort_column = getattr(Activity, sort_by)
        if sort_order.lower() == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(Activity.start_date))
    
    # Applica paginazione
    total = query.count()
    activities = query.offset(skip).limit(limit).all()
    
    return {
        "activities": [ActivitySchema.from_orm(activity) for activity in activities],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{user_id}/activity/{activity_id}")
async def get_activity_detail(
    user_id: int,
    activity_id: int,
    db: Session = Depends(get_db)
):
    """Ottiene i dettagli di una singola attività"""
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.user_id == user_id
    ).first()
    
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    # Ottieni i laps
    laps = db.query(Lap).filter(Lap.activity_id == activity_id).order_by(Lap.lap_index).all()
    
    # Crea la risposta con i laps
    activity_data = ActivitySchema.from_orm(activity)
    response_data = activity_data.dict()
    response_data["laps"] = [{"id": lap.id, "lap_index": lap.lap_index, "distance": lap.distance, 
                             "moving_time": lap.moving_time, "average_speed": lap.average_speed, 
                             "start_date": lap.start_date} for lap in laps]
    
    return response_data

@router.get("/{user_id}/stats")
async def get_user_stats(
    user_id: int,
    start_date: Optional[datetime] = Query(None, description="Start date for stats"),
    end_date: Optional[datetime] = Query(None, description="End date for stats"),
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    db: Session = Depends(get_db)
):
    """Ottiene le statistiche aggregate di un utente"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Query per tutte le attività dell'utente (senza filtri)
    all_activities_query = db.query(Activity).filter(Activity.user_id == user_id)
    all_activities = all_activities_query.all()
    total_activities_all = len(all_activities)
    num_bike = sum(1 for a in all_activities if a.type and a.type.lower() == 'ride')
    num_tennis = sum(1 for a in all_activities if a.type and a.type.lower() == 'workout')

    # Costruisci la query base per le statistiche (solo distanza > 0)
    query = db.query(Activity).filter(Activity.user_id == user_id)
    if activity_type:
        query = query.filter(Activity.type == activity_type)
    if start_date:
        query = query.filter(Activity.start_date >= start_date)
    if end_date:
        query = query.filter(Activity.start_date <= end_date)
    query = query.filter(Activity.distance > 0)
    activities = query.all()

    if not activities:
        return {
            "total_activities": 0,
            "total_distance": 0,
            "total_time": 0,
            "total_elevation": 0,
            "average_pace": 0,
            "total_activities_all": total_activities_all,
            "num_bike": num_bike,
            "num_tennis": num_tennis
        }

    total_activities = len(activities)
    total_distance = sum(activity.distance for activity in activities)
    total_time = sum(activity.moving_time for activity in activities)
    total_elevation = sum(activity.total_elevation_gain or 0 for activity in activities)

    # Calcolo ritmo medio solo sulle corse (Run)
    runs = [a for a in activities if a.type and a.type.lower() == 'run']
    total_run_distance = sum(a.distance for a in runs)
    total_run_time = sum(a.moving_time for a in runs)
    if total_run_distance > 0:
        average_pace = (total_run_time / 60) / (total_run_distance / 1000)  # min/km
    else:
        average_pace = 0

    print(f"DEBUG: total_time={total_time} sec, total_distance={total_distance} m, total_activities={total_activities}, average_pace={average_pace:.2f} min/km")

    return {
        "total_activities": total_activities,
        "total_distance": total_distance,
        "total_time": total_time,
        "total_elevation": total_elevation,
        "average_pace": average_pace,
        "total_activities_all": total_activities_all,
        "num_bike": num_bike,
        "num_tennis": num_tennis
    }


@router.get("/{user_id}/trends")
async def get_user_trends(
    user_id: int,
    period: str = Query("month", description="Period: week, month, year"),
    db: Session = Depends(get_db)
):
    """Ottiene le tendenze delle attività di un utente"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calcola la data di inizio del periodo
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
        group_format = "%Y-%m-%d"
    elif period == "month":
        start_date = now - timedelta(days=30)
        group_format = "%Y-%m-%d"
    elif period == "year":
        start_date = now - timedelta(days=365)
        group_format = "%Y-%m"
    else:
        raise HTTPException(status_code=400, detail="Invalid period")
    
    # Ottieni le attività del periodo
    activities = db.query(Activity).filter(
        Activity.user_id == user_id,
        Activity.start_date >= start_date
    ).order_by(Activity.start_date).all()
    
    # Raggruppa per periodo
    trends = {}
    for activity in activities:
        if period == "week" or period == "month":
            key = activity.start_date.strftime("%Y-%m-%d")
        else:
            key = activity.start_date.strftime("%Y-%m")
        
        if key not in trends:
            trends[key] = {
                "distance": 0,
                "time": 0,
                "activities": 0,
                "elevation": 0
            }
        
        trends[key]["distance"] += activity.distance
        trends[key]["time"] += activity.moving_time
        trends[key]["activities"] += 1
        trends[key]["elevation"] += activity.total_elevation_gain or 0
    
    return {
        "period": period,
        "trends": trends
    } 