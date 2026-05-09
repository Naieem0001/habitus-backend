import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

// Create a Supabase client with the service role key
// CAUTION: This bypasses all Row Level Security (RLS) policies.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
