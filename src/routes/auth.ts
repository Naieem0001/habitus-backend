import { Router } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/verifyToken';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

// Get current user profile from public.users table
router.get('/me', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
