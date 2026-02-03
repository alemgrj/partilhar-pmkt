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
          <!-- Card 1: Destino da Publicação -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="publish" class="q-mr-sm" />
                Destino da Publicação
              </div>

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

                <!-- Conta da Plataforma (Facebook/Instagram) -->
                <q-select
                  v-if="form.social_network === 'instagram' || form.social_network === 'facebook'"
                  v-model="form.account_id"
                  :options="accountOptions"
                  :label="form.social_network === 'instagram' ? 'Conta Instagram *' : 'Página Facebook *'"
                  outlined
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Campo obrigatório para publicação via Meta API']"
                  hint="Selecione a conta onde publicar"
                >
                  <template v-slot:prepend>
                    <q-icon name="account_circle" />
                  </template>
                  <template v-slot:after>
                    <q-btn
                      flat
                      round
                      dense
                      icon="settings"
                      color="primary"
                      @click="showAccountSetupDialog = true"
                    >
                      <q-tooltip>Gerenciar contas conectadas</q-tooltip>
                    </q-btn>
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        <q-item-label>Nenhuma conta conectada</q-item-label>
                        <q-item-label caption>Configure suas contas nas Configurações</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <!-- Tipo de Publicação -->
                <q-select
                  v-model="form.post_type"
                  :options="postTypeOptions"
                  label="Tipo de Publicação *"
                  outlined
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                >
                  <template v-slot:prepend>
                    <q-icon name="ads_click" />
                  </template>
                </q-select>

                <!-- Conta de Anúncios (se tráfego pago) -->
                <q-select
                  v-if="form.post_type === 'paid'"
                  v-model="form.ad_account_id"
                  :options="adAccountOptions"
                  label="Conta de Anúncios"
                  outlined
                  emit-value
                  map-options
                  hint="Necessário para tráfego pago"
                >
                  <template v-slot:prepend>
                    <q-icon name="paid" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        Configure contas de anúncios nas Configurações
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-form>
            </q-card-section>
          </q-card>

          <!-- Card 2: Formato e Conteúdo -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="image" class="q-mr-sm" />
                Formato e Conteúdo
              </div>

              <q-form class="q-gutter-md">
                <!-- Tipo de Criativo -->
                <q-select
                  v-model="form.creative_type"
                  :options="creativeTypeOptions"
                  label="Tipo de Criativo *"
                  outlined
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  @update:model-value="onCreativeTypeChange"
                >
                  <template v-slot:prepend>
                    <q-icon name="photo_library" />
                  </template>
                </q-select>

                <!-- Formato da Postagem -->
                <q-select
                  v-if="form.social_network"
                  v-model="form.post_format"
                  :options="formatOptions"
                  label="Formato da Postagem *"
                  outlined
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  hint="Escolha o formato ideal para o tipo de postagem"
                >
                  <template v-slot:prepend>
                    <q-icon name="aspect_ratio" />
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-badge
                          :color="getPriorityColor(scope.opt.priority)"
                          :label="scope.opt.priority"
                        />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

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
                        v-if="file.type.startsWith('image/') && form.creative_type === 'image'"
                        flat
                        round
                        dense
                        icon="crop"
                        color="primary"
                        @click="openCropper(file, index)"
                      >
                        <q-tooltip>Enquadrar imagem</q-tooltip>
                      </q-btn>
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

          <!-- Card 3: Agendamento -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="schedule" class="q-mr-sm" />
                Agendamento e Campanha
              </div>

              <q-form class="q-gutter-md">
                <!-- Tipo de Publicação -->
                <q-select
                  v-model="form.publish_type"
                  :options="publishTypeOptions"
                  label="Quando Publicar *"
                  outlined
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                >
                  <template v-slot:prepend>
                    <q-icon :name="form.publish_type === 'immediate' ? 'flash_on' : 'schedule'" />
                  </template>
                </q-select>

                <!-- Data e Hora (condicional - só se agendado) -->
                <q-input
                  v-if="form.publish_type === 'scheduled'"
                  v-model="form.scheduled_date"
                  label="Data e Hora de Publicação *"
                  type="datetime-local"
                  outlined
                  :rules="[
                    (val) => !!val || 'Campo obrigatório',
                    (val) => validateFutureDate(val) || 'Data inválida'
                  ]"
                  :hint="getScheduleDateHint()"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>

                <!-- Indicador para publicação imediata -->
                <q-banner
                  v-if="form.publish_type === 'immediate'"
                  class="bg-info text-white"
                  rounded
                >
                  <template v-slot:avatar>
                    <q-icon name="info" color="white" />
                  </template>
                  A postagem será publicada imediatamente ao clicar em "Criar Postagem"
                </q-banner>

                <!-- Campanha -->
                <q-select
                  v-model="form.campaign_id"
                  :options="campaignOptions"
                  label="Campanha (Opcional)"
                  outlined
                  emit-value
                  map-options
                  clearable
                  hint="Agrupe posts em campanhas para melhor organização"
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

                <MobilePreview 
                  v-else 
                  :platform="form.social_network"
                  :post-format="form.post_format"
                >
                  <!-- Image Preview -->
                  <ImagePreview
                    v-if="form.creative_type === 'image' && uploadedFiles[0]"
                    :image-url="uploadedFiles[0].url"
                    :caption="form.caption"
                    :platform="form.social_network"
                    :post-format="form.post_format"
                  />

                  <!-- Video Preview -->
                  <VideoPreview
                    v-else-if="form.creative_type === 'video' && uploadedFiles[0]"
                    :video-url="uploadedFiles[0].url"
                    :caption="form.caption"
                    :platform="form.social_network"
                    :post-format="form.post_format"
                  />

                  <!-- Carousel Preview -->
                  <CarouselPreview
                    v-else-if="form.creative_type === 'carousel'"
                    :items="uploadedFiles"
                    :caption="form.caption"
                    :post-format="form.post_format"
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

    <!-- Dialog Image Cropper -->
    <q-dialog v-model="showCropperDialog" maximized>
      <ImageCropper
        v-if="currentCropperFile"
        :image-url="currentCropperFile.url"
        :selected-format="selectedFormatConfig"
        @apply="onCropApply"
        @cancel="showCropperDialog = false"
      />
    </q-dialog>

    <!-- Dialog Configuração de Contas -->
    <q-dialog v-model="showAccountSetupDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Contas Conectadas</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-banner class="bg-orange text-white" rounded>
            <template v-slot:avatar>
              <q-icon name="construction" color="white" />
            </template>
            <div class="text-subtitle2">Funcionalidade em Desenvolvimento</div>
            <div class="text-caption q-mt-xs">
              A conexão de contas Facebook/Instagram via OAuth será implementada em breve.
              Por enquanto, as postagens são salvas localmente para publicação manual.
            </div>
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Fechar" flat color="primary" v-close-popup />
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
import { getFormatOptions, getMainFormat } from 'src/constants/postFormats'
import { getMediaType, getPlacementType, getMaxScheduleDays, toUnixTimestamp, validateFutureDate as validateFutureDateHelper } from 'src/utils/formatHelpers'
import MobilePreview from 'src/components/MobilePreview.vue'
import ImagePreview from 'src/components/previews/ImagePreview.vue'
import VideoPreview from 'src/components/previews/VideoPreview.vue'
import CarouselPreview from 'src/components/previews/CarouselPreview.vue'
import PostTagsInput from 'src/components/PostTagsInput.vue'
import CreativeAlerts from 'src/components/CreativeAlerts.vue'
import ImageCropper from 'src/components/ImageCropper.vue'

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
const showCropperDialog = ref(false)
const currentCropperFile = ref(null)
const currentCropperIndex = ref(null)
const showAccountSetupDialog = ref(false)

const form = ref({
  social_network: null,
  account_id: null, // page_id (Facebook) ou instagram_business_account_id
  post_type: 'organic',
  creative_type: 'image',
  post_format: null,
  publish_type: 'scheduled', // 'immediate' ou 'scheduled'
  scheduled_date: '',
  ad_account_id: null, // para tráfego pago
  campaign_id: null,
  campaign_name: '',
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

const publishTypeOptions = [
  { label: 'Publicar Agora', value: 'immediate', icon: 'flash_on' },
  { label: 'Agendar Publicação', value: 'scheduled', icon: 'schedule' },
]

const accountOptions = computed(() => {
  // Por enquanto retorna lista vazia
  // Futuramente virá de uma store de contas conectadas (OAuth)
  // TODO: Integrar com store de contas quando implementar OAuth
  return []
})

const adAccountOptions = computed(() => {
  // Lista de contas de anúncios do Facebook
  // TODO: Integrar com Meta Business API para obter contas
  return []
})

const formatOptions = computed(() => {
  if (!form.value.social_network) return []
  return getFormatOptions(form.value.social_network)
})

const selectedFormatConfig = computed(() => {
  if (!form.value.post_format || !form.value.social_network) return null
  const options = formatOptions.value
  return options.find((opt) => opt.value === form.value.post_format)
})

const acceptedFileTypes = computed(() => {
  if (form.value.creative_type === 'video') {
    return 'video/mp4,video/quicktime,video/webm'
  }
  return 'image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm'
})

const canCreate = computed(() => {
  const baseValidation =
    form.value.social_network &&
    form.value.post_type &&
    form.value.creative_type &&
    form.value.post_format &&
    uploadedFiles.value.length > 0

  // Se for Meta (Instagram/Facebook), precisa de conta
  const needsAccount = ['instagram', 'facebook'].includes(form.value.social_network)
  const hasAccount = needsAccount ? !!form.value.account_id : true

  // Se for agendado, precisa de data
  const needsDate = form.value.publish_type === 'scheduled'
  const hasDate = needsDate ? !!form.value.scheduled_date : true

  return baseValidation && hasAccount && hasDate
})

const currentTips = computed(() => {
  const tips = {
    instagram: [
      'Reels/Stories (9:16) têm melhor alcance orgânico',
      'Feed retrato (4:5) ocupa mais espaço na tela',
      'Legendas até 2.200 caracteres',
      'Use hashtags relevantes',
    ],
    tiktok: [
      'Formato vertical (9:16) é obrigatório para melhor performance',
      'Vídeos de 15-60 segundos têm melhor alcance',
      'Use música trending',
      'Primeiros 3 segundos são cruciais',
    ],
    facebook: [
      'Formato quadrado (1:1) é o mais familiar',
      'Feed retrato (4:5) tem melhor engajamento no mobile',
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

function getPriorityColor(priority) {
  const colors = {
    principal: 'green',
    'muito aceito': 'blue',
    aceito: 'orange',
    absoluto: 'deep-purple',
  }
  return colors[priority] || 'grey'
}

function validateFutureDate(dateString) {
  if (!dateString) return true
  
  const maxDays = getMaxScheduleDays(form.value.social_network)
  const validation = validateFutureDateHelper(dateString, maxDays)
  
  return validation.isValid || validation.message
}

function getScheduleDateHint() {
  const maxDays = getMaxScheduleDays(form.value.social_network)
  return `Agende até ${maxDays} dias no futuro`
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
      form.value.social_network,
      form.value.post_format
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

function openCropper(file, index) {
  if (!form.value.post_format) {
    $q.notify({
      type: 'warning',
      message: 'Selecione um formato de postagem antes de enquadrar a imagem',
      position: 'top',
    })
    return
  }

  currentCropperFile.value = file
  currentCropperIndex.value = index
  showCropperDialog.value = true
}

async function onCropApply({ blob }) {
  if (currentCropperIndex.value === null) return

  $q.loading.show({ message: 'Processando imagem...' })

  try {
    // Upload da imagem cortada
    const croppedFile = new File([blob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' })
    const result = await uploadFile(croppedFile)

    if (result.success) {
      // Atualizar arquivo na lista
      uploadedFiles.value[currentCropperIndex.value] = {
        url: result.url,
        path: result.path,
        name: croppedFile.name,
        type: croppedFile.type,
        size: croppedFile.size,
      }

      // Validar novo arquivo
      await validateFile(croppedFile, uploadedFiles.value[currentCropperIndex.value])

      $q.notify({
        type: 'positive',
        message: 'Imagem enquadrada com sucesso!',
        position: 'top',
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao processar imagem',
      position: 'top',
    })
  } finally {
    $q.loading.hide()
    showCropperDialog.value = false
    currentCropperFile.value = null
    currentCropperIndex.value = null
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
    // Derivar campos para API Meta
    const mediaType = getMediaType(form.value.creative_type)
    const placement = getPlacementType(form.value.social_network, form.value.post_format)
    
    // Preparar timestamp UNIX se agendado
    let scheduledTimestamp = null
    let scheduledDateISO = null
    
    if (form.value.publish_type === 'scheduled') {
      scheduledTimestamp = toUnixTimestamp(form.value.scheduled_date)
      scheduledDateISO = new Date(form.value.scheduled_date).toISOString()
    }

    // Criar post
    const postData = {
      // Campos existentes
      social_network: form.value.social_network,
      post_type: form.value.post_type,
      creative_type: form.value.creative_type,
      post_format: form.value.post_format,
      campaign_id: form.value.campaign_id,
      campaign_name: form.value.campaign_name,
      scheduled_date: scheduledDateISO,
      caption: form.value.caption,
      status: form.value.status,
      
      // Novos campos para Meta API
      account_id: form.value.account_id,
      publish_type: form.value.publish_type,
      scheduled_publish_time: scheduledTimestamp,
      ad_account_id: form.value.ad_account_id,
      
      // Campos derivados
      media_type: mediaType,
      placement: placement,
      aspect_ratio: selectedFormatConfig.value?.aspectRatio,
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
  (newValue) => {
    // Auto-selecionar formato principal quando mudar rede social
    if (newValue) {
      const mainFormat = getMainFormat(newValue)
      if (mainFormat) {
        const formatKey = Object.keys(getFormatOptions(newValue).reduce((acc, opt) => {
          acc[opt.value] = opt
          return acc
        }, {})).find(key => {
          const opt = getFormatOptions(newValue).find(o => o.value === key)
          return opt.priority === mainFormat.priority
        })
        form.value.post_format = formatKey || getFormatOptions(newValue)[0]?.value
      }
    }

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
          form.value.social_network,
          form.value.post_format
        )
        validations.value = results
      }
    }
  }
)

// Watch para revalidar quando mudar formato
watch(
  () => form.value.post_format,
  () => {
    if (uploadedFiles.value.length > 0 && uploadedFiles.value[0].type.startsWith('image/')) {
      const file = uploadedFiles.value[0]
      const img = new Image()
      img.src = file.url
      img.onload = async () => {
        const results = await validateImage(
          { name: file.name, size: file.size, type: file.type },
          img.naturalWidth,
          img.naturalHeight,
          form.value.social_network,
          form.value.post_format
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
