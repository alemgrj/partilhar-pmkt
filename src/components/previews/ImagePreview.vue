<template>
  <div class="image-preview" :class="{ 'vertical-preview': isVerticalFormat }">
    <!-- Post Header (não mostrar em formatos verticais) -->
    <div v-if="currentIcons.position === 'bottom'" class="post-header">
      <div class="user-info">
        <q-avatar size="28px">
          <img src="https://via.placeholder.com/32" alt="Profile" />
        </q-avatar>
        <div class="user-details">
          <div class="username">seu_perfil</div>
          <div class="location" v-if="location">{{ location }}</div>
        </div>
      </div>
      <q-icon name="more_vert" size="18px" />
    </div>

    <!-- Image Content -->
    <div class="post-image-container">
      <img :src="imageUrl" alt="Post" class="post-image" @load="checkImageRatio" />

      <!-- Warning se proporção incorreta -->
      <div v-if="showWarning" class="aspect-warning">
        <q-icon name="warning" size="14px" />
        <span>Proporção não ideal</span>
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
    </div>

    <!-- Post Caption (apenas para formatos não-verticais) -->
    <div v-if="currentIcons.position === 'bottom' && caption" class="post-caption">
      <span class="username">seu_perfil</span>
      <span class="caption-text">{{ caption }}</span>
      <div v-if="caption.length > 100" class="more-link">mais</div>
    </div>

    <!-- Comments Preview (apenas para formatos não-verticais) -->
    <div v-if="currentIcons.position === 'bottom'" class="comments-preview">
      <div class="view-comments">Ver todos os comentários</div>
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
  imageUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  location: {
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

const imageRatio = ref(null)
const showWarning = ref(false)

const idealRatios = {
  instagram: {
    square: 1,
    portrait: 4 / 5,
    landscape: 1.91 / 1,
  },
}

function checkImageRatio(event) {
  const img = event.target
  const ratio = img.naturalWidth / img.naturalHeight
  imageRatio.value = ratio

  // Verificar se está dentro dos padrões ideais do Instagram
  const ratios = idealRatios.instagram
  const tolerance = 0.05

  const isIdealRatio =
    Math.abs(ratio - ratios.square) < tolerance ||
    Math.abs(ratio - ratios.portrait) < tolerance ||
    Math.abs(ratio - ratios.landscape) < tolerance

  showWarning.value = !isIdealRatio
}
</script>

<style scoped lang="scss">
.image-preview {
  background: #fff;
  
  &.vertical-preview {
    background: #000;
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .post-image-container {
      flex: 1;
    }
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user-details {
    .username {
      font-weight: 600;
      font-size: 13px;
    }

    .location {
      font-size: 11px;
      color: #666;
    }
  }
}

.post-image-container {
  position: relative;
  width: 100%;
  background: #000;

  .post-image {
    width: 100%;
    height: auto;
    display: block;
  }

  .aspect-warning {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(255, 152, 0, 0.9);
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
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
  padding: 8px 14px;

  .actions-left {
    display: flex;
    gap: 14px;
  }

  .action-icon {
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }
}

.post-stats {
  padding: 0 14px 6px;

  .likes {
    font-size: 13px;
  }
}

.post-caption {
  padding: 0 14px 6px;
  font-size: 13px;

  .username {
    font-weight: 600;
    margin-right: 4px;
  }

  .caption-text {
    line-height: 1.4;
  }

  .more-link {
    color: #666;
    cursor: pointer;
    margin-top: 4px;
    font-size: 12px;
  }
}

.comments-preview {
  padding: 0 14px 6px;

  .view-comments {
    font-size: 13px;
    color: #666;
    cursor: pointer;
  }
}

.post-time {
  padding: 0 14px 12px;
  font-size: 10px;
  color: #999;
  letter-spacing: 0.2px;
}
</style>
