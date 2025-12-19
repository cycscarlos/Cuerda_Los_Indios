
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://angpgvphynohghiuvivp.supabase.co';
// The key provided by user
const SUPABASE_KEY = 'sb_publishable_vY5p8TGqrAcMlKmmL-Twng_Q4XSiY1c';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
    console.log("Testing connection to:", SUPABASE_URL);
    
    try {
        const { data, error } = await supabase.from('roosters').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error("Connection Failed:", error.message);
            console.error("Details:", error);
        } else {
            console.log("Connection Successful!");
            console.log("Table 'roosters' found.");
            console.log("Row count:", data); // valid for head:true? actually select count returns response.count
        }

        // Try to insert if empty? No, just read for now.
    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

testConnection();
