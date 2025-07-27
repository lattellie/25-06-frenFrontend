import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://smwnqdlpekapycfydqzu.supabase.co";
// https://smwnqdlpekapycfydqzu.supabase.co (es)
// https://ompfikdnjsoheytrennc.supabase.co (origin)
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtd25xZGxwZWthcHljZnlkcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODU1MzcsImV4cCI6MjA2OTE2MTUzN30.NsASx89I9_Q3aBhrTrbRaa38CYD27nDetWnYgNaGDK8"; // Found in Supabase → Project → API → anon key
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtd25xZGxwZWthcHljZnlkcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODU1MzcsImV4cCI6MjA2OTE2MTUzN30.NsASx89I9_Q3aBhrTrbRaa38CYD27nDetWnYgNaGDK8 (es)
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcGZpa2RuanNvaGV5dHJlbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDM3MTgsImV4cCI6MjA2NzkxOTcxOH0.VWMqNu7mSeohwHUWnCL-NOqBRo_gWmM73NPmhwGEWBU (ori)
export const supabase = createClient(supabaseUrl, supabaseKey);
