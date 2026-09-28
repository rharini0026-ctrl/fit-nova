import os
import json
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Reads GOOGLE_API_KEY or GEMINI_API_KEY from environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

def get_genai_client():
    if not GOOGLE_API_KEY:
        return None
    try:
        from google import genai
        return genai.Client(api_key=GOOGLE_API_KEY)
    except Exception as e:
        logger.warning(f"Could not initialize google.genai: {e}")
        return None

def generate_workout_plan(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a personalized, safe, beginner-friendly 7-day fitness plan using Gemini API.
    """
    prompt = f"""
You are a responsible AI fitness coach and exercise scientist.
Create a safe, beginner-friendly, and personalized 7-day fitness plan.

User Information:
- Name: {user_data.get('name')}
- Age: {user_data.get('age')}
- Weight: {user_data.get('weight')} kg
- Goal: {user_data.get('goal')}
- Experience: {user_data.get('experience')}
- Intensity: {user_data.get('intensity')}
- Workout Days: {user_data.get('workout_days')} days/week
- Duration: {user_data.get('workout_duration')}
- Equipment: {user_data.get('equipment')}

CRITICAL REQUIREMENTS:
1. Provide a structured 7-day plan (Day 1 through Day 7).
2. Schedule {user_data.get('workout_days')} active workout days and {7 - int(user_data.get('workout_days', 3))} active recovery / rest days.
3. For EVERY day provide:
   - dayNumber (1-7)
   - dayName (e.g. "Day 1: Full Body Mobility & Push")
   - focus (e.g. "Chest, Triceps & Core")
   - isRestDay (true/false)
   - estimatedDurationMinutes (integer)
   - warmup: {{ "duration": "string", "description": "string", "exercises": ["ex1", "ex2"] }}
   - exercises: array of 3-5 exercises. Each exercise:
       - name (string)
       - targetMuscle (string)
       - sets (number or string)
       - repsOrDuration (string)
       - rest (string)
       - instructions (clear form cues)
   - cooldown: {{ "duration": "string", "description": "string", "stretches": ["s1", "s2"] }}
   - coachNotes (string)

Return ONLY valid JSON matching this exact structure:
{{
  "planTitle": "string",
  "summary": "string",
  "weeklyGoal": "string",
  "safetyAdvice": "string",
  "days": [...]
}}
"""
    client = get_genai_client()
    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            if response.text:
                return json.loads(response.text)
        except Exception as e:
            logger.warning(f"Gemini API error during workout plan generation: {e}")

    # Robust built-in fallback generator
    return _build_fallback_workout_plan(user_data)

def generate_nutrition_tip(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates practical, general wellness nutrition and recovery tips based on user's goal.
    """
    prompt = f"""
You are a certified nutrition coach and sports recovery specialist.
Provide a safe, evidence-based, general wellness tip for:
User: {user_data.get('name')}, Goal: {user_data.get('goal')}, Experience: {user_data.get('experience')}.

Guidelines:
- Focus on practical hydration, balanced meals, protein intake, and sleep.
- Do NOT prescribe extreme diets, crash calorie restrictions, or unverified supplements.

Return ONLY valid JSON:
{{
  "title": "string",
  "category": "Hydration | Nutrition | Sleep & Recovery",
  "content": "string (2-3 sentences)",
  "practicalTips": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"]
}}
"""
    client = get_genai_client()
    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            if response.text:
                return json.loads(response.text)
        except Exception as e:
            logger.warning(f"Gemini API error during nutrition tip generation: {e}")

    return {
        "title": f"Nutritional Foundations for {user_data.get('goal', 'General Wellness')}",
        "category": "Nutrition",
        "content": "Sustainable health begins with balanced whole foods, consistent cellular hydration, and prioritizing restorative sleep to accelerate muscle tissue repair.",
        "practicalTips": [
            "Drink at least 2.5 liters of water daily, sipping continuously.",
            "Include a palm-sized portion of protein with each main meal.",
            "Fill half of your lunch and dinner plates with colorful vegetables.",
            "Aim for 7 to 8 hours of uninterrupted sleep for peak recovery."
        ]
    }

def _build_fallback_workout_plan(user: Dict[str, Any]) -> Dict[str, Any]:
    name = user.get("name", "Athlete")
    goal = user.get("goal", "General wellness")
    days_count = int(user.get("workout_days", 3))
    eq = user.get("equipment", "No equipment")

    days = []
    active_days_remaining = days_count

    for d in range(1, 8):
        is_workout = (d % 2 == 1 and active_days_remaining > 0) or (active_days_remaining > 0 and (8 - d) <= active_days_remaining)
        if is_workout:
            active_days_remaining -= 1
            days.append({
                "dayNumber": d,
                "dayName": f"Day {d}: Total Body Foundation & Conditioning",
                "focus": "Full Body Strength & Core Stability",
                "isRestDay": False,
                "estimatedDurationMinutes": 40,
                "warmup": {
                    "duration": "7 mins",
                    "description": "Dynamic movement prep and joint mobility.",
                    "exercises": ["Arm circles 30s", "Bodyweight air squats 10 reps", "Cat-cow spinal stretch 10 reps"]
                },
                "exercises": [
                    {
                        "name": "Bodyweight Squats or Goblet Squats",
                        "targetMuscle": "Quadriceps & Glutes",
                        "sets": 3,
                        "repsOrDuration": "10-12 reps",
                        "rest": "60 sec",
                        "instructions": "Keep chest upright and feet shoulder-width apart. Drive through heels."
                    },
                    {
                        "name": "Push-Ups (Floor or Incline)",
                        "targetMuscle": "Chest, Shoulders & Triceps",
                        "sets": 3,
                        "repsOrDuration": "8-12 reps",
                        "rest": "60 sec",
                        "instructions": "Maintain straight plank line from shoulders to heels. Avoid sagging hips."
                    },
                    {
                        "name": "Resistance Band or Towel Rows",
                        "targetMuscle": "Upper Back & Posture",
                        "sets": 3,
                        "repsOrDuration": "12 reps",
                        "rest": "60 sec",
                        "instructions": "Squeeze shoulder blades together at peak contraction."
                    },
                    {
                        "name": "Front Plank Hold",
                        "targetMuscle": "Transverse Abdominis",
                        "sets": 3,
                        "repsOrDuration": "30-45 seconds",
                        "rest": "45 sec",
                        "instructions": "Brace core muscles firmly and breathe steadily."
                    }
                ],
                "cooldown": {
                    "duration": "5 mins",
                    "description": "Static stretching and heart rate recovery.",
                    "stretches": ["Standing quad stretch 30s each", "Child's pose 60s", "Deep diaphragmatic breathing"]
                },
                "coachNotes": "Focus on smooth controlled movement instead of rushing."
            })
        else:
            days.append({
                "dayNumber": d,
                "dayName": f"Day {d}: Active Recovery & Mobility",
                "focus": "Rest, Joint Mobility & Circulation",
                "isRestDay": True,
                "estimatedDurationMinutes": 20,
                "warmup": {
                    "duration": "4 mins",
                    "description": "Gentle neck and spinal mobility.",
                    "exercises": ["Gentle neck rolls", "Spinal twists"]
                },
                "exercises": [
                    {
                        "name": "Brisk Outdoor Walk",
                        "targetMuscle": "Cardiovascular Circulation",
                        "sets": 1,
                        "repsOrDuration": "20 mins",
                        "rest": "N/A",
                        "instructions": "Walk at a relaxed conversational pace to flush metabolic waste."
                    }
                ],
                "cooldown": {
                    "duration": "4 mins",
                    "description": "Mindful relaxation and stretching.",
                    "stretches": ["Hamstring stretch", "Torso gentle twist"]
                },
                "coachNotes": "Rest days rebuild your muscle fibers and replenish energy stores."
            })

    return {
        "planTitle": f"FitBuddy 7-Day {goal} Blueprint",
        "summary": f"Specially tailored for {name} based on {days_count} active days using {eq}. Balances progressive challenge with restorative recovery.",
        "weeklyGoal": f"Build foundational strength, endurance, and consistency aligned with {goal}.",
        "safetyAdvice": "Always stay hydrated and stop immediately if you experience sharp or pinching joint pain.",
        "days": days
    }
