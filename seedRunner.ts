import { supabaseAdmin } from './src/lib/supabaseAdmin';

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

async function runSeed() {
  console.log('Seeding...');
  
  // Clean up old mocks (the ones inserted previously)
  const { error: deleteError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('is_mock', true);

  if (deleteError) {
    console.error('Error deleting old mock users:', deleteError);
  } else {
    console.log('Old mock users deleted.');
  }

  const results = [];
  for (const user of mockUsers) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        ...user,
        id: crypto.randomUUID()
      }, { onConflict: 'email' })
      .select()
      .single();

    if (error) {
      console.error(`Error seeding user ${user.email}:`, error);
    } else {
      console.log(`Success seeding ${user.email}`);
    }
  }
  console.log('Seed process completed');
}

runSeed();
