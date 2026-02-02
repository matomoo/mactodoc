// biome-ignore assist/source/organizeImports: <none>
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  (() => {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  })();
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  (() => {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  })();

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});
