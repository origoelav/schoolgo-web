import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oohypmgybyauwbajdvsa.supabase.co',
  'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD'
);

async function checkMasters() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, email, role, is_deleted');
  
  if (error) {
    console.error('Error fetching profiles:', error.message);
  } else {
    const masters = profiles?.filter(p => p.role === 'master' && !p.is_deleted) || [];
    console.log('Active Masters in DB:', masters);
    console.log('Total profiles in DB:', profiles?.length);
  }
}

checkMasters();
