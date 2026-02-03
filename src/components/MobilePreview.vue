<template>
  <div class="mobile-preview">
    <div class="phone-frame" :class="phoneFrameClass">
      <!-- Notch / Camera -->
      <div class="phone-notch"></div>

      <!-- Status Bar -->
      <div class="phone-status-bar">
        <div class="status-left">
          <q-icon name="signal_cellular_alt" size="12px" />
          <q-icon name="wifi" size="12px" />
        </div>
        <div class="status-center">{{ currentTime }}</div>
        <div class="status-right">
          <q-icon name="battery_full" size="12px" />
        </div>
      </div>

      <!-- App Header -->
      <div class="app-header" :class="`platform-${platform}`">
        <div class="header-content">
          <template v-if="platform === 'instagram'">
            <div class="header-left">
              <q-icon name="photo_camera" size="20px" />
              <span class="app-title">Instagram</span>
            </div>
            <div class="header-right">
              <q-icon name="favorite_border" size="20px" />
              <q-icon name="send" size="20px" />
            </div>
          </template>

          <template v-else-if="platform === 'tiktok'">
            <div class="header-left">
              <q-icon name="home" size="20px" />
              <span class="app-title">TikTok</span>
            </div>
            <div class="header-right">
              <q-icon name="search" size="20px" />
            </div>
          </template>

          <template v-else-if="platform === 'facebook'">
            <div class="header-left">
              <span class="app-title">Facebook</span>
            </div>
            <div class="header-right">
              <q-icon name="search" size="20px" />
              <q-icon name="chat_bubble_outline" size="20px" />
            </div>
          </template>
        </div>
      </div>

      <!-- Content Area -->
      <div class="phone-content" :class="contentClass">
        <slot></slot>
      </div>

      <!-- Home Indicator (iPhone style) -->
      <div class="phone-home-indicator"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  platform: {
    type: String,
    default: 'instagram',
    validator: (value) => ['instagram', 'tiktok', 'facebook', 'google_ads'].includes(value),
  },
  postFormat: {
    type: String,
    default: null,
  },
})

// Determina a classe do frame baseado no formato
const phoneFrameClass = computed(() => {
  // Para formatos verticais (9:16), usar frame mais alto
  if (props.postFormat && (props.postFormat.includes('reels') || props.postFormat.includes('stories') || props.postFormat === 'default')) {
    return 'phone-frame-vertical'
  }
  // Para formatos quadrados ou horizontais, frame padrão
  return 'phone-frame-standard'
})

// Determina a classe do conteúdo baseado no formato
const contentClass = computed(() => {
  if (!props.postFormat) return ''
  
  if (props.postFormat.includes('reels') || props.postFormat.includes('stories') || props.postFormat === 'default') {
    return 'content-vertical'
  } else if (props.postFormat.includes('square')) {
    return 'content-square'
  } else if (props.postFormat.includes('portrait')) {
    return 'content-portrait'
  }
  
  return ''
})

const currentTime = ref('')

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

let timeInterval = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000) // Update every minute
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped lang="scss">
.mobile-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.phone-frame {
  background: #000;
  border-radius: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  border: 10px solid #1a1a1a;
  display: flex;
  flex-direction: column;
  
  // iPhone 13/14 Pro dimensions (padrão)
  &.phone-frame-standard {
    width: 390px;
    height: 650px;
  }
  
  // iPhone em modo vertical completo para Reels/Stories/TikTok
  &.phone-frame-vertical {
    width: 390px;
    height: 780px;
  }
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 110px;
  height: 28px;
  background: #1a1a1a;
  border-radius: 0 0 18px 18px;
  z-index: 10;
}

.phone-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  padding-top: 36px;
  background: #fff;
  color: #000;
  font-size: 11px;
  z-index: 5;
  flex-shrink: 0;

  .status-left,
  .status-right {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .status-center {
    font-weight: 600;
    font-size: 11px;
  }
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #dbdbdb;
  padding: 10px 16px;
  z-index: 5;
  flex-shrink: 0;

  &.platform-instagram {
    .app-title {
      font-family: 'Segoe UI', sans-serif;
      font-weight: 600;
      font-size: 16px;
    }
  }

  &.platform-tiktok {
    background: #000;
    color: #fff;
    border-bottom-color: #333;

    .app-title {
      font-weight: 700;
      font-size: 16px;
    }
  }

  &.platform-facebook {
    .app-title {
      color: #1877f2;
      font-weight: 700;
      font-size: 16px;
    }
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left,
  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.phone-content {
  flex: 1;
  background: #fff;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;
  }

  // Classe para conteúdo vertical (Reels, Stories, TikTok)
  &.content-vertical {
    background: #000;
    
    // Força o conteúdo a ocupar toda a área disponível
    :deep(.image-preview),
    :deep(.video-preview) {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    :deep(.post-image-container),
    :deep(.post-video-container) {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }
    
    :deep(.post-image),
    :deep(.post-video) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      max-height: none;
    }
  }

  // Classe para conteúdo quadrado (1:1)
  &.content-square {
    :deep(.post-image-container),
    :deep(.post-video-container) {
      aspect-ratio: 1;
    }
    
    :deep(.post-image),
    :deep(.post-video) {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
  }

  // Classe para conteúdo portrait (4:5)
  &.content-portrait {
    :deep(.post-image-container),
    :deep(.post-video-container) {
      aspect-ratio: 4/5;
    }
    
    :deep(.post-image),
    :deep(.post-video) {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
  }
}

.phone-home-indicator {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 5px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 3px;
  z-index: 10;
}
</style>
