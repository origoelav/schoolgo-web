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
    FROM public.profiles 
    WHERE email = 'filipe_origoela@hotmail.com';
  `);
  
  console.log("Profile details for filipe_origoela@hotmail.com:");
  console.log(res.rows[0]);
  
  await client.end();
}

run();
