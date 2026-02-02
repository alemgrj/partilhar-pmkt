<template>
  <q-page class="roles-page q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold">Papéis de Usuários</div>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        label="Novo Papel"
        @click="openCreateDialog"
      />
    </div>

    <!-- Lista de Papéis -->
    <div class="row q-col-gutter-md">
      <div
        v-for="role in rolesStore.roles"
        :key="role.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card flat bordered class="role-card">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-avatar :color="role.color" text-color="white" size="48px">
                <q-icon :name="role.icon" />
              </q-avatar>
              <div class="q-ml-md">
                <div class="text-h6">{{ role.name }}</div>
                <div class="text-caption text-grey-7">
                  {{ userCounts[role.id] || 0 }} usuário(s)
                </div>
              </div>
            </div>

            <div v-if="role.description" class="text-body2 text-grey-8">
              {{ role.description }}
            </div>
          </q-card-section>

          <q-card-actions>
            <q-btn flat color="primary" icon="edit" label="Editar" @click="openEditDialog(role)" />
            <q-btn
              flat
              color="negative"
              icon="delete"
              label="Excluir"
              @click="deleteRole(role.id)"
              :disable="(userCounts[role.id] || 0) > 0"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div v-if="rolesStore.roles.length === 0 && !rolesStore.loading" class="col-12">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-lg">
            <q-icon name="badge" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">Nenhum papel encontrado</div>
            <div class="text-caption text-grey-5">Crie o primeiro papel para começar</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog Criar/Editar -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editing ? 'Editar Papel' : 'Novo Papel' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveRole" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Nome do Papel *"
              outlined
              hint="Ex: Designer, Copywriter"
              :rules="[(val) => !!val || 'Campo obrigatório']"
            />

            <q-input
              v-model="form.description"
              label="Descrição"
              type="textarea"
              outlined
              rows="3"
              hint="Breve descrição do papel"
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
import { useRolesStore } from 'stores/roles'

const $q = useQuasar()
const rolesStore = useRolesStore()

const showDialog = ref(false)
const editing = ref(false)
const saving = ref(false)
const userCounts = ref({})

const form = ref({
  name: '',
  description: '',
  color: 'blue',
  icon: 'person',
})

const colorOptions = [
  { label: 'Azul', value: 'blue' },
  { label: 'Verde', value: 'green' },
  { label: 'Laranja', value: 'orange' },
  { label: 'Roxo', value: 'purple' },
  { label: 'Rosa', value: 'pink' },
  { label: 'Vermelho', value: 'red' },
  { label: 'Ciano', value: 'cyan' },
  { label: 'Teal', value: 'teal' },
  { label: 'Amarelo', value: 'amber' },
  { label: 'Cinza', value: 'grey' },
]

const iconOptions = [
  { label: 'Pessoa', value: 'person' },
  { label: 'Negócio', value: 'business' },
  { label: 'Campanha', value: 'campaign' },
  { label: 'Paleta', value: 'palette' },
  { label: 'Editar', value: 'edit' },
  { label: 'Star', value: 'star' },
  { label: 'Work', value: 'work' },
  { label: 'Grupo', value: 'group' },
  { label: 'Badge', value: 'badge' },
  { label: 'Verified', value: 'verified' },
]

onMounted(async () => {
  await rolesStore.fetchRoles()
  await loadUserCounts()
})

async function loadUserCounts() {
  for (const role of rolesStore.roles) {
    userCounts.value[role.id] = await rolesStore.getUserCountByRole(role.id)
  }
}

function openCreateDialog() {
  editing.value = false
  resetForm()
  showDialog.value = true
}

function openEditDialog(role) {
  editing.value = true
  form.value = {
    id: role.id,
    name: role.name,
    description: role.description,
    color: role.color,
    icon: role.icon,
  }
  showDialog.value = true
}

async function saveRole() {
  saving.value = true
  try {
    let result

    if (editing.value) {
      result = await rolesStore.updateRole(form.value.id, {
        name: form.value.name,
        description: form.value.description,
        color: form.value.color,
        icon: form.value.icon,
      })
    } else {
      result = await rolesStore.createRole(form.value)
    }

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: editing.value ? 'Papel atualizado!' : 'Papel criado!',
        position: 'top',
      })
      showDialog.value = false
      resetForm()
      await loadUserCounts()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao salvar papel',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

async function deleteRole(id) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Tem certeza que deseja excluir este papel?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await rolesStore.deleteRole(id)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Papel excluído!',
        position: 'top',
      })
      await loadUserCounts()
    } else {
      $q.notify({
        type: 'negative',
        message: result.error || 'Erro ao excluir papel',
        position: 'top',
      })
    }
  })
}

function resetForm() {
  form.value = {
    name: '',
    description: '',
    color: 'blue',
    icon: 'person',
  }
}
</script>

<style scoped lang="scss">
.roles-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.role-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
</style>
