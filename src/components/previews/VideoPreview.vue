<template>
  <div class="video-preview" :class="{ 'vertical-preview': isVerticalFormat }">
    <!-- Post Header (não mostrar em formatos verticais) -->
    <div v-if="currentIcons.position === 'bottom'" class="post-header">
      <div class="user-info">
        <q-avatar size="32px">
          <img src="https://via.placeholder.com/32" alt="Profile" />
        </q-avatar>
        <div class="user-details">
          <div class="username">seu_perfil</div>
        </div>
      </div>
      <q-icon name="more_vert" size="20px" />
    </div>

    <!-- Video Content -->
    <div class="post-video-container">
      <video
        ref="videoElement"
        :src="videoUrl"
        class="post-video"
        loop
        muted
        playsinline
        @loadedmetadata="checkVideoDuration"
        @click="togglePlay"
      />

      <!-- Play/Pause Overlay -->
      <div class="video-overlay" @click="togglePlay">
        <q-icon
          v-if="!isPlaying"
          name="play_circle_outline"
          size="64px"
          color="white"
          class="play-icon"
        />
      </div>

      <!-- Video Controls -->
      <div class="video-controls">
        <q-icon
          :name="isMuted ? 'volume_off' : 'volume_up'"
          size="24px"
          color="white"
          class="control-icon"
          @click.stop="toggleMute"
        />
      </div>

      <!-- Duration Warning -->
      <div v-if="showDurationWarning" class="duration-warning">
        <q-icon name="warning" size="16px" />
        <span>{{ durationWarningMessage }}</span>
      </div>

      <!-- Overlay para formatos verticais (Reels/Stories style) -->
      <div v-if="currentIcons.position === 'side'" class="vertical-overlay">
        <div class="vertical-actions">
          <div 
            v-for="icon in currentIcons.icons" 
            :key="icon.label" 
            class="action-item"
          >
            <q-icon :name="icon.name" size="32px" color="white" />
            <div v-if="icon.count" class="action-count">{{ icon.count }}</div>
          </div>
        </div>
        
        <div class="vertical-bottom">
          <div class="username-vertical">@seu_perfil</div>
          <div v-if="caption" class="caption-vertical">{{ caption }}</div>
        </div>
      </div>
    </div>

    <!-- Post Actions (apenas para formatos não-verticais) -->
    <div v-if="currentIcons.position === 'bottom'" class="post-actions">
      <div class="actions-left">
        <q-icon 
          v-for="icon in currentIcons.icons" 
          :key="icon.action"
          :name="icon.name" 
          size="24px" 
          class="action-icon" 
        />
      </div>
      <q-icon 
        v-if="currentIcons.rightIcon"
        :name="currentIcons.rightIcon.name" 
        size="24px" 
        class="action-icon" 
      />
    </div>

    <!-- Post Stats (apenas para formatos não-verticais) -->
    <div v-if="currentIcons.position === 'bottom'" class="post-stats">
      <div class="likes">
        <strong>1.234</strong> curtidas
      </div>
      <div class="views">
        <strong>5.678</strong> visualizações
      </div>
    </div>

    <!-- Post Caption (apenas para formatos não-verticais) -->
    <div v-if="currentIcons.position === 'bottom' && caption" class="post-caption">
      <span class="username">seu_perfil</span>
      <span class="caption-text">{{ caption }}</span>
    </div>

    <!-- Post Time (apenas para formatos não-verticais) -->
    <div v-if="currentIcons.position === 'bottom'" class="post-time">HÁ 2 HORAS</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getPlatformIcons } from 'src/constants/platformIcons'
import { getPlacementType, isVerticalFormat as checkVerticalFormat } from 'src/utils/formatHelpers'

const props = defineProps({
  videoUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  platform: {
    type: String,
    default: 'instagram',
  },
  postFormat: {
    type: String,
    default: null,
  },
})

// Determina se é formato vertical (Reels/Stories)
const isVerticalFormat = computed(() => {
  return checkVerticalFormat(props.postFormat)
})

// Obtém os ícones corretos baseado na plataforma e formato
const currentIcons = computed(() => {
  const placementType = getPlacementType(props.platform, props.postFormat)
  return getPlatformIcons(props.platform, placementType)
})

const videoElement = ref(null)
const isPlaying = ref(false)
const isMuted = ref(true)
const videoDuration = ref(0)

const showDurationWarning = ref(false)
const durationWarningMessage = ref('')

const maxDurations = {
  instagram_feed: 60,
  instagram_reels: 90,
  tiktok: 180,
  facebook: 240,
}

function togglePlay() {
  if (!videoElement.value) return

  if (isPlaying.value) {
    videoElement.value.pause()
  } else {
    videoElement.value.play()
  }

  isPlaying.value = !isPlaying.value
}

function toggleMute() {
  if (!videoElement.value) return

  videoElement.value.muted = !videoElement.value.muted
  isMuted.value = videoElement.value.muted
}

function checkVideoDuration() {
  if (!videoElement.value) return

  videoDuration.value = videoElement.value.duration

  const maxDuration = maxDurations[`${props.platform}_feed`] || maxDurations[props.platform] || 60

  if (videoDuration.value > maxDuration) {
    showDurationWarning.value = true
    durationWarningMessage.value = `Vídeo muito longo (${Math.round(videoDuration.value)}s). Máximo recomendado: ${maxDuration}s`
  } else if (videoDuration.value < 3) {
    showDurationWarning.value = true
    durationWarningMessage.value = 'Vídeo muito curto (menos de 3s)'
  }
}
</script>

<style scoped lang="scss">
.video-preview {
  background: #fff;
  
  &.vertical-preview {
    background: #000;
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .post-video-container {
      flex: 1;
    }
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user-details {
    .username {
      font-weight: 600;
      font-size: 14px;
    }
  }
}

.post-video-container {
  position: relative;
  width: 100%;
  background: #000;
  cursor: pointer;

  .post-video {
    width: 100%;
    height: auto;
    display: block;
    max-height: 500px;
    object-fit: contain;
  }

  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }

    .play-icon {
      pointer-events: none;
    }
  }

  .video-controls {
    position: absolute;
    bottom: 16px;
    right: 16px;

    .control-icon {
      cursor: pointer;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      padding: 8px;

      &:hover {
        background: rgba(0, 0, 0, 0.8);
      }
    }
  }

  .duration-warning {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(255, 152, 0, 0.9);
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
    z-index: 5;
  }

  // Overlay para formato vertical (Reels/Stories)
  .vertical-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    pointer-events: none;
    
    .vertical-actions {
      position: absolute;
      right: 12px;
      bottom: 80px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
      
      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        
        .action-count {
          color: white;
          font-size: 11px;
          font-weight: 600;
        }
      }
    }
    
    .vertical-bottom {
      padding: 16px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
      color: white;
      
      .username-vertical {
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 4px;
      }
      
      .caption-vertical {
        font-size: 12px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }
}

.post-actions {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;

  .actions-left {
    display: flex;
    gap: 16px;
  }

  .action-icon {
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }
}

.post-stats {
  padding: 0 16px 8px;

  .likes,
  .views {
    font-size: 14px;
  }
}

.post-caption {
  padding: 0 16px 8px;
  font-size: 14px;

  .username {
    font-weight: 600;
    margin-right: 4px;
  }

  .caption-text {
    line-height: 1.4;
  }
}

.post-time {
  padding: 0 16px 16px;
  font-size: 11px;
  color: #999;
  letter-spacing: 0.2px;
}
</style>
