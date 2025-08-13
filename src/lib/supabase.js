import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('Supabase URL not configured. Please set up your Supabase project.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  console.warn('Supabase Anon Key not configured. Please set up your Supabase project.')
}

// Create a mock client if environment variables are not set
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Please configure Supabase first' } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Please configure Supabase first' } }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getUser: () => Promise.resolve({ data: { user: null } })
  },
  from: () => ({
    select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
    insert: () => ({ select: () => Promise.resolve({ data: [], error: { message: 'Please configure Supabase first' } }) }),
    update: () => ({ eq: () => ({ select: () => Promise.resolve({ data: [], error: { message: 'Please configure Supabase first' } }) }) }),
    delete: () => ({ eq: () => Promise.resolve({ error: { message: 'Please configure Supabase first' } }) })
  })
})

export const supabase = (supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()