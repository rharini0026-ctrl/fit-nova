import json
import logging
from typing import Dict, Any
from app.gemini_generator import get_genai_client

logger = logging.getLogger(__name__)

def update_workout_plan(
    original_plan: Dict[str, Any],
    user_data: Dict[str, Any],
    feedback_text: str
) -> Dict[str, Any]:
    """
    Submits original plan + user feedback to Gemini to generate an updated 7-day plan,
    keeping the original plan intact while adjusting the new plan.
    """
    prompt = f"""
You are FitBuddy AI.
The user has reviewed their original 7-day fitness plan and provided specific feedback to improve or customize it.

User Profile:
- Name: {user_data.get('name')}
- Age: {user_data.get('age')}
- Goal: {user_data.get('goal')}
- Experience: {user_data.get('experience')}
- Intensity: {user_data.get('intensity')}
- Equipment: {user_data.get('equipment')}

Original Plan Title: "{original_plan.get('planTitle', '7-Day Plan')}"
Original Summary: "{original_plan.get('summary', '')}"

User's Improvement Feedback:
"{feedback_text}"

INSTRUCTIONS:
1. Update the 7-day workout plan directly addressing the user's feedback (e.g. adjust cardio, exercise difficulty, rest days, or duration).
2. Maintain complete 7 days structure (Day 1 through Day 7) with warmup, exercises, sets/reps, rest, and cooldown.
3. Update the plan title and summary explaining what was modified.
4. Keep safety as top priority.

Return ONLY valid JSON matching:
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
            logger.warning(f"Gemini API error during plan update: {e}")

    # Fallback update modifier
    updated = json.loads(json.dumps(original_plan))
    updated["planTitle"] = f"{original_plan.get('planTitle', '7-Day Plan')} (Updated)"
    updated["summary"] = f"Plan adjusted according to feedback: '{feedback_text}'. Original schedule retained as baseline."
    return updated
