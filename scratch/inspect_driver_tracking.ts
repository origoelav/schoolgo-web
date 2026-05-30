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
    SELECT * 
    FROM public.driver_tracking;
  `);
  
  console.log("driver_tracking table contents:");
  console.table(res.rows);
  
  await client.end();
}

run();
