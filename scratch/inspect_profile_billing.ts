import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oohypmgybyauwbajdvsa.supabase.co';
const supabaseKey = 'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('email, role, subscription_status, trial_expires_at, next_payment_date, created_at, is_deleted');

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  console.log("BILLING STATS FOR ALL PROFILES:");
  profiles?.forEach(p => {
    console.log(`- Email: ${p.email} | Role: ${p.role} | Status: ${p.subscription_status} | Trial Exp: ${p.trial_expires_at} | Next Payment: ${p.next_payment_date} | Created At: ${p.created_at} | Deleted: ${p.is_deleted}`);
  });
}

run();
