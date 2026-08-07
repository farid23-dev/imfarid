import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase credentials not found. Using mock data.");
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;
