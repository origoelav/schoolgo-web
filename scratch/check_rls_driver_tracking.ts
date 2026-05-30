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
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'driver_tracking';
  `);
  
  console.log("driver_tracking table security info:");
  console.log(res.rows);

  const resPolicies = await client.query(`
    SELECT policyname, cmd, roles, qual, with_check 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'driver_tracking';
  `);
  
  console.log("driver_tracking RLS policies:");
  console.table(resPolicies.rows);
  
  await client.end();
}

run();
