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
    SELECT routine_definition 
    FROM information_schema.routines 
    WHERE routine_name = 'rescue_orphan_user';
  `);
  
  console.log("rescue_orphan_user definition:");
  if (res.rows.length > 0) {
    console.log(res.rows[0].routine_definition);
  } else {
    console.log("Function not found.");
  }
  
  await client.end();
}

run();
