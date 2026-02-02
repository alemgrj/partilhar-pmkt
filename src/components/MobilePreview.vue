<template>
  <div class="mobile-preview">
    <div class="phone-frame">
      <!-- Notch / Camera -->
      <div class="phone-notch"></div>

      <!-- Status Bar -->
      <div class="phone-status-bar">
        <div class="status-left">
          <q-icon name="signal_cellular_alt" size="14px" />
          <q-icon name="wifi" size="14px" />
        </div>
        <div class="status-center">{{ currentTime }}</div>
        <div class="status-right">
          <q-icon name="battery_full" size="14px" />
        </div>
      </div>

      <!-- App Header -->
      <div class="app-header" :class="`platform-${platform}`">
        <div class="header-content">
          <template v-if="platform === 'instagram'">
            <div class="header-left">
              <q-icon name="photo_camera" size="24px" />
              <span class="app-title">Instagram</span>
            </div>
            <div class="header-right">
              <q-icon name="favorite_border" size="24px" />
              <q-icon name="send" size="24px" />
            </div>
          </template>

          <template v-else-if="platform === 'tiktok'">
            <div class="header-left">
              <q-icon name="home" size="24px" />
              <span class="app-title">TikTok</span>
            </div>
            <div class="header-right">
              <q-icon name="search" size="24px" />
            </div>
          </template>

          <template v-else-if="platform === 'facebook'">
            <div class="header-left">
              <span class="app-title">Facebook</span>
            </div>
            <div class="header-right">
              <q-icon name="search" size="24px" />
              <q-icon name="chat_bubble_outline" size="24px" />
            </div>
          </template>
        </div>
      </div>

      <!-- Content Area -->
      <div class="phone-content">
        <slot></slot>
      </div>

      <!-- Home Indicator (iPhone style) -->
      <div class="phone-home-indicator"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  platform: {
    type: String,
    default: 'instagram',
    validator: (value) => ['instagram', 'tiktok', 'facebook', 'google_ads'].includes(value),
  },
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
  width: 375px;
  height: 667px;
  background: #000;
  border-radius: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  border: 12px solid #1a1a1a;
  display: flex;
  flex-direction: column;
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 24px;
  background: #1a1a1a;
  border-radius: 0 0 16px 16px;
  z-index: 10;
}

.phone-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  padding-top: 32px;
  background: #fff;
  color: #000;
  font-size: 12px;
  z-index: 5;

  .status-left,
  .status-right {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .status-center {
    font-weight: 600;
  }
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #dbdbdb;
  padding: 12px 16px;
  z-index: 5;

  &.platform-instagram {
    .app-title {
      font-family: 'Segoe UI', sans-serif;
      font-weight: 600;
      font-size: 18px;
    }
  }

  &.platform-tiktok {
    background: #000;
    color: #fff;
    border-bottom-color: #333;

    .app-title {
      font-weight: 700;
      font-size: 18px;
    }
  }

  &.platform-facebook {
    .app-title {
      color: #1877f2;
      font-weight: 700;
      font-size: 18px;
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
    gap: 12px;
  }
}

.phone-content {
  flex: 1;
  background: #fff;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;
  }
}

.phone-home-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}
</style>
