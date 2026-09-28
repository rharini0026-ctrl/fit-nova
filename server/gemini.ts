import { GoogleGenAI } from '@google/genai';
import { NutritionTipData, UserProfile, WorkoutPlanData } from '../src/types/fitness.js';

// Support both GEMINI_API_KEY and GOOGLE_API_KEY
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with key:', err);
  }
}

/**
 * Generate a personalized 7-day fitness plan using Gemini
 */
export async function generateAiWorkoutPlan(user: UserProfile): Promise<WorkoutPlanData> {
  const prompt = `
You are a certified professional fitness coach and health expert acting as FitBuddy AI.
Create a safe, beginner-friendly, and personalized 7-day fitness plan based on the user's specific profile:

User Information:
- Name: ${user.name}
- Age: ${user.age}
- Weight: ${user.weight} kg
- Fitness Goal: ${user.goal}
- Experience Level: ${user.experience}
- Workout Intensity: ${user.intensity}
- Available Workout Days: ${user.workoutDays} days per week
- Preferred Duration: ${user.workoutDuration}
- Equipment: ${user.equipment}
${user.medicalConditions ? `- Health Notes / Considerations: ${user.medicalConditions}` : ''}

SAFETY & DESIGN DIRECTIVES:
1. Provide a structured 7-day plan from Day 1 to Day 7.
2. The user has ${user.workoutDays} active workout days. The remaining ${7 - user.workoutDays} days MUST be dedicated Rest / Active Recovery days (e.g. gentle walks, mobility stretching, hydration, nervous system reset).
3. If the user is a Beginner, provide joint-friendly, scalable exercises with clear cues. Never prescribe extreme or dangerous movements.
4. If equipment is "${user.equipment}", only include exercises possible with that equipment.
5. For EVERY day (1 through 7), return:
   - dayNumber: integer (1-7)
   - dayName: string (e.g. "Day 1: Full Body Mobility & Push")
   - focus: string (e.g. "Chest, Triceps & Core" or "Active Recovery & Mobility")
   - isRestDay: boolean (true if rest/recovery day, false if active workout)
   - estimatedDurationMinutes: integer
   - warmup: object with duration (string), description (string), exercises (array of strings)
   - exercises: array of 3 to 5 exercises. Each exercise must have:
       - name (string)
       - targetMuscle (string)
       - sets (number or string, e.g. 3)
       - repsOrDuration (string, e.g. "10-12 reps" or "40 seconds")
       - rest (string, e.g. "60-90 sec")
       - instructions (string, concise safe form cue)
   - cooldown: object with duration (string), description (string), stretches (array of strings)
   - coachNotes: string (supportive encouraging tip)

6. Return valid JSON matching the following schema:
{
  "planTitle": "string",
  "summary": "string",
  "weeklyGoal": "string",
  "safetyAdvice": "string",
  "days": [ ... array of 7 day objects as described ... ]
}
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.days && Array.isArray(parsed.days) && parsed.days.length > 0) {
          return parsed as WorkoutPlanData;
        }
      }
    } catch (error) {
      console.warn('Gemini API call failed, falling back to algorithmic generator:', error);
    }
  }

  // Graceful high-quality fallback generator
  return generateAlgorithmicPlan(user);
}

/**
 * Generate a practical nutrition and recovery wellness tip
 */
export async function generateAiNutritionTip(user: UserProfile): Promise<NutritionTipData> {
  const prompt = `
You are a responsible sports nutritionist and wellness advisor.
Generate a practical, evidence-based, general nutrition and recovery tip for:
User: ${user.name}, Goal: ${user.goal}, Intensity: ${user.intensity}, Experience: ${user.experience}.

Guidelines:
- General wellness advice only (hydration, protein balance, whole foods, sleep, recovery).
- DO NOT prescribe extreme calorie deficits, crash diets, or dangerous supplements.
- Return valid JSON matching:
{
  "title": "string",
  "category": "Hydration" | "Nutrition" | "Sleep & Recovery" | "Pre/Post Workout",
  "content": "string (2-3 sentences)",
  "practicalTips": ["tip 1", "tip 2", "tip 3", "tip 4"]
}
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return {
          id: 'tip-' + Date.now(),
          userId: user.userId,
          title: parsed.title || 'Personalized Wellness & Nutrition Guide',
          category: parsed.category || 'Nutrition',
          content: parsed.content || 'Nourish your body consistently to support recovery and daily vitality.',
          practicalTips: parsed.practicalTips || [
            'Drink water steadily throughout the day.',
            'Incorporate protein and fiber in main meals.',
            'Aim for 7-8 hours of quality sleep.'
          ],
          createdAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Gemini nutrition tip generation error:', error);
    }
  }

  // Fallback tip based on goal
  return getFallbackNutritionTip(user);
}

/**
 * Update an existing workout plan based on user feedback
 */
export async function updateAiWorkoutPlan(
  originalPlan: WorkoutPlanData,
  user: UserProfile,
  feedback: string
): Promise<WorkoutPlanData> {
  const prompt = `
You are FitBuddy AI.
The user has reviewed their original 7-day fitness plan and provided specific feedback to improve or customize it.

User Profile:
- Name: ${user.name}
- Age: ${user.age}
- Goal: ${user.goal}
- Experience: ${user.experience}
- Equipment: ${user.equipment}

Original Plan Title: "${originalPlan.planTitle}"
Original Summary: "${originalPlan.summary}"
Original Days: ${JSON.stringify(originalPlan.days.map(d => ({ day: d.dayNumber, focus: d.focus, isRest: d.isRestDay })))}

User's Improvement Feedback:
"${feedback}"

INSTRUCTIONS:
1. Revise the 7-day plan directly addressing the user's feedback (e.g. if they asked for more cardio, adjust cardio frequency; if they asked for easier exercises or more rest, modify sets, intensity, or rest days).
2. Maintain complete 7 days (Day 1 through Day 7) structure with warmups, exercises, sets/reps, rest, and cooldowns.
3. Update the planTitle (e.g. appending "[Customized: ...]") and write an updated summary explaining specifically what changes were made.
4. Return valid JSON matching:
{
  "planTitle": "string",
  "summary": "string",
  "weeklyGoal": "string",
  "safetyAdvice": "string",
  "days": [ ... 7 days with dayNumber, dayName, focus, isRestDay, estimatedDurationMinutes, warmup, exercises, cooldown, coachNotes ... ]
}
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.days && Array.isArray(parsed.days) && parsed.days.length > 0) {
          return parsed as WorkoutPlanData;
        }
      }
    } catch (error) {
      console.warn('Gemini update plan failed, falling back:', error);
    }
  }

  // Fallback update modifier
  return modifyPlanAlgorithmic(originalPlan, user, feedback);
}

// ==========================================
// Safe Algorithmic Fallback Generator
// ==========================================
function generateAlgorithmicPlan(user: UserProfile): WorkoutPlanData {
  const activeDays = Math.min(Math.max(user.workoutDays || 3, 2), 6);
  const eq = user.equipment;
  const isGym = eq === 'Gym equipment';
  const isHome = eq === 'Home equipment';

  const days: WorkoutPlanData['days'] = [];

  const splits: Record<number, string[]> = {
    2: ['Full Body Foundation A', 'Full Body Foundation B'],
    3: ['Full Body Push & Core', 'Full Body Pull & Legs', 'Full Body Conditioning & Mobility'],
    4: ['Upper Body Push & Core', 'Lower Body Strength & Posterior', 'Upper Body Pull & Posture', 'Full Body Dynamic Circuit'],
    5: ['Chest & Triceps', 'Back & Biceps', 'Legs & Calves', 'Shoulders & Core', 'Total Conditioning & Mobility'],
    6: ['Push Workout A', 'Pull Workout A', 'Legs Workout A', 'Push Workout B', 'Pull Workout B', 'Legs & Core B'],
  };

  const activeDayFoci = splits[activeDays] || splits[3];

  let activeIndex = 0;
  for (let dayNum = 1; dayNum <= 7; dayNum++) {
    // Schedule distribution: alternate workout and rest if possible
    const shouldBeWorkout = (dayNum % 2 === 1 && activeIndex < activeDays) || (activeIndex < activeDays && 7 - dayNum < activeDays - activeIndex);

    if (shouldBeWorkout && activeIndex < activeDays) {
      const focusName = activeDayFoci[activeIndex] || `Targeted Workout ${activeIndex + 1}`;
      activeIndex++;

      const isPush = focusName.toLowerCase().includes('push') || focusName.toLowerCase().includes('chest');
      const isPull = focusName.toLowerCase().includes('pull') || focusName.toLowerCase().includes('back');
      const isLegs = focusName.toLowerCase().includes('leg') || focusName.toLowerCase().includes('lower');

      const warmupEx = isPush
        ? ['Arm circles (30s each direction)', 'Cat-cow spinal mobility (10 reps)', 'Wall push-ups or band pull-aparts (15 reps)']
        : isPull
        ? ['Scapular shoulder blade pinches (12 reps)', 'Doorway torso twists (10 reps each side)', 'Dead hang or reach stretch (30s)']
        : ['Bodyweight hip hinges (12 reps)', 'Air squats at easy tempo (10 reps)', 'Ankle mobility circles (10 each side)'];

      const exercises = [
        {
          name: isPush ? (isGym ? 'Dumbbell Flat Bench Press' : isHome ? 'Dumbbell Floor Press' : 'Standard or Incline Push-ups')
                       : isPull ? (isGym ? 'Lat Pulldowns or Cable Rows' : isHome ? 'Resistance Band Rows' : 'Inverted Towel or Door Rows')
                       : (isGym ? 'Goblet Squats with Dumbbell' : isHome ? 'Home Dumbbell Squats' : 'Controlled Tempo Air Squats'),
          targetMuscle: isPush ? 'Pectorals & Triceps' : isPull ? 'Latissimus Dorsi & Rhomboids' : 'Quadriceps & Gluteal complex',
          sets: user.experience === 'Beginner' ? 3 : 4,
          repsOrDuration: user.goal === 'Strength' ? '6-8 reps' : '10-12 reps',
          rest: user.goal === 'Strength' ? '90 sec' : '60 sec',
          instructions: 'Brace your midsection, move in a steady controlled cadence, and keep continuous tension on the target muscles.'
        },
        {
          name: isPush ? (isGym ? 'Seated Dumbbell Overhead Press' : isHome ? 'Standing Band Shoulder Press' : 'Pike Push-ups with knees bent')
                       : isPull ? (isGym ? 'Seated Cable Face Pulls' : isHome ? 'Band Pull-Aparts' : 'Prone Cobra Back Extensions')
                       : (isGym ? 'Romanian Deadlifts (Dumbbells)' : isHome ? 'Band Hip Hinges' : 'Single-Leg Glute Bridges'),
          targetMuscle: isPush ? 'Deltoids & Upper Traps' : isPull ? 'Posterior Deltoids & Mid Traps' : 'Hamstrings & Gluteus Maximus',
          sets: 3,
          repsOrDuration: '10-12 reps',
          rest: '60 sec',
          instructions: 'Prioritize posture and spinal alignment throughout the range of motion.'
        },
        {
          name: isPush ? (isGym ? 'Cable Triceps Pressdown' : isHome ? 'Overhead Band Extension' : 'Bench / Chair Triceps Dips')
                       : isPull ? (isGym ? 'Dumbbell Bicep Curls' : isHome ? 'Band Bicep Curls' : 'Isometric Doorframe Hold')
                       : (isGym ? 'Walking Dumbbell Lunges' : isHome ? 'Reverse Lunges' : 'Alternating Step Lunges'),
          targetMuscle: isPush ? 'Triceps Brachii' : isPull ? 'Biceps Brachii' : 'Quads, Calves & Balance',
          sets: 3,
          repsOrDuration: '12-15 reps',
          rest: '45-60 sec',
          instructions: 'Focus on full range of motion without momentum or swinging.'
        },
        {
          name: 'Plank with Controlled Breathing',
          targetMuscle: 'Transverse Abdominis & Deep Core',
          sets: 3,
          repsOrDuration: user.experience === 'Beginner' ? '25-35 seconds' : '45-60 seconds',
          rest: '45 sec',
          instructions: 'Keep elbows directly beneath shoulders, squeeze glutes, and draw belly button gently inward.'
        }
      ];

      days.push({
        dayNumber: dayNum,
        dayName: `Day ${dayNum}: ${focusName}`,
        focus: focusName,
        isRestDay: false,
        estimatedDurationMinutes: parseInt(user.workoutDuration.split('-')[0]) || 40,
        warmup: {
          duration: '6-8 mins',
          description: 'Dynamic joint lubrication and light heart rate elevation.',
          exercises: warmupEx
        },
        exercises,
        cooldown: {
          duration: '5-7 mins',
          description: 'Static stretching and heart rate deceleration.',
          stretches: ['Doorframe chest or lat stretch (45s)', 'Hamstring sweep stretch (45s per leg)', 'Slow box breathing (2 minutes)']
        },
        coachNotes: 'Always keep 1-2 repetitions in reserve. Consistency beats intensity every single time.'
      });
    } else {
      // Rest or Active Recovery Day
      days.push({
        dayNumber: dayNum,
        dayName: `Day ${dayNum}: Active Rest & Recovery`,
        focus: 'Fascial Recovery & Cardiovascular Circulation',
        isRestDay: true,
        estimatedDurationMinutes: 20,
        warmup: {
          duration: '4 mins',
          description: 'Gentle neck rolls and relaxed shoulder shrugs.',
          exercises: ['Neck rotation 5x each way', 'Gentle spinal twists']
        },
        exercises: [
          {
            name: 'Low-Intensity Conversational Walk',
            targetMuscle: 'Cardiorespiratory Circulation',
            sets: 1,
            repsOrDuration: '20-25 mins',
            rest: 'N/A',
            instructions: 'Walk outdoors at a comfortable pace where you can easily speak full sentences. Stimulates lymphatic flush.'
          },
          {
            name: 'Gentle Hip & Spinal Mobility Flow',
            targetMuscle: 'Hip Flexors & Thoracic Spine',
            sets: 1,
            repsOrDuration: '8-10 mins',
            rest: 'Self-paced',
            instructions: 'Spend 60 seconds each in child\'s pose, downward dog, and seated butterfly.'
          }
        ],
        cooldown: {
          duration: '4 mins',
          description: 'Mindful relaxation and restorative breathing.',
          stretches: ['Supine twist (1 min each side)', 'Legs up on a couch or wall for blood circulation (3 mins)']
        },
        coachNotes: 'Recovery is the secret ingredient of fitness. Stay hydrated and prioritize quality sleep.'
      });
    }
  }

  return {
    planTitle: `Personalized 7-Day ${user.goal} Plan`,
    summary: `Tailored for ${user.name} (${user.experience} level, ${user.intensity} intensity) using ${user.equipment}. Designed with ${activeDays} active training sessions and ${7 - activeDays} active recovery periods for optimal progress without burnout.`,
    weeklyGoal: `Establish consistent workout habits, strengthen core movement patterns, and enhance weekly vitality safely.`,
    safetyAdvice: `Always warm up before beginning exercises. If any movement produces sharp joint pain, stop immediately and choose a gentler alternative.`,
    days
  };
}

function getFallbackNutritionTip(user: UserProfile): NutritionTipData {
  const tipsByGoal: Record<string, { title: string; category: NutritionTipData['category']; content: string; practicalTips: string[] }> = {
    'Weight management': {
      title: 'Mindful Satiety & Whole Food Volume',
      category: 'Nutrition',
      content: 'Sustainable weight management is driven by choosing nutrient-dense, high-volume foods like vegetables, lean proteins, and legumes that keep you satisfied while nourishing your metabolism.',
      practicalTips: [
        'Aim to fill half your dinner plate with non-starchy colorful vegetables.',
        'Drink a large glass of water 15 minutes before your main meals.',
        'Include 20-30g of protein in your breakfast to curb mid-morning cravings.',
        'Avoid restrictive crash diets; focus on sustainable habits you enjoy.'
      ]
    },
    'Strength': {
      title: 'Nutrient Timing for Muscle Recovery & Power',
      category: 'Pre/Post Workout',
      content: 'To maximize strength gains and repair micro-tears in muscle fibers, distribute protein intake consistently every 3 to 4 hours and replenish with complex carbs after workouts.',
      practicalTips: [
        'Consume a post-workout snack with both protein and complex carbohydrates within 90 minutes.',
        'Hydrate with electrolytes if training in warm conditions or sweating heavily.',
        'Include healthy fats (olive oil, avocados, seeds) to support hormone production.',
        'Aim for 7 to 9 hours of restorative sleep to maximize natural tissue repair.'
      ]
    },
    'General wellness': {
      title: 'Foundational Hydration & Natural Energy Rhythm',
      category: 'Hydration',
      content: 'Proper daily hydration improves cognitive clarity, digestion, and workout performance. Start your day with water before caffeine to replenish overnight fluid loss.',
      practicalTips: [
        'Carry a water bottle and sip steadily rather than chugging large amounts at once.',
        'Eat a colorful variety of fruits and vegetables for natural antioxidants.',
        'Establish a regular sleep schedule to regulate your natural circadian rhythm.',
        'Incorporate a 10-minute post-meal stroll to aid natural blood sugar regulation.'
      ]
    }
  };

  const selected = tipsByGoal[user.goal] || tipsByGoal['General wellness'];

  return {
    id: 'tip-' + Date.now(),
    userId: user.userId,
    title: selected.title,
    category: selected.category,
    content: selected.content,
    practicalTips: selected.practicalTips,
    createdAt: new Date().toISOString()
  };
}

function modifyPlanAlgorithmic(originalPlan: WorkoutPlanData, user: UserProfile, feedback: string): WorkoutPlanData {
  const feedbackLower = feedback.toLowerCase();
  const updatedDays = JSON.parse(JSON.stringify(originalPlan.days)) as WorkoutPlanData['days'];

  let changeNotes = 'Updated based on your custom feedback: ';

  if (feedbackLower.includes('cardio')) {
    changeNotes += 'Integrated extra 8-10 minutes of aerobic cardio warmups and low-impact finishers. ';
    updatedDays.forEach(day => {
      if (!day.isRestDay) {
        day.warmup.exercises.push('Light cardio jog in place or jumping jacks (2 mins)');
        day.exercises.push({
          name: 'Low-Impact Cardio Finisher (Shadow Boxing or Incline Walk)',
          targetMuscle: 'Cardiorespiratory System',
          sets: 1,
          repsOrDuration: '8 mins continuous',
          rest: 'Cool-down follows',
          instructions: 'Maintain moderate heart rate to burn calories and boost aerobic capacity.'
        });
      }
    });
  } else if (feedbackLower.includes('easier') || feedbackLower.includes('light')) {
    changeNotes += 'Reduced set volumes and introduced extended rest intervals for greater recovery. ';
    updatedDays.forEach(day => {
      day.exercises.forEach(ex => {
        if (typeof ex.sets === 'number' && ex.sets > 2) {
          ex.sets = ex.sets - 1;
        }
        ex.rest = '75-90 sec (extended for comfort)';
      });
    });
  } else if (feedbackLower.includes('rest') || feedbackLower.includes('tired')) {
    changeNotes += 'Converted Day 4 into an additional restorative active rest day. ';
    if (updatedDays[3]) {
      updatedDays[3].isRestDay = true;
      updatedDays[3].focus = 'Extra Rest & Restoration';
      updatedDays[3].dayName = 'Day 4: Rest & Mobility Recovery';
      updatedDays[3].exercises = [
        {
          name: 'Relaxed Outdoor Walking',
          targetMuscle: 'Full Body Circulation',
          sets: 1,
          repsOrDuration: '20 mins',
          rest: 'N/A',
          instructions: 'Easy pace to allow joints and nervous system to rejuvenate.'
        }
      ];
    }
  } else {
    changeNotes += `Tailored routines and pacing to accommodate: "${feedback}". `;
  }

  return {
    planTitle: `${originalPlan.planTitle} (Updated)`,
    summary: `${changeNotes}Original baseline preserved.`,
    weeklyGoal: originalPlan.weeklyGoal,
    safetyAdvice: originalPlan.safetyAdvice,
    days: updatedDays
  };
}
