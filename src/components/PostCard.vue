<template>
  <q-card
    class="post-card"
    :class="`status-${post.status}`"
    flat
    bordered
    @click="$emit('click', post)"
  >
    <q-card-section class="q-pa-sm">
      <div class="row items-center q-mb-xs">
        <q-icon
          :name="getSocialIcon(post.social_network)"
          size="20px"
          :color="getSocialColor(post.social_network)"
        />
        <q-space />
        <q-badge
          :color="getTypeColor(post.post_type)"
          :label="post.post_type === 'organic' ? 'Orgânico' : 'Ads'"
          class="text-caption"
        />
      </div>

      <div class="text-subtitle2 text-weight-medium ellipsis-2-lines q-mb-xs">
        {{ post.campaign_name || 'Sem campanha' }}
      </div>

      <div class="text-caption text-grey-7 q-mb-xs">
        <q-icon name="event" size="14px" class="q-mr-xs" />
        {{ formatDate(post.scheduled_date) }}
      </div>

      <div v-if="post.caption" class="text-caption ellipsis-2-lines">
        {{ post.caption }}
      </div>

      <div class="row items-center q-mt-sm q-gutter-xs">
        <q-chip
          v-if="post.creative_type"
          size="sm"
          dense
          :icon="getCreativeIcon(post.creative_type)"
          class="q-ma-none"
        >
          {{ getCreativeLabel(post.creative_type) }}
        </q-chip>

        <q-chip
          v-if="post.post_creatives?.length"
          size="sm"
          dense
          icon="image"
          class="q-ma-none"
        >
          {{ post.post_creatives.length }}
        </q-chip>
      </div>

      <!-- Tags de Aprovação -->
      <div v-if="approvalTags.length > 0" class="q-mt-sm">
        <q-badge
          v-for="tag in approvalTags"
          :key="tag.id"
          color="green"
          icon="verified"
          class="q-mr-xs"
        >
          {{ tag.tag_value }}
        </q-badge>
      </div>
    </q-card-section>

    <q-card-section v-if="post.responsible_user" class="q-pa-sm q-pt-none">
      <div class="row items-center">
        <q-avatar size="20px" class="q-mr-xs">
          <img
            v-if="post.responsible_user.avatar_url"
            :src="post.responsible_user.avatar_url"
          />
          <q-icon v-else name="person" />
        </q-avatar>
        <div class="text-caption text-grey-7">
          {{ post.responsible_user.name }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})

defineEmits(['click'])

const approvalTags = computed(() => {
  return props.post.post_tags?.filter((t) => t.tag_type === 'approval') || []
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

function getSocialColor(network) {
  const colors = {
    instagram: 'pink',
    tiktok: 'black',
    google_ads: 'blue',
    facebook: 'blue-7',
  }
  return colors[network] || 'grey'
}

function getTypeColor(type) {
  return type === 'organic' ? 'green' : 'orange'
}

function getCreativeIcon(type) {
  const icons = {
    image: 'image',
    video: 'videocam',
    carousel: 'view_carousel',
  }
  return icons[type] || 'image'
}

function getCreativeLabel(type) {
  const labels = {
    image: 'Imagem',
    video: 'Vídeo',
    carousel: 'Carrossel',
  }
  return labels[type] || type
}

function formatDate(date) {
  return format(new Date(date), "dd/MM 'às' HH:mm", { locale: ptBR })
}
</script>

<style scoped lang="scss">
.post-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.status-ideas {
    border-left-color: #9e9e9e;
  }

  &.status-in_production {
    border-left-color: #2196f3;
  }

  &.status-ready_for_review {
    border-left-color: #ff9800;
  }

  &.status-adjustments_requested {
    border-left-color: #f44336;
  }

  &.status-validated {
    border-left-color: #4caf50;
  }

  &.status-published {
    border-left-color: #9c27b0;
  }
}

.ellipsis-2-lines {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
