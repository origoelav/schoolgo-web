const { Client } = require('pg');
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
  const res = await client.query("SELECT id, name, latitude, longitude, driver_id FROM school_students;");
  console.log("TOTAL STUDENTS:", res.rows.length);
  res.rows.forEach(r => {
    console.log(`- id=${r.id} | name=${r.name} | lat=${r.latitude} | lng=${r.longitude} | driver_id=${r.driver_id}`);
  });
  await client.end();
}
run();
