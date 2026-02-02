<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="text-h4 q-mb-md">
          <q-icon name="bug_report" color="primary" class="q-mr-sm" />
          Debug de Sessão
        </div>
        <q-banner class="bg-warning text-white" rounded>
          <template v-slot:avatar>
            <q-icon name="warning" />
          </template>
          Esta página é apenas para desenvolvimento e debug. Remova em produção.
        </q-banner>
      </div>

      <!-- Status da Sessão -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              <q-icon name="account_circle" class="q-mr-sm" />
              Status da Sessão
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="q-gutter-sm">
              <div class="row items-center">
                <div class="col-5 text-grey-7">Autenticado:</div>
                <div class="col-7">
                  <q-badge :color="authStore.isAuthenticated ? 'green' : 'red'">
                    {{ authStore.isAuthenticated ? 'Sim' : 'Não' }}
                  </q-badge>
                </div>
              </div>

              <div class="row items-center">
                <div class="col-5 text-grey-7">Email:</div>
                <div class="col-7">{{ sessionInfo.email || '-' }}</div>
              </div>

              <div class="row items-center">
                <div class="col-5 text-grey-7">User ID:</div>
                <div class="col-7 text-caption">{{ sessionInfo.userId || '-' }}</div>
              </div>

              <div class="row items-center">
                <div class="col-5 text-grey-7">Perfil:</div>
                <div class="col-7">
                  <q-badge :color="authStore.isAdmin ? 'orange' : 'blue'">
                    {{ authStore.isAdmin ? 'Admin' : 'User' }}
                  </q-badge>
                </div>
              </div>

              <div class="row items-center">
                <div class="col-5 text-grey-7">Papel:</div>
                <div class="col-7">{{ authStore.profile?.user_role?.name || '-' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Token Info -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              <q-icon name="key" class="q-mr-sm" />
              Informações do Token
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="q-gutter-sm">
              <div class="row items-center">
                <div class="col-5 text-grey-7">Token expira em:</div>
                <div class="col-7">
                  <q-badge :color="expirationColor">{{ timeUntilExpiration }}</q-badge>
                </div>
              </div>

              <div class="row items-center">
                <div class="col-5 text-grey-7">Data de expiração:</div>
                <div class="col-7 text-caption">{{ expirationDate }}</div>
              </div>

              <div class="row items-center">
                <div class="col-5 text-grey-7">Criado em:</div>
                <div class="col-7 text-caption">{{ createdAt }}</div>
              </div>

              <div class="row items-center">
                <div class="col-5 text-grey-7">Última atualização:</div>
                <div class="col-7 text-caption">{{ updatedAt }}</div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              icon="refresh"
              label="Renovar Sessão"
              @click="refreshSession"
              :loading="refreshing"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Storage Info -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              <q-icon name="storage" class="q-mr-sm" />
              Storage
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="q-gutter-sm">
              <div class="row items-center">
                <div class="col-5 text-grey-7">localStorage:</div>
                <div class="col-7">
                  <q-badge :color="hasLocalStorage ? 'green' : 'red'">
                    {{ hasLocalStorage ? 'Presente' : 'Ausente' }}
                  </q-badge>
                </div>
              </div>

              <div class="row items-center">
                <div class="col-5 text-grey-7">sessionStorage:</div>
                <div class="col-7">
                  <q-badge :color="hasSessionStorage ? 'green' : 'red'">
                    {{ hasSessionStorage ? 'Presente' : 'Ausente' }}
                  </q-badge>
                </div>
              </div>

              <div class="row items-center">
                <div class="col-5 text-grey-7">Storage Key:</div>
                <div class="col-7 text-caption">pmkt-auth-token</div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat color="negative" icon="delete" label="Limpar Storage" @click="clearStorage" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Event Log -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              <q-icon name="history" class="q-mr-sm" />
              Log de Eventos
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <q-list dense>
              <q-item v-for="(log, index) in eventLogs.slice(-10).reverse()" :key="index">
                <q-item-section avatar>
                  <q-icon :name="getEventIcon(log.type)" :color="getEventColor(log.type)" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ log.message }}</q-item-label>
                  <q-item-label caption>{{ log.time }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="eventLogs.length === 0">
                <q-item-section class="text-center text-grey-5">Nenhum evento registrado</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat color="grey" icon="clear" label="Limpar Log" @click="eventLogs = []" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Actions -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              <q-icon name="settings" class="q-mr-sm" />
              Ações de Debug
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-gutter-sm">
              <q-btn color="primary" icon="login" label="Testar Login" @click="testLogin" />
              <q-btn color="negative" icon="logout" label="Testar Logout" @click="testLogout" />
              <q-btn color="info" icon="sync" label="Verificar Sessão" @click="checkSession" />
              <q-btn color="warning" icon="build" label="Forçar Reload Profile" @click="reloadProfile" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Raw Session Data -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              <q-icon name="code" class="q-mr-sm" />
              Dados Brutos da Sessão
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <pre class="bg-grey-2 q-pa-md" style="overflow-x: auto">{{ JSON.stringify(rawSessionData, null, 2) }}</pre>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from 'stores/auth'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const authStore = useAuthStore()
const $q = useQuasar()

const sessionInfo = ref({})
const rawSessionData = ref({})
const eventLogs = ref([])
const refreshing = ref(false)
const updateInterval = ref(null)

// Computed
const timeUntilExpiration = computed(() => {
  if (!sessionInfo.value.expiresAt) return '-'
  const now = Date.now()
  const expiry = sessionInfo.value.expiresAt * 1000
  const diff = expiry - now

  if (diff < 0) return 'Expirado'

  const minutes = Math.floor(diff / 1000 / 60)
  const seconds = Math.floor((diff / 1000) % 60)

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  return `${minutes}m ${seconds}s`
})

const expirationColor = computed(() => {
  if (!sessionInfo.value.expiresAt) return 'grey'
  const now = Date.now()
  const expiry = sessionInfo.value.expiresAt * 1000
  const diff = expiry - now

  if (diff < 0) return 'red'
  if (diff < 5 * 60 * 1000) return 'orange' // < 5 minutos
  if (diff < 15 * 60 * 1000) return 'yellow' // < 15 minutos
  return 'green'
})

const expirationDate = computed(() => {
  if (!sessionInfo.value.expiresAt) return '-'
  return format(new Date(sessionInfo.value.expiresAt * 1000), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
})

const createdAt = computed(() => {
  if (!sessionInfo.value.createdAt) return '-'
  return format(new Date(sessionInfo.value.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
})

const updatedAt = computed(() => {
  if (!sessionInfo.value.updatedAt) return '-'
  return format(new Date(sessionInfo.value.updatedAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
})

const hasLocalStorage = computed(() => {
  return !!localStorage.getItem('pmkt-auth-token')
})

const hasSessionStorage = computed(() => {
  return !!sessionStorage.getItem('pmkt-auth-token')
})

// Functions
function addLog(type, message) {
  eventLogs.value.push({
    type,
    message,
    time: format(new Date(), 'HH:mm:ss', { locale: ptBR }),
  })
}

function getEventIcon(type) {
  const icons = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
    refresh: 'refresh',
  }
  return icons[type] || 'info'
}

function getEventColor(type) {
  const colors = {
    info: 'blue',
    success: 'green',
    warning: 'orange',
    error: 'red',
    refresh: 'purple',
  }
  return colors[type] || 'grey'
}

async function loadSessionInfo() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) throw error

    if (session) {
      sessionInfo.value = {
        email: session.user.email,
        userId: session.user.id,
        expiresAt: session.expires_at,
        createdAt: session.user.created_at,
        updatedAt: session.user.updated_at,
      }
      rawSessionData.value = session
    } else {
      sessionInfo.value = {}
      rawSessionData.value = {}
    }
  } catch (error) {
    console.error('Error loading session info:', error)
    addLog('error', `Erro ao carregar sessão: ${error.message}`)
  }
}

async function refreshSession() {
  refreshing.value = true
  try {
    const result = await authStore.refreshSession()
    if (result.success) {
      $q.notify({ type: 'positive', message: 'Sessão renovada!', position: 'top' })
      addLog('success', 'Sessão renovada manualmente')
      await loadSessionInfo()
    } else {
      throw new Error('Falha ao renovar sessão')
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top' })
    addLog('error', `Erro ao renovar: ${error.message}`)
  } finally {
    refreshing.value = false
  }
}

async function clearStorage() {
  $q.dialog({
    title: 'Confirmar',
    message: 'Isso irá limpar toda a sessão. Continuar?',
    cancel: true,
  }).onOk(async () => {
    localStorage.clear()
    sessionStorage.clear()
    addLog('warning', 'Storage limpo')
    $q.notify({ type: 'info', message: 'Storage limpo. Recarregue a página.', position: 'top' })
    setTimeout(() => window.location.reload(), 2000)
  })
}

async function checkSession() {
  addLog('info', 'Verificando sessão...')
  await loadSessionInfo()
  $q.notify({ type: 'info', message: 'Sessão verificada', position: 'top' })
}

async function reloadProfile() {
  try {
    await authStore.loadProfile()
    addLog('success', 'Profile recarregado')
    $q.notify({ type: 'positive', message: 'Profile recarregado!', position: 'top' })
  } catch (error) {
    addLog('error', `Erro ao recarregar profile: ${error.message}`)
    $q.notify({ type: 'negative', message: error.message, position: 'top' })
  }
}

function testLogin() {
  $q.notify({ type: 'info', message: 'Use a página de login para testar', position: 'top' })
}

function testLogout() {
  $q.dialog({
    title: 'Confirmar Logout',
    message: 'Deseja realmente fazer logout?',
    cancel: true,
  }).onOk(async () => {
    await authStore.signOut()
    addLog('info', 'Logout realizado')
  })
}

onMounted(() => {
  loadSessionInfo()

  // Atualizar a cada segundo
  updateInterval.value = setInterval(() => {
    if (authStore.isAuthenticated) {
      // Força re-render do computed de tempo
      sessionInfo.value = { ...sessionInfo.value }
    }
  }, 1000)

  // Listener de auth events
  const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
    addLog('refresh', `Auth Event: ${event}`)
    loadSessionInfo()
  })

  // Cleanup
  onBeforeUnmount(() => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
    }
    if (subscription) {
      subscription.unsubscribe()
    }
  })

  addLog('info', 'Debug page iniciada')
})
</script>

<style scoped lang="scss">
pre {
  font-size: 11px;
  max-height: 400px;
  overflow: auto;
}
</style>
