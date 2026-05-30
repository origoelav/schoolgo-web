import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oohypmgybyauwbajdvsa.supabase.co';
const supabaseKey = 'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('get_policies');
  if (error) {
    console.error("RPC get_policies failed, let's select pg_policies via normal query if possible or inspect schema.");
    // Wait, let's run a raw query by creating an RPC or running pg_policies select
  }
  console.log("Policies data:", data);
}

run();
