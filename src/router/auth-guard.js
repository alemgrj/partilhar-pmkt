import { useAuthStore } from 'stores/auth'

export async function authGuard(to, from, next) {
  const authStore = useAuthStore()

  // Aguarda a inicialização se ainda não foi feita
  if (!authStore.user && !authStore.loading) {
    await authStore.initialize()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redireciona para login se rota requer autenticação
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (requiresAdmin && !authStore.isAdmin) {
    // Redireciona para dashboard se rota requer admin mas usuário não é
    next('/dashboard')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // Redireciona para dashboard se já autenticado tentando acessar login
    next('/dashboard')
  } else {
    next()
  }
}
