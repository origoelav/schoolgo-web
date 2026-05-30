import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: students, error } = await supabase
    .from('school_students')
    .select('*');
    
  if (error) {
    console.error("Error fetching students:", error);
    return;
  }
  
  console.log("STUDENT RECORDS:");
  students.forEach(s => {
    console.log(`- name=${s.name} | driver_id=${s.driver_id} | lat=${s.latitude} | lng=${s.longitude} | escolaLat=${s.escolaLat} | escolaLng=${s.escolaLng} | client_id=${s.client_id}`);
  });
}

run();
