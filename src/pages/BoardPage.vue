<template>
  <q-page class="board-page">
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-md">
        <div class="text-h5 text-weight-bold">Board de Produção</div>
        <q-space />
        <q-btn
          color="primary"
          icon="add"
          label="Nova Postagem"
          to="/create"
          unelevated
        />
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="row justify-center q-py-xl">
        <q-spinner color="primary" size="50px" />
      </div>

      <!-- Board Container -->
      <div v-else-if="phases.length > 0" class="board-container">
        <div
          v-for="phase in phases"
          :key="phase.key"
          v-memo="[postsByStatus[phase.key]?.length, phase.key]"
          class="board-column"
        >
          <!-- Column Header -->
          <div class="column-header">
            <q-icon :name="phase.icon" :color="phase.color" size="sm" />
            <div class="text-subtitle1 text-weight-bold">{{ phase.title }}</div>
            <q-space />
            <q-badge :color="phase.color" :label="getPostCount(phase.key)" />
          </div>

          <!-- Column Body with VueDraggable -->
          <draggable
            :list="postsByStatus[phase.key]"
            group="posts"
            :animation="200"
            ghost-class="ghost-card"
            drag-class="drag-card"
            item-key="id"
            class="column-body"
            @change="(event) => handleDragChange(event, phase.key)"
          >
            <template #item="{ element }">
              <div 
                class="post-card-wrapper" 
                @click="openPostDetail(element.id)"
              >
                <PostCard :post="element" />
              </div>
            </template>
          </draggable>

          <!-- Empty State -->
          <div v-if="postsByStatus[phase.key]?.length === 0" class="empty-state">
            <q-icon name="inbox" size="48px" color="grey-4" />
            <div class="text-caption text-grey-6 q-mt-sm">Nenhum post aqui</div>
          </div>
        </div>
      </div>

      <!-- Empty state para board sem fases -->
      <div v-else class="empty-board">
        <q-icon name="view_column" size="80px" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">Nenhuma fase configurada</div>
        <div class="text-body2 text-grey-5">Configure as fases do workflow no backoffice</div>
        <q-btn
          flat
          color="primary"
          label="Ir para Configurações"
          to="/backoffice/phases"
          class="q-mt-md"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePostsStore } from 'stores/posts'
import { useWorkflowStore } from 'stores/workflow'
import draggable from 'vuedraggable'
import PostCard from 'components/PostCard.vue'

const router = useRouter()
const $q = useQuasar()
const postsStore = usePostsStore()
const workflowStore = useWorkflowStore()

const phases = computed(() => workflowStore.phases)
const postsByStatus = computed(() => postsStore.postsByStatus)
const loading = computed(() => postsStore.loading || workflowStore.loading)

onMounted(async () => {
  await Promise.all([
    workflowStore.fetchPhases(),
    postsStore.fetchPosts(),
  ])
})

function getPostCount(phaseKey) {
  return postsByStatus.value[phaseKey]?.length || 0
}

async function handleDragChange(event, phaseKey) {
  // Quando um card é adicionado a esta coluna
  if (event.added) {
    const post = event.added.element
    const newStatus = phaseKey

    console.log(`Moving post ${post.id} to ${newStatus}`)

    try {
      const result = await postsStore.updateStatus(post.id, newStatus)

      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar status')
      }

      $q.notify({
        type: 'positive',
        message: 'Status atualizado com sucesso!',
        position: 'top',
        timeout: 2000,
      })
    } catch (error) {
      console.error('Error updating post status:', error)

      $q.notify({
        type: 'negative',
        message: 'Erro ao mover post. Tente novamente.',
        position: 'top',
        timeout: 3000,
      })

      // Forçar atualização para restaurar estado correto
      await postsStore.fetchPosts()
    }
  }
}

function openPostDetail(postId) {
  router.push(`/post/${postId}`)
}
</script>

<style lang="scss" scoped>
.board-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ee 100%);
  min-height: 100vh;
}

.board-container {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.board-column {
  min-width: 320px;
  max-width: 380px;
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 180px);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.column-header {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 2px solid rgba(0, 0, 0, 0.06);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.column-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  min-height: 200px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.post-card-wrapper {
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

// Estilos do vuedraggable
:deep(.ghost-card) {
  opacity: 0.3;
  background: #e3f2fd;
}

:deep(.drag-card) {
  cursor: grabbing !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transform: rotate(2deg);
}
</style>
