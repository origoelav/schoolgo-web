import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oohypmgybyauwbajdvsa.supabase.co';
const supabaseKey = 'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, email, display_name, vehicle_plate, is_extra_driver');

  if (error) {
    console.error(error);
    return;
  }

  profiles.forEach(p => {
    console.log(`user_id=${p.user_id} | email=${p.email} | name=${p.display_name} | plate=${p.vehicle_plate} | extra=${p.is_extra_driver}`);
  });
}

run();
