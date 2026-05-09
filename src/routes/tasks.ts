import { Router } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/verifyToken';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

// Get all tasks for current user
router.get('/', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new task
router.post('/', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { title, description, priority, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: userId,
        title,
        description,
        priority: priority || 'medium',
        due_date,
        is_completed: false
      })
      .select()
      .single();

    if (error) throw error;
    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete a task and award XP
router.patch('/:id/complete', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    // 1. Mark task as completed
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .update({ is_completed: true })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (taskError || !task) {
      return res.status(404).json({ error: 'Task not found or already completed' });
    }

    // 2. Fetch current user stats
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('xp, tasks_completed, level')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // 3. Calculate new stats
    const xpGain = 10;
    const newXp = user.xp + xpGain;
    const newLevel = Math.floor(newXp / 100);
    const newTasksCompleted = user.tasks_completed + 1;
    const leveledUp = newLevel > user.level;

    // 4. Update user stats
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        xp: newXp,
        level: newLevel,
        tasks_completed: newTasksCompleted
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      message: 'Quest Complete!',
      xp_gained: xpGain,
      user: updatedUser,
      leveled_up: leveledUp
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
