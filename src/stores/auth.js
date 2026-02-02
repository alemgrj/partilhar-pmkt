import { defineStore } from 'pinia'
import { supabase } from 'boot/supabase'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  async function initialize() {
    loading.value = true
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        user.value = session.user
        await loadProfile()
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          user.value = session.user
          await loadProfile()
        } else {
          user.value = null
          profile.value = null
        }
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
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

      if (error) throw error
      profile.value = data
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  async function signIn(email, password, rememberMe = true) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Se rememberMe = true, sessão persiste por 1 ano
          // Se false, sessão expira ao fechar navegador
          persistSession: rememberMe,
        }
      })

      if (error) throw error

      user.value = data.user
      await loadProfile()

      return { success: true }
    } catch (error) {
      console.error('Error signing in:', error)
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

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    initialize,
    loadProfile,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
})
