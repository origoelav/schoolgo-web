import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: routes, error } = await supabase
    .from('route_history')
    .select('*');
    
  if (error) {
    console.error("Error fetching route_history:", error);
    return;
  }
  
  console.log("ROUTE HISTORY COUNT:", routes?.length);
  if (routes && routes.length > 0) {
    routes.slice(0, 5).forEach(r => {
      console.log(`- user_id=${r.user_id} | deliveries count=${r.deliveries?.length}`);
    });
  }
}

run();
