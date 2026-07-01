import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wwqpwvlhwfhabxpgqprt.supabase.co'
const supabaseAnonKey = 'sb_publishable_-lDKIbdkqR05R2UZzLgheA_KMsupzl4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)