import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching profiles for filipe...");
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');
    
  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }
  
  console.log("Total profiles:", profiles.length);
  const filipeProfiles = profiles.filter(p => 
    p.email?.toLowerCase().includes("filipe") || 
    p.email?.toLowerCase().includes("origoela")
  );
  
  console.log("\nFilipe Profiles found:");
  console.log(JSON.stringify(filipeProfiles, null, 2));

  // Find drivers whose client_id is one of these profile's user_id
  for (const f of filipeProfiles) {
    const drivers = profiles.filter(p => p.client_id === f.user_id);
    console.log(`\nDrivers linked to ${f.email} (${f.user_id}):`);
    drivers.forEach(d => {
      console.log(`  - ${d.email} | role=${d.role} | client_id=${d.client_id} | is_deleted=${d.is_deleted}`);
    });
  }

  console.log("\nAll masters:");
  const masters = profiles.filter(p => p.role === 'master');
  masters.forEach(m => {
    console.log(`  - ${m.email} | user_id=${m.user_id} | client_id=${m.client_id}`);
  });
}

run();
