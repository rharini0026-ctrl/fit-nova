import React, { useState, useEffect } from 'react';
import {
  Activity,
  Flame,
  Dumbbell,
  ShieldCheck,
  Calendar,
  Clock,
  Printer,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Trash2,
  Search,
  ExternalLink,
  ChevronRight,
  Heart,
  Droplet,
  Moon,
  Info,
  Layers,
  ArrowRight,
  UserCheck,
  Code
} from 'lucide-react';
import {
  UserProfile,
  WorkoutPlanData,
  NutritionTipData,
  StoredWorkoutPlan,
  FitnessGoal,
  ExperienceLevel,
  WorkoutIntensity,
  EquipmentOption
} from './types/fitness';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'questionnaire' | 'plan' | 'dashboard' | 'admin' | 'python'>('home');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: 'Jordan Smith',
    userId: 'jordan-fit',
    age: 27,
    weight: 68,
    goal: 'Strength' as FitnessGoal,
    experience: 'Beginner' as ExperienceLevel,
    intensity: 'Moderate / Medium' as WorkoutIntensity,
    workoutDays: 3,
    workoutDuration: '30-45 min',
    equipment: 'Home equipment' as EquipmentOption,
    medicalConditions: '',
  });

  // Current Active User & Plan State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlanData | null>(null);
  const [originalPlan, setOriginalPlan] = useState<WorkoutPlanData | null>(null);
  const [nutritionTip, setNutritionTip] = useState<NutritionTipData | null>(null);
  const [planViewMode, setPlanViewMode] = useState<'active' | 'original'>('active');

  // Feedback State
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState<Array<{ feedbackText: string; appliedAt: string }>>([]);

  // Admin Dashboard State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Preload sample user data on initial mount
  useEffect(() => {
    loadInitialUserData();
  }, []);

  const loadInitialUserData = async () => {
    try {
      const res = await fetch('/api/dashboard/user-alex-101');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setCurrentPlan(data.plan?.updatedPlan || data.plan?.originalPlan);
        setOriginalPlan(data.plan?.originalPlan);
        setNutritionTip(data.nutritionTip);
        if (data.plan?.feedbackHistory) {
          setFeedbackHistory(data.plan.feedbackHistory);
        }
      }
    } catch (err) {
      console.warn('Initial data load error:', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'weight' || name === 'workoutDays' ? parseInt(value) || 0 : value
    }));
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      const payload = {
        name: formData.name,
        user_id: formData.userId || 'user-' + Date.now().toString().slice(-4),
        age: formData.age,
        weight: formData.weight,
        goal: formData.goal,
        experience: formData.experience,
        intensity: formData.intensity,
        workout_days: formData.workoutDays,
        workout_duration: formData.workoutDuration,
        equipment: formData.equipment,
        medical_conditions: formData.medicalConditions
      };

      const res = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCurrentUser(data.user);
        setCurrentPlan(data.plan);
        setOriginalPlan(data.plan);
        setNutritionTip(data.nutrition_tip);
        setFeedbackHistory([]);
        setPlanViewMode('active');
        setActiveTab('plan');
        showToast('Your personalized 7-Day AI Fitness Plan has been generated!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast(data.error || 'Failed to generate plan. Please try again.', 'error');
      }
    } catch (err: any) {
      showToast('Network error while connecting to FitBuddy server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !feedbackText.trim()) return;

    setUpdating(true);
    try {
      const res = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.userId,
          feedback: feedbackText.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCurrentPlan(data.updated_plan);
        setOriginalPlan(data.original_plan);
        setFeedbackHistory(prev => [
          ...prev,
          { feedbackText: feedbackText.trim(), appliedAt: new Date().toISOString() }
        ]);
        setPlanViewMode('active');
        setFeedbackText('');
        showToast('Your fitness plan has been updated successfully.');
        window.scrollTo({ top: 200, behavior: 'smooth' });
      } else {
        showToast(data.error || 'Failed to refine plan.', 'error');
      }
    } catch (err) {
      showToast('Error sending feedback to AI.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const loadAdminUsers = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch('/api/admin');
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSelectAdminUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setCurrentPlan(data.plan?.updatedPlan || data.plan?.originalPlan);
        setOriginalPlan(data.plan?.originalPlan);
        setNutritionTip(data.nutritionTip);
        if (data.plan?.feedbackHistory) {
          setFeedbackHistory(data.plan.feedbackHistory);
        }
        setActiveTab('plan');
        showToast(`Loaded ${data.user.name}'s fitness plan.`);
      }
    } catch (e) {
      showToast('Could not load athlete plan.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(`Are you sure you want to delete user ${userId}?`)) return;
    try {
      const res = await fetch(`/api/user/${encodeURIComponent(userId)}`, { method: 'DELETE' });
      if (res.ok) {
        setAdminUsers(prev => prev.filter(u => u.user_id !== userId));
        showToast(`Athlete ${userId} deleted.`);
      }
    } catch (e) {
      showToast('Error deleting athlete.', 'error');
    }
  };

  const displayedPlan = planViewMode === 'original' && originalPlan ? originalPlan : currentPlan;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl transition-all duration-300 border ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500 text-rose-200'
          }`}
        >
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                FIT<span className="text-emerald-400">BUDDY</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI Coach
              </span>
            </div>
          </button>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'home'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab('questionnaire')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'questionnaire'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Create Plan
            </button>

            {currentPlan && (
              <button
                onClick={() => setActiveTab('plan')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'plan'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                7-Day Plan
              </button>
            )}

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => {
                setActiveTab('admin');
                loadAdminUsers();
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'admin'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Coach Admin
            </button>

            <button
              onClick={() => setActiveTab('python')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'python'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
              }`}
              title="View Python FastAPI Source Files"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden md:inline">FastAPI Source</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* ======================================================== */}
        {/* TAB 1: LANDING / HOME */}
        {/* ======================================================== */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(255,255,255,0))]"></div>
              
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-6">
                    <Sparkles className="w-3.5 h-3.5" />
                    Powered by Google Gemini AI
                  </div>

                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
                    Your AI-Powered <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                      Personal Fitness Companion
                    </span>
                  </h1>

                  <p className="mt-6 text-lg sm:text-xl text-slate-400 font-normal leading-relaxed">
                    Personalized, beginner-friendly, and safe 7-day workout plans tailored to your body, goals, equipment, and weekly schedule — complete with active recovery and nutrition guidance.
                  </p>

                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => setActiveTab('questionnaire')}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <span>Create My Fitness Plan</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    {currentPlan && (
                      <button
                        onClick={() => setActiveTab('plan')}
                        className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>View Active Plan</span>
                        <ChevronRight className="w-4 h-4 text-emerald-400" />
                      </button>
                    )}
                  </div>

                  <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left pt-8 border-t border-slate-800/80">
                    <div className="p-3">
                      <div className="text-emerald-400 font-bold text-base">7-Day Structure</div>
                      <div className="text-xs text-slate-400 mt-0.5">Warmups, sets, reps & cooldowns</div>
                    </div>
                    <div className="p-3">
                      <div className="text-teal-400 font-bold text-base">Built-In Recovery</div>
                      <div className="text-xs text-slate-400 mt-0.5">Active rest days prevent burnout</div>
                    </div>
                    <div className="p-3">
                      <div className="text-cyan-400 font-bold text-base">Dynamic Refinement</div>
                      <div className="text-xs text-slate-400 mt-0.5">AI adapts to your feedback</div>
                    </div>
                    <div className="p-3">
                      <div className="text-emerald-400 font-bold text-base">Coach Dashboard</div>
                      <div className="text-xs text-slate-400 mt-0.5">Track & filter all athlete plans</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Health & Safety Banner */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-amber-300">Important Health & Safety Disclaimer</h4>
                  <p className="text-sm text-amber-200/80 mt-1 leading-relaxed">
                    FitBuddy is engineered for general wellness and fitness educational guidance. It does not diagnose medical conditions or prescribe extreme calorie restrictions. If you have an injury, chronic medical condition, or pregnancy, please consult a qualified physician before starting any training program.
                  </p>
                </div>
              </div>
            </section>

            {/* Feature Highlights Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-white">How FitBuddy Works</h2>
                <p className="text-slate-400 mt-2">Precision exercise programming driven by responsible AI</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative group hover:border-emerald-500/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">1. Intake Assessment</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Enter your age, weight, goal, fitness experience, preferred intensity, duration, and available equipment (bodyweight, dumbbells, or full gym).
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative group hover:border-teal-500/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-5">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">2. Gemini AI Synthesis</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Gemini creates an individualized 7-day schedule with precise warmup protocols, muscle focus, sets/reps, rest periods, and restorative cooldowns.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative group hover:border-cyan-500/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-5">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">3. Feedback & Refine</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Need extra cardio or lighter sets? Submit natural language feedback to immediately rebalance your plan while preserving your original baseline.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: QUESTIONNAIRE FORM */}
        {/* ======================================================== */}
        {activeTab === 'questionnaire' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <div className="text-center mb-8">
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Fitness Profile Assessment
              </span>
              <h2 className="text-3xl font-black text-white mt-3">Design Your Custom 7-Day Plan</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-xl mx-auto">
                Our Gemini AI engine crafts a personalized schedule based on your specific training environment and availability.
              </p>
            </div>

            <form onSubmit={handleGeneratePlan} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
              {/* Section 1: Athlete Info */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                  <UserCheck className="w-4 h-4" /> 1. Personal Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g. Jordan Smith"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      User ID / Handle *
                    </label>
                    <input
                      type="text"
                      name="userId"
                      value={formData.userId}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g. jordan-fit-99"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Age (years) *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleFormChange}
                      min="14"
                      max="100"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Current Weight (kg) *
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleFormChange}
                      min="30"
                      max="250"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Goals & Experience */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                  <Activity className="w-4 h-4" /> 2. Fitness Goals & Experience
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Primary Goal *
                    </label>
                    <select
                      name="goal"
                      value={formData.goal}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none"
                    >
                      <option value="General wellness">General wellness</option>
                      <option value="Weight management">Weight management</option>
                      <option value="Strength">Strength</option>
                      <option value="Muscle building">Muscle building</option>
                      <option value="Flexibility">Flexibility</option>
                      <option value="Endurance">Endurance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Experience Level *
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Workout Intensity *
                    </label>
                    <select
                      name="intensity"
                      value={formData.intensity}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none"
                    >
                      <option value="Beginner / Low">Beginner / Low</option>
                      <option value="Moderate / Medium">Moderate / Medium</option>
                      <option value="Advanced / High">Advanced / High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Schedule & Equipment */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                  <Calendar className="w-4 h-4" /> 3. Schedule & Equipment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Active Workout Days (1-7) *
                    </label>
                    <input
                      type="number"
                      name="workoutDays"
                      min="1"
                      max="7"
                      value={formData.workoutDays}
                      onChange={handleFormChange}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Remaining {7 - formData.workoutDays} days set to Active Rest.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Session Duration *
                    </label>
                    <select
                      name="workoutDuration"
                      value={formData.workoutDuration}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none"
                    >
                      <option value="15-30 min">15-30 min</option>
                      <option value="30-45 min">30-45 min</option>
                      <option value="45-60 min">45-60 min</option>
                      <option value="60+ min">60+ min</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Available Equipment *
                    </label>
                    <select
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none"
                    >
                      <option value="No equipment">No equipment (Bodyweight)</option>
                      <option value="Home equipment">Home equipment (Dumbbells/Bands)</option>
                      <option value="Gym equipment">Gym equipment (Full Gym)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Physical Sensitivities or Health Notes (Optional)
                  </label>
                  <input
                    type="text"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleFormChange}
                    placeholder="e.g. Mild knee clicking, tight lower back, shoulder impingement..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Safety Confirmation */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 mb-8 flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  By generating this plan, you acknowledge that FitBuddy AI provides general fitness guidelines. Exercise within your comfortable limits and stop immediately if you feel pain or dizziness.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/20 disabled:opacity-60 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Gemini AI is generating your 7-day plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate My 7-Day Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: WORKOUT RESULT PAGE */}
        {/* ======================================================== */}
        {activeTab === 'plan' && displayedPlan && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl card-print">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Personalized 7-Day Schedule
                    </span>
                    {originalPlan && currentPlan && originalPlan !== currentPlan && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        Feedback Updated
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {displayedPlan.planTitle}
                  </h1>
                  <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
                    {displayedPlan.summary}
                  </p>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 flex-wrap no-print">
                  {originalPlan && currentPlan && originalPlan !== currentPlan && (
                    <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
                      <button
                        onClick={() => setPlanViewMode('active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          planViewMode === 'active'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Updated Plan
                      </button>
                      <button
                        onClick={() => setPlanViewMode('original')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          planViewMode === 'original'
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Original Plan
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Print Plan</span>
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById('feedback-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Improve Plan</span>
                  </button>
                </div>
              </div>

              {/* User Snapshot Badges */}
              {currentUser && (
                <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Athlete</span>
                    <span className="font-semibold text-slate-200">{currentUser.name} ({currentUser.age}y / {currentUser.weight}kg)</span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Goal</span>
                    <span className="font-semibold text-emerald-400">{currentUser.goal}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Experience</span>
                    <span className="font-semibold text-slate-200">{currentUser.experience}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Intensity</span>
                    <span className="font-semibold text-slate-200">{currentUser.intensity}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Equipment</span>
                    <span className="font-semibold text-slate-200">{currentUser.equipment}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 7-Day Workout Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {displayedPlan.days.map(day => (
                <div
                  key={day.dayNumber}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-all card-print ${
                    day.isRestDay
                      ? 'bg-slate-900/40 border-cyan-900/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <div>
                    {/* Day Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-black tracking-wider uppercase bg-slate-800 text-slate-300">
                        Day {day.dayNumber}
                      </span>
                      {day.isRestDay ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                          <Moon className="w-3 h-3" /> Active Rest
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {day.estimatedDurationMinutes} Mins
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                      {day.focus}
                    </h3>

                    {/* Warm-Up Section */}
                    <div className="mb-4 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Activity className="w-3 h-3" /> Warm-up ({day.warmup.duration})
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        {day.warmup.description}
                      </p>
                      {day.warmup.exercises && day.warmup.exercises.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {day.warmup.exercises.map((wEx, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/70 text-slate-300">
                              {wEx}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Exercises List */}
                    <div className="space-y-3 mb-4">
                      {day.exercises.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/70 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-white tracking-wide">{ex.name}</h4>
                              <span className="text-[10px] text-slate-400">{ex.targetMuscle}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-emerald-400 block">
                                {ex.sets} × {ex.repsOrDuration}
                              </span>
                              <span className="text-[10px] text-slate-500">Rest: {ex.rest}</span>
                            </div>
                          </div>
                          {ex.instructions && (
                            <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/50 leading-relaxed">
                              💡 {ex.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cool-Down Section */}
                  <div className="pt-3 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1 font-semibold text-teal-400 mb-1">
                      <Heart className="w-3 h-3" /> Cool-down & Mobility ({day.cooldown.duration})
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {day.cooldown.description}
                    </p>
                    {day.coachNotes && (
                      <div className="mt-2 text-[10px] text-emerald-300/80 italic">
                        Coach Note: {day.coachNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Nutrition & Recovery Section */}
            {nutritionTip && (
              <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl card-print">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Today's Nutrition & Recovery Protocol
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {nutritionTip.title}
                    </h3>
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed mb-5 max-w-3xl">
                  {nutritionTip.content}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nutritionTip.practicalTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-3 text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improve Your Plan (Feedback Loop) */}
            <div id="feedback-section" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-12 no-print">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    Adaptive Refinement
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Improve Your Plan with FitBuddy AI
                </h3>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  Every body responds differently. Tell Gemini what needs adjusting (e.g. more cardio, easier sets, additional rest days) and receive an updated plan tailored while preserving your baseline.
                </p>

                {/* Quick Feedback Suggestions */}
                <div className="flex flex-wrap gap-2 mt-4 mb-4">
                  {[
                    'Add 10 minutes of low-impact cardio to workouts',
                    'Make the workouts slightly easier with lighter sets',
                    'Include more rest days for better recovery',
                    'I have less time on weekdays (reduce to 30 mins)',
                    'Add flexibility and rotator cuff exercises'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFeedbackText(chip)}
                      className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 text-slate-300 border border-slate-700 transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleUpdateFeedback} className="mt-4">
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    placeholder="Enter what you would like to adjust in your schedule..."
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      FitBuddy will update your 7-day plan using Gemini AI.
                    </span>
                    <button
                      type="submit"
                      disabled={updating || !feedbackText.trim()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {updating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating with Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Update Plan</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Feedback History Log */}
                {feedbackHistory.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Applied Refinement History ({feedbackHistory.length})
                    </h5>
                    <div className="space-y-2">
                      {feedbackHistory.map((item, idx) => (
                        <div key={idx} className="text-xs bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-slate-300 flex items-center justify-between">
                          <span>"{item.feedbackText}"</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: USER DASHBOARD */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
                    <UserCheck className="w-3.5 h-3.5" />
                    Athlete Profile
                  </div>
                  <h1 className="text-3xl font-black text-white">
                    {currentUser ? currentUser.name : 'Your Dashboard'}
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Manage your current goals, access your 7-day schedule, and review nutrition tips.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('questionnaire')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                  >
                    + New Assessment
                  </button>
                  {currentPlan && (
                    <button
                      onClick={() => setActiveTab('plan')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
                    >
                      View 7-Day Plan
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Grid Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Current Goal</h3>
                <div className="text-2xl font-black text-white mt-1">
                  {currentUser?.goal || 'Strength'}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {currentUser?.workoutDays || 3} active workout days per week
                </p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Equipment Setup</h3>
                <div className="text-2xl font-black text-white mt-1">
                  {currentUser?.equipment || 'Home equipment'}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Duration: {currentUser?.workoutDuration || '30-45 min'}
                </p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Refinements</h3>
                <div className="text-2xl font-black text-white mt-1">
                  {feedbackHistory.length} Updates
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Original plan baseline safely stored
                </p>
              </div>
            </div>

            {/* Quick Summary of Days */}
            {currentPlan && (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg font-bold text-white mb-4">Active Weekly Blueprint</h3>
                <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                  {currentPlan.days.map(d => (
                    <div
                      key={d.dayNumber}
                      onClick={() => setActiveTab('plan')}
                      className={`p-3.5 rounded-xl border cursor-pointer hover:scale-105 transition-all ${
                        d.isRestDay
                          ? 'bg-slate-950/60 border-cyan-900/40 text-cyan-300'
                          : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-emerald-500'
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Day {d.dayNumber}</div>
                      <div className="text-xs font-bold mt-1 line-clamp-2">{d.focus}</div>
                      <div className="text-[10px] text-slate-400 mt-2">
                        {d.isRestDay ? 'Rest / Mobility' : `${d.estimatedDurationMinutes} mins`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: COACH / ADMIN DASHBOARD */}
        {/* ======================================================== */}
        {activeTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin & Coach Oversight
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">Registered Athletes & AI Plans</h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Review member fitness questionnaires, original vs updated Gemini workout plans, and refinement requests.
                  </p>
                </div>
                <button
                  onClick={loadAdminUsers}
                  disabled={adminLoading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${adminLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Athletes</span>
                </button>
              </div>

              {/* Filters */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search by name or User ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <select
                    value={goalFilter}
                    onChange={e => setGoalFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="">All Fitness Goals</option>
                    <option value="General wellness">General wellness</option>
                    <option value="Weight management">Weight management</option>
                    <option value="Strength">Strength</option>
                    <option value="Muscle building">Muscle building</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Athlete Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-6">User ID</th>
                      <th className="py-4 px-6">Athlete Name</th>
                      <th className="py-4 px-6">Age / Weight</th>
                      <th className="py-4 px-6">Goal</th>
                      <th className="py-4 px-6">Schedule / Eq</th>
                      <th className="py-4 px-6">Plan Status</th>
                      <th className="py-4 px-6">Last Feedback</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {adminUsers
                      .filter(u => {
                        const matchQ = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                       u.user_id.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchG = !goalFilter || u.goal === goalFilter;
                        return matchQ && matchG;
                      })
                      .map(u => (
                        <tr key={u.user_id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-white">
                            {u.user_id}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-100">
                            {u.name}
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {u.age} yrs / {u.weight} kg
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {u.goal}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {u.workout_days} d/wk • {u.equipment}
                          </td>
                          <td className="py-4 px-6">
                            {u.has_updated_plan ? (
                              <span className="text-teal-400 font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Updated
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">Original</span>
                            )}
                          </td>
                          <td className="py-4 px-6 max-w-xs truncate text-slate-400 italic">
                            {u.last_feedback ? `"${u.last_feedback}"` : '—'}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSelectAdminUser(u.user_id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/20 transition-colors"
                              >
                                View Plan
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.user_id)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {adminUsers.length === 0 && !adminLoading && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No registered athletes found. Click "Create Plan" to generate one!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: PYTHON FASTAPI SOURCE CODE INSPECTOR */}
        {/* ======================================================== */}
        {activeTab === 'python' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Python Backend & Local Setup
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Python FastAPI & SQLAlchemy Architecture
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
                As specified in your requirements, complete Python FastAPI backend files, SQLAlchemy database models, Pydantic schemas, and Jinja2 templates are fully implemented in the project tree.
              </p>

              <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                <div className="text-emerald-400 font-bold mb-2"># Quick Local Run Instructions</div>
                <div className="text-slate-400">1. pip install -r requirements.txt</div>
                <div className="text-slate-400">2. export GOOGLE_API_KEY="your-gemini-key"</div>
                <div className="text-slate-400">3. uvicorn app.main:app --reload --port 8000</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" /> app/main.py
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Mounts FastAPI application, enables CORS, automatically generates SQLite database tables via SQLAlchemy <code className="text-emerald-400">Base.metadata.create_all()</code>, and includes routes.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  from fastapi import FastAPI<br />
                  from app.database import engine, Base<br />
                  from app.routes import router<br /><br />
                  Base.metadata.create_all(bind=engine)<br />
                  app = FastAPI(title="FitBuddy AI")<br />
                  app.include_router(router)
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" /> app/models.py & SQLAlchemy
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Persists <code className="text-emerald-400">User</code>, <code className="text-teal-400">WorkoutPlan</code> (original and updated plans stored separately), and <code className="text-cyan-400">NutritionTip</code> with relational foreign keys.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  class WorkoutPlan(Base):<br />
                  &nbsp;&nbsp;user_id = Column(String, ForeignKey("users.user_id"))<br />
                  &nbsp;&nbsp;original_plan = Column(Text, nullable=False)<br />
                  &nbsp;&nbsp;updated_plan = Column(Text, nullable=True)<br />
                  &nbsp;&nbsp;feedback = Column(Text, nullable=True)
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> app/gemini_generator.py
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Integrates Google Gemini API using structured JSON prompts. Implements safety directives, duration constraints, equipment tailoring, and active recovery days.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  client.models.generate_content(<br />
                  &nbsp;&nbsp;model="gemini-2.5-flash",<br />
                  &nbsp;&nbsp;contents=prompt,<br />
                  &nbsp;&nbsp;config={"{'response_mime_type': 'application/json'}"}<br />
                  )
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400" /> app/updated_plan.py
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Handles iterative feedback loop: takes the baseline original plan and user feedback, asks Gemini to rebalance volume and cardio, and stores the resulting updated plan.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  update_workout_plan(original_plan, user_data, feedback_text)
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-300">FITBUDDY AI</span>
            <span>— Your AI-Powered Personal Fitness Companion</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('home')} className="hover:text-slate-300">Home</button>
            <button onClick={() => setActiveTab('questionnaire')} className="hover:text-slate-300">Create Plan</button>
            <button onClick={() => setActiveTab('admin')} className="hover:text-slate-300">Coach Admin</button>
            <button onClick={() => setActiveTab('python')} className="hover:text-slate-300">FastAPI Specs</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
