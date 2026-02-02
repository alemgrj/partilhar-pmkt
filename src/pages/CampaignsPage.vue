<template>
  <q-page class="campaigns-page q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold">Campanhas</div>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        label="Nova Campanha"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filter.status"
              :options="statusOptions"
              label="Status"
              outlined
              dense
              clearable
              @update:model-value="loadCampaigns"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filter.objective"
              :options="objectiveOptions"
              label="Objetivo"
              outlined
              dense
              clearable
              @update:model-value="loadCampaigns"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="filter.search"
              label="Buscar"
              outlined
              dense
              clearable
              @update:model-value="loadCampaigns"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Lista de Campanhas -->
    <div class="row q-col-gutter-md">
      <div v-for="campaign in campaigns" :key="campaign.id" class="col-12 col-md-6 col-lg-4">
        <q-card flat bordered class="campaign-card">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="text-h6">{{ campaign.name }}</div>
              <q-space />
              <q-badge :color="getStatusColor(campaign.status)" :label="getStatusLabel(campaign.status)" />
            </div>

            <div v-if="campaign.description" class="text-caption q-mb-sm">
              {{ campaign.description }}
            </div>

            <div class="campaign-details q-mt-md">
              <div class="detail-item">
                <q-icon name="flag" size="sm" />
                <span>{{ getObjectiveLabel(campaign.objective) }}</span>
              </div>
              <div v-if="campaign.budget" class="detail-item">
                <q-icon name="attach_money" size="sm" />
                <span>R$ {{ formatMoney(campaign.budget) }}</span>
              </div>
              <div v-if="campaign.start_date" class="detail-item">
                <q-icon name="event" size="sm" />
                <span>{{ formatDate(campaign.start_date) }} - {{ formatDate(campaign.end_date) }}</span>
              </div>
            </div>
          </q-card-section>

          <q-card-actions>
            <q-btn flat color="primary" label="Editar" @click="editCampaign(campaign)" />
            <q-btn flat color="negative" label="Excluir" @click="deleteCampaign(campaign.id)" />
          </q-card-actions>
        </q-card>
      </div>

      <div v-if="campaigns.length === 0 && !loading" class="col-12">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-lg">
            <q-icon name="campaign" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">Nenhuma campanha encontrada</div>
            <div class="text-caption text-grey-5">Crie sua primeira campanha para começar</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog Criar/Editar -->
    <q-dialog v-model="showCreateDialog">
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ editingCampaign ? 'Editar Campanha' : 'Nova Campanha' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveCampaign" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Nome da Campanha *"
              outlined
              :rules="[(val) => !!val || 'Campo obrigatório']"
            />

            <q-input
              v-model="form.description"
              label="Descrição"
              type="textarea"
              outlined
              rows="3"
            />

            <q-select
              v-model="form.objective"
              :options="objectiveOptions"
              label="Objetivo"
              outlined
              emit-value
              map-options
            />

            <q-select
              v-model="form.status"
              :options="statusOptions"
              label="Status *"
              outlined
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo obrigatório']"
            />

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model="form.start_date"
                  label="Data Início"
                  type="date"
                  outlined
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="form.end_date"
                  label="Data Fim"
                  type="date"
                  outlined
                />
              </div>
            </div>

            <q-input
              v-model.number="form.budget"
              label="Orçamento (R$)"
              type="number"
              outlined
              step="0.01"
              prefix="R$"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancelar" flat v-close-popup />
              <q-btn
                label="Salvar"
                type="submit"
                color="primary"
                :loading="saving"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from 'boot/supabase'
import { useAuthStore } from 'stores/auth'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const $q = useQuasar()
const authStore = useAuthStore()

const campaigns = ref([])
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingCampaign = ref(null)

const filter = ref({
  status: null,
  objective: null,
  search: '',
})

const form = ref({
  name: '',
  description: '',
  objective: null,
  status: 'draft',
  start_date: '',
  end_date: '',
  budget: null,
})

const statusOptions = [
  { label: 'Rascunho', value: 'draft' },
  { label: 'Ativa', value: 'active' },
  { label: 'Pausada', value: 'paused' },
  { label: 'Concluída', value: 'completed' },
  { label: 'Cancelada', value: 'cancelled' },
]

const objectiveOptions = [
  { label: 'Awareness (Consciência)', value: 'awareness' },
  { label: 'Consideration (Consideração)', value: 'consideration' },
  { label: 'Conversion (Conversão)', value: 'conversion' },
  { label: 'Retention (Retenção)', value: 'retention' },
  { label: 'Branding', value: 'branding' },
]

onMounted(() => {
  loadCampaigns()
})

async function loadCampaigns() {
  loading.value = true
  try {
    let query = supabase
      .from('campaigns')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filter.value.status) {
      query = query.eq('status', filter.value.status)
    }

    if (filter.value.objective) {
      query = query.eq('objective', filter.value.objective)
    }

    if (filter.value.search) {
      query = query.ilike('name', `%${filter.value.search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    campaigns.value = data || []
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao carregar campanhas',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function editCampaign(campaign) {
  editingCampaign.value = campaign
  form.value = {
    name: campaign.name,
    description: campaign.description,
    objective: campaign.objective,
    status: campaign.status,
    start_date: campaign.start_date,
    end_date: campaign.end_date,
    budget: campaign.budget,
  }
  showCreateDialog.value = true
}

async function saveCampaign() {
  saving.value = true
  try {
    if (editingCampaign.value) {
      // Atualizar
      const { error } = await supabase
        .from('campaigns')
        .update(form.value)
        .eq('id', editingCampaign.value.id)

      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Campanha atualizada com sucesso!',
        position: 'top',
      })
    } else {
      // Criar
      const { error } = await supabase.from('campaigns').insert({
        ...form.value,
        created_by: authStore.user.id,
      })

      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Campanha criada com sucesso!',
        position: 'top',
      })
    }

    showCreateDialog.value = false
    editingCampaign.value = null
    resetForm()
    loadCampaigns()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao salvar campanha',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

async function deleteCampaign(id) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja excluir esta campanha?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Campanha excluída com sucesso!',
        position: 'top',
      })

      loadCampaigns()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Erro ao excluir campanha',
        position: 'top',
      })
    }
  })
}

function resetForm() {
  form.value = {
    name: '',
    description: '',
    objective: null,
    status: 'draft',
    start_date: '',
    end_date: '',
    budget: null,
  }
}

function getStatusColor(status) {
  const colors = {
    draft: 'grey',
    active: 'green',
    paused: 'orange',
    completed: 'blue',
    cancelled: 'red',
  }
  return colors[status] || 'grey'
}

function getStatusLabel(status) {
  const labels = {
    draft: 'Rascunho',
    active: 'Ativa',
    paused: 'Pausada',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  }
  return labels[status] || status
}

function getObjectiveLabel(objective) {
  if (!objective) return '-'
  const labels = {
    awareness: 'Awareness',
    consideration: 'Consideration',
    conversion: 'Conversion',
    retention: 'Retention',
    branding: 'Branding',
  }
  return labels[objective] || objective
}

function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(date) {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}
</script>

<style scoped lang="scss">
.campaigns-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.campaign-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.campaign-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}
</style>
