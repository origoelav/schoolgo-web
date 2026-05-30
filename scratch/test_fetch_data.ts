import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oohypmgybyauwbajdvsa.supabase.co';
const supabaseKey = 'sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const userId = '6e8781af-0525-4367-bd22-81cde68cbed0'; // Filipe Origoela
  
  // 1. Fetch profile
  const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  console.log("PROFILE DATA:", profileData);

  const isMasterUser = profileData?.client_id === 'SCHOOLGO_MASTER' || profileData?.role === 'master';
  console.log("IS MASTER:", isMasterUser);

  let data1: any[] = [];
  if (isMasterUser) {
    const { data: mastersData } = await supabase.from('profiles').select('*').eq('client_id', 'SCHOOLGO_MASTER');
    const allowedMasters = ['filipe_origoela@hotmail.com', 'daniel.hp1@hotmail.com', 'dno.gomesps@gmail.com'];
    const masters = (mastersData || []).filter(p => allowedMasters.includes(p.email?.toLowerCase()));
    
    const { data: realDrivers } = await supabase.from('profiles').select('*').eq('client_id', userId);
    data1 = [...masters, ...(realDrivers || [])];
  } else {
    const effectiveClientId = profileData?.client_id && profileData.client_id !== 'SCHOOLGO_CLIENT'
      ? profileData.client_id 
      : userId;
    const { data } = await supabase.from('profiles').select('*').eq('client_id', effectiveClientId);
    data1 = data || [];
  }

  console.log("DATA1 LENGTH:", data1.length);
  data1.forEach(d => console.log(`- ${d.display_name} (${d.email})`));
}

run();
