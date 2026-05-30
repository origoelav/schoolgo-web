import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oohypmgybyauwbajdvsa.supabase.co";
const supabaseKey = "sb_publishable_ilHu7HD_jdfIUWaIBnBqtA_N5eOlkeD";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  console.log("Testing client_link_existing_driver RPC...");
  try {
    const { data, error } = await supabase.rpc('client_link_existing_driver', {
      driver_email: 'extra@gmail.com',
      driver_plate: 'EDX-7B03'
    });
    
    if (error) {
      console.error("RPC returned error:", error);
    } else {
      console.log("RPC returned success data:", data);
    }
  } catch (err) {
    console.error("Catch block error:", err);
  }
}

testRpc();
