import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Let's query school_students again, print count
  const { count, error: countError } = await supabase
    .from('school_students')
    .select('*', { count: 'exact', head: true });
    
  console.log("school_students total count:", count, "error:", countError);
  
  // Let's fetch the first 5 records if count > 0
  if (count && count > 0) {
    const { data, error } = await supabase.from('school_students').select('*').limit(5);
    console.log("Sample students:", data);
  }
}

run();
