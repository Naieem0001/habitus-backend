-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  last_check_in DATE,
  is_mock BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Delete existing mock users to prevent duplicates on multiple runs
DELETE FROM public.users WHERE is_mock = true;

-- Insert 3 fake users with their XP values, tasks_completed, and check_ins (streak_days)
INSERT INTO public.users (email, display_name, avatar_url, xp, level, streak_days, tasks_completed, is_mock, last_check_in)
VALUES 
  ('alex.hacker@example.com', 'Alex Hacker', 'https://i.pravatar.cc/150?u=alex', 1250, 12, 14, 45, true, CURRENT_DATE),
  ('sam.shipper@example.com', 'Sam Shipper', 'https://i.pravatar.cc/150?u=sam', 850, 8, 7, 28, true, CURRENT_DATE),
  ('jordan.builder@example.com', 'Jordan Builder', 'https://i.pravatar.cc/150?u=jordan', 2100, 21, 30, 95, true, CURRENT_DATE);

-- Optional: Create tasks and check_ins tables if they were meant to be separate,
-- though the leaderboard relies on the columns in the users table.
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert some dummy tasks for the fake users
INSERT INTO public.tasks (user_id, title, completed)
SELECT id, 'Ship a new feature', true FROM public.users WHERE is_mock = true;

INSERT INTO public.tasks (user_id, title, completed)
SELECT id, 'Fix a critical bug', true FROM public.users WHERE is_mock = true;

-- Insert some dummy check-ins for the fake users
INSERT INTO public.check_ins (user_id, check_in_date)
SELECT id, CURRENT_DATE FROM public.users WHERE is_mock = true;
