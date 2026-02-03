import { computed, ref } from 'vue'
import {
  POST_FORMATS,
  getFormatsByPlatform,
  getMainFormat,
  getFormatOptions,
  getFormatTips,
  validateAspectRatio,
  calculateIdealDimensions,
} from 'src/constants/postFormats'

/**
 * Composable para gerenciar formatos de postagem
 * Centraliza a lógica de formatos, proporções e validações
 */
export function usePostFormats() {
  const selectedPlatform = ref(null)
  const selectedFormat = ref(null)

  /**
   * Formatos disponíveis para a plataforma selecionada
   */
  const availableFormats = computed(() => {
    if (!selectedPlatform.value) return []
    return getFormatOptions(selectedPlatform.value)
  })

  /**
   * Configuração do formato selecionado
   */
  const currentFormatConfig = computed(() => {
    if (!selectedFormat.value || !selectedPlatform.value) return null
    const formats = getFormatsByPlatform(selectedPlatform.value)
    return formats[selectedFormat.value]
  })

  /**
   * Dicas para o formato atual
   */
  const currentFormatTips = computed(() => {
    if (!selectedFormat.value || !selectedPlatform.value) return []
    return getFormatTips(selectedPlatform.value, selectedFormat.value)
  })

  /**
   * Define a plataforma e auto-seleciona o formato principal
   */
  function setPlatform(platform) {
    selectedPlatform.value = platform
    
    if (platform) {
      const mainFormat = getMainFormat(platform)
      if (mainFormat) {
        // Encontrar a chave do formato principal
        const formats = getFormatsByPlatform(platform)
        const formatKey = Object.keys(formats).find(
          (key) => formats[key].priority === mainFormat.priority
        )
        selectedFormat.value = formatKey
      }
    }
  }

  /**
   * Define o formato manualmente
   */
  function setFormat(format) {
    selectedFormat.value = format
  }

  /**
   * Valida se uma imagem está na proporção correta
   */
  function validateImageFormat(width, height, tolerance = 0.05) {
    if (!currentFormatConfig.value) return { isValid: false, message: 'Nenhum formato selecionado' }

    const isValid = validateAspectRatio(
      width,
      height,
      currentFormatConfig.value.ratio,
      tolerance
    )

    return {
      isValid,
      message: isValid
        ? `Imagem na proporção ideal (${currentFormatConfig.value.aspectRatio})`
        : `Imagem fora da proporção. Esperado: ${currentFormatConfig.value.aspectRatio}`,
      currentRatio: (width / height).toFixed(2),
      expectedRatio: currentFormatConfig.value.aspectRatio,
    }
  }

  /**
   * Calcula dimensões ideais para o formato selecionado
   */
  function getIdealDimensions(currentWidth, currentHeight) {
    if (!currentFormatConfig.value) return { width: currentWidth, height: currentHeight }

    return calculateIdealDimensions(
      currentWidth,
      currentHeight,
      currentFormatConfig.value.ratio
    )
  }

  /**
   * Retorna informações sobre o recorte necessário
   */
  function getCropInfo(originalWidth, originalHeight) {
    if (!currentFormatConfig.value) return null

    const originalRatio = originalWidth / originalHeight
    const targetRatio = currentFormatConfig.value.ratio

    let cropWidth = originalWidth
    let cropHeight = originalHeight

    if (originalRatio > targetRatio) {
      // Imagem mais larga - cortar nas laterais
      cropWidth = originalHeight * targetRatio
      return {
        needsCrop: true,
        cropType: 'horizontal',
        dimensions: { width: Math.round(cropWidth), height: originalHeight },
        lossPercentage: ((1 - cropWidth / originalWidth) * 100).toFixed(1),
      }
    } else if (originalRatio < targetRatio) {
      // Imagem mais alta - cortar em cima/baixo
      cropHeight = originalWidth / targetRatio
      return {
        needsCrop: true,
        cropType: 'vertical',
        dimensions: { width: originalWidth, height: Math.round(cropHeight) },
        lossPercentage: ((1 - cropHeight / originalHeight) * 100).toFixed(1),
      }
    }

    return {
      needsCrop: false,
      cropType: null,
      dimensions: { width: originalWidth, height: originalHeight },
      lossPercentage: 0,
    }
  }

  /**
   * Retorna a cor do badge baseado na prioridade
   */
  function getPriorityColor(priority) {
    const colors = {
      principal: 'green',
      'muito aceito': 'blue',
      aceito: 'orange',
      absoluto: 'deep-purple',
    }
    return colors[priority] || 'grey'
  }

  /**
   * Retorna todos os formatos (para referência)
   */
  function getAllFormats() {
    return POST_FORMATS
  }

  /**
   * Reseta seleções
   */
  function reset() {
    selectedPlatform.value = null
    selectedFormat.value = null
  }

  return {
    // State
    selectedPlatform,
    selectedFormat,
    
    // Computed
    availableFormats,
    currentFormatConfig,
    currentFormatTips,
    
    // Methods
    setPlatform,
    setFormat,
    validateImageFormat,
    getIdealDimensions,
    getCropInfo,
    getPriorityColor,
    getAllFormats,
    reset,
  }
}
