# FITBUDDY – AI Fitness Plan Generator

A modern, full-stack, AI-powered fitness web application that generates personalized, beginner-friendly, and safe 7-day workout plans based on individual fitness goals, experience, intensity, and schedule.

---

## ⚡ Core Features

1. **Intelligent 7-Day Workout Generation**
   - Leverages **Google Gemini API** (`gemini-3.8-flash`) to generate structured, day-by-day routines.
   - Every day includes targeted focus, warm-up mobility drills, exercises with sets/reps/rest, and cool-down recovery stretches.
   - Dedicated **Active Rest & Recovery Days** are scheduled according to user workout frequency.

2. **Goal & Equipment Tailoring**
   - Goals: General wellness, Weight management, Strength, Muscle building, Flexibility, Endurance.
   - Equipment: No equipment (calisthenics/bodyweight), Home equipment (dumbbells/bands), Gym equipment (full gym).
   - Experience: Beginner, Intermediate, Advanced.

3. **Built-In Safety & Health Disclaimers**
   - Non-diagnostic wellness guidance.
   - Visible medical caution banners recommending physician consultation for pre-existing injuries or conditions.

4. **AI Nutrition & Recovery Guide**
   - Generates personalized daily hydration, protein distribution, and restorative sleep recommendations.

5. **Interactive Plan Refinement (Feedback Loop)**
   - Allows users to enter natural language adjustments (e.g. *"Add more cardio"*, *"Make workouts easier"*, *"More rest days"*).
   - Submits original plan + feedback to Gemini to generate an updated 7-day plan while keeping original baseline intact.

6. **Coach / Admin Dashboard (`/admin`)**
   - View all registered members, workout history, plan status, and feedback history.
   - Search by user handle or name, and filter by fitness goals.
   - Delete users with confirmation.

7. **Print & Export**
   - Clean CSS print media formatting allows users to print or save their customized 7-day plan as PDF with a single click.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Modern JavaScript (Fetch API, responsive cards, print-ready CSS)
- **Interactive UI**: React 19 + TypeScript + Tailwind CSS (Vite / Express dev server)
- **Backend**: Python FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **Templates**: Jinja2
- **AI Engine**: Google Gemini API (`@google/genai` & `google-genai`)

---

## 📂 Project Structure

```text
FitBuddy/
│
├── app/
│   ├── main.py                  # FastAPI application entrypoint & static mount
│   ├── routes.py                # API & Page routes (workout generation, feedback, admin)
│   ├── database.py              # SQLite & SQLAlchemy engine configuration
│   ├── models.py                # User, WorkoutPlan, and NutritionTip ORM models
│   ├── schemas.py               # Pydantic validation schemas
│   ├── gemini_generator.py      # Core Gemini API prompt engineering & workout generator
│   ├── gemini_flash_generator.py# High-speed Flash model inference module
│   └── updated_plan.py          # Plan refinement & feedback integration
│
├── templates/
│   ├── index.html               # Landing page & interactive questionnaire form
│   ├── result.html              # 7-day workout plan dashboard & feedback widget
│   ├── dashboard.html           # User profile & plan history
│   ├── feedback.html            # Standalone feedback submission form
│   └── admin.html               # Coach / Admin user management table
│
├── static/
│   ├── css/
│   │   └── style.css            # Dark/emerald fitness theme, cards, animations
│   └── js/
│       └── script.js            # Client interactions, dynamic card rendering, API calls
│
├── src/                         # Full React + TypeScript interactive live frontend
│   ├── App.tsx
│   ├── types/fitness.ts
│   └── ...
├── server/                      # Server-side API endpoints & Gemini integration
│   ├── db.ts
│   └── gemini.ts
├── server.ts                    # Full-stack Express server mounting Vite
├── requirements.txt             # Python dependencies
├── .env.example                 # Example environment variables
└── README.md                    # Documentation & run instructions
```

---

## 🚀 Running the Python FastAPI Backend Locally

### 1. Prerequisites
- Python 3.9+
- A Google Gemini API Key from Google AI Studio

### 2. Setup Virtual Environment & Install Dependencies
```bash
# Clone or navigate to the project directory
cd FitBuddy

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and set your Gemini API key:
```env
GOOGLE_API_KEY="your-gemini-api-key"
DATABASE_URL="sqlite:///./fitbuddy.db"
```

### 4. Start the FastAPI Server
```bash
uvicorn app.main:app --reload --port 8000
```
Open your browser and navigate to:
- **Web App**: [http://localhost:8000](http://localhost:8000)
- **FastAPI Interactive Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Admin Dashboard**: [http://localhost:8000/admin](http://localhost:8000/admin)

---

## 🌐 Running the AI Studio Interactive App

In this AI Studio preview container, the application runs on **Port 3000** with full full-stack support:
```bash
npm run dev
```
Navigate the live UI to generate workout plans, submit adjustments, test coach administration, and print plans!
