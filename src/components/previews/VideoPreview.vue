<template>
  <div class="video-preview">
    <!-- Post Header -->
    <div class="post-header">
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
    </div>

    <!-- Post Actions -->
    <div class="post-actions">
      <div class="actions-left">
        <q-icon name="favorite_border" size="28px" class="action-icon" />
        <q-icon name="chat_bubble_outline" size="28px" class="action-icon" />
        <q-icon name="send" size="28px" class="action-icon" />
      </div>
      <q-icon name="bookmark_border" size="28px" class="action-icon" />
    </div>

    <!-- Post Stats -->
    <div class="post-stats">
      <div class="likes">
        <strong>1.234</strong> curtidas
      </div>
      <div class="views">
        <strong>5.678</strong> visualizações
      </div>
    </div>

    <!-- Post Caption -->
    <div class="post-caption" v-if="caption">
      <span class="username">seu_perfil</span>
      <span class="caption-text">{{ caption }}</span>
    </div>

    <!-- Post Time -->
    <div class="post-time">HÁ 2 HORAS</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
