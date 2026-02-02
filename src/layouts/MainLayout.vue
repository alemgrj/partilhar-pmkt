<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="text-weight-bold">
          PMkt
        </q-toolbar-title>

        <!-- User Menu -->
        <q-btn-dropdown flat round dense icon="account_circle">
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-avatar size="48px">
                  <img
                    v-if="authStore.profile?.avatar_url"
                    :src="authStore.profile.avatar_url"
                  />
                  <q-icon v-else name="person" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ authStore.profile?.name }}</q-item-label>
                <q-item-label caption>{{ authStore.user?.email }}</q-item-label>
                <q-badge
                  v-if="authStore.isAdmin"
                  color="orange"
                  label="Admin"
                  class="q-mt-xs"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Sair</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="260"
      class="bg-grey-1"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item-label header class="text-weight-bold text-grey-8">
            Menu Principal
          </q-item-label>

          <q-item
            v-for="item in menuItems"
            :key="item.to"
            clickable
            v-ripple
            :to="item.to"
            exact
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
              <q-item-label caption v-if="item.caption">
                {{ item.caption }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <template v-if="authStore.isAdmin">
            <q-separator class="q-my-md" />

            <q-item-label header class="text-weight-bold text-grey-8">
              Administração
            </q-item-label>

            <q-item
              v-for="item in adminMenuItems"
              :key="item.to"
              clickable
              v-ripple
              :to="item.to"
              exact
              active-class="bg-primary text-white"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
                <q-item-label caption v-if="item.caption">
                  {{ item.caption }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <q-separator class="q-my-md" />

          <q-item-label header class="text-weight-bold text-grey-8">
            Informações
          </q-item-label>

          <q-item>
            <q-item-section>
              <q-item-label caption>Versão</q-item-label>
              <q-item-label>{{ version }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'
import { version } from '../../package.json'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const leftDrawerOpen = ref(false)

const menuItems = [
  {
    label: 'Dashboard',
    caption: 'Visão geral',
    icon: 'dashboard',
    to: '/dashboard',
  },
  {
    label: 'Nova Postagem',
    caption: 'Criar post',
    icon: 'add_circle',
    to: '/create',
  },
  {
    label: 'Board de Produção',
    caption: 'Kanban',
    icon: 'view_kanban',
    to: '/board',
  },
  {
    label: 'Calendário Editorial',
    caption: 'Cronograma',
    icon: 'event',
    to: '/calendar',
  },
  {
    label: 'Campanhas',
    caption: 'Gerenciar campanhas',
    icon: 'campaign',
    to: '/campaigns',
  },
]

const adminMenuItems = [
  {
    label: 'Fases do Workflow',
    caption: 'Configurar fases',
    icon: 'account_tree',
    to: '/backoffice/phases',
  },
  {
    label: 'Papéis de Usuários',
    caption: 'Gerenciar papéis',
    icon: 'badge',
    to: '/backoffice/roles',
  },
  {
    label: 'Usuários',
    caption: 'Gerenciar usuários',
    icon: 'people',
    to: '/users',
  },
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function handleLogout() {
  $q.loading.show({ message: 'Saindo...' })

  const result = await authStore.signOut()

  $q.loading.hide()

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Logout realizado com sucesso!',
      position: 'top',
    })
    router.push('/login')
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || 'Erro ao fazer logout',
      position: 'top',
    })
  }
}

onMounted(() => {
  authStore.initialize()
})
</script>

<style scoped lang="scss">
.q-item {
  border-radius: 8px;
  margin: 4px 8px;
}
</style>
