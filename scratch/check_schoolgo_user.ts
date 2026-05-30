import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oohypmgybyauwbajdvsa.supabase.co',
  'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD'
);

async function checkUser() {
  const userId = '6e8781af-0525-4367-bd22-81cde68cbed0';
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching user from SchoolGo DB:', error);
  } else {
    console.log('SchoolGo DB User Profile:', profile);
  }
}

checkUser();
