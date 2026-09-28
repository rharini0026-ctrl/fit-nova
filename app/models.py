import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    age = Column(Integer, nullable=False)
    weight = Column(Integer, nullable=False)  # in kg
    goal = Column(String(100), nullable=False)
    experience = Column(String(100), nullable=False)
    intensity = Column(String(100), nullable=False)
    workout_days = Column(Integer, nullable=False, default=3)
    workout_duration = Column(String(50), nullable=False, default="30-45 min")
    equipment = Column(String(100), nullable=False, default="No equipment")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    nutrition_tips = relationship("NutritionTip", back_populates="user", cascade="all, delete-orphan")

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), ForeignKey("users.user_id"), nullable=False, index=True)
    original_plan = Column(Text, nullable=False)  # JSON serialized string
    updated_plan = Column(Text, nullable=True)     # JSON serialized string
    feedback = Column(Text, nullable=True)         # Last submitted feedback
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="plans")

class NutritionTip(Base):
    __tablename__ = "nutrition_tips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), ForeignKey("users.user_id"), nullable=False, index=True)
    tip = Column(Text, nullable=False)            # JSON or formatted string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="nutrition_tips")
