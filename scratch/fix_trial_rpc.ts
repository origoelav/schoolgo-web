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

  console.log("Re-defining rescue_orphan_user function...");
  await client.query(`
    CREATE OR REPLACE FUNCTION public.rescue_orphan_user(target_email text, target_role text, target_client_id text)
     RETURNS void
     LANGUAGE plpgsql
     SECURITY DEFINER
    AS $function$
      DECLARE
        target_user_id UUID;
      BEGIN
        SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
        IF target_user_id IS NOT NULL THEN
          INSERT INTO public.profiles (user_id, email, role, client_id, subscription_status, trial_expires_at, is_deleted)
          VALUES (
            target_user_id, 
            target_email, 
            target_role, 
            target_client_id, 
            CASE WHEN target_role = 'master' THEN 'active' ELSE 'trial' END, 
            CASE WHEN target_role = 'master' THEN NULL ELSE NOW() + INTERVAL '7 days' END, 
            FALSE
          )
          ON CONFLICT (user_id) DO UPDATE 
          SET role = target_role, 
              client_id = target_client_id, 
              is_deleted = FALSE, 
              subscription_status = CASE WHEN target_role = 'master' THEN 'active' ELSE COALESCE(profiles.subscription_status, 'trial') END, 
              trial_expires_at = CASE WHEN target_role = 'master' THEN NULL ELSE COALESCE(profiles.trial_expires_at, NOW() + INTERVAL '7 days') END;
        ELSE
          RAISE EXCEPTION 'Usuário não encontrado no Auth';
        END IF;
      END;
    $function$;
  `);
  console.log("Function redefined successfully!");

  console.log("Updating existing Master profiles in public.profiles...");
  const updateRes = await client.query(`
    UPDATE public.profiles 
    SET subscription_status = 'active', 
        trial_expires_at = NULL 
    WHERE role = 'master' OR email IN ('filipe_origoela@hotmail.com', 'origoela@gmail.com', 'admin@escolargo.com');
  `);
  console.log(`Updated ${updateRes.rowCount} profile rows.`);

  await client.end();
}

run();
