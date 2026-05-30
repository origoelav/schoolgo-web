import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'filipe_origoela@hotmail.com',
    password: '/NBbx3.e$N2dm@N'
  });
  
  if (authError) {
     console.error("Auth error:", authError);
     return;
  }
  
  console.log("Logged in successfully as:", authData.user.email);
  
  const { data: students, error: studentError } = await supabase
    .from('school_students')
    .select('*');
    
  if (studentError) {
    console.error("Student error:", studentError);
    return;
  }
  
  console.log("TOTAL STUDENTS:", students.length);
  students.forEach(s => {
    console.log(`- name=${s.name} | lat=${s.latitude} | lng=${s.longitude} | driver_id=${s.driver_id} | school=${s.school} | escolaLat=${s.escolaLat} | escolaLng=${s.escolaLng}`);
  });
}
run();
