// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xwloprhomuuvvclaekhd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3bG9wcmhvbXV1dnZjbGFla2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTMwMjYsImV4cCI6MjA2NTM4OTAyNn0.HtiyHXsmLTJVBf8-xNQUxL3tCPFiRv7JMQf3UK3esKc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);