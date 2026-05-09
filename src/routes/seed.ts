import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

const mockUsers = [
  {
    email: 'alex.hacker@example.com',
    display_name: 'Alex Hacker',
    avatar_url: 'https://i.pravatar.cc/150?u=alex',
    xp: 1250,
    level: 12,
    streak_days: 14,
    tasks_completed: 45,
    is_mock: true
  },
  {
    email: 'sam.shipper@example.com',
    display_name: 'Sam Shipper',
    avatar_url: 'https://i.pravatar.cc/150?u=sam',
    xp: 850,
    level: 8,
    streak_days: 7,
    tasks_completed: 28,
    is_mock: true
  },
  {
    email: 'jordan.builder@example.com',
    display_name: 'Jordan Builder',
    avatar_url: 'https://i.pravatar.cc/150?u=jordan',
    xp: 2100,
    level: 21,
    streak_days: 30,
    tasks_completed: 95,
    is_mock: true
  }
];

router.post('/', async (req, res) => {
  try {
    const seedSecret = req.headers['x-seed-secret'];
    
    if (!process.env.SEED_SECRET || seedSecret !== process.env.SEED_SECRET) {
      return res.status(401).json({ error: 'Unauthorized to seed database' });
    }

    const results = [];

    for (const user of mockUsers) {
      // First, try to insert into auth.users (if needed, though for leaderboard we just need public.users)
      // Since this is a hackathon and they are mock users, we can just insert directly into public.users 
      // without creating actual auth accounts for them, depending on the RLS policies.
      // But since we are using supabaseAdmin, it bypasses RLS anyway.
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert({
          ...user,
          // Generate a deterministic or random UUID for mock users
          id: crypto.randomUUID()
        }, { onConflict: 'email' })
        .select()
        .single();

      if (error) {
        console.error(`Error seeding user ${user.email}:`, error);
        results.push({ email: user.email, status: 'error', message: error.message });
      } else {
        results.push({ email: user.email, status: 'success', data });
      }
    }

    res.json({ message: 'Seed process completed', results });
  } catch (error) {
    console.error('Error in seed route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
