import { Router } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/verifyToken';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

// Get current user profile
router.get('/me', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add XP to user
router.post('/xp/add', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { amount, reason } = req.body;

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // First fetch current XP
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('xp, tasks_completed')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newXp = user.xp + amount;
    const newLevel = Math.floor(newXp / 100);
    const newTasksCompleted = user.tasks_completed + 1; // Assuming each XP add is a task completed for now

    // Update user
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

    if (updateError) {
      throw updateError;
    }

    res.json({ message: 'XP added successfully', user: updatedUser, reason });
  } catch (error) {
    console.error('Error adding XP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update streak
router.post('/streak/update', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('streak_days, last_check_in')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let newStreak = user.streak_days;
    
    if (!user.last_check_in) {
      // First time checking in
      newStreak = 1;
    } else {
      const lastCheckInStr = user.last_check_in as string;
      const lastCheckIn = new Date(lastCheckInStr);
      const currentDate = new Date(today);
      
      const diffTime = Math.abs(currentDate.getTime() - lastCheckIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        // Checked in yesterday, increment streak
        newStreak += 1;
      } else if (diffDays > 1) {
        // Missed a day, reset streak
        newStreak = 1;
      }
      // If diffDays === 0, they already checked in today, do nothing
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        streak_days: newStreak,
        last_check_in: today
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({ message: 'Streak updated', streak: newStreak });
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leaderboard (Public, no auth needed)
router.get('/leaderboard', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, display_name, avatar_url, xp, level, streak_days, tasks_completed, is_mock')
      // Supabase doesn't natively support calculated columns in simple select without a Postgres function, 
      // so we'll fetch all and sort in memory for this hackathon
      .limit(100);

    if (error) {
      throw error;
    }

    // Calculate composite score and sort
    // score = (tasks_completed * 10) + (streak_days * 15) + xp
    const sortedLeaderboard = data.map(user => ({
      ...user,
      score: (user.tasks_completed * 10) + (user.streak_days * 15) + user.xp
    })).sort((a, b) => b.score - a.score);

    res.json(sortedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users by display name or email
router.get('/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchPattern = `%${query}%`;
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, display_name, avatar_url, xp, level, streak_days, tasks_completed')
      .or(`display_name.ilike.${searchPattern},email.ilike.${searchPattern}`)
      .limit(20);

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
