import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.js';
import { generateAiWorkoutPlan, generateAiNutritionTip, updateAiWorkoutPlan } from './server/gemini.js';
import { UserProfile } from './src/types/fitness.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Routes
  // 1. Generate Workout Plan
  app.post('/api/generate-workout', async (req, res) => {
    try {
      const body = req.body;
      if (!body.name || !body.user_id) {
        return res.status(400).json({ error: 'Name and User ID are required.' });
      }

      const user: UserProfile = {
        id: 'usr-' + Date.now(),
        userId: body.user_id,
        name: body.name,
        age: parseInt(body.age, 10) || 28,
        weight: parseInt(body.weight, 10) || 70,
        goal: body.goal || 'General wellness',
        experience: body.experience || 'Beginner',
        intensity: body.intensity || 'Moderate / Medium',
        workoutDays: parseInt(body.workout_days, 10) || 3,
        workoutDuration: body.workout_duration || '30-45 min',
        equipment: body.equipment || 'No equipment',
        medicalConditions: body.medical_conditions || '',
        createdAt: new Date().toISOString()
      };

      // Save user profile
      db.saveUser(user);

      // Generate 7-day plan and nutrition tip with Gemini
      const planData = await generateAiWorkoutPlan(user);
      const tipData = await generateAiNutritionTip(user);

      // Store plan and tip
      db.savePlan({
        id: 'plan-' + Date.now(),
        userId: user.userId,
        originalPlan: planData,
        updatedPlan: null,
        feedbackHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      db.saveNutritionTip(tipData);

      return res.json({
        status: 'success',
        user_id: user.userId,
        user,
        plan: planData,
        nutrition_tip: tipData
      });
    } catch (err: any) {
      console.error('Error generating workout:', err);
      return res.status(500).json({ error: 'Failed to generate workout plan', detail: err.message });
    }
  });

  // 2. Submit Feedback and Update Plan
  app.post('/api/submit-feedback', async (req, res) => {
    try {
      const { user_id, feedback } = req.body;
      if (!user_id || !feedback) {
        return res.status(400).json({ error: 'user_id and feedback are required.' });
      }

      const user = db.getUser(user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const existingPlan = db.getPlan(user_id);
      if (!existingPlan || !existingPlan.originalPlan) {
        return res.status(404).json({ error: 'No original workout plan found for user.' });
      }

      // Generate updated plan using Gemini
      const updatedPlan = await updateAiWorkoutPlan(existingPlan.originalPlan, user, feedback);

      existingPlan.updatedPlan = updatedPlan;
      existingPlan.feedbackHistory.push({
        feedbackText: feedback,
        appliedAt: new Date().toISOString()
      });
      existingPlan.updatedAt = new Date().toISOString();

      db.savePlan(existingPlan);

      return res.json({
        status: 'success',
        message: 'Your fitness plan has been updated successfully.',
        user_id: user.userId,
        original_plan: existingPlan.originalPlan,
        updated_plan: updatedPlan
      });
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      return res.status(500).json({ error: 'Failed to update plan', detail: err.message });
    }
  });

  // 3. User Dashboard
  app.get('/api/dashboard/:userId?', (req, res) => {
    const userId = req.params.userId || 'user-alex-101';
    const data = db.getCompleteUserData(userId);
    if (!data) {
      return res.status(404).json({ error: 'User data not found' });
    }
    return res.json(data);
  });

  // 4. Admin Dashboard
  app.get('/api/admin', (_req, res) => {
    const users = db.getAllUsers();
    const formatted = users.map(u => {
      const plan = db.getPlan(u.userId);
      return {
        id: u.id,
        user_id: u.userId,
        name: u.name,
        age: u.age,
        weight: u.weight,
        goal: u.goal,
        experience: u.experience,
        intensity: u.intensity,
        equipment: u.equipment,
        workout_days: u.workoutDays,
        created_at: u.createdAt,
        has_original_plan: Boolean(plan?.originalPlan),
        has_updated_plan: Boolean(plan?.updatedPlan),
        feedback_count: plan?.feedbackHistory.length || 0,
        last_feedback: plan?.feedbackHistory[plan.feedbackHistory.length - 1]?.feedbackText || null
      };
    });

    return res.json({ users: formatted, total_users: formatted.length });
  });

  // 5. Single User Details
  app.get('/api/user/:userId', (req, res) => {
    const data = db.getCompleteUserData(req.params.userId);
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(data);
  });

  // 6. Delete User
  app.delete('/api/user/:userId', (req, res) => {
    const success = db.deleteUser(req.params.userId);
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ status: 'success', message: `User ${req.params.userId} deleted.` });
  });

  // Vite Integration in Development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
});
