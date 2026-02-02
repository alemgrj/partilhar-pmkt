<template>
  <router-view />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from 'stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Inicializar autenticação
  // O Supabase já gerencia auto-refresh do token (autoRefreshToken: true em supabase.js)
  // Não é necessário verificação manual
  authStore.initialize()
})

onBeforeUnmount(() => {
  // Limpar subscription do auth
  authStore.cleanup()
})
</script>
