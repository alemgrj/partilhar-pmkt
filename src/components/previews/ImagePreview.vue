<template>
  <div class="image-preview">
    <!-- Post Header -->
    <div class="post-header">
      <div class="user-info">
        <q-avatar size="32px">
          <img src="https://via.placeholder.com/32" alt="Profile" />
        </q-avatar>
        <div class="user-details">
          <div class="username">seu_perfil</div>
          <div class="location" v-if="location">{{ location }}</div>
        </div>
      </div>
      <q-icon name="more_vert" size="20px" />
    </div>

    <!-- Image Content -->
    <div class="post-image-container">
      <img :src="imageUrl" alt="Post" class="post-image" @load="checkImageRatio" />

      <!-- Warning se proporção incorreta -->
      <div v-if="showWarning" class="aspect-warning">
        <q-icon name="warning" size="16px" />
        <span>Proporção não ideal para {{ platform }}</span>
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
      <div v-if="caption.length > 100" class="more-link">mais</div>
    </div>

    <!-- Comments Preview -->
    <div class="comments-preview">
      <div class="view-comments">Ver todos os comentários</div>
    </div>

    <!-- Post Time -->
    <div class="post-time">HÁ 2 HORAS</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
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

    .location {
      font-size: 12px;
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

  .more-link {
    color: #666;
    cursor: pointer;
    margin-top: 4px;
  }
}

.comments-preview {
  padding: 0 16px 8px;

  .view-comments {
    font-size: 14px;
    color: #666;
    cursor: pointer;
  }
}

.post-time {
  padding: 0 16px 16px;
  font-size: 11px;
  color: #999;
  letter-spacing: 0.2px;
}
</style>
