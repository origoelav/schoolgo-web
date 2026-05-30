import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  console.log("Checking profiles in SchoolGo DB for extra@gmail.com...");
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'extra@gmail.com');
    
  if (pError) {
    console.error("Error fetching profiles:", pError);
  } else {
    console.log("Profiles matching extra@gmail.com:", JSON.stringify(profiles, null, 2));
  }
}

checkUser();
