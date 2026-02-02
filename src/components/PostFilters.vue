<template>
  <div class="post-filters">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle2 text-weight-bold q-mb-md">Filtros</div>

        <!-- Filtros Rápidos -->
        <div class="quick-filters q-mb-md">
          <div class="text-caption text-grey-7 q-mb-sm">Filtros Rápidos:</div>
          <div class="row q-gutter-sm">
            <q-btn
              outline
              :color="activeQuickFilter === 'my_pending' ? 'primary' : 'grey'"
              label="Pendentes de Mim"
              size="sm"
              @click="applyQuickFilter('my_pending')"
            />
            <q-btn
              outline
              :color="activeQuickFilter === 'team_pending' ? 'primary' : 'grey'"
              label="Pendentes do Time"
              size="sm"
              @click="applyQuickFilter('team_pending')"
            />
            <q-btn
              outline
              :color="activeQuickFilter === 'this_week' ? 'primary' : 'grey'"
              label="Esta Semana"
              size="sm"
              @click="applyQuickFilter('this_week')"
            />
            <q-btn
              outline
              :color="activeQuickFilter === 'ads_only' ? 'primary' : 'grey'"
              label="Somente Ads"
              size="sm"
              @click="applyQuickFilter('ads_only')"
            />
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Filtros Detalhados -->
        <div class="detailed-filters">
          <div class="row q-col-gutter-md">
            <!-- Busca por texto -->
            <div class="col-12">
              <q-input
                v-model="filters.search"
                outlined
                dense
                placeholder="Buscar por campanha ou legenda..."
                clearable
                @update:model-value="emitFilters"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <!-- Status -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                label="Status"
                outlined
                dense
                clearable
                emit-value
                map-options
                @update:model-value="emitFilters"
              />
            </div>

            <!-- Rede Social -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="filters.social_network"
                :options="socialNetworkOptions"
                label="Rede Social"
                outlined
                dense
                clearable
                emit-value
                map-options
                @update:model-value="emitFilters"
              />
            </div>

            <!-- Tipo de Post -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="filters.post_type"
                :options="postTypeOptions"
                label="Tipo"
                outlined
                dense
                clearable
                emit-value
                map-options
                @update:model-value="emitFilters"
              />
            </div>

            <!-- Tipo de Criativo -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="filters.creative_type"
                :options="creativeTypeOptions"
                label="Tipo de Criativo"
                outlined
                dense
                clearable
                emit-value
                map-options
                @update:model-value="emitFilters"
              />
            </div>

            <!-- Data Inicial -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="filters.start_date"
                label="Data Inicial"
                type="date"
                outlined
                dense
                clearable
                @update:model-value="emitFilters"
              />
            </div>

            <!-- Data Final -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="filters.end_date"
                label="Data Final"
                type="date"
                outlined
                dense
                clearable
                @update:model-value="emitFilters"
              />
            </div>
          </div>

          <!-- Ações -->
          <div class="row justify-end q-mt-md q-gutter-sm">
            <q-btn
              flat
              label="Limpar Filtros"
              color="grey"
              @click="clearFilters"
            />
            <q-btn
              label="Aplicar"
              color="primary"
              @click="emitFilters"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'stores/auth'
import { startOfWeek, endOfWeek } from 'date-fns'

const emit = defineEmits(['update:filters'])

const authStore = useAuthStore()
const activeQuickFilter = ref(null)

const filters = ref({
  search: '',
  status: null,
  social_network: null,
  post_type: null,
  creative_type: null,
  start_date: null,
  end_date: null,
  responsible_user_id: null,
  created_by: null,
})

const statusOptions = [
  { label: 'Ideias', value: 'ideas' },
  { label: 'Em Produção', value: 'in_production' },
  { label: 'Pronto para Revisão', value: 'ready_for_review' },
  { label: 'Ajustes Solicitados', value: 'adjustments_requested' },
  { label: 'Validado', value: 'validated' },
  { label: 'Publicado', value: 'published' },
]

const socialNetworkOptions = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Google Ads', value: 'google_ads' },
  { label: 'Facebook', value: 'facebook' },
]

const postTypeOptions = [
  { label: 'Orgânico', value: 'organic' },
  { label: 'Tráfego Pago', value: 'paid' },
]

const creativeTypeOptions = [
  { label: 'Imagem', value: 'image' },
  { label: 'Vídeo', value: 'video' },
  { label: 'Carrossel', value: 'carousel' },
]

function applyQuickFilter(filterType) {
  // Toggle: se já está ativo, desativa
  if (activeQuickFilter.value === filterType) {
    activeQuickFilter.value = null
    clearFilters()
    return
  }

  activeQuickFilter.value = filterType
  clearFilters()

  switch (filterType) {
    case 'my_pending':
      filters.value.responsible_user_id = authStore.user.id
      filters.value.status = null // Remover filtro específico para mostrar todos pendentes
      break

    case 'team_pending':
      // Pendentes que não são do usuário atual
      filters.value.status = 'in_production'
      break

    case 'this_week': {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 })
      filters.value.start_date = weekStart.toISOString().split('T')[0]
      filters.value.end_date = weekEnd.toISOString().split('T')[0]
      break
    }

    case 'ads_only':
      filters.value.post_type = 'paid'
      break
  }

  emitFilters()
}

function clearFilters() {
  filters.value = {
    search: '',
    status: null,
    social_network: null,
    post_type: null,
    creative_type: null,
    start_date: null,
    end_date: null,
    responsible_user_id: null,
    created_by: null,
  }
  activeQuickFilter.value = null
  emitFilters()
}

function emitFilters() {
  // Remover valores nulos/vazios antes de emitir
  const cleanFilters = Object.fromEntries(
    Object.entries(filters.value).filter(([, v]) => v != null && v !== '')
  )
  emit('update:filters', cleanFilters)
}
</script>

<style scoped lang="scss">
.post-filters {
  .quick-filters {
    .q-btn {
      text-transform: none;
    }
  }
}
</style>
