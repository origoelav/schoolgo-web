import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: tracking, error } = await supabase
    .from('driver_tracking')
    .select('*');
    
  if (error) {
    console.error("Error fetching tracking:", error);
    return;
  }
  
  console.log("DRIVER TRACKING RECORDS:");
  tracking.forEach(t => {
    console.log(`- user_id=${t.user_id} | lat=${t.lat} | lng=${t.lng} | updated_at=${t.updated_at}`);
  });
}

run();
