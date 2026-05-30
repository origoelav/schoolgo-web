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
    SELECT display_name, email, role, subscription_status, trial_expires_at, created_at, updated_at
    FROM public.profiles
    ORDER BY created_at DESC
    LIMIT 20;
  `);
  
  console.log("Recent profiles:");
  console.table(res.rows);
  
  await client.end();
}

run();
