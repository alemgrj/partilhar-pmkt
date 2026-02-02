<template>
  <q-page class="users-page q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold">Usuários</div>
      <q-space />
      <q-badge color="primary" :label="`${users.length} usuários`" />
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filter.role"
              :options="roleOptions"
              label="Perfil"
              outlined
              dense
              clearable
              @update:model-value="loadUsers"
            />
          </div>
          <div class="col-12 col-md-9">
            <q-input
              v-model="filter.search"
              label="Buscar por nome ou email"
              outlined
              dense
              clearable
              @update:model-value="loadUsers"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabela de Usuários -->
    <q-card flat bordered>
      <q-table
        :rows="users"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :rows-per-page-options="[10, 25, 50]"
      >
        <template v-slot:body-cell-user="props">
          <q-td :props="props">
            <div class="row items-center">
              <q-avatar size="40px" class="q-mr-sm">
                <img v-if="props.row.avatar_url" :src="props.row.avatar_url" />
                <q-icon v-else name="person" />
              </q-avatar>
              <div>
                <div class="text-weight-medium">{{ props.row.name }}</div>
                <div class="text-caption text-grey-7">{{ props.row.email }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-role="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-xs">
              <q-badge
                :color="props.row.role === 'admin' ? 'orange' : 'blue'"
                :label="props.row.role === 'admin' ? 'Admin' : 'User'"
              />
              <q-badge
                v-if="props.row.user_role"
                :color="props.row.user_role.color"
                :icon="props.row.user_role.icon"
              >
                {{ props.row.user_role.name }}
              </q-badge>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-created_at="props">
          <q-td :props="props">
            {{ formatDateTime(props.row.created_at) }}
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="more_vert"
            >
              <q-menu>
                <q-list>
                  <q-item
                    clickable
                    v-close-popup
                    @click="editUserRole(props.row)"
                  >
                    <q-item-section avatar>
                      <q-icon name="badge" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Editar Papel</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="toggleRole(props.row)"
                    :disable="props.row.id === authStore.user.id"
                  >
                    <q-item-section avatar>
                      <q-icon name="swap_horiz" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ props.row.role === 'admin' ? 'Tornar User' : 'Tornar Admin' }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="deleteUser(props.row)"
                    :disable="props.row.id === authStore.user.id"
                  >
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-negative">Excluir</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog para editar papel do usuário -->
    <q-dialog v-model="showRoleDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Editar Papel do Usuário</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body2 q-mb-md">
            Usuário: <strong>{{ editingUser?.name }}</strong>
          </div>

          <q-select
            v-model="selectedRoleId"
            :options="allRoles"
            label="Papel"
            outlined
            emit-value
            map-options
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="badge" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Salvar"
            @click="saveUserRole"
            :loading="savingRole"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from 'boot/supabase'
import { useAuthStore } from 'stores/auth'
import { useRolesStore } from 'stores/roles'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const $q = useQuasar()
const authStore = useAuthStore()
const rolesStore = useRolesStore()

const users = ref([])
const loading = ref(false)
const showRoleDialog = ref(false)
const editingUser = ref(null)
const selectedRoleId = ref(null)
const savingRole = ref(false)

const filter = ref({
  role: null,
  search: '',
})

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
]

const columns = [
  {
    name: 'user',
    label: 'Usuário',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'role',
    label: 'Perfil',
    field: 'role',
    align: 'center',
    sortable: true,
  },
  {
    name: 'created_at',
    label: 'Criado em',
    field: 'created_at',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'center',
  },
]

const allRoles = computed(() => {
  return rolesStore.roles.map((r) => ({
    label: r.name,
    value: r.id,
  }))
})

onMounted(async () => {
  await rolesStore.fetchRoles()
  await loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    // Buscar usuários da tabela public.users + email de auth.users + role
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*, user_role:role_id(id, name, color, icon)')

    if (usersError) throw usersError

    // Buscar emails dos usuários
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      // Se não tem permissão de admin, usar rpc ou buscar de outra forma
      // Por enquanto vamos apenas mostrar os dados de public.users
      users.value = usersData.map((u) => ({ ...u, email: 'N/A' }))
    } else {
      // Mapear emails
      const emailMap = {}
      authUsers.users.forEach((u) => {
        emailMap[u.id] = u.email
      })

      users.value = usersData.map((u) => ({
        ...u,
        email: emailMap[u.id] || 'N/A',
      }))
    }

    // Aplicar filtros
    let filtered = users.value

    if (filter.value.role) {
      filtered = filtered.filter((u) => u.role === filter.value.role)
    }

    if (filter.value.search) {
      const search = filter.value.search.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      )
    }

    users.value = filtered
  } catch (error) {
    console.error('Error loading users:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao carregar usuários',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

async function toggleRole(user) {
  const newRole = user.role === 'admin' ? 'user' : 'admin'

  $q.dialog({
    title: 'Alterar perfil',
    message: `Deseja tornar ${user.name} um ${newRole === 'admin' ? 'Admin' : 'User'}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user.id)

      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Perfil atualizado com sucesso!',
        position: 'top',
      })

      loadUsers()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Erro ao atualizar perfil',
        position: 'top',
      })
    }
  })
}

async function deleteUser(user) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o usuário ${user.name}? Esta ação não pode ser desfeita.`,
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(async () => {
    try {
      // Deletar da tabela users (vai cascatear para auth.users via FK)
      const { error } = await supabase.auth.admin.deleteUser(user.id)

      if (error) throw error

      $q.notify({
        type: 'positive',
        message: 'Usuário excluído com sucesso!',
        position: 'top',
      })

      loadUsers()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Erro ao excluir usuário',
        position: 'top',
      })
    }
  })
}

function editUserRole(user) {
  editingUser.value = user
  selectedRoleId.value = user.role_id
  showRoleDialog.value = true
}

async function saveUserRole() {
  savingRole.value = true
  try {
    const { error } = await supabase
      .from('users')
      .update({ role_id: selectedRoleId.value })
      .eq('id', editingUser.value.id)

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Papel atualizado com sucesso!',
      position: 'top',
    })

    showRoleDialog.value = false
    await loadUsers()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao atualizar papel',
      position: 'top',
    })
  } finally {
    savingRole.value = false
  }
}

function formatDateTime(date) {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}
</script>

<style scoped lang="scss">
.users-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>
