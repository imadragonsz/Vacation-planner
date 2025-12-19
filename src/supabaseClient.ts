import { createClient } from "@supabase/supabase-js";

// For Create React App, use process.env
// @ts-expect-error: process.env is injected by CRA at build time
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
// @ts-expect-error: process.env is injected by CRA at build time
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
