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
    SELECT user_id, email, display_name, role, subscription_status, client_id
    FROM public.profiles 
    WHERE user_id = 'bec915a7-417d-4a10-b9ed-1eb44daea937' OR user_id = '6e8781af-0525-4367-bd22-81cde68cbed0';
  `);
  
  console.log("Profiles matching the IDs:");
  console.table(res.rows);
  
  await client.end();
}

run();
