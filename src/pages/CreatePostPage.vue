<template>
  <q-page class="create-post-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header q-pa-md">
        <q-btn flat round icon="arrow_back" @click="goBack" />
        <div class="text-h5 text-weight-bold q-ml-md">Nova Postagem</div>
        <q-space />
        <q-btn
          color="primary"
          label="Criar Postagem"
          icon="check"
          @click="createPost"
          :loading="creating"
          :disable="!canCreate"
          unelevated
        />
      </div>

      <div class="row q-col-gutter-md q-pa-md">
        <!-- Coluna Esquerda: Formulário -->
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">Informações da Postagem</div>

              <q-form class="q-gutter-md">
                <!-- Rede Social -->
                <q-select
                  v-model="form.social_network"
                  :options="socialNetworkOptions"
                  label="Rede Social *"
                  outlined
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                >
                  <template v-slot:prepend>
                    <q-icon :name="getSocialIcon(form.social_network)" />
                  </template>
                </q-select>

                <!-- Tipo de Post e Criativo -->
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <q-select
                      v-model="form.post_type"
                      :options="postTypeOptions"
                      label="Tipo *"
                      outlined
                      emit-value
                      map-options
                      :rules="[(val) => !!val || 'Campo obrigatório']"
                    />
                  </div>
                  <div class="col-6">
                    <q-select
                      v-model="form.creative_type"
                      :options="creativeTypeOptions"
                      label="Tipo de Criativo *"
                      outlined
                      emit-value
                      map-options
                      :rules="[(val) => !!val || 'Campo obrigatório']"
                      @update:model-value="onCreativeTypeChange"
                    />
                  </div>
                </div>

                <!-- Campanha -->
                <q-select
                  v-model="form.campaign_id"
                  :options="campaignOptions"
                  label="Campanha"
                  outlined
                  emit-value
                  map-options
                  clearable
                  hint="Selecione uma campanha existente"
                >
                  <template v-slot:prepend>
                    <q-icon name="campaign" />
                  </template>
                  <template v-slot:after>
                    <q-btn
                      flat
                      round
                      dense
                      icon="add"
                      @click.stop="showQuickCampaignDialog = true"
                      color="primary"
                    >
                      <q-tooltip>Criar campanha rápida</q-tooltip>
                    </q-btn>
                  </template>
                </q-select>

                <!-- Nome customizado (se não selecionar campanha) -->
                <q-input
                  v-if="!form.campaign_id"
                  v-model="form.campaign_name"
                  label="Nome da Postagem"
                  outlined
                  hint="Ex: Post de Black Friday, Lançamento Produto X"
                >
                  <template v-slot:prepend>
                    <q-icon name="title" />
                  </template>
                </q-input>

                <!-- Data e Hora -->
                <q-input
                  v-model="form.scheduled_date"
                  label="Data e Hora de Publicação *"
                  type="datetime-local"
                  outlined
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>

                <!-- Upload de Criativos -->
                <div class="upload-section">
                  <div class="text-subtitle2 q-mb-sm">
                    Criativos *
                    <q-badge
                      v-if="uploadedFiles.length > 0"
                      color="primary"
                      :label="uploadedFiles.length"
                    />
                  </div>

                  <!-- Área de Upload -->
                  <div
                    class="upload-area"
                    :class="{ 'upload-drag-over': dragOver }"
                    @click="triggerFileInput"
                    @drop.prevent="onDrop"
                    @dragover.prevent="dragOver = true"
                    @dragleave.prevent="dragOver = false"
                  >
                    <q-icon name="cloud_upload" size="48px" color="primary" />
                    <div class="text-body1 q-mt-sm">
                      Clique ou arraste arquivos aqui
                    </div>
                    <div class="text-caption text-grey-6">
                      {{
                        form.creative_type === 'carousel'
                          ? 'Múltiplos arquivos (2-10)'
                          : 'Imagens (JPG, PNG, GIF) ou Vídeos (MP4, MOV)'
                      }}
                    </div>
                    <div class="text-caption text-grey-6">Máximo: 50MB por arquivo</div>
                  </div>

                  <input
                    ref="fileInput"
                    type="file"
                    :accept="acceptedFileTypes"
                    :multiple="form.creative_type === 'carousel'"
                    style="display: none"
                    @change="onFileSelect"
                  />

                  <!-- Progress Bar -->
                  <q-linear-progress
                    v-if="uploadProgress > 0 && uploadProgress < 100"
                    :value="uploadProgress / 100"
                    color="primary"
                    class="q-mt-sm"
                  />

                  <!-- Arquivos Enviados -->
                  <div v-if="uploadedFiles.length > 0" class="uploaded-files q-mt-md">
                    <div
                      v-for="(file, index) in uploadedFiles"
                      :key="index"
                      class="uploaded-file-item"
                    >
                      <q-img
                        v-if="file.type.startsWith('image/')"
                        :src="file.url"
                        class="file-thumb"
                      />
                      <div v-else class="file-thumb video-thumb">
                        <q-icon name="videocam" size="32px" />
                      </div>
                      <div class="file-info">
                        <div class="text-body2">{{ file.name }}</div>
                        <div class="text-caption text-grey-6">
                          {{ formatFileSize(file.size) }}
                        </div>
                      </div>
                      <q-btn
                        flat
                        round
                        dense
                        icon="close"
                        @click="removeFile(index)"
                      />
                    </div>
                  </div>

                  <!-- Validações -->
                  <CreativeAlerts
                    v-if="validations.length > 0"
                    :validations="validations"
                    class="q-mt-md"
                  />
                </div>

                <!-- Legenda -->
                <q-input
                  v-model="form.caption"
                  label="Legenda / Copy"
                  type="textarea"
                  outlined
                  rows="5"
                  counter
                  maxlength="2200"
                  hint="Escreva a legenda do seu post"
                >
                  <template v-slot:prepend>
                    <q-icon name="subject" />
                  </template>
                </q-input>

                <!-- Tags -->
                <PostTagsInput v-model="form.tags" />
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <!-- Coluna Direita: Preview -->
        <div class="col-12 col-md-6">
          <div class="preview-sticky">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">Preview</div>

                <div v-if="!form.social_network" class="preview-empty">
                  <q-icon name="smartphone" size="64px" color="grey-4" />
                  <div class="text-body1 text-grey-6 q-mt-sm">
                    Selecione uma rede social para ver o preview
                  </div>
                </div>

                <div v-else-if="uploadedFiles.length === 0" class="preview-empty">
                  <q-icon name="add_photo_alternate" size="64px" color="grey-4" />
                  <div class="text-body1 text-grey-6 q-mt-sm">
                    Adicione arquivos para ver o preview
                  </div>
                </div>

                <MobilePreview v-else :platform="form.social_network">
                  <!-- Image Preview -->
                  <ImagePreview
                    v-if="form.creative_type === 'image' && uploadedFiles[0]"
                    :image-url="uploadedFiles[0].url"
                    :caption="form.caption"
                    :platform="form.social_network"
                  />

                  <!-- Video Preview -->
                  <VideoPreview
                    v-else-if="form.creative_type === 'video' && uploadedFiles[0]"
                    :video-url="uploadedFiles[0].url"
                    :caption="form.caption"
                    :platform="form.social_network"
                  />

                  <!-- Carousel Preview -->
                  <CarouselPreview
                    v-else-if="form.creative_type === 'carousel'"
                    :items="uploadedFiles"
                    :caption="form.caption"
                  />
                </MobilePreview>
              </q-card-section>
            </q-card>

            <!-- Dicas -->
            <q-card flat bordered class="q-mt-md">
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">
                  <q-icon name="lightbulb" color="orange" />
                  Dicas
                </div>
                <div class="tips-list">
                  <div
                    v-for="tip in currentTips"
                    :key="tip"
                    class="tip-item text-caption"
                  >
                    • {{ tip }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Campanha Rápida -->
    <q-dialog v-model="showQuickCampaignDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Criar Campanha Rápida</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="quickCampaignName"
            label="Nome da Campanha"
            outlined
            autofocus
            @keyup.enter="createQuickCampaign"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat v-close-popup />
          <q-btn
            label="Criar"
            color="primary"
            @click="createQuickCampaign"
            :disable="!quickCampaignName"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from 'stores/posts'
import { useCampaignsStore } from 'stores/campaigns'
import { useQuasar } from 'quasar'
import { useFileUpload } from 'src/composables/useFileUpload'
import { useCreativeValidation } from 'src/composables/useCreativeValidation'
import MobilePreview from 'src/components/MobilePreview.vue'
import ImagePreview from 'src/components/previews/ImagePreview.vue'
import VideoPreview from 'src/components/previews/VideoPreview.vue'
import CarouselPreview from 'src/components/previews/CarouselPreview.vue'
import PostTagsInput from 'src/components/PostTagsInput.vue'
import CreativeAlerts from 'src/components/CreativeAlerts.vue'

const router = useRouter()
const postsStore = usePostsStore()
const campaignsStore = useCampaignsStore()
const $q = useQuasar()
const { uploadFile, uploadMultipleFiles, isImage, isVideo } = useFileUpload()
const { validateImage, validateVideo, validateCarousel, clearValidations } =
  useCreativeValidation()

const creating = ref(false)
const dragOver = ref(false)
const fileInput = ref(null)
const uploadedFiles = ref([])
const uploadProgress = ref(0)
const validations = ref([])
const showQuickCampaignDialog = ref(false)
const quickCampaignName = ref('')

const form = ref({
  social_network: null,
  post_type: 'organic',
  creative_type: 'image',
  campaign_id: null,
  campaign_name: '',
  scheduled_date: '',
  caption: '',
  tags: [],
  status: 'ideas',
})

const campaignOptions = computed(() => {
  return campaignsStore.campaigns.map(c => ({
    label: c.name,
    value: c.id
  }))
})

const socialNetworkOptions = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Google Ads', value: 'google_ads' },
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

const acceptedFileTypes = computed(() => {
  if (form.value.creative_type === 'video') {
    return 'video/mp4,video/quicktime,video/webm'
  }
  return 'image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm'
})

const canCreate = computed(() => {
  return (
    form.value.social_network &&
    form.value.post_type &&
    form.value.creative_type &&
    form.value.scheduled_date &&
    uploadedFiles.value.length > 0
  )
})

const currentTips = computed(() => {
  const tips = {
    instagram: [
      'Proporção ideal: 1:1 (quadrado) ou 4:5 (retrato)',
      'Legendas até 2.200 caracteres',
      'Use hashtags relevantes',
      'Stories: 9:16 (vertical)',
    ],
    tiktok: [
      'Proporção: 9:16 (vertical)',
      'Vídeos de 15-60 segundos têm melhor performance',
      'Use música trending',
      'Legendas curtas e diretas',
    ],
    facebook: [
      'Proporção: 1:1 ou 1.91:1',
      'Vídeos até 240 minutos',
      'Texto objetivo no início',
    ],
    google_ads: [
      'Imagens de alta qualidade',
      'Texto claro e chamada para ação',
      'Proporção: 1:1 ou 1.91:1',
    ],
  }

  return tips[form.value.social_network] || []
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

function triggerFileInput() {
  fileInput.value.click()
}

async function onFileSelect(event) {
  const files = Array.from(event.target.files)
  await handleFiles(files)
  event.target.value = '' // Reset input
}

async function onDrop(event) {
  dragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  await handleFiles(files)
}

async function handleFiles(files) {
  if (files.length === 0) return

  // Validar tipo de criativo vs arquivos
  if (form.value.creative_type === 'image') {
    const hasVideo = files.some((f) => isVideo(f))
    if (hasVideo) {
      $q.notify({
        type: 'negative',
        message: 'Tipo de criativo selecionado é Imagem. Selecione apenas imagens.',
        position: 'top',
      })
      return
    }
    // Apenas 1 imagem
    if (files.length > 1) {
      files = [files[0]]
      $q.notify({
        type: 'info',
        message: 'Apenas 1 imagem será usada. Use Carrossel para múltiplas imagens.',
        position: 'top',
      })
    }
  }

  if (form.value.creative_type === 'video') {
    const hasImage = files.some((f) => isImage(f))
    if (hasImage) {
      $q.notify({
        type: 'negative',
        message: 'Tipo de criativo selecionado é Vídeo. Selecione apenas vídeos.',
        position: 'top',
      })
      return
    }
    // Apenas 1 vídeo
    if (files.length > 1) {
      files = [files[0]]
      $q.notify({
        type: 'info',
        message: 'Apenas 1 vídeo será usado.',
        position: 'top',
      })
    }
  }

  if (form.value.creative_type === 'carousel') {
    if (files.length < 2) {
      $q.notify({
        type: 'negative',
        message: 'Carrossel precisa de pelo menos 2 arquivos.',
        position: 'top',
      })
      return
    }
    if (files.length > 10) {
      $q.notify({
        type: 'warning',
        message: 'Máximo de 10 arquivos. Os primeiros 10 serão usados.',
        position: 'top',
      })
      files = files.slice(0, 10)
    }
  }

  $q.loading.show({ message: 'Fazendo upload...' })

  try {
    if (files.length === 1) {
      uploadProgress.value = 50
      const result = await uploadFile(files[0])
      uploadProgress.value = 100

      if (result.success) {
        const fileObj = {
          url: result.url,
          path: result.path,
          name: files[0].name,
          type: files[0].type,
          size: files[0].size,
        }
        uploadedFiles.value = [fileObj]

        // Validar arquivo
        await validateFile(files[0], fileObj)

        $q.notify({
          type: 'positive',
          message: 'Upload realizado com sucesso!',
          position: 'top',
        })
      } else {
        throw new Error(result.error)
      }
    } else {
      const result = await uploadMultipleFiles(files)

      if (result.success) {
        uploadedFiles.value = result.files.map((f, i) => ({
          url: f.url,
          path: f.path,
          name: f.name,
          type: f.type,
          size: files[i].size,
        }))

        // Validar carrossel
        if (form.value.creative_type === 'carousel') {
          const carouselValidation = validateCarousel(uploadedFiles.value.length)
          validations.value = [carouselValidation]
        }

        $q.notify({
          type: 'positive',
          message: `${result.files.length} arquivos enviados com sucesso!`,
          position: 'top',
        })
      } else {
        throw new Error('Erro ao fazer upload dos arquivos')
      }
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao fazer upload',
      position: 'top',
    })
  } finally {
    $q.loading.hide()
    uploadProgress.value = 0
  }
}

async function validateFile(file, fileObj) {
  clearValidations()

  if (isImage(file)) {
    const img = new Image()
    img.src = fileObj.url
    await new Promise((resolve) => {
      img.onload = resolve
    })

    const results = await validateImage(
      file,
      img.naturalWidth,
      img.naturalHeight,
      form.value.social_network
    )
    validations.value = results
  } else if (isVideo(file)) {
    const video = document.createElement('video')
    video.src = fileObj.url
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve
    })

    const results = await validateVideo(
      file,
      video.duration,
      video.videoWidth,
      video.videoHeight,
      form.value.social_network
    )
    validations.value = results
  }
}

function removeFile(index) {
  uploadedFiles.value.splice(index, 1)
  clearValidations()
}

function onCreativeTypeChange() {
  // Limpar arquivos ao mudar tipo
  if (uploadedFiles.value.length > 0) {
    $q.dialog({
      title: 'Mudar Tipo de Criativo',
      message: 'Ao mudar o tipo de criativo, os arquivos enviados serão removidos. Continuar?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      uploadedFiles.value = []
      clearValidations()
    }).onCancel(() => {
      // Reverter mudança
      // Não tem como reverter facilmente aqui, usuário terá que reselecionar
    })
  }
}

onMounted(() => {
  campaignsStore.fetchCampaigns()
})

async function createPost() {
  if (!canCreate.value) return

  creating.value = true

  try {
    // Criar post
    const postData = {
      social_network: form.value.social_network,
      post_type: form.value.post_type,
      creative_type: form.value.creative_type,
      campaign_id: form.value.campaign_id,
      campaign_name: form.value.campaign_name,
      scheduled_date: new Date(form.value.scheduled_date).toISOString(),
      caption: form.value.caption,
      status: form.value.status,
    }

    const result = await postsStore.createPost(postData)

    if (result.success) {
      // Adicionar criativos ao post
      const { postsService } = await import('src/services/postsService')
      const creativesData = uploadedFiles.value.map((file) => ({
        url: file.url,
        type: file.type,
      }))

      await postsService.addCreatives(result.data.id, creativesData)

      // Adicionar tags se houver
      if (form.value.tags.length > 0) {
        await postsService.addTags(result.data.id, form.value.tags)
      }

      $q.notify({
        type: 'positive',
        message: 'Postagem criada com sucesso!',
        position: 'top',
      })

      router.push('/board')
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao criar postagem',
      position: 'top',
    })
  } finally {
    creating.value = false
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

async function createQuickCampaign() {
  if (!quickCampaignName.value) return

  const result = await campaignsStore.createCampaign({
    name: quickCampaignName.value,
    status: 'active',
  })

  if (result.success) {
    form.value.campaign_id = result.data.id
    showQuickCampaignDialog.value = false
    quickCampaignName.value = ''

    $q.notify({
      type: 'positive',
      message: 'Campanha criada!',
      position: 'top',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || 'Erro ao criar campanha',
      position: 'top',
    })
  }
}

function goBack() {
  if (uploadedFiles.value.length > 0 || form.value.caption) {
    $q.dialog({
      title: 'Descartar alterações?',
      message: 'Você tem alterações não salvas. Deseja sair mesmo assim?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      router.back()
    })
  } else {
    router.back()
  }
}

// Watch para atualizar validações quando mudar rede social
watch(
  () => form.value.social_network,
  () => {
    if (uploadedFiles.value.length > 0 && uploadedFiles.value[0].type.startsWith('image/')) {
      // Re-validar
      const file = uploadedFiles.value[0]
      const img = new Image()
      img.src = file.url
      img.onload = async () => {
        const results = await validateImage(
          { name: file.name, size: file.size, type: file.type },
          img.naturalWidth,
          img.naturalHeight,
          form.value.social_network
        )
        validations.value = results
      }
    }
  }
)
</script>

<style scoped lang="scss">
.create-post-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;

  &:hover {
    border-color: #1976d2;
    background: #f0f7ff;
  }

  &.upload-drag-over {
    border-color: #1976d2;
    background: #e3f2fd;
  }
}

.uploaded-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uploaded-file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;

  .file-thumb {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;

    &.video-thumb {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e0e0e0;
    }
  }

  .file-info {
    flex: 1;
  }
}

.preview-sticky {
  position: sticky;
  top: 20px;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fafafa;
  border-radius: 8px;
  min-height: 400px;
}

.tips-list {
  .tip-item {
    padding: 4px 0;
    color: #666;
  }
}
</style>
