import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Signing in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'filipe_origoela@hotmail.com',
    password: '/NBbx3.e$N2dm@N'
  });
  
  if (authError) {
     console.error("Auth error:", authError);
     return;
  }
  
  const user = authData.user;
  console.log("Logged in successfully as:", user.email, "id:", user.id);
  
  console.log("Attempting upsert to driver_tracking...");
  const { data, error } = await supabase
    .from('driver_tracking')
    .upsert({
      id: user.id,
      user_id: user.id,
      lat: -23.502728,
      lng: -46.611364,
      speed: 0,
      students: [],
      updated_at: new Date().toISOString(),
      panic: false
    }, { onConflict: 'user_id' })
    .select();

  if (error) {
    console.error("Upsert failed! Error details:", error);
  } else {
    console.log("Upsert succeeded! Data returned:", data);
  }
}
run();
