import json
from fastapi import APIRouter, Depends, HTTPException, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
import os

from app.database import get_db
from app.models import User, WorkoutPlan, NutritionTip
from app.schemas import UserCreate, FeedbackRequest
from app.gemini_generator import generate_workout_plan, generate_nutrition_tip
from app.updated_plan import update_workout_plan

router = APIRouter()

# Setup templates directory if it exists
templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
templates = Jinja2Templates(directory=templates_dir) if os.path.exists(templates_dir) else None

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    if templates and os.path.exists(os.path.join(templates_dir, "index.html")):
        return templates.TemplateResponse("index.html", {"request": request})
    return HTMLResponse("<h1>FitBuddy – AI Fitness Plan Generator</h1><p>Visit /docs for FastAPI Swagger Documentation</p>")

@router.post("/generate-workout")
async def create_workout_endpoint(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Creates user profile, invokes Gemini for 7-day workout plan and nutrition tip,
    and persists everything in the database.
    """
    # Check if user already exists or create/update
    existing_user = db.query(User).filter(User.user_id == user_in.user_id).first()
    if existing_user:
        for key, val in user_in.model_dump().items():
            setattr(existing_user, key, val)
        user = existing_user
    else:
        user = User(**user_in.model_dump())
        db.add(user)
    db.commit()
    db.refresh(user)

    user_dict = user_in.model_dump()

    # Generate via Gemini
    generated_plan = generate_workout_plan(user_dict)
    nutrition_tip = generate_nutrition_tip(user_dict)

    # Save WorkoutPlan
    plan_record = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user.user_id).first()
    if plan_record:
        plan_record.original_plan = json.dumps(generated_plan)
        plan_record.updated_plan = None
        plan_record.feedback = None
    else:
        plan_record = WorkoutPlan(
            user_id=user.user_id,
            original_plan=json.dumps(generated_plan),
            updated_plan=None,
            feedback=None
        )
        db.add(plan_record)

    # Save NutritionTip
    tip_record = db.query(NutritionTip).filter(NutritionTip.user_id == user.user_id).first()
    if tip_record:
        tip_record.tip = json.dumps(nutrition_tip)
    else:
        tip_record = NutritionTip(
            user_id=user.user_id,
            tip=json.dumps(nutrition_tip)
        )
        db.add(tip_record)

    db.commit()

    return {
        "status": "success",
        "user_id": user.user_id,
        "plan": generated_plan,
        "nutrition_tip": nutrition_tip
    }

@router.post("/submit-feedback")
async def submit_feedback_endpoint(feedback_req: FeedbackRequest, db: Session = Depends(get_db)):
    """
    Retrieves original plan, sends to Gemini with feedback, saves updated plan,
    leaving original plan intact.
    """
    user = db.query(User).filter(User.user_id == feedback_req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    plan_record = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user.user_id).first()
    if not plan_record or not plan_record.original_plan:
        raise HTTPException(status_code=404, detail="Original workout plan not found for user")

    original_plan_data = json.loads(plan_record.original_plan)
    user_dict = {
        "name": user.name,
        "age": user.age,
        "weight": user.weight,
        "goal": user.goal,
        "experience": user.experience,
        "intensity": user.intensity,
        "equipment": user.equipment
    }

    updated_plan_data = update_workout_plan(original_plan_data, user_dict, feedback_req.feedback)

    plan_record.updated_plan = json.dumps(updated_plan_data)
    plan_record.feedback = feedback_req.feedback
    db.commit()

    return {
        "status": "success",
        "message": "Your fitness plan has been updated successfully.",
        "user_id": user.user_id,
        "original_plan": original_plan_data,
        "updated_plan": updated_plan_data
    }

@router.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: str, db: Session = Depends(get_db)):
    """Returns complete user, original plan, updated plan, and nutrition tip"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    plan_record = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id).first()
    tip_record = db.query(NutritionTip).filter(NutritionTip.user_id == user_id).first()

    return {
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "age": user.age,
            "weight": user.weight,
            "goal": user.goal,
            "experience": user.experience,
            "intensity": user.intensity,
            "workout_days": user.workout_days,
            "workout_duration": user.workout_duration,
            "equipment": user.equipment,
            "created_at": user.created_at.isoformat() if user.created_at else None
        },
        "original_plan": json.loads(plan_record.original_plan) if plan_record and plan_record.original_plan else None,
        "updated_plan": json.loads(plan_record.updated_plan) if plan_record and plan_record.updated_plan else None,
        "feedback": plan_record.feedback if plan_record else None,
        "nutrition_tip": json.loads(tip_record.tip) if tip_record and tip_record.tip else None
    }

@router.get("/admin")
async def admin_dashboard(db: Session = Depends(get_db)):
    """Admin endpoint to view all users, plan status, and feedback"""
    users = db.query(User).order_by(User.created_at.desc()).all()
    results = []
    for u in users:
        plan = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == u.user_id).first()
        results.append({
            "id": u.id,
            "user_id": u.user_id,
            "name": u.name,
            "age": u.age,
            "weight": u.weight,
            "goal": u.goal,
            "experience": u.experience,
            "intensity": u.intensity,
            "equipment": u.equipment,
            "workout_days": u.workout_days,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "has_original_plan": bool(plan and plan.original_plan),
            "has_updated_plan": bool(plan and plan.updated_plan),
            "last_feedback": plan.feedback if plan else None
        })
    return {"users": results, "total_users": len(results)}

@router.get("/user/{user_id}")
async def get_user_endpoint(user_id: str, db: Session = Depends(get_db)):
    return await get_dashboard_data(user_id, db)

@router.delete("/user/{user_id}")
async def delete_user_endpoint(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"status": "success", "message": f"User {user_id} deleted successfully."}
