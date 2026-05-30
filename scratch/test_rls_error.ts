import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oohypmgybyauwbajdvsa.supabase.co',
  'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD'
);

async function runTestUpdate() {
  // Try to update one of the master's own profile display_name (no-op or small change)
  // This will trigger the RLS update policy. If it fails with infinite recursion, we will know immediately!
  const { data, error } = await supabase
    .from('profiles')
    .update({ display_name: 'Filipe Origoela' })
    .eq('user_id', '6e8781af-0525-4367-bd22-81cde68cbed0');
  
  if (error) {
    console.error('Error on update:', error.message, error.code, error.details);
  } else {
    console.log('Update succeeded:', data);
  }
}

runTestUpdate();
