import { createClient } from '@supabase/supabase-base';
// Wait, we can just fetch one row from profiles and log its keys!
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ""; 
// Let's import the client from src/lib/supabase or use the values from src/context/AppContext.tsx!
