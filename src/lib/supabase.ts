
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://onghjyhpmzrpmlmklmxu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ2hqeWhwbXpycG1sbWtsbXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzgxNzQsImV4cCI6MjA2MTg1NDE3NH0.IIMArFRPpoBhojrci5pDKZVLmPzsIyN8t2G6F720-0k";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== 'undefined' ? localStorage : undefined
    }
  }
)
