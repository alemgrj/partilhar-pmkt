<template>
  <q-page class="phases-page q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold">Fases do Workflow</div>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        label="Nova Fase"
        @click="openCreateDialog"
      />
    </div>

    <!-- Lista de Fases -->
    <q-card flat bordered>
      <q-list separator>
        <draggable
          v-model="workflowStore.phases"
          item-key="id"
          @end="handleReorder"
          handle=".drag-handle"
        >
          <template #item="{ element: phase }">
            <q-item>
              <q-item-section avatar>
                <q-icon name="drag_indicator" class="drag-handle cursor-pointer" />
              </q-item-section>

              <q-item-section avatar>
                <q-avatar :color="phase.color" text-color="white">
                  <q-icon :name="phase.icon" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ phase.title }}</q-item-label>
                <q-item-label caption>
                  Key: {{ phase.key }} | Ordem: {{ phase.order_index }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs items-center">
                  <q-badge v-if="phase.has_approval_button" color="green" icon="check_circle">
                    Aprovação
                  </q-badge>
                  <q-badge v-if="phase.next_phase_key" color="blue" icon="arrow_forward">
                    → {{ getPhaseTitleByKey(phase.next_phase_key) }}
                  </q-badge>
                </div>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    flat
                    round
                    dense
                    icon="edit"
                    color="primary"
                    @click="openEditDialog(phase)"
                  >
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    @click="deletePhase(phase.id)"
                  >
                    <q-tooltip>Excluir</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </template>
        </draggable>

        <q-item v-if="workflowStore.phases.length === 0">
          <q-item-section class="text-center text-grey-5">
            Nenhuma fase cadastrada
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Dialog Criar/Editar -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ editing ? 'Editar Fase' : 'Nova Fase' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="savePhase" class="q-gutter-md">
            <q-input
              v-model="form.key"
              label="Chave (Key) *"
              outlined
              hint="Identificador único (ex: in_production)"
              :rules="[(val) => !!val || 'Campo obrigatório']"
              :disable="editing"
            />

            <q-input
              v-model="form.title"
              label="Título *"
              outlined
              hint="Nome exibido (ex: Em Produção)"
              :rules="[(val) => !!val || 'Campo obrigatório']"
            />

            <q-input
              v-model.number="form.order_index"
              label="Ordem *"
              type="number"
              outlined
              hint="Posição no board (1, 2, 3...)"
              :rules="[(val) => val >= 1 || 'Deve ser maior que 0']"
            />

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-select
                  v-model="form.color"
                  :options="colorOptions"
                  label="Cor"
                  outlined
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="circle" :color="form.color" />
                  </template>
                </q-select>
              </div>

              <div class="col-6">
                <q-select
                  v-model="form.icon"
                  :options="iconOptions"
                  label="Ícone"
                  outlined
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon :name="form.icon" />
                  </template>
                </q-select>
              </div>
            </div>

            <q-select
              v-model="form.next_phase_key"
              :options="nextPhaseOptions"
              label="Próxima Fase"
              outlined
              clearable
              emit-value
              map-options
              hint="Fase para onde o post vai após aprovação"
            />

            <q-checkbox
              v-model="form.has_approval_button"
              label="Esta fase tem botão de aprovação?"
            />

            <q-input
              v-if="form.has_approval_button"
              v-model="form.approval_tag_label"
              label="Label da Tag de Aprovação"
              outlined
              hint="Ex: Aprovado pelo Cliente"
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
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useWorkflowStore } from 'stores/workflow'
import draggable from 'vuedraggable'

const $q = useQuasar()
const workflowStore = useWorkflowStore()

const showDialog = ref(false)
const editing = ref(false)
const saving = ref(false)

const form = ref({
  key: '',
  title: '',
  order_index: 1,
  color: 'grey',
  icon: 'circle',
  has_approval_button: false,
  approval_tag_label: '',
  next_phase_key: null,
})

const colorOptions = [
  { label: 'Cinza', value: 'grey' },
  { label: 'Azul', value: 'blue' },
  { label: 'Verde', value: 'green' },
  { label: 'Laranja', value: 'orange' },
  { label: 'Vermelho', value: 'red' },
  { label: 'Roxo', value: 'purple' },
  { label: 'Rosa', value: 'pink' },
  { label: 'Amarelo', value: 'amber' },
  { label: 'Ciano', value: 'cyan' },
  { label: 'Teal', value: 'teal' },
]

const iconOptions = [
  { label: 'Lâmpada', value: 'lightbulb' },
  { label: 'Construção', value: 'construction' },
  { label: 'Revisão', value: 'rate_review' },
  { label: 'Editar', value: 'edit' },
  { label: 'Check', value: 'check_circle' },
  { label: 'Publicar', value: 'public' },
  { label: 'Star', value: 'star' },
  { label: 'Flag', value: 'flag' },
  { label: 'Work', value: 'work' },
  { label: 'Done', value: 'done' },
  { label: 'Circle', value: 'circle' },
  { label: 'Square', value: 'square' },
]

const nextPhaseOptions = computed(() => {
  return workflowStore.phases
    .filter((p) => p.key !== form.value.key)
    .map((p) => ({
      label: p.title,
      value: p.key,
    }))
})

onMounted(() => {
  workflowStore.fetchPhases()
})

function openCreateDialog() {
  editing.value = false
  resetForm()
  // Calcular próxima ordem
  const maxOrder = Math.max(...workflowStore.phases.map((p) => p.order_index), 0)
  form.value.order_index = maxOrder + 1
  showDialog.value = true
}

function openEditDialog(phase) {
  editing.value = true
  form.value = {
    id: phase.id,
    key: phase.key,
    title: phase.title,
    order_index: phase.order_index,
    color: phase.color,
    icon: phase.icon,
    has_approval_button: phase.has_approval_button,
    approval_tag_label: phase.approval_tag_label,
    next_phase_key: phase.next_phase_key,
  }
  showDialog.value = true
}

async function savePhase() {
  saving.value = true
  try {
    let result

    if (editing.value) {
      result = await workflowStore.updatePhase(form.value.id, {
        title: form.value.title,
        order_index: form.value.order_index,
        color: form.value.color,
        icon: form.value.icon,
        has_approval_button: form.value.has_approval_button,
        approval_tag_label: form.value.approval_tag_label,
        next_phase_key: form.value.next_phase_key,
      })
    } else {
      result = await workflowStore.createPhase(form.value)
    }

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: editing.value ? 'Fase atualizada!' : 'Fase criada!',
        position: 'top',
      })
      showDialog.value = false
      resetForm()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao salvar fase',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

async function deletePhase(id) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja excluir esta fase?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await workflowStore.deletePhase(id)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Fase excluída!',
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: result.error || 'Erro ao excluir fase',
        position: 'top',
      })
    }
  })
}

async function handleReorder() {
  // Atualizar order_index de todas as fases
  const updates = workflowStore.phases.map((phase, index) => {
    return workflowStore.updatePhase(phase.id, {
      order_index: index + 1,
    })
  })

  await Promise.all(updates)

  $q.notify({
    type: 'positive',
    message: 'Ordem atualizada!',
    position: 'top',
  })
}

function getPhaseTitleByKey(key) {
  return workflowStore.getPhaseTitleByKey(key)
}

function resetForm() {
  form.value = {
    key: '',
    title: '',
    order_index: 1,
    color: 'grey',
    icon: 'circle',
    has_approval_button: false,
    approval_tag_label: '',
    next_phase_key: null,
  }
}
</script>

<style scoped lang="scss">
.phases-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.drag-handle {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}
</style>
