import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oohypmgybyauwbajdvsa.supabase.co',
  'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD'
);

async function listProfiles() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, email, role, client_id, is_deleted');
  
  if (error) {
    console.error('Error fetching profiles:', error.message);
  } else {
    console.log('Profiles in DB:');
    profiles?.forEach(p => {
      console.log(`- email: ${p.email} | role: ${p.role} | client_id: ${p.client_id} | is_deleted: ${p.is_deleted}`);
    });
  }
}

listProfiles();
