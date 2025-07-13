from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    strava_id = Column(Integer, unique=True, index=True, nullable=False)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    profile_picture_url = Column(String(500))
    last_sync_timestamp = Column(DateTime)
    
    # Relationship
    activities = relationship("Activity", back_populates="user") 