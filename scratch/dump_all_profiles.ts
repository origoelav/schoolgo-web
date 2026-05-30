import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD"; // public/anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Let's fetch one row from school_students
  const { data, error } = await supabase
    .from('school_students')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error("Error fetching school_students:", error);
    return;
  }
  
  console.log("SCHOOL_STUDENTS ROW KEYS:", data && data.length > 0 ? Object.keys(data[0]) : "No rows found");
}

run();
