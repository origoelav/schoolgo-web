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
  const ids = [
    '0910fd88-44a6-46e7-a7c9-23d4c8c780b1',
    '6e8781af-0525-4367-bd22-81cde68cbed0',
    'bec915a7-417d-4a10-b9ed-1eb44daea937'
  ];
  
  const res = await client.query(`
    SELECT user_id, email, role, display_name, vehicle_plate, updated_at 
    FROM public.profiles 
    WHERE user_id = ANY($1);
  `, [ids]);
  
  console.log("Matching profiles in DB:");
  console.log(res.rows);
  
  await client.end();
}

run();
