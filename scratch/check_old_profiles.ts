import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oohypmgybyauwbajdvsa.supabase.co',
  'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD'
);

async function checkOldProfiles() {
  const { data, error } = await supabase
    .from('old_profiles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error with old_profiles table:', error.message);
  } else {
    console.log('old_profiles table exists. Data sample:', data);
  }
}

checkOldProfiles();
