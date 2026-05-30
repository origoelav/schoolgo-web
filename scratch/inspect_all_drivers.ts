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
    SELECT user_id, email, display_name, role, subscription_status, trial_expires_at, created_at, updated_at
    FROM public.profiles
    WHERE role IN ('driver', 'fleet_admin_driver', 'fleet_admin') OR vehicle_plate IS NOT NULL
    ORDER BY updated_at DESC;
  `);
  
  console.log("All drivers / frotistas:");
  console.table(res.rows);
  
  await client.end();
}

run();
