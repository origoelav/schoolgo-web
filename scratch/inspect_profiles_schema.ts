import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://elgszwdeyrbwzfopoxjy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZ3N6d2RleXJid3pmb3BveGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTA0MjgsImV4cCI6MjA4NjY2NjQyOH0.ZVx2MrtyuuZ6hlJH1QpJJVxt_NsyNNyYalRNCPfODj0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProfiles() {
  console.log("Fetching one profile row...");
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error("Error fetching profile row:", error);
  } else {
    console.log("Keys of profiles:", Object.keys(data[0] || {}));
    console.log("Full row sample:", JSON.stringify(data[0] || {}, null, 2));
  }
}

inspectProfiles();
