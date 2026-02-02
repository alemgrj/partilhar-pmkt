<template>
  <q-page class="board-page">
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="text-h5 text-weight-bold">Board de Produção</div>
        <q-space />
        <q-btn
          color="primary"
          icon="add"
          label="Nova Postagem"
          to="/create"
        />
      </div>

      <div class="board-container">
        <div
          v-for="column in columns"
          :key="column.key"
          class="board-column"
          :style="`border-top: 4px solid var(--q-${column.color})`"
          @drop="onDrop($event, column.key)"
          @dragover.prevent
          @dragenter.prevent
        >
          <div class="column-header">
            <q-icon :name="column.icon" :color="column.color" size="sm" class="q-mr-xs" />
            <div class="text-subtitle1 text-weight-bold">
              {{ column.title }}
            </div>
            <q-space />
            <q-badge :color="column.color" :label="getColumnCount(column.key)" />
          </div>

          <div class="column-content">
            <div
              v-for="post in postsByStatus[column.key]"
              :key="post.id"
              draggable="true"
              @dragstart="onDragStart($event, post)"
              class="q-mb-sm"
            >
              <PostCard :post="post" @click="openPostDetail(post.id)" />
            </div>

            <div v-if="getColumnCount(column.key) === 0" class="empty-state">
              <q-icon name="inbox" size="48px" color="grey-4" />
              <div class="text-caption text-grey-5 q-mt-sm">Nenhum post</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from 'stores/posts'
import { useWorkflowStore } from 'stores/workflow'
import { useQuasar } from 'quasar'
import PostCard from 'components/PostCard.vue'

const router = useRouter()
const postsStore = usePostsStore()
const workflowStore = useWorkflowStore()
const $q = useQuasar()

const draggedPost = ref(null)

const columns = computed(() => workflowStore.phases)

const { postsByStatus } = postsStore

onMounted(() => {
  workflowStore.fetchPhases()
  postsStore.fetchPosts()
})

function getColumnCount(status) {
  return postsByStatus[status]?.length || 0
}

function onDragStart(event, post) {
  draggedPost.value = post
  event.dataTransfer.effectAllowed = 'move'
}

async function onDrop(event, newStatus) {
  event.preventDefault()

  if (!draggedPost.value || draggedPost.value.status === newStatus) {
    return
  }

  const result = await postsStore.updateStatus(draggedPost.value.id, newStatus)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Status atualizado com sucesso!',
      position: 'top',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || 'Erro ao atualizar status',
      position: 'top',
    })
  }

  draggedPost.value = null
}


function openPostDetail(postId) {
  router.push(`/post/${postId}`)
}
</script>

<style scoped lang="scss">
.board-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.board-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.board-column {
  min-width: 300px;
  flex: 1;
  background-color: #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  max-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #bdbdbd;
}

.column-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #bdbdbd;
    border-radius: 3px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}
</style>
