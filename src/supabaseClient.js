import { createClient } from '@supabase/supabase-js';

// Supabase Dashboard -> Project Settings -> API se copy karein
const supabaseUrl = 'https://exygxszkqmefhhzfiqsn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eWd4c3prcW1lZmhoemZpcXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTc1NTIsImV4cCI6MjEwMjk5MzU1Mn0.qc6HhHwRx1XETuH0GzOVi09cvToDr14HQaEB4OWFpK8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);