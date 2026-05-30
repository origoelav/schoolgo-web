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
  console.log("Connected to database successfully!");

  // Query policies
  console.log("\n--- POLICIES ON driver_tracking ---");
  const policiesRes = await client.query(`
    SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'driver_tracking';
  `);
  console.log(policiesRes.rows);

  // Query count and records in driver_tracking
  console.log("\n--- RECORDS IN driver_tracking ---");
  const trackingRes = await client.query(`
    SELECT * FROM public.driver_tracking;
  `);
  console.log("Count:", trackingRes.rowCount);
  console.log("Rows:", trackingRes.rows);

  await client.end();
}

run().catch(err => {
  console.error("Database error:", err);
});
