import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://elgszwdeyrbwzfopoxjy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZ3N6d2RleXJid3pmb3BveGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTA0MjgsImV4cCI6MjA4NjY2NjQyOH0.ZVx2MrtyuuZ6hlJH1QpJJVxt_NsyNNyYalRNCPfODj0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { count: countStudents, error: errS } = await supabase
    .from('school_students')
    .select('*', { count: 'exact', head: true });
    
  console.log("MAIN DB school_students count:", countStudents, "error:", errS);
  
  if (countStudents && countStudents > 0) {
    const { data: students } = await supabase.from('school_students').select('*').limit(5);
    console.log("Sample students in Main DB:");
    students?.forEach(s => {
      console.log(`- name=${s.name} | driver_id=${s.driver_id} | lat=${s.latitude} | lng=${s.longitude}`);
    });
  }

  const { count: countTracking, error: errT } = await supabase
    .from('driver_tracking')
    .select('*', { count: 'exact', head: true });
    
  console.log("MAIN DB driver_tracking count:", countTracking, "error:", errT);
  
  if (countTracking && countTracking > 0) {
    const { data: tracking } = await supabase.from('driver_tracking').select('*').limit(5);
    console.log("Sample tracking in Main DB:");
    tracking?.forEach(t => {
      console.log(`- user_id=${t.user_id} | lat=${t.lat} | lng=${t.lng}`);
    });
  }
}

run();
