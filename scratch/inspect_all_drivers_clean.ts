import { Client } from 'pg';

const client = new Client({
  host: 'db.oohypmgybyauwbajdvsa.supabase.co',
  port: 5432,
  user: 'postgres',
  password: '/NBbx3.e$N2dm@N',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT user_id, email, display_name, role, subscription_status, trial_expires_at, updated_at
    FROM public.profiles
    ORDER BY updated_at DESC;
  `);
  
  console.log("All profiles ordered by updated_at:");
  res.rows.forEach((r, i) => {
    console.log(`${i}: email=${r.email} name=${r.display_name} role=${r.role} status=${r.subscription_status} trial_expires=${r.trial_expires_at} updated=${r.updated_at}`);
  });
  
  await client.end();
}

run();
