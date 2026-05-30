import pg from 'pg';
const { Client } = pg;
const client = new Client({
  host: 'db.oohypmgybyauwbajdvsa.supabase.co', port: 5432, user: 'postgres', password: '/NBbx3.e$N2dm@N', database: 'postgres', ssl: { rejectUnauthorized: false }
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'school_students' AND column_name = 'client_id'
  `);
  console.log('COLUMN TYPES:', res.rows);
  await client.end();
}
run();
