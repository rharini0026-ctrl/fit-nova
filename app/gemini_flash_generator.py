"""
Gemini Flash Generator - Specialized high-speed inference module for FitBuddy.
Optimized for rapid generation of workouts and rapid plan updates.
"""
import os
import json
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

def fast_generate(prompt: str) -> Dict[str, Any]:
    """Generates structured JSON using Gemini Flash model."""
    if not GOOGLE_API_KEY:
        return {}
    try:
        from google import genai
        client = genai.Client(api_key=GOOGLE_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        if response.text:
            return json.loads(response.text)
    except Exception as e:
        logger.warning(f"Fast generate error: {e}")
    return {}
