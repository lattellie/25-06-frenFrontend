import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ompfikdnjsoheytrennc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcGZpa2RuanNvaGV5dHJlbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDM3MTgsImV4cCI6MjA2NzkxOTcxOH0.VWMqNu7mSeohwHUWnCL-NOqBRo_gWmM73NPmhwGEWBU"; // Found in Supabase → Project → API → anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
