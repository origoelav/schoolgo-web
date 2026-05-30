import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oohypmgybyauwbajdvsa.supabase.co',
  'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD'
);

async function findDrivers() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('All active profiles that are not master:');
    profiles?.forEach(p => {
      if (p.role !== 'master' || p.email === 'filipe_origoela@hotmail.com') {
        console.log(`- email: ${p.email} | role: ${p.role} | client_id: ${p.client_id} | is_deleted: ${p.is_deleted}`);
      }
    });
  }
}

findDrivers();
