
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// TODO: Replace with your actual Supabase credentials from the Dashboard
const SUPABASE_URL = 'https://angpgvphynohghiuvivp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vY5p8TGqrAcMlKmmL-Twng_Q4XSiY1c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
