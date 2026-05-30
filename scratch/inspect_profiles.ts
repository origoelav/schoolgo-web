import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oohypmgybyauwbajdvsa.supabase.co';
const supabaseKey = 'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  console.log("ALL PROFILES IN DATABASE:");
  profiles?.forEach(p => {
    console.log(`- ID: ${p.user_id}, Name: ${p.display_name}, Email: ${p.email}, Role: ${p.role}, ClientID: ${p.client_id}, Plate: ${p.vehicle_plate}, Deleted: ${p.is_deleted}`);
  });
}

run();
