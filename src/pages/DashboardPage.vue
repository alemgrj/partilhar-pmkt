<template>
  <q-page class="dashboard-page q-pa-md">
    <div class="text-h5 text-weight-bold q-mb-md">Dashboard Executivo</div>

    <!-- Cards de Métricas -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold">{{ totalPosts }}</div>
                <div class="text-caption text-grey-7">Total de Posts</div>
              </div>
              <q-icon name="dashboard" size="48px" color="blue-5" class="stat-icon" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-orange">{{ pendingPosts }}</div>
                <div class="text-caption text-grey-7">Pendentes</div>
              </div>
              <q-icon name="pending" size="48px" color="orange" class="stat-icon" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-green">{{ validatedPosts }}</div>
                <div class="text-caption text-grey-7">Validados</div>
              </div>
              <q-icon name="check_circle" size="48px" color="green" class="stat-icon" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4 text-weight-bold text-purple">{{ publishedPosts }}</div>
                <div class="text-caption text-grey-7">Publicados</div>
              </div>
              <q-icon name="publish" size="48px" color="purple" class="stat-icon" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficos e Estatísticas -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Posts por Rede Social -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">
              Posts por Rede Social
            </div>
            <div v-if="postsBySocialNetwork.length > 0">
              <div
                v-for="item in postsBySocialNetwork"
                :key="item.network"
                class="stat-row q-mb-sm"
              >
                <div class="row items-center">
                  <q-icon
                    :name="getSocialIcon(item.network)"
                    size="24px"
                    :color="getSocialColor(item.network)"
                    class="q-mr-sm"
                  />
                  <div class="col">
                    <div class="text-body2">{{ getSocialLabel(item.network) }}</div>
                  </div>
                  <div class="text-h6 text-weight-bold">{{ item.count }}</div>
                </div>
                <q-linear-progress
                  :value="item.count / totalPosts"
                  :color="getSocialColor(item.network)"
                  class="q-mt-xs"
                />
              </div>
            </div>
            <div v-else class="text-center text-grey-5 q-py-lg">
              Nenhum post cadastrado
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Posts por Status -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">
              Posts por Status
            </div>
            <div v-if="postsByStatus.length > 0">
              <div
                v-for="item in postsByStatus"
                :key="item.status"
                class="stat-row q-mb-sm"
              >
                <div class="row items-center">
                  <div
                    class="status-dot q-mr-sm"
                    :style="{ backgroundColor: getStatusColor(item.status) }"
                  ></div>
                  <div class="col">
                    <div class="text-body2">{{ getStatusLabel(item.status) }}</div>
                  </div>
                  <div class="text-h6 text-weight-bold">{{ item.count }}</div>
                </div>
                <q-linear-progress
                  :value="item.count / totalPosts"
                  :color="getStatusColor(item.status)"
                  class="q-mt-xs"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Orgânico vs Ads -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">
              Orgânico vs Tráfego Pago
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-6 text-center">
                <div class="text-h4 text-green">{{ organicPosts }}</div>
                <div class="text-caption">Orgânico</div>
                <q-linear-progress
                  :value="organicPosts / totalPosts"
                  color="green"
                  class="q-mt-sm"
                  size="8px"
                />
              </div>
              <div class="col-6 text-center">
                <div class="text-h4 text-orange">{{ paidPosts }}</div>
                <div class="text-caption">Tráfego Pago</div>
                <q-linear-progress
                  :value="paidPosts / totalPosts"
                  color="orange"
                  class="q-mt-sm"
                  size="8px"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Resumo Semanal -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">
              Resumo Semanal
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <div class="summary-item">
                  <q-icon name="event" size="20px" color="blue" />
                  <span class="q-ml-sm">{{ postsThisWeek }} posts esta semana</span>
                </div>
              </div>
              <div class="col-6">
                <div class="summary-item">
                  <q-icon name="schedule" size="20px" color="orange" />
                  <span class="q-ml-sm">{{ postsNextWeek }} na próxima</span>
                </div>
              </div>
              <div class="col-6">
                <div class="summary-item">
                  <q-icon name="pending_actions" size="20px" color="red" />
                  <span class="q-ml-sm">{{ adjustmentsRequested }} ajustes pendentes</span>
                </div>
              </div>
              <div class="col-6">
                <div class="summary-item">
                  <q-icon name="verified" size="20px" color="green" />
                  <span class="q-ml-sm">{{ readyToPublish }} prontos</span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Acesso Rápido -->
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">
              Acesso Rápido
            </div>
            <div class="row q-gutter-md">
              <q-btn
                color="primary"
                label="Board de Produção"
                icon="view_kanban"
                to="/board"
                unelevated
                size="lg"
              />
              <q-btn
                color="secondary"
                label="Calendário Editorial"
                icon="event"
                to="/calendar"
                unelevated
                size="lg"
              />
              <q-btn
                color="positive"
                label="Nova Postagem"
                icon="add"
                to="/create"
                unelevated
                size="lg"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePostsStore } from 'stores/posts'
import { startOfWeek, endOfWeek, addWeeks, isWithinInterval } from 'date-fns'

const postsStore = usePostsStore()

const totalPosts = computed(() => postsStore.posts.filter((p) => p.deleted_at === null).length)

const pendingPosts = computed(() => {
  return postsStore.posts.filter(
    (p) =>
      p.deleted_at === null &&
      ['ideas', 'in_production', 'ready_for_review', 'adjustments_requested'].includes(
        p.status
      )
  ).length
})

const validatedPosts = computed(() => {
  return postsStore.posts.filter(
    (p) => p.deleted_at === null && p.status === 'validated'
  ).length
})

const publishedPosts = computed(() => {
  return postsStore.posts.filter(
    (p) => p.deleted_at === null && p.status === 'published'
  ).length
})

const organicPosts = computed(() => {
  return postsStore.posts.filter(
    (p) => p.deleted_at === null && p.post_type === 'organic'
  ).length
})

const paidPosts = computed(() => {
  return postsStore.posts.filter(
    (p) => p.deleted_at === null && p.post_type === 'paid'
  ).length
})

const postsBySocialNetwork = computed(() => {
  const grouped = {}
  postsStore.posts
    .filter((p) => p.deleted_at === null)
    .forEach((post) => {
      grouped[post.social_network] = (grouped[post.social_network] || 0) + 1
    })

  return Object.entries(grouped)
    .map(([network, count]) => ({ network, count }))
    .sort((a, b) => b.count - a.count)
})

const postsByStatus = computed(() => {
  const grouped = {}
  postsStore.posts
    .filter((p) => p.deleted_at === null)
    .forEach((post) => {
      grouped[post.status] = (grouped[post.status] || 0) + 1
    })

  return Object.entries(grouped)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)
})

const postsThisWeek = computed(() => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 })

  return postsStore.posts.filter((p) => {
    if (p.deleted_at !== null) return false
    const date = new Date(p.scheduled_date)
    return isWithinInterval(date, { start: weekStart, end: weekEnd })
  }).length
})

const postsNextWeek = computed(() => {
  const nextWeekStart = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 0 })
  const nextWeekEnd = endOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 0 })

  return postsStore.posts.filter((p) => {
    if (p.deleted_at !== null) return false
    const date = new Date(p.scheduled_date)
    return isWithinInterval(date, { start: nextWeekStart, end: nextWeekEnd })
  }).length
})

const adjustmentsRequested = computed(() => {
  return postsStore.posts.filter(
    (p) => p.deleted_at === null && p.status === 'adjustments_requested'
  ).length
})

const readyToPublish = computed(() => {
  return postsStore.posts.filter(
    (p) => p.deleted_at === null && p.status === 'validated'
  ).length
})

function getSocialIcon(network) {
  const icons = {
    instagram: 'photo_camera',
    tiktok: 'music_note',
    google_ads: 'ads_click',
    facebook: 'facebook',
  }
  return icons[network] || 'public'
}

function getSocialColor(network) {
  const colors = {
    instagram: 'pink',
    tiktok: 'black',
    google_ads: 'blue',
    facebook: 'blue-7',
  }
  return colors[network] || 'grey'
}

function getSocialLabel(network) {
  const labels = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    google_ads: 'Google Ads',
    facebook: 'Facebook',
  }
  return labels[network] || network
}

function getStatusColor(status) {
  const colors = {
    ideas: '#9e9e9e',
    in_production: '#2196f3',
    ready_for_review: '#ff9800',
    adjustments_requested: '#f44336',
    validated: '#4caf50',
    published: '#9c27b0',
  }
  return colors[status] || '#9e9e9e'
}

function getStatusLabel(status) {
  const labels = {
    ideas: 'Ideias',
    in_production: 'Em Produção',
    ready_for_review: 'Pronto para Revisão',
    adjustments_requested: 'Ajustes Solicitados',
    validated: 'Validado',
    published: 'Publicado',
  }
  return labels[status] || status
}

onMounted(() => {
  postsStore.fetchPosts()
})
</script>

<style scoped lang="scss">
.dashboard-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    opacity: 0.2;
  }
}

.stat-row {
  padding: 8px 0;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.summary-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 13px;
}
</style>
