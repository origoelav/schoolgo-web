import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: students, error } = await supabase
    .from('school_students')
    .select('id, name, latitude, longitude, driver_id, client_id')
    .limit(50);
    
  if (error) {
    console.error("Error fetching students:", error);
    return;
  }
  
  console.log("SCHOOL STUDENTS RECORDS:");
  students?.forEach(s => {
    console.log(`- id=${s.id} | name=${s.name} | lat=${s.latitude} | lng=${s.longitude} | driver_id=${s.driver_id} | client_id=${s.client_id}`);
  });
}

run();
