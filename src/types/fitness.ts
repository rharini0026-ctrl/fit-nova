export type FitnessGoal =
  | 'General wellness'
  | 'Weight management'
  | 'Strength'
  | 'Muscle building'
  | 'Flexibility'
  | 'Endurance';

export type WorkoutIntensity =
  | 'Beginner / Low'
  | 'Moderate / Medium'
  | 'Advanced / High';

export type ExperienceLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced';

export type EquipmentOption =
  | 'No equipment'
  | 'Home equipment'
  | 'Gym equipment';

export interface Exercise {
  name: string;
  targetMuscle: string;
  sets: number | string;
  repsOrDuration: string;
  rest: string;
  instructions: string;
}

export interface DayWorkout {
  dayNumber: number;
  dayName: string;
  focus: string;
  isRestDay: boolean;
  estimatedDurationMinutes: number;
  warmup: {
    duration: string;
    description: string;
    exercises: string[];
  };
  exercises: Exercise[];
  cooldown: {
    duration: string;
    description: string;
    stretches: string[];
  };
  coachNotes?: string;
}

export interface WorkoutPlanData {
  planTitle: string;
  summary: string;
  weeklyGoal: string;
  safetyAdvice: string;
  days: DayWorkout[];
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  weight: number;
  goal: FitnessGoal;
  experience: ExperienceLevel;
  intensity: WorkoutIntensity;
  workoutDays: number;
  workoutDuration: string;
  equipment: EquipmentOption;
  medicalConditions?: string;
  createdAt: string;
}

export interface NutritionTipData {
  id: string;
  userId: string;
  title: string;
  category: 'Hydration' | 'Nutrition' | 'Sleep & Recovery' | 'Pre/Post Workout';
  content: string;
  practicalTips: string[];
  createdAt: string;
}

export interface StoredWorkoutPlan {
  id: string;
  userId: string;
  originalPlan: WorkoutPlanData;
  updatedPlan?: WorkoutPlanData | null;
  feedbackHistory: Array<{
    feedbackText: string;
    appliedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteUserData {
  user: UserProfile;
  plan: StoredWorkoutPlan | null;
  nutritionTip: NutritionTipData | null;
}
