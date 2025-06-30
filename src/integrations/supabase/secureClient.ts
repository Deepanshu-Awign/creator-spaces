
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://wnsihrjtrqjpczmqwfik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Induc2locmp0cnFqcGN6bXF3ZmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjUzOTMsImV4cCI6MjA2NjM0MTM5M30.hAmVh19Cs42MleKvG722K5MqDFRbcOVfUUjME7kdiIE';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'bookmystudio-web'
    }
  },
  db: {
    schema: 'public'
  }
});

// Enhanced error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  
  if (event === 'SIGNED_OUT') {
    // Clear any cached data
    window.location.href = '/';
  }
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  }
});
