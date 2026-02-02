import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persistir sessão no localStorage por padrão
    persistSession: true,
    // Detectar mudanças de sessão automaticamente
    autoRefreshToken: true,
    // Detectar se usuário está em múltiplas abas
    detectSessionInUrl: true,
    // Storage para persistir sessão
    storage: window.localStorage,
  },
})

export default ({ app }) => {
  app.config.globalProperties.$supabase = supabase
}
