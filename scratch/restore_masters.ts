import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oohypmgybyauwbajdvsa.supabase.co',
  'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD'
);

async function restoreMasters() {
  const emails = ['daniel.hp1@hotmail.com', 'dno.gomesps@gmail.com', 'admin@escolargo.com'];
  
  for (const email of emails) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_deleted: false })
      .eq('email', email);
    
    if (error) {
      console.error(`Error restoring ${email}:`, error.message);
    } else {
      console.log(`Restored ${email} successfully!`);
    }
  }
}

restoreMasters();
