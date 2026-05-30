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

  console.log("Adding public.driver_tracking to supabase_realtime publication...");
  try {
    await client.query(`
      ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_tracking;
    `);
    console.log("driver_tracking table added successfully!");
  } catch (err: any) {
    console.error("Error adding driver_tracking:", err.message);
  }

  console.log("Adding public.profiles to supabase_realtime publication...");
  try {
    await client.query(`
      ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    `);
    console.log("profiles table added successfully!");
  } catch (err: any) {
    console.error("Error adding profiles:", err.message);
  }

  // Double check all tables in supabase_realtime publication now
  const res = await client.query(`
    SELECT pubname, schemaname, tablename 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime';
  `);
  
  console.log("Updated tables in supabase_realtime publication:");
  console.table(res.rows);

  await client.end();
}

run();
