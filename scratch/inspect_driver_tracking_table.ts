import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('driver_tracking')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error details:", error);
  } else {
    console.log("Success! Data:", data);
  }
}

run();
