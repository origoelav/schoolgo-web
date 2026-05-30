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
  
  // Query triggers on profiles table
  const resTriggers = await client.query(`
    SELECT trigger_name, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE event_object_table = 'profiles';
  `);
  
  console.log("Triggers on profiles:");
  console.log(resTriggers.rows);

  // Query triggers on auth.users table
  const resAuthTriggers = await client.query(`
    SELECT trigger_name, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth';
  `);
  
  console.log("Triggers on auth.users:");
  console.log(resAuthTriggers.rows);
  
  await client.end();
}

run();
