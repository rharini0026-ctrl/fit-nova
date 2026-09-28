import fs from 'fs';
import path from 'path';
import { CompleteUserData, NutritionTipData, StoredWorkoutPlan, UserProfile, WorkoutPlanData } from '../src/types/fitness.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'fitbuddy_db.json');

interface DatabaseSchema {
  users: Record<string, UserProfile>;
  plans: Record<string, StoredWorkoutPlan>;
  nutritionTips: Record<string, NutritionTipData>;
}

// Initial seed data so the dashboard and admin panel are immediately interactive
const initialData: DatabaseSchema = {
  users: {
    'user-alex-101': {
      id: 'usr-1',
      userId: 'user-alex-101',
      name: 'Alex Rivera',
      age: 28,
      weight: 72,
      goal: 'Strength',
      experience: 'Intermediate',
      intensity: 'Moderate / Medium',
      workoutDays: 4,
      workoutDuration: '45-60 min',
      equipment: 'Gym equipment',
      medicalConditions: '',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    'user-sarah-202': {
      id: 'usr-2',
      userId: 'user-sarah-202',
      name: 'Sarah Jenkins',
      age: 34,
      weight: 65,
      goal: 'Weight management',
      experience: 'Beginner',
      intensity: 'Beginner / Low',
      workoutDays: 3,
      workoutDuration: '30-45 min',
      equipment: 'Home equipment',
      medicalConditions: 'Mild lower back sensitivity',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    }
  },
  plans: {
    'user-alex-101': {
      id: 'plan-1',
      userId: 'user-alex-101',
      originalPlan: {
        planTitle: '4-Day Progressive Strength & Functional Hypertrophy',
        summary: 'Targeted upper/lower split focusing on compound strength lifts with dedicated core stability and active rest.',
        weeklyGoal: 'Build foundational compound lift strength and increase upper body muscular endurance safely.',
        safetyAdvice: 'Prioritize strict form over weight on all multi-joint lifts. Rest 90-120 seconds between heavier sets.',
        days: [
          {
            dayNumber: 1,
            dayName: 'Day 1: Upper Body Push & Core Foundation',
            focus: 'Chest, Shoulders & Triceps Strength',
            isRestDay: false,
            estimatedDurationMinutes: 50,
            warmup: {
              duration: '8 mins',
              description: 'Dynamic shoulder mobility, arm circles, band pull-aparts and cat-cow stretches.',
              exercises: ['Band Pull-Aparts 2x15', 'Arm Circles 30s each way', 'Scapular Push-ups 2x10']
            },
            exercises: [
              {
                name: 'Dumbbell Bench Press',
                targetMuscle: 'Pectorals & Anterior Deltoids',
                sets: 4,
                repsOrDuration: '8-10 reps',
                rest: '90 sec',
                instructions: 'Retract scapula, keep feet planted firmly, lower dumbbells smoothly to chest level and press with control.'
              },
              {
                name: 'Seated Dumbbell Shoulder Press',
                targetMuscle: 'Medial & Anterior Deltoids',
                sets: 3,
                repsOrDuration: '10-12 reps',
                rest: '75 sec',
                instructions: 'Maintain upright torso, press dumbbells upward in a natural arc without arching lower back.'
              },
              {
                name: 'Cable Triceps Pushdowns',
                targetMuscle: 'Triceps Brachii',
                sets: 3,
                repsOrDuration: '12-15 reps',
                rest: '60 sec',
                instructions: 'Pin elbows to sides, extend fully downwards, controlling the eccentric return phase.'
              },
              {
                name: 'Plank with Shoulder Taps',
                targetMuscle: 'Transverse Abdominis & Obliques',
                sets: 3,
                repsOrDuration: '40 seconds',
                rest: '45 sec',
                instructions: 'Keep hips level without rotating side-to-side as hands alternate touching opposite shoulders.'
              }
            ],
            cooldown: {
              duration: '6 mins',
              description: 'Doorway chest stretch, cross-body shoulder stretch and deep diaphragm breathing.',
              stretches: ['Doorway Pectoral Stretch (30s per side)', 'Cross-Body Deltoid Stretch (30s per side)', 'Child\'s Pose (60s)']
            },
            coachNotes: 'Focus on explosive push and a controlled 2-second lowering tempo.'
          },
          {
            dayNumber: 2,
            dayName: 'Day 2: Lower Body Posterior Chain & Stability',
            focus: 'Quads, Hamstrings & Glute Drive',
            isRestDay: false,
            estimatedDurationMinutes: 50,
            warmup: {
              duration: '8 mins',
              description: 'Bodyweight squats, walking lunges, hip openers and ankle mobility circles.',
              exercises: ['Leg Swings 15x per leg', 'Glute Bridges 2x15', 'Inchworms 2x6']
            },
            exercises: [
              {
                name: 'Goblet Squats',
                targetMuscle: 'Quadriceps, Glutes & Core',
                sets: 4,
                repsOrDuration: '10-12 reps',
                rest: '90 sec',
                instructions: 'Hold dumbbell vertically at chest, break at hips and knees simultaneously, descend until thighs parallel.'
              },
              {
                name: 'Romanian Deadlifts (Dumbbells)',
                targetMuscle: 'Hamstrings & Gluteus Maximus',
                sets: 3,
                repsOrDuration: '10-12 reps',
                rest: '90 sec',
                instructions: 'Hinge hips backwards, maintain neutral spine, feel deep stretch in hamstrings before driving hips forward.'
              },
              {
                name: 'Dumbbell Walking Lunges',
                targetMuscle: 'Quads & Balance',
                sets: 3,
                repsOrDuration: '10 paces per leg',
                rest: '60 sec',
                instructions: 'Step forward in controlled stride, drop back knee gently toward floor while keeping torso tall.'
              },
              {
                name: 'Standing Calf Raises',
                targetMuscle: 'Gastrocnemius & Soleus',
                sets: 3,
                repsOrDuration: '15-20 reps',
                rest: '45 sec',
                instructions: 'Pause at peak contraction for 1 full second, then lower heels slowly below step level.'
              }
            ],
            cooldown: {
              duration: '7 mins',
              description: 'Hamstring stretch, kneeling hip flexor stretch and seated butterfly stretch.',
              stretches: ['Kneeling Hip Flexor Stretch (45s per side)', 'Seated Hamstring Reach (45s)', 'Figure 4 Piriformis Stretch (45s per side)']
            }
          },
          {
            dayNumber: 3,
            dayName: 'Day 3: Active Rest & Fascial Recovery',
            focus: 'Recovery, Walking & Mobility Flow',
            isRestDay: true,
            estimatedDurationMinutes: 25,
            warmup: {
              duration: '5 mins',
              description: 'Gentle spinal twists and neck releases.',
              exercises: ['Deep diaphragmatic breathing', 'Gentle neck rotations']
            },
            exercises: [
              {
                name: 'Brisk Outdoor Walk or Light Cycling',
                targetMuscle: 'Cardiovascular Circulation & Recovery',
                sets: 1,
                repsOrDuration: '20-25 mins',
                rest: 'N/A',
                instructions: 'Maintain easy conversational pace (Zone 1-2) to flush metabolic waste and increase blood flow.'
              },
              {
                name: 'Full Body Foam Rolling',
                targetMuscle: 'Myofascial Release (Back, Quads, IT-band)',
                sets: 1,
                repsOrDuration: '10 mins total',
                rest: 'As needed',
                instructions: 'Gently roll back and forth over muscle bellies, pausing for 20-30s on tight tender spots.'
              }
            ],
            cooldown: {
              duration: '5 mins',
              description: 'Supine spinal twist and corpse pose deep relaxation.',
              stretches: ['Supine Spinal Twist (60s per side)', 'Legs Up the Wall (3 mins)']
            },
            coachNotes: 'Rest is where muscles repair and rebuild. Prioritize 8 hours of quality sleep.'
          },
          {
            dayNumber: 4,
            dayName: 'Day 4: Upper Body Pull & Posterior Delts',
            focus: 'Back Thickness, Lats & Biceps',
            isRestDay: false,
            estimatedDurationMinutes: 50,
            warmup: {
              duration: '7 mins',
              description: 'Dead hangs, scapular pull-ups, arm windmills.',
              exercises: ['Dead Hang on Pull-up Bar 30s', 'Scapular Pull-ups 2x8', 'Band Face Pulls 2x15']
            },
            exercises: [
              {
                name: 'Lat Pulldowns or Assisted Pull-ups',
                targetMuscle: 'Latissimus Dorsi & Lower Traps',
                sets: 4,
                repsOrDuration: '8-10 reps',
                rest: '90 sec',
                instructions: 'Drive elbows down toward hip pockets, slight arch in upper back, squeeze shoulder blades together.'
              },
              {
                name: 'One-Arm Dumbbell Rows',
                targetMuscle: 'Rhomboids, Lats & Middle Trapezius',
                sets: 3,
                repsOrDuration: '10 reps each side',
                rest: '60 sec',
                instructions: 'Keep back flat parallel to floor, pull dumbbell toward hip pocket avoiding twisting torso.'
              },
              {
                name: 'Face Pulls with Rope',
                targetMuscle: 'Posterior Deltoids & Rotator Cuff',
                sets: 3,
                repsOrDuration: '15 reps',
                rest: '60 sec',
                instructions: 'Pull cable rope toward eyes while externally rotating thumbs back. Essential for posture.'
              },
              {
                name: 'Incline Dumbbell Bicep Curls',
                targetMuscle: 'Biceps Brachii (Long Head)',
                sets: 3,
                repsOrDuration: '12 reps',
                rest: '60 sec',
                instructions: 'Sit on 60-degree incline, let arms hang fully extended, curl with supinated palms.'
              }
            ],
            cooldown: {
              duration: '6 mins',
              description: 'Lat doorway stretch and forearm flexor releases.',
              stretches: ['Lat Doorframe Stretch (45s per side)', 'Forearm Wrist Flexor Stretch (30s each)', 'Child\'s Pose (60s)']
            }
          },
          {
            dayNumber: 5,
            dayName: 'Day 5: Full Body Functional & Core Circuit',
            focus: 'Functional Strength & Work Capacity',
            isRestDay: false,
            estimatedDurationMinutes: 45,
            warmup: {
              duration: '8 mins',
              description: 'Jumping jacks, high knees, dynamic thoracic rotations.',
              exercises: ['Jumping Jacks 60s', 'World\'s Greatest Stretch 5x per side', 'Bird-Dog 2x10 per side']
            },
            exercises: [
              {
                name: 'Kettlebell or Dumbbell Deadlifts',
                targetMuscle: 'Whole Posterior Chain & Core',
                sets: 3,
                repsOrDuration: '10-12 reps',
                rest: '75 sec',
                instructions: 'Brace core, keep spine neutral, stand tall and lock out hips firmly.'
              },
              {
                name: 'Push-Up to Downward Dog',
                targetMuscle: 'Chest, Triceps & Hamstring Mobility',
                sets: 3,
                repsOrDuration: '10-12 reps',
                rest: '60 sec',
                instructions: 'Complete standard push-up then press hips up and back into downward dog, pressing heels to ground.'
              },
              {
                name: 'Farmer\'s Carry Walks',
                targetMuscle: 'Forearms, Traps & Core Anti-Lateral Flexion',
                sets: 3,
                repsOrDuration: '40 meters walk',
                rest: '60 sec',
                instructions: 'Pick up heavy pair of dumbbells, walk with proud posture, shoulders down and back.'
              },
              {
                name: 'Hanging Knee Raises or Reverse Crunches',
                targetMuscle: 'Lower Rectus Abdominis',
                sets: 3,
                repsOrDuration: '12-15 reps',
                rest: '45 sec',
                instructions: 'Curl pelvis up toward ribcage rather than just swinging legs.'
              }
            ],
            cooldown: {
              duration: '6 mins',
              description: 'Cobra stretch into child\'s pose.',
              stretches: ['Cobra Abdominal Stretch (30s)', 'Downward Facing Dog (45s)', 'Seated Spinal Twist (45s per side)']
            }
          },
          {
            dayNumber: 6,
            dayName: 'Day 6: Low-Impact Cardio & Core Stability',
            focus: 'Aerobic Base & Trunk Stability',
            isRestDay: true,
            estimatedDurationMinutes: 30,
            warmup: {
              duration: '5 mins',
              description: 'Gentle joint rotations and easy pacing.',
              exercises: ['Easy treadmill or elliptical pace']
            },
            exercises: [
              {
                name: 'Zone 2 Incline Walking or Rowing',
                targetMuscle: 'Cardiorespiratory Endurance',
                sets: 1,
                repsOrDuration: '25 mins steady',
                rest: 'N/A',
                instructions: 'Keep heart rate between 60-70% max, breathing comfortably through nose if possible.'
              },
              {
                name: 'Bird-Dog and Side Planks',
                targetMuscle: 'Multifidus & Quadratus Lumborum',
                sets: 2,
                repsOrDuration: '30s hold per side',
                rest: '30 sec',
                instructions: 'Lock core tightly, align shoulders, hips and ankles in straight line.'
              }
            ],
            cooldown: {
              duration: '5 mins',
              description: 'Calf stretches and slow breathing.',
              stretches: ['Wall Calf Stretch (45s each)', 'Deep Box Breathing (2 mins)']
            }
          },
          {
            dayNumber: 7,
            dayName: 'Day 7: Complete Rest & Mindful Regeneration',
            focus: 'Central Nervous System Reset',
            isRestDay: true,
            estimatedDurationMinutes: 15,
            warmup: {
              duration: '5 mins',
              description: 'Gentle morning stretch routine in bed or floor.',
              exercises: ['Knee to chest hugs', 'Slow torso twists']
            },
            exercises: [
              {
                name: 'Leisurely Stroll or Light Yoga',
                targetMuscle: 'Mind-Body Wellness',
                sets: 1,
                repsOrDuration: '15-20 mins',
                rest: 'N/A',
                instructions: 'No timing or tracking. Enjoy fresh air, sunlight, and relaxed natural pacing.'
              }
            ],
            cooldown: {
              duration: '5 mins',
              description: 'Meditation and recovery hydration.',
              stretches: ['Reclined Bound Angle Pose (3 mins)', 'Slow diaphragmatic relaxation']
            },
            coachNotes: 'Prepare your workout gear and meal prep for next week!'
          }
        ]
      },
      updatedPlan: {
        planTitle: '4-Day Progressive Strength (Updated with Extra Shoulder Stability & Cardio)',
        summary: 'Updated based on your feedback: Incorporated dedicated rotator cuff warmups, slightly increased rest times for strength gains, and added 10 minutes of low-impact steady state cardio.',
        weeklyGoal: 'Enhance upper body pressing power while keeping shoulders bulletproof and maintaining cardiovascular stamina.',
        safetyAdvice: 'Listen to joint cues. Stop 1-2 reps shy of technical failure.',
        days: [
          {
            dayNumber: 1,
            dayName: 'Day 1: Upper Body Push & Shoulder Care',
            focus: 'Chest & Deltoid Strength with Rotator Cuff Priming',
            isRestDay: false,
            estimatedDurationMinutes: 55,
            warmup: {
              duration: '10 mins',
              description: 'Thorough rotator cuff activation: side-lying external rotations, Y-T-W raises, and scapular wall slides.',
              exercises: ['Band External Rotations 2x15', 'Scapular Wall Slides 2x10', 'Arm Circles 40s']
            },
            exercises: [
              {
                name: 'Dumbbell Bench Press',
                targetMuscle: 'Pectorals & Anterior Deltoids',
                sets: 4,
                repsOrDuration: '8-10 reps',
                rest: '90-120 sec',
                instructions: 'Squeeze shoulder blades back and down before pressing. Control the descent.'
              },
              {
                name: 'Incline Neutral-Grip Dumbbell Press',
                targetMuscle: 'Clavicular Head & Front Deltoids',
                sets: 3,
                repsOrDuration: '10-12 reps',
                rest: '90 sec',
                instructions: 'Palms facing inward protects the shoulder capsule while maximizing upper chest activation.'
              },
              {
                name: 'Cable Lateral Raises',
                targetMuscle: 'Lateral Deltoids',
                sets: 3,
                repsOrDuration: '12-15 reps',
                rest: '60 sec',
                instructions: 'Raise hands slightly forward in the scapular plane, avoiding shrugging traps.'
              },
              {
                name: 'Rope Triceps Pushdowns + LISS Finish',
                targetMuscle: 'Triceps & Cardio Finish',
                sets: 3,
                repsOrDuration: '12 reps + 8 min incline walk',
                rest: '60 sec',
                instructions: 'Spread rope apart at bottom lockout, followed by an 8 min gentle cool-down walk.'
              }
            ],
            cooldown: {
              duration: '7 mins',
              description: 'Doorway pectoral release and deep belly breathing.',
              stretches: ['Doorframe Pec Minor Stretch (45s each)', 'Sleeper Stretch for Posterior Capsule (30s each)']
            },
            coachNotes: 'Updated to include neutral grip pressing for enhanced joint comfort.'
          },
          {
            dayNumber: 2,
            dayName: 'Day 2: Lower Body Posterior Chain & Core Focus',
            focus: 'Quads, Hamstrings & Glutes',
            isRestDay: false,
            estimatedDurationMinutes: 50,
            warmup: {
              duration: '8 mins',
              description: 'Hip openers, leg swings and dynamic bridges.',
              exercises: ['Glute Bridges 2x15', 'Leg Swings 15x', 'Inchworms 2x6']
            },
            exercises: [
              {
                name: 'Goblet Squats',
                targetMuscle: 'Quads & Glutes',
                sets: 4,
                repsOrDuration: '10-12 reps',
                rest: '90 sec',
                instructions: 'Maintain upright posture, drive through whole foot.'
              },
              {
                name: 'Romanian Deadlifts',
                targetMuscle: 'Hamstrings & Glutes',
                sets: 3,
                repsOrDuration: '10-12 reps',
                rest: '90 sec',
                instructions: 'Hinge hips backwards, slight soft knee bend.'
              },
              {
                name: 'Walking Lunges',
                targetMuscle: 'Quads & Balance',
                sets: 3,
                repsOrDuration: '10 paces per leg',
                rest: '60 sec',
                instructions: 'Step forward in controlled stride, drop back knee gently.'
              }
            ],
            cooldown: {
              duration: '6 mins',
              description: 'Hamstring and hip flexor stretches.',
              stretches: ['Kneeling Hip Flexor Stretch (45s)', 'Figure 4 Piriformis Stretch (45s)']
            }
          },
          {
            dayNumber: 3,
            dayName: 'Day 3: Active Rest & 30-min Recovery Cardio',
            focus: 'Aerobic Base & Mobility',
            isRestDay: true,
            estimatedDurationMinutes: 30,
            warmup: {
              duration: '5 mins',
              description: 'Easy dynamic neck and torso rolls.',
              exercises: ['Spinal twists', 'Deep breathing']
            },
            exercises: [
              {
                name: 'Zone 2 Outdoor Walk or Stationary Bike',
                targetMuscle: 'Cardiovascular Recovery',
                sets: 1,
                repsOrDuration: '30 mins continuous',
                rest: 'N/A',
                instructions: 'Stay conversational. This flushes soreness from Days 1 and 2.'
              }
            ],
            cooldown: {
              duration: '5 mins',
              description: 'Full body stretching flow.',
              stretches: ['Child\'s pose', 'Pigeon pose (45s per side)']
            }
          },
          {
            dayNumber: 4,
            dayName: 'Day 4: Upper Body Pull & Posterior Chain',
            focus: 'Back Thickness, Lats & Biceps',
            isRestDay: false,
            estimatedDurationMinutes: 50,
            warmup: {
              duration: '7 mins',
              description: 'Band pull aparts and dead hangs.',
              exercises: ['Band Pull-Aparts 2x15', 'Dead Hang 30s']
            },
            exercises: [
              {
                name: 'Lat Pulldowns',
                targetMuscle: 'Lats & Upper Back',
                sets: 4,
                repsOrDuration: '8-10 reps',
                rest: '90 sec',
                instructions: 'Drive elbows down toward waist.'
              },
              {
                name: 'One-Arm Dumbbell Rows',
                targetMuscle: 'Rhomboids & Lats',
                sets: 3,
                repsOrDuration: '10 reps each side',
                rest: '60 sec',
                instructions: 'Keep back flat parallel to floor.'
              },
              {
                name: 'Face Pulls with High External Rotation',
                targetMuscle: 'Rear Delts & Rotator Cuff',
                sets: 3,
                repsOrDuration: '15 reps',
                rest: '60 sec',
                instructions: 'Pull toward forehead, thumbs pointed behind.'
              }
            ],
            cooldown: {
              duration: '6 mins',
              description: 'Lat and bicep wall stretches.',
              stretches: ['Doorframe Lat Stretch (45s)', 'Forearm Flexor Stretch (30s)']
            }
          },
          {
            dayNumber: 5,
            dayName: 'Day 5: Full Body Functional Conditioning',
            focus: 'Core Stability & Functional Strength',
            isRestDay: false,
            estimatedDurationMinutes: 45,
            warmup: {
              duration: '8 mins',
              description: 'Dynamic movement prep.',
              exercises: ['World\'s Greatest Stretch', 'Bird Dog 2x10']
            },
            exercises: [
              {
                name: 'Dumbbell Deadlifts',
                targetMuscle: 'Posterior Chain',
                sets: 3,
                repsOrDuration: '10 reps',
                rest: '75 sec',
                instructions: 'Hinge and lift with neutral spine.'
              },
              {
                name: 'Farmer\'s Carry Walks',
                targetMuscle: 'Grip & Core Anti-Flexion',
                sets: 3,
                repsOrDuration: '45 seconds walk',
                rest: '60 sec',
                instructions: 'Stand tall with heavy dumbbells at sides.'
              },
              {
                name: 'Incline Push-ups to Downward Dog',
                targetMuscle: 'Chest, Triceps & Hamstrings',
                sets: 3,
                repsOrDuration: '12 reps',
                rest: '60 sec',
                instructions: 'Smooth tempo and deep breath.'
              }
            ],
            cooldown: {
              duration: '6 mins',
              description: 'Cobra and child pose.',
              stretches: ['Cobra pose (30s)', 'Child\'s pose (60s)']
            }
          },
          {
            dayNumber: 6,
            dayName: 'Day 6: Low Impact Cardio Flow',
            focus: 'Cardio & Joint Longevity',
            isRestDay: true,
            estimatedDurationMinutes: 30,
            warmup: {
              duration: '5 mins',
              description: 'Joint warm up',
              exercises: ['Ankle rolls', 'Hip circles']
            },
            exercises: [
              {
                name: 'Steady State Cardio (Elliptical or Bike)',
                targetMuscle: 'Cardiorespiratory Health',
                sets: 1,
                repsOrDuration: '25-30 mins',
                rest: 'N/A',
                instructions: 'Low impact to protect knees and hips.'
              }
            ],
            cooldown: {
              duration: '5 mins',
              description: 'Calf and quad stretches',
              stretches: ['Wall calf stretch', 'Standing quad stretch']
            }
          },
          {
            dayNumber: 7,
            dayName: 'Day 7: Full Rest & Restoration',
            focus: 'Recovery and Nervous System Balance',
            isRestDay: true,
            estimatedDurationMinutes: 15,
            warmup: {
              duration: '5 mins',
              description: 'Morning mobility',
              exercises: ['Deep breathing']
            },
            exercises: [
              {
                name: 'Relaxed Nature Walk',
                targetMuscle: 'Mental & Physical Reset',
                sets: 1,
                repsOrDuration: '20 mins',
                rest: 'N/A',
                instructions: 'Keep it peaceful and leisurely.'
              }
            ],
            cooldown: {
              duration: '5 mins',
              description: 'Gentle relaxation and hydration',
              stretches: ['Legs up the wall (5 mins)']
            }
          }
        ]
      },
      feedbackHistory: [
        {
          feedbackText: 'Add more cardio and make sure my shoulders have extra warmup routines.',
          appliedAt: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  },
  nutritionTips: {
    'user-alex-101': {
      id: 'tip-1',
      userId: 'user-alex-101',
      title: 'Optimal Protein Distribution & Muscle Glycogen Replenishment',
      category: 'Nutrition',
      content: 'For your strength training goal, aim to spread high-quality protein evenly across 3-4 meals throughout the day (approx 20-35g per meal). Combine with whole complex carbohydrates within 2 hours after your lifting sessions to replenish depleted muscle glycogen stores.',
      practicalTips: [
        'Consume a source of lean protein (eggs, Greek yogurt, tofu, fish, or chicken) within 90 minutes post-workout.',
        'Target 2.5 to 3 liters of water daily, sipping consistently between sets to maintain muscle contractile strength.',
        'Include anti-inflammatory foods like berries, walnuts, and leafy greens to accelerate tendon and joint recovery.',
        'Prioritize 7-8 hours of uninterrupted sleep; growth hormone peaks during deep stage 3 and 4 sleep cycles.'
      ],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    'user-sarah-202': {
      id: 'tip-2',
      userId: 'user-sarah-202',
      title: 'Hydration Foundations & Mindful Balanced Plates',
      category: 'Hydration',
      content: 'Sustainable weight management and energy balance start with proper cell hydration. Drinking a glass of water right when waking up and 20 minutes before meals aids natural digestion and helps differentiate true hunger from thirst.',
      practicalTips: [
        'Keep a reusable water bottle nearby and aim for pale straw-colored hydration throughout the day.',
        'Build meals using the plate method: 1/2 colorful vegetables, 1/4 quality protein, and 1/4 high-fiber carbohydrates.',
        'Enjoy a 10-minute gentle walk after dinner to naturally stabilize post-prandial blood glucose levels.',
        'Never skip meals or drastically restrict calories; nourishing your metabolism ensures sustained vitality.'
      ],
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  }
};

class FitBuddyDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing db file, using seed data:', e);
    }
    this.save(initialData);
    return initialData;
  }

  private save(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db file:', e);
    }
  }

  public getAllUsers(): UserProfile[] {
    return Object.values(this.data.users).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getUser(userId: string): UserProfile | null {
    return this.data.users[userId] || null;
  }

  public saveUser(user: UserProfile): UserProfile {
    this.data.users[user.userId] = user;
    this.save(this.data);
    return user;
  }

  public deleteUser(userId: string): boolean {
    if (!this.data.users[userId]) {
      return false;
    }
    delete this.data.users[userId];
    delete this.data.plans[userId];
    delete this.data.nutritionTips[userId];
    this.save(this.data);
    return true;
  }

  public getPlan(userId: string): StoredWorkoutPlan | null {
    return this.data.plans[userId] || null;
  }

  public savePlan(plan: StoredWorkoutPlan): StoredWorkoutPlan {
    this.data.plans[plan.userId] = plan;
    this.save(this.data);
    return plan;
  }

  public getNutritionTip(userId: string): NutritionTipData | null {
    return this.data.nutritionTips[userId] || null;
  }

  public saveNutritionTip(tip: NutritionTipData): NutritionTipData {
    this.data.nutritionTips[tip.userId] = tip;
    this.save(this.data);
    return tip;
  }

  public getCompleteUserData(userId: string): CompleteUserData | null {
    const user = this.getUser(userId);
    if (!user) return null;
    return {
      user,
      plan: this.getPlan(userId),
      nutritionTip: this.getNutritionTip(userId)
    };
  }
}

export const db = new FitBuddyDatabase();
