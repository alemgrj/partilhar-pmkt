<template>
  <div class="image-cropper">
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          Enquadrar Imagem
          <q-chip size="sm" color="primary" text-color="white">
            {{ selectedFormat?.aspectRatio || '1:1' }}
          </q-chip>
        </div>

        <!-- Canvas de Crop -->
        <div class="crop-container" ref="cropContainer">
          <canvas ref="canvas" class="crop-canvas"></canvas>
          
          <!-- Overlay de Crop -->
          <div class="crop-overlay" :style="overlayStyle">
            <div class="crop-box" :style="cropBoxStyle" @mousedown="startDrag">
              <!-- Handles de Resize -->
              <div class="crop-handle crop-handle-nw" @mousedown.stop="startResize('nw')"></div>
              <div class="crop-handle crop-handle-ne" @mousedown.stop="startResize('ne')"></div>
              <div class="crop-handle crop-handle-sw" @mousedown.stop="startResize('sw')"></div>
              <div class="crop-handle crop-handle-se" @mousedown.stop="startResize('se')"></div>
              
              <!-- Grid Lines -->
              <div class="crop-grid">
                <div class="grid-line grid-line-h" style="top: 33.33%"></div>
                <div class="grid-line grid-line-h" style="top: 66.66%"></div>
                <div class="grid-line grid-line-v" style="left: 33.33%"></div>
                <div class="grid-line grid-line-v" style="left: 66.66%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Informações -->
        <div class="crop-info q-mt-md">
          <div class="row q-col-gutter-sm text-caption">
            <div class="col">
              <strong>Original:</strong> {{ originalWidth }}x{{ originalHeight }}
            </div>
            <div class="col">
              <strong>Recorte:</strong> {{ Math.round(cropWidth) }}x{{ Math.round(cropHeight) }}
            </div>
          </div>
        </div>

        <!-- Controles -->
        <div class="crop-controls q-mt-md">
          <q-slider
            v-model="zoom"
            :min="1"
            :max="3"
            :step="0.1"
            label
            label-always
            @update:model-value="updateCanvas"
          >
            <template v-slot:label="{ value }">
              <q-badge color="primary">Zoom: {{ value.toFixed(1) }}x</q-badge>
            </template>
          </q-slider>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancelar" flat @click="$emit('cancel')" />
        <q-btn
          label="Redefinir"
          flat
          color="orange"
          @click="resetCrop"
          icon="refresh"
        />
        <q-btn
          label="Aplicar"
          color="primary"
          @click="applyCrop"
          icon="check"
          unelevated
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
  selectedFormat: {
    type: Object,
    default: () => ({ ratio: 1, aspectRatio: '1:1' }),
  },
})

const emit = defineEmits(['apply', 'cancel'])

// Refs
const canvas = ref(null)
const cropContainer = ref(null)
const image = ref(null)
const zoom = ref(1)

// Original dimensions
const originalWidth = ref(0)
const originalHeight = ref(0)

// Canvas dimensions
const canvasWidth = ref(600)
const canvasHeight = ref(600)

// Crop box
const cropX = ref(0)
const cropY = ref(0)
const cropWidth = ref(400)
const cropHeight = ref(400)

// Drag state
const isDragging = ref(false)
const isResizing = ref(false)
const resizeHandle = ref(null)
const dragStartX = ref(0)
const dragStartY = ref(0)
const cropStartX = ref(0)
const cropStartY = ref(0)
const cropStartWidth = ref(0)
const cropStartHeight = ref(0)

// Computed
const targetRatio = computed(() => props.selectedFormat?.ratio || 1)

const overlayStyle = computed(() => ({
  width: `${canvasWidth.value}px`,
  height: `${canvasHeight.value}px`,
}))

const cropBoxStyle = computed(() => ({
  left: `${cropX.value}px`,
  top: `${cropY.value}px`,
  width: `${cropWidth.value}px`,
  height: `${cropHeight.value}px`,
}))

// Load image
async function loadImage() {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      image.value = img
      originalWidth.value = img.naturalWidth
      originalHeight.value = img.naturalHeight
      
      // Calculate initial canvas size
      const maxCanvasSize = 600
      const imgRatio = img.naturalWidth / img.naturalHeight
      
      if (imgRatio > 1) {
        canvasWidth.value = maxCanvasSize
        canvasHeight.value = maxCanvasSize / imgRatio
      } else {
        canvasHeight.value = maxCanvasSize
        canvasWidth.value = maxCanvasSize * imgRatio
      }
      
      // Initialize crop box
      resetCrop()
      updateCanvas()
      resolve()
    }
    
    img.onerror = reject
    img.src = props.imageUrl
  })
}

// Reset crop to center with ideal ratio
function resetCrop() {
  const idealWidth = Math.min(canvasWidth.value * 0.8, canvasHeight.value * 0.8 * targetRatio.value)
  const idealHeight = idealWidth / targetRatio.value
  
  cropWidth.value = idealWidth
  cropHeight.value = idealHeight
  cropX.value = (canvasWidth.value - idealWidth) / 2
  cropY.value = (canvasHeight.value - idealHeight) / 2
  
  zoom.value = 1
  updateCanvas()
}

// Update canvas
function updateCanvas() {
  if (!canvas.value || !image.value) return
  
  const ctx = canvas.value.getContext('2d')
  canvas.value.width = canvasWidth.value
  canvas.value.height = canvasHeight.value
  
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Calculate scaled dimensions with zoom
  const scaledWidth = canvasWidth.value * zoom.value
  const scaledHeight = canvasHeight.value * zoom.value
  const offsetX = (canvasWidth.value - scaledWidth) / 2
  const offsetY = (canvasHeight.value - scaledHeight) / 2
  
  // Draw image
  ctx.drawImage(image.value, offsetX, offsetY, scaledWidth, scaledHeight)
}

// Drag handlers
function startDrag(e) {
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  cropStartX.value = cropX.value
  cropStartY.value = cropY.value
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

function handleDrag(e) {
  if (!isDragging.value) return
  
  const deltaX = e.clientX - dragStartX.value
  const deltaY = e.clientY - dragStartY.value
  
  // Calculate new position with constraints
  let newX = cropStartX.value + deltaX
  let newY = cropStartY.value + deltaY
  
  // Constrain to canvas bounds
  newX = Math.max(0, Math.min(newX, canvasWidth.value - cropWidth.value))
  newY = Math.max(0, Math.min(newY, canvasHeight.value - cropHeight.value))
  
  cropX.value = newX
  cropY.value = newY
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Resize handlers
function startResize(handle) {
  isResizing.value = true
  resizeHandle.value = handle
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  cropStartX.value = cropX.value
  cropStartY.value = cropY.value
  cropStartWidth.value = cropWidth.value
  cropStartHeight.value = cropHeight.value
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(e) {
  if (!isResizing.value) return
  
  const deltaX = e.clientX - dragStartX.value
  
  let newWidth = cropStartWidth.value
  let newHeight = cropStartHeight.value
  let newX = cropStartX.value
  let newY = cropStartY.value
  
  // Calculate based on handle
  switch (resizeHandle.value) {
    case 'se': // Southeast
      newWidth = cropStartWidth.value + deltaX
      break
    case 'sw': // Southwest
      newWidth = cropStartWidth.value - deltaX
      newX = cropStartX.value + deltaX
      break
    case 'ne': // Northeast
      newWidth = cropStartWidth.value + deltaX
      break
    case 'nw': // Northwest
      newWidth = cropStartWidth.value - deltaX
      newX = cropStartX.value + deltaX
      break
  }
  
  // Maintain aspect ratio
  newHeight = newWidth / targetRatio.value
  
  // Adjust Y position for top handles
  if (resizeHandle.value.includes('n')) {
    const heightDelta = newHeight - cropStartHeight.value
    newY = cropStartY.value - heightDelta
  }
  
  // Constrain to canvas bounds
  const minSize = 50
  newWidth = Math.max(minSize, Math.min(newWidth, canvasWidth.value))
  newHeight = newWidth / targetRatio.value
  
  // Adjust position if out of bounds
  if (newX < 0) {
    newWidth += newX
    newHeight = newWidth / targetRatio.value
    newX = 0
  }
  if (newY < 0) {
    const extraHeight = -newY
    newHeight -= extraHeight
    newWidth = newHeight * targetRatio.value
    newY = 0
  }
  if (newX + newWidth > canvasWidth.value) {
    newWidth = canvasWidth.value - newX
    newHeight = newWidth / targetRatio.value
  }
  if (newY + newHeight > canvasHeight.value) {
    newHeight = canvasHeight.value - newY
    newWidth = newHeight * targetRatio.value
  }
  
  cropX.value = newX
  cropY.value = newY
  cropWidth.value = newWidth
  cropHeight.value = newHeight
}

function stopResize() {
  isResizing.value = false
  resizeHandle.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// Apply crop
async function applyCrop() {
  if (!image.value) return
  
  // Calculate crop in original image coordinates
  const scaleX = (originalWidth.value * zoom.value) / canvasWidth.value
  const scaleY = (originalHeight.value * zoom.value) / canvasHeight.value
  
  const offsetX = (canvasWidth.value * (1 - zoom.value)) / 2
  const offsetY = (canvasHeight.value * (1 - zoom.value)) / 2
  
  const cropData = {
    x: (cropX.value - offsetX) * scaleX,
    y: (cropY.value - offsetY) * scaleY,
    width: cropWidth.value * scaleX,
    height: cropHeight.value * scaleY,
    zoom: zoom.value,
  }
  
  // Create cropped canvas
  const croppedCanvas = document.createElement('canvas')
  const targetWidth = props.selectedFormat?.width || 1080
  const targetHeight = props.selectedFormat?.height || 1080
  
  croppedCanvas.width = targetWidth
  croppedCanvas.height = targetHeight
  
  const ctx = croppedCanvas.getContext('2d')
  
  ctx.drawImage(
    image.value,
    cropData.x,
    cropData.y,
    cropData.width,
    cropData.height,
    0,
    0,
    targetWidth,
    targetHeight
  )
  
  // Convert to blob
  croppedCanvas.toBlob((blob) => {
    emit('apply', {
      blob,
      cropData,
      url: URL.createObjectURL(blob),
    })
  }, 'image/jpeg', 0.95)
}

// Watch for format changes
watch(() => props.selectedFormat, () => {
  resetCrop()
})

onMounted(async () => {
  await loadImage()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped lang="scss">
.image-cropper {
  .crop-container {
    position: relative;
    display: inline-block;
    margin: 0 auto;
  }

  .crop-canvas {
    display: block;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .crop-overlay {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .crop-box {
    position: absolute;
    border: 2px solid #1976d2;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    cursor: move;
    pointer-events: auto;

    &:hover .crop-grid {
      opacity: 1;
    }
  }

  .crop-handle {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #fff;
    border: 2px solid #1976d2;
    border-radius: 50%;
    pointer-events: auto;

    &.crop-handle-nw {
      top: -6px;
      left: -6px;
      cursor: nw-resize;
    }

    &.crop-handle-ne {
      top: -6px;
      right: -6px;
      cursor: ne-resize;
    }

    &.crop-handle-sw {
      bottom: -6px;
      left: -6px;
      cursor: sw-resize;
    }

    &.crop-handle-se {
      bottom: -6px;
      right: -6px;
      cursor: se-resize;
    }
  }

  .crop-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    transition: opacity 0.2s;

    .grid-line {
      position: absolute;
      background: rgba(255, 255, 255, 0.5);

      &.grid-line-h {
        left: 0;
        right: 0;
        height: 1px;
      }

      &.grid-line-v {
        top: 0;
        bottom: 0;
        width: 1px;
      }
    }
  }

  .crop-info {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
  }
}
</style>
