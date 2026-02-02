import { defineStore } from 'pinia'
import { supabase } from 'boot/supabase'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)
  const authSubscription = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  async function initialize() {
    loading.value = true
    try {
      // Tentar recuperar sessão existente
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Error getting session:', sessionError)
      }

      if (session?.user) {
        console.log('✅ Sessão recuperada:', session.user.email)
        user.value = session.user
        await loadProfile()
      } else {
        console.log('⚠️ Nenhuma sessão ativa encontrada')
      }

      // Limpar subscription anterior se existir
      if (authSubscription.value?.subscription) {
        authSubscription.value.subscription.unsubscribe()
      }

      // Listen for auth changes e armazenar subscription
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔔 Auth event:', event, session?.user?.email)

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            user.value = session.user
            await loadProfile()
            console.log('✅ Token atualizado/renovado')
          }
        } else if (event === 'SIGNED_OUT') {
          user.value = null
          profile.value = null
          console.log('👋 Usuário deslogado')
        } else if (event === 'USER_UPDATED') {
          if (session?.user) {
            user.value = session.user
            console.log('🔄 Usuário atualizado')
          }
        }
      })

      authSubscription.value = data
    } catch (error) {
      console.error('❌ Error initializing auth:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadProfile() {
    if (!user.value) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) {
        // Erros 404/401/403 são problemas de setup, NÃO de sessão
        if (error.code === 'PGRST116') {
          console.warn('⚠️ Perfil não encontrado. Criando automaticamente...')
          await createProfileIfNotExists()
        } else {
          console.error('❌ Erro ao carregar perfil:', error)
        }

        // NÃO fazer logout, apenas logar erro
        // Usuário pode continuar usando o sistema
        return
      }

      profile.value = data
      console.log('✅ Perfil carregado:', data.name)
    } catch (error) {
      console.error('❌ Erro crítico ao carregar perfil:', error)
      // Ainda assim, NÃO fazer logout
    }
  }

  async function createProfileIfNotExists() {
    if (!user.value) return

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.value.id,
          name: user.value.email?.split('@')[0] || 'Usuário',
          role: 'user',
        })
        .select()
        .single()

      if (!error && data) {
        profile.value = data
        console.log('✅ Perfil criado automaticamente:', data.name)
      } else if (error) {
        console.error('❌ Falha ao criar perfil:', error)
      }
    } catch (e) {
      console.error('❌ Erro crítico ao criar perfil:', e)
    }
  }

  async function signIn(email, password, rememberMe = true) {
    loading.value = true
    try {
      // O Supabase já gerencia a persistência através da configuração global
      // Não é necessário passar persistSession aqui
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      user.value = data.user
      await loadProfile()

      console.log('✅ Login bem-sucedido:', email)
      console.log('🔐 Sessão persistirá:', rememberMe ? 'Sim (localStorage)' : 'Não (sessionStorage)')

      return { success: true }
    } catch (error) {
      console.error('❌ Error signing in:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function signUp(email, password, name) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error signing up:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      user.value = null
      profile.value = null

      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates) {
    if (!user.value) return { success: false, error: 'Not authenticated' }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) throw error

      profile.value = data
      return { success: true, data }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Função para verificar e renovar sessão manualmente (fallback)
  async function refreshSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession()

      if (error) {
        console.error('⚠️ Erro ao renovar sessão:', error)
        return { success: false, error }
      }

      if (session?.user) {
        user.value = session.user
        console.log('✅ Sessão renovada manualmente')
        return { success: true }
      }

      return { success: false }
    } catch (error) {
      console.error('❌ Erro crítico ao renovar sessão:', error)
      return { success: false, error }
    }
  }

  // Cleanup ao destruir a store
  function cleanup() {
    if (authSubscription.value?.subscription) {
      authSubscription.value.subscription.unsubscribe()
      authSubscription.value = null
      console.log('🧹 Auth subscription limpa')
    }
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    initialize,
    loadProfile,
    createProfileIfNotExists,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshSession,
    cleanup,
  }
})
