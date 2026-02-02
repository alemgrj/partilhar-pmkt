<template>
  <div class="carousel-preview">
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

    <!-- Carousel Content -->
    <div class="post-carousel-container">
      <div
        class="carousel-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="carousel-item"
        >
          <img
            v-if="isImage(item)"
            :src="item.url"
            alt="Carousel item"
            class="carousel-image"
          />
          <video
            v-else-if="isVideo(item)"
            :src="item.url"
            class="carousel-video"
            loop
            muted
            playsinline
          />
        </div>
      </div>

      <!-- Navigation Arrows -->
      <div
        v-if="currentIndex > 0"
        class="carousel-nav carousel-nav-prev"
        @click="prevSlide"
      >
        <q-icon name="chevron_left" size="32px" color="white" />
      </div>

      <div
        v-if="currentIndex < items.length - 1"
        class="carousel-nav carousel-nav-next"
        @click="nextSlide"
      >
        <q-icon name="chevron_right" size="32px" color="white" />
      </div>

      <!-- Indicators -->
      <div class="carousel-indicators">
        <div
          v-for="(item, index) in items"
          :key="`indicator-${index}`"
          class="indicator"
          :class="{ active: index === currentIndex }"
        ></div>
      </div>

      <!-- Warning se poucos slides -->
      <div v-if="showWarning" class="carousel-warning">
        <q-icon name="warning" size="16px" />
        <span>{{ warningMessage }}</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    validator: (items) =>
      items.every((item) => item.url && item.type),
  },
  caption: {
    type: String,
    default: '',
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
  autoPlayInterval: {
    type: Number,
    default: 3000,
  },
})

const currentIndex = ref(0)
const touchStartX = ref(0)
const touchEndX = ref(0)
let autoPlayTimer = null

const showWarning = computed(() => {
  return props.items.length < 2 || props.items.length > 10
})

const warningMessage = computed(() => {
  if (props.items.length < 2) {
    return 'Carrossel deve ter pelo menos 2 itens'
  }
  if (props.items.length > 10) {
    return 'Carrossel muito longo (máx recomendado: 10 itens)'
  }
  return ''
})

function isImage(item) {
  return item.type.startsWith('image/')
}

function isVideo(item) {
  return item.type.startsWith('video/')
}

function nextSlide() {
  if (currentIndex.value < props.items.length - 1) {
    currentIndex.value++
  }
}

function prevSlide() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function handleTouchStart(event) {
  touchStartX.value = event.touches[0].clientX
}

function handleTouchMove(event) {
  touchEndX.value = event.touches[0].clientX
}

function handleTouchEnd() {
  const swipeDistance = touchStartX.value - touchEndX.value
  const minSwipeDistance = 50

  if (swipeDistance > minSwipeDistance) {
    nextSlide()
  } else if (swipeDistance < -minSwipeDistance) {
    prevSlide()
  }

  touchStartX.value = 0
  touchEndX.value = 0
}

function startAutoPlay() {
  if (!props.autoPlay) return

  autoPlayTimer = setInterval(() => {
    if (currentIndex.value < props.items.length - 1) {
      nextSlide()
    } else {
      currentIndex.value = 0
    }
  }, props.autoPlayInterval)
}

function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

onMounted(() => {
  const container = document.querySelector('.post-carousel-container')
  if (container) {
    container.addEventListener('touchstart', handleTouchStart)
    container.addEventListener('touchmove', handleTouchMove)
    container.addEventListener('touchend', handleTouchEnd)
  }

  if (props.autoPlay) {
    startAutoPlay()
  }
})

onUnmounted(() => {
  const container = document.querySelector('.post-carousel-container')
  if (container) {
    container.removeEventListener('touchstart', handleTouchStart)
    container.removeEventListener('touchmove', handleTouchMove)
    container.removeEventListener('touchend', handleTouchEnd)
  }

  stopAutoPlay()
})
</script>

<style scoped lang="scss">
.carousel-preview {
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

.post-carousel-container {
  position: relative;
  width: 100%;
  background: #000;
  overflow: hidden;
  touch-action: pan-y;

  .carousel-track {
    display: flex;
    transition: transform 0.3s ease;
  }

  .carousel-item {
    flex: 0 0 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .carousel-image,
  .carousel-video {
    width: 100%;
    height: auto;
    display: block;
    max-height: 500px;
    object-fit: contain;
  }

  .carousel-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    padding: 4px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }

    &.carousel-nav-prev {
      left: 8px;
    }

    &.carousel-nav-next {
      right: 8px;
    }
  }

  .carousel-indicators {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;

    .indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transition: background 0.3s;

      &.active {
        background: rgba(255, 255, 255, 1);
      }
    }
  }

  .carousel-warning {
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

  .likes {
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
