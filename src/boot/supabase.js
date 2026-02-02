import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persistir sessão no localStorage por padrão
    persistSession: true,
    // Renovar token automaticamente antes de expirar
    autoRefreshToken: true,
    // Detectar se usuário está em múltiplas abas
    detectSessionInUrl: true,
    // Storage padrão para sessão (localStorage = persiste entre sessões)
    storage: window.localStorage,
    // Tentar renovar token 60 segundos antes de expirar
    // Isso evita logout súbito quando o token está perto de expirar
    storageKey: 'pmkt-auth-token',
    // Manter sessão sempre ativa
    flowType: 'pkce',
  },
  // Configurações globais
  global: {
    headers: {
      'x-client-info': 'pmkt-web',
    },
  },
  // Configurações de realtime (não usado ainda, mas útil para futuro)
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Log de inicialização (apenas em dev)
if (import.meta.env.DEV) {
  console.log('🔧 Supabase inicializado')
  console.log('📍 URL:', supabaseUrl)
}

export default ({ app }) => {
  app.config.globalProperties.$supabase = supabase
}
