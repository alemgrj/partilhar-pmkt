<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    maximized
  >
    <q-card>
      <q-bar class="bg-primary text-white">
        <div class="text-h6">Detalhes da Postagem</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>

      <!-- Banner de Aprovação -->
      <q-banner
        v-if="!loading && currentPhaseHasApproval && authStore.isAdmin"
        class="bg-orange text-white"
      >
        <template v-slot:avatar>
          <q-icon name="verified_user" />
        </template>
        Esta fase requer aprovação
        <template v-slot:action>
          <q-btn
            flat
            label="Aprovar"
            icon="check_circle"
            @click="showApprovalDialog = true"
          />
        </template>
      </q-banner>

      <q-card-section v-if="loading" class="flex flex-center" style="min-height: 400px">
        <q-spinner size="xl" color="primary" />
      </q-card-section>

      <q-card-section v-else-if="post" class="row q-col-gutter-md">
        <!-- Coluna Esquerda: Informações e Preview -->
        <div class="col-12 col-md-7">
          <!-- Bloco 1: Informações Gerais -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                Informações Gerais
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="editablePost.social_network"
                    :options="socialNetworkOptions"
                    label="Rede Social"
                    outlined
                    emit-value
                    map-options
                    :disable="!canEdit"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-select
                    v-model="editablePost.post_type"
                    :options="postTypeOptions"
                    label="Tipo"
                    outlined
                    emit-value
                    map-options
                    :disable="!canEdit"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-select
                    v-model="editablePost.creative_type"
                    :options="creativeTypeOptions"
                    label="Tipo de Criativo"
                    outlined
                    emit-value
                    map-options
                    :disable="!canEdit"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-select
                    v-model="editablePost.status"
                    :options="statusOptions"
                    label="Status"
                    outlined
                    emit-value
                    map-options
                    :disable="!canEdit"
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="editablePost.campaign_name"
                    label="Nome da Campanha"
                    outlined
                    :disable="!canEdit"
                  />
                </div>

                <div class="col-12">
                  <q-input
                    v-model="editablePost.scheduled_date"
                    label="Data de Publicação"
                    type="datetime-local"
                    outlined
                    :disable="!canEdit"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Bloco 2: Conteúdo -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">Conteúdo</div>

              <!-- Upload de Criativos -->
              <div class="q-mb-md">
                <div class="text-caption text-grey-7 q-mb-sm">Criativos</div>
                <div class="row q-gutter-sm q-mb-sm">
                  <q-img
                    v-for="creative in post.post_creatives"
                    :key="creative.id"
                    :src="creative.file_url"
                    style="width: 100px; height: 100px"
                    class="rounded-borders"
                  >
                    <div class="absolute-bottom-right q-pa-xs">
                      <q-btn
                        round
                        dense
                        size="xs"
                        icon="close"
                        color="negative"
                        @click="removeCreative(creative.id)"
                        v-if="canEdit"
                      />
                    </div>
                  </q-img>
                </div>

                <q-btn
                  v-if="canEdit"
                  outline
                  color="primary"
                  icon="add_photo_alternate"
                  label="Adicionar Criativo"
                  @click="$refs.fileInput.click()"
                />
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  style="display: none"
                  @change="handleFileUpload"
                />
              </div>

              <q-input
                v-model="editablePost.caption"
                label="Legenda / Copy"
                type="textarea"
                outlined
                rows="5"
                :disable="!canEdit"
              />
            </q-card-section>
          </q-card>

          <!-- Ações -->
          <div class="row q-gutter-sm">
            <q-btn
              v-if="canEdit"
              color="primary"
              label="Salvar Alterações"
              icon="save"
              @click="saveChanges"
              :loading="saving"
            />
            <q-btn
              v-if="post.status === 'ready_for_review' && authStore.isAdmin"
              color="positive"
              label="Aprovar"
              icon="check_circle"
              @click="approvePost"
            />
            <q-btn
              v-if="post.status === 'ready_for_review' && authStore.isAdmin"
              color="negative"
              label="Solicitar Ajuste"
              icon="edit"
              @click="requestAdjustments"
            />
            <q-btn
              flat
              label="Cancelar"
              v-close-popup
            />
          </div>
        </div>

        <!-- Coluna Direita: Preview e Comentários -->
        <div class="col-12 col-md-5">
          <!-- Preview Nativo -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                Preview
              </div>

              <div v-if="!post.social_network || !post.post_creatives?.length" class="preview-placeholder">
                <q-icon name="smartphone" size="64px" color="grey-4" />
                <div class="text-caption text-grey-5 q-mt-sm">
                  {{ !post.post_creatives?.length ? 'Nenhum criativo' : 'Selecione uma rede social' }}
                </div>
              </div>

              <MobilePreview v-else :platform="post.social_network">
                <!-- Image Preview -->
                <ImagePreview
                  v-if="post.creative_type === 'image' && post.post_creatives[0]"
                  :image-url="post.post_creatives[0].file_url"
                  :caption="post.caption"
                  :platform="post.social_network"
                />

                <!-- Video Preview -->
                <VideoPreview
                  v-else-if="post.creative_type === 'video' && post.post_creatives[0]"
                  :video-url="post.post_creatives[0].file_url"
                  :caption="post.caption"
                  :platform="post.social_network"
                />

                <!-- Carousel Preview -->
                <CarouselPreview
                  v-else-if="post.creative_type === 'carousel'"
                  :items="carouselItems"
                  :caption="post.caption"
                />
              </MobilePreview>
            </q-card-section>
          </q-card>

          <!-- Comentários -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                Comentários Internos
              </div>

              <div class="comments-sections">
                <!-- Comentários da Fase Atual -->
                <q-expansion-item
                  default-opened
                  :label="`Comentários da fase '${currentPhaseTitle}' (${currentPhaseComments.length})`"
                  icon="comment"
                  class="q-mb-md"
                >
                  <q-separator />
                  <div class="q-pa-md comments-list">
                    <div
                      v-for="comment in currentPhaseComments"
                      :key="comment.id"
                      class="comment-item q-mb-md"
                    >
                      <div class="row items-start q-gutter-sm">
                        <q-avatar size="32px">
                          <img
                            v-if="comment.user?.avatar_url"
                            :src="comment.user.avatar_url"
                          />
                          <q-icon v-else name="person" />
                          <q-badge v-if="comment.role" floating :color="comment.role.color">
                            <q-icon :name="comment.role.icon" size="xs" />
                          </q-badge>
                        </q-avatar>
                        <div class="col">
                          <div class="row items-center q-gutter-xs">
                            <div class="text-weight-bold">{{ comment.user?.name }}</div>
                            <q-badge v-if="comment.role" :color="comment.role.color">
                              {{ comment.role.name }}
                            </q-badge>
                          </div>
                          <div class="text-caption text-grey-7">
                            {{ formatDate(comment.created_at) }}
                          </div>
                          <div class="q-mt-xs">{{ comment.comment }}</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="currentPhaseComments.length === 0" class="text-center text-grey-5 q-py-md">
                      Nenhum comentário nesta fase
                    </div>
                  </div>
                </q-expansion-item>

                <!-- Comentários de Fases Anteriores (Colapsado) -->
                <q-expansion-item
                  v-for="phase in previousPhasesWithComments"
                  :key="phase.key"
                  :label="`Comentários de '${phase.title}' (${phase.comments.length})`"
                  icon="history"
                  class="q-mb-md"
                >
                  <q-separator />
                  <div class="q-pa-md comments-list">
                    <div
                      v-for="comment in phase.comments"
                      :key="comment.id"
                      class="comment-item comment-item-strikethrough q-mb-md"
                    >
                      <div class="row items-start q-gutter-sm">
                        <q-avatar size="32px">
                          <img
                            v-if="comment.user?.avatar_url"
                            :src="comment.user.avatar_url"
                          />
                          <q-icon v-else name="person" />
                          <q-badge v-if="comment.role" floating :color="comment.role.color">
                            <q-icon :name="comment.role.icon" size="xs" />
                          </q-badge>
                        </q-avatar>
                        <div class="col">
                          <div class="row items-center q-gutter-xs">
                            <div class="text-weight-bold">{{ comment.user?.name }}</div>
                            <q-badge v-if="comment.role" :color="comment.role.color">
                              {{ comment.role.name }}
                            </q-badge>
                          </div>
                          <div class="text-caption text-grey-7">
                            {{ formatDate(comment.created_at) }}
                          </div>
                          <div class="q-mt-xs">{{ comment.comment }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-expansion-item>

                <div v-if="!post.post_comments?.length" class="text-center text-grey-5 q-py-md">
                  Nenhum comentário ainda
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="row q-gutter-sm">
                <q-input
                  v-model="newComment"
                  outlined
                  placeholder="Adicionar comentário..."
                  class="col"
                  @keyup.enter="addComment"
                />
                <q-btn
                  color="primary"
                  icon="send"
                  @click="addComment"
                  :loading="addingComment"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog de Aprovação -->
    <q-dialog v-model="showApprovalDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Aprovar Postagem</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="approvalNote"
            type="textarea"
            label="Nota (opcional)"
            outlined
            rows="3"
            hint="Adicione observações sobre a aprovação"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Confirmar Aprovação"
            icon="check_circle"
            @click="handleApproval"
            :loading="approvingPost"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { usePostsStore } from 'stores/posts'
import { useAuthStore } from 'stores/auth'
import { useWorkflowStore } from 'stores/workflow'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useFileUpload } from 'src/composables/useFileUpload'
import MobilePreview from 'src/components/MobilePreview.vue'
import ImagePreview from 'src/components/previews/ImagePreview.vue'
import VideoPreview from 'src/components/previews/VideoPreview.vue'
import CarouselPreview from 'src/components/previews/CarouselPreview.vue'

const props = defineProps({
  modelValue: Boolean,
  postId: String,
})

defineEmits(['update:modelValue'])

const postsStore = usePostsStore()
const authStore = useAuthStore()
const workflowStore = useWorkflowStore()
const $q = useQuasar()
const { uploadFile, uploadMultipleFiles } = useFileUpload()

const post = ref(null)
const editablePost = ref({})
const loading = ref(false)
const saving = ref(false)
const addingComment = ref(false)
const newComment = ref('')
const uploading = ref(false)
const showApprovalDialog = ref(false)
const approvalNote = ref('')
const approvingPost = ref(false)

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

const statusOptions = [
  { label: 'Ideias', value: 'ideas' },
  { label: 'Em Produção', value: 'in_production' },
  { label: 'Pronto para Revisão', value: 'ready_for_review' },
  { label: 'Ajustes Solicitados', value: 'adjustments_requested' },
  { label: 'Validado', value: 'validated' },
  { label: 'Publicado', value: 'published' },
]

const canEdit = computed(() => {
  if (!post.value || !authStore.user) return false
  return (
    post.value.created_by === authStore.user.id ||
    post.value.responsible_user_id === authStore.user.id ||
    authStore.isAdmin
  )
})

const carouselItems = computed(() => {
  if (!post.value?.post_creatives) return []
  return post.value.post_creatives.map(c => ({
    url: c.file_url,
    type: c.file_type,
    name: c.file_url.split('/').pop(),
    size: 0
  }))
})

const currentPhaseTitle = computed(() => {
  return workflowStore.getPhaseTitleByKey(post.value?.status)
})

const currentPhaseComments = computed(() => {
  if (!post.value?.post_comments) return []
  return post.value.post_comments.filter(
    (c) => c.phase_status === post.value.status
  )
})

const previousPhasesWithComments = computed(() => {
  if (!post.value?.post_comments) return []

  const phases = {}
  post.value.post_comments.forEach((comment) => {
    if (comment.phase_status !== post.value.status) {
      if (!phases[comment.phase_status]) {
        phases[comment.phase_status] = {
          key: comment.phase_status,
          title: workflowStore.getPhaseTitleByKey(comment.phase_status),
          comments: [],
        }
      }
      phases[comment.phase_status].comments.push(comment)
    }
  })
  return Object.values(phases)
})

const currentPhase = computed(() => {
  return workflowStore.phases.find((p) => p.key === post.value?.status)
})

const currentPhaseHasApproval = computed(() => {
  return currentPhase.value?.has_approval_button || false
})

onMounted(() => {
  workflowStore.fetchPhases()
})

watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal && props.postId) {
      await loadPost()
    }
  }
)

async function loadPost() {
  loading.value = true
  const result = await postsStore.fetchPostById(props.postId)

  if (result.success) {
    post.value = result.data
    editablePost.value = {
      social_network: post.value.social_network,
      post_type: post.value.post_type,
      creative_type: post.value.creative_type,
      status: post.value.status,
      campaign_name: post.value.campaign_name,
      scheduled_date: formatDateTimeLocal(post.value.scheduled_date),
      caption: post.value.caption,
    }
  }

  loading.value = false
}

async function saveChanges() {
  saving.value = true

  const result = await postsStore.updatePost(props.postId, {
    ...editablePost.value,
    scheduled_date: new Date(editablePost.value.scheduled_date).toISOString(),
  })

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Alterações salvas com sucesso!',
      position: 'top',
    })
    await loadPost()
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || 'Erro ao salvar alterações',
      position: 'top',
    })
  }

  saving.value = false
}

async function approvePost() {
  const result = await postsStore.updateStatus(props.postId, 'validated')

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Postagem aprovada!',
      position: 'top',
    })
    await loadPost()
  }
}

async function requestAdjustments() {
  const result = await postsStore.updateStatus(props.postId, 'adjustments_requested')

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Ajustes solicitados!',
      position: 'top',
    })
    await loadPost()
  }
}

async function addComment() {
  if (!newComment.value.trim()) return

  addingComment.value = true

  const result = await postsStore.addComment(props.postId, newComment.value)

  if (result.success) {
    newComment.value = ''
    await loadPost()
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || 'Erro ao adicionar comentário',
      position: 'top',
    })
  }

  addingComment.value = false
}

async function handleApproval() {
  approvingPost.value = true

  try {
    const result = await workflowStore.approvePost(
      post.value.id,
      post.value.status,
      approvalNote.value
    )

    if (result.success) {
      showApprovalDialog.value = false
      approvalNote.value = ''

      $q.notify({
        type: 'positive',
        message: 'Postagem aprovada com sucesso!',
        position: 'top',
      })

      await loadPost()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao aprovar postagem',
      position: 'top',
    })
  } finally {
    approvingPost.value = false
  }
}

function formatDate(date) {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

function formatDateTimeLocal(date) {
  const d = new Date(date)
  return format(d, "yyyy-MM-dd'T'HH:mm")
}

async function handleFileUpload(event) {
  const files = Array.from(event.target.files)
  if (files.length === 0) return

  uploading.value = true
  $q.loading.show({ message: 'Fazendo upload...' })

  try {
    const result = files.length === 1 
      ? await uploadFile(files[0])
      : await uploadMultipleFiles(files)

    if (result.success) {
      const { postsService } = await import('src/services/postsService')
      
      if (files.length === 1) {
        await postsService.addCreatives(props.postId, [{ url: result.url, type: files[0].type }])
      } else {
        await postsService.addCreatives(props.postId, result.files.map(f => ({ url: f.url, type: f.type })))
      }

      $q.notify({
        type: 'positive',
        message: 'Upload realizado com sucesso!',
        position: 'top',
      })

      await loadPost()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao fazer upload',
      position: 'top',
    })
  } finally {
    uploading.value = false
    $q.loading.hide()
    event.target.value = ''
  }
}

async function removeCreative(creativeId) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: 'Deseja remover este criativo?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const { postsService } = await import('src/services/postsService')
      const result = await postsService.removeCreative(creativeId)

      if (result.success) {
        $q.notify({
          type: 'positive',
          message: 'Criativo removido com sucesso!',
          position: 'top',
        })
        await loadPost()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message || 'Erro ao remover criativo',
        position: 'top',
      })
    }
  })
}
</script>

<style scoped lang="scss">
.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: #fafafa;
  border-radius: 8px;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
}

.comment-item {
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
}

.comment-item-strikethrough {
  opacity: 0.6;
  text-decoration: line-through;
}
</style>
