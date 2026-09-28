from typing import List, Optional, Any
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    user_id: str = Field(..., min_length=2, max_length=100)
    name: str = Field(..., min_length=2, max_length=150)
    age: int = Field(..., ge=12, le=105)
    weight: int = Field(..., ge=25, le=350)
    goal: str
    experience: str
    intensity: str
    workout_days: int = Field(..., ge=1, le=7)
    workout_duration: str
    equipment: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: Any

    class Config:
        from_attributes = True

class FeedbackRequest(BaseModel):
    user_id: str
    feedback: str = Field(..., min_length=3, max_length=1000)

class ExerciseSchema(BaseModel):
    name: str
    targetMuscle: str
    sets: Any
    repsOrDuration: str
    rest: str
    instructions: str

class DayWorkoutSchema(BaseModel):
    dayNumber: int
    dayName: str
    focus: str
    isRestDay: bool
    estimatedDurationMinutes: int
    warmup: Any
    exercises: List[ExerciseSchema]
    cooldown: Any
    coachNotes: Optional[str] = None

class WorkoutPlanSchema(BaseModel):
    planTitle: str
    summary: str
    weeklyGoal: str
    safetyAdvice: str
    days: List[DayWorkoutSchema]
