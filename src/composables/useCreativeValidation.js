import { ref, computed } from 'vue'

/**
 * Composable para validação de criativos (imagens e vídeos)
 */
export function useCreativeValidation() {
  const validations = ref([])

  // Proporções ideais por plataforma (usando as constantes)
  const idealAspectRatios = {
    instagram: {
      reels: { ratio: 9 / 16, label: '9:16 (Reels/Stories)', tolerance: 0.05 },
      feed_portrait: { ratio: 4 / 5, label: '4:5 (Feed Retrato)', tolerance: 0.05 },
      feed_square: { ratio: 1, label: '1:1 (Feed Quadrado)', tolerance: 0.05 },
    },
    facebook: {
      feed_square: { ratio: 1, label: '1:1 (Feed)', tolerance: 0.05 },
      feed_portrait: { ratio: 4 / 5, label: '4:5 (Feed)', tolerance: 0.05 },
      stories: { ratio: 9 / 16, label: '9:16 (Stories/Reels)', tolerance: 0.05 },
    },
    tiktok: {
      default: { ratio: 9 / 16, label: '9:16 (Padrão)', tolerance: 0.05 },
      square: { ratio: 1, label: '1:1 (Quadrado)', tolerance: 0.05 },
    },
    google_ads: {
      square: { ratio: 1, label: '1:1 (Quadrado)', tolerance: 0.05 },
      landscape: { ratio: 1.91, label: '1.91:1 (Paisagem)', tolerance: 0.05 },
    },
  }

  // Durações recomendadas de vídeo por plataforma (em segundos)
  const videoDurations = {
    instagram_feed: { min: 3, max: 60, ideal: 30 },
    instagram_reels: { min: 3, max: 90, ideal: 30 },
    instagram_stories: { min: 1, max: 15, ideal: 10 },
    tiktok: { min: 5, max: 180, ideal: 30 },
    facebook: { min: 3, max: 240, ideal: 60 },
  }

  // Tamanhos recomendados de arquivo
  const fileSizeLimits = {
    image: { max: 10 * 1024 * 1024, warning: 5 * 1024 * 1024 }, // 10MB max, 5MB warning
    video: { max: 100 * 1024 * 1024, warning: 50 * 1024 * 1024 }, // 100MB max, 50MB warning
  }

  /**
   * Valida proporção de uma imagem
   */
  function validateImageAspectRatio(width, height, platform = 'instagram', selectedFormat = null) {
    const ratio = width / height
    const platformRatios = idealAspectRatios[platform] || idealAspectRatios.instagram

    // Se um formato específico foi selecionado, validar contra ele
    if (selectedFormat && platformRatios[selectedFormat]) {
      const targetFormat = platformRatios[selectedFormat]
      const isIdeal = Math.abs(ratio - targetFormat.ratio) < targetFormat.tolerance

      return {
        isValid: isIdeal,
        currentRatio: ratio.toFixed(2),
        closestIdealRatio: targetFormat.label,
        message: isIdeal
          ? `Proporção ideal (${targetFormat.label})`
          : `Proporção não ideal. Esperado: ${targetFormat.label}`,
        severity: isIdeal ? 'success' : 'warning',
        details: {
          width,
          height,
          ratio,
        },
      }
    }

    // Caso contrário, encontrar o formato mais próximo
    let closestRatio = null
    let minDifference = Infinity

    for (const [, config] of Object.entries(platformRatios)) {
      const difference = Math.abs(ratio - config.ratio)
      if (difference < minDifference) {
        minDifference = difference
        closestRatio = config
      }
    }

    const isIdeal = minDifference < closestRatio.tolerance

    return {
      isValid: isIdeal,
      currentRatio: ratio.toFixed(2),
      closestIdealRatio: closestRatio.label,
      message: isIdeal
        ? `Proporção ideal (${closestRatio.label})`
        : `Proporção não ideal. Recomendado: ${closestRatio.label}`,
      severity: isIdeal ? 'success' : 'warning',
      details: {
        width,
        height,
        ratio,
      },
    }
  }

  /**
   * Valida duração de um vídeo
   */
  function validateVideoDuration(duration, platform = 'instagram', type = 'feed') {
    const key = `${platform}_${type}`
    const limits = videoDurations[key] || videoDurations.instagram_feed

    let isValid = true
    let message = ''
    let severity = 'success'

    if (duration < limits.min) {
      isValid = false
      message = `Vídeo muito curto (${duration.toFixed(1)}s). Mínimo: ${limits.min}s`
      severity = 'error'
    } else if (duration > limits.max) {
      isValid = false
      message = `Vídeo muito longo (${duration.toFixed(1)}s). Máximo: ${limits.max}s`
      severity = 'error'
    } else if (duration > limits.ideal * 2) {
      message = `Vídeo pode ser muito longo (${duration.toFixed(1)}s). Ideal: até ${limits.ideal}s`
      severity = 'warning'
    } else {
      message = `Duração adequada (${duration.toFixed(1)}s)`
    }

    return {
      isValid,
      duration,
      message,
      severity,
      limits,
    }
  }

  /**
   * Valida tamanho de arquivo
   */
  function validateFileSize(size, type = 'image') {
    const limits = fileSizeLimits[type] || fileSizeLimits.image
    const sizeMB = (size / (1024 * 1024)).toFixed(2)

    let message = ''
    let severity = 'success'
    let isValid = true

    if (size > limits.max) {
      isValid = false
      message = `Arquivo muito grande (${sizeMB}MB). Máximo: ${(limits.max / (1024 * 1024)).toFixed(0)}MB`
      severity = 'error'
    } else if (size > limits.warning) {
      message = `Arquivo grande (${sizeMB}MB). Considere comprimir.`
      severity = 'warning'
    } else {
      message = `Tamanho adequado (${sizeMB}MB)`
    }

    return {
      isValid,
      size,
      sizeMB,
      message,
      severity,
    }
  }

  /**
   * Valida resolução de imagem
   */
  function validateImageResolution(width, height, platform = 'instagram') {
    const minResolutions = {
      instagram: { width: 1080, height: 1080 },
      tiktok: { width: 1080, height: 1920 },
      facebook: { width: 1200, height: 630 },
      google_ads: { width: 1200, height: 628 },
    }

    const minRes = minResolutions[platform] || minResolutions.instagram

    let message = ''
    let severity = 'success'
    let isValid = true

    if (width < minRes.width || height < minRes.height) {
      isValid = false
      message = `Resolução baixa (${width}x${height}). Mínimo recomendado: ${minRes.width}x${minRes.height}`
      severity = 'warning'
    } else if (width > 4000 || height > 4000) {
      message = `Resolução muito alta (${width}x${height}). Considere reduzir para melhor performance.`
      severity = 'info'
    } else {
      message = `Resolução adequada (${width}x${height})`
    }

    return {
      isValid,
      width,
      height,
      message,
      severity,
      minResolution: minRes,
    }
  }

  /**
   * Valida carrossel
   */
  function validateCarousel(itemsCount) {
    let message = ''
    let severity = 'success'
    let isValid = true

    if (itemsCount < 2) {
      isValid = false
      message = 'Carrossel deve ter pelo menos 2 itens'
      severity = 'error'
    } else if (itemsCount > 10) {
      message = `Carrossel muito longo (${itemsCount} itens). Máximo recomendado: 10 itens`
      severity = 'warning'
    } else if (itemsCount < 3) {
      message = `Carrossel curto (${itemsCount} itens). Recomendado: 3-10 itens`
      severity = 'info'
    } else {
      message = `Carrossel adequado (${itemsCount} itens)`
    }

    return {
      isValid,
      itemsCount,
      message,
      severity,
    }
  }

  /**
   * Valida formato de arquivo
   */
  function validateFileFormat(fileName, type) {
    const allowedFormats = {
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      video: ['mp4', 'mov', 'webm'],
    }

    const ext = fileName.split('.').pop().toLowerCase()
    const allowed = allowedFormats[type] || []
    const isValid = allowed.includes(ext)

    return {
      isValid,
      extension: ext,
      message: isValid
        ? `Formato válido (.${ext})`
        : `Formato não suportado (.${ext}). Permitidos: ${allowed.join(', ')}`,
      severity: isValid ? 'success' : 'error',
      allowedFormats: allowed,
    }
  }

  /**
   * Executa todas as validações para uma imagem
   */
  async function validateImage(file, width, height, platform = 'instagram', selectedFormat = null) {
    const results = []

    // Validar formato
    results.push({
      type: 'format',
      ...validateFileFormat(file.name, 'image'),
    })

    // Validar tamanho
    results.push({
      type: 'fileSize',
      ...validateFileSize(file.size, 'image'),
    })

    // Validar resolução
    results.push({
      type: 'resolution',
      ...validateImageResolution(width, height, platform),
    })

    // Validar proporção
    results.push({
      type: 'aspectRatio',
      ...validateImageAspectRatio(width, height, platform, selectedFormat),
    })

    validations.value = results
    return results
  }

  /**
   * Executa todas as validações para um vídeo
   */
  async function validateVideo(
    file,
    duration,
    width,
    height,
    platform = 'instagram',
    type = 'feed'
  ) {
    const results = []

    // Validar formato
    results.push({
      type: 'format',
      ...validateFileFormat(file.name, 'video'),
    })

    // Validar tamanho
    results.push({
      type: 'fileSize',
      ...validateFileSize(file.size, 'video'),
    })

    // Validar duração
    results.push({
      type: 'duration',
      ...validateVideoDuration(duration, platform, type),
    })

    // Validar resolução
    results.push({
      type: 'resolution',
      ...validateImageResolution(width, height, platform),
    })

    validations.value = results
    return results
  }

  /**
   * Limpa validações
   */
  function clearValidations() {
    validations.value = []
  }

  /**
   * Obtém validações por severidade
   */
  const validationsBySeverity = computed(() => {
    return {
      errors: validations.value.filter((v) => v.severity === 'error'),
      warnings: validations.value.filter((v) => v.severity === 'warning'),
      info: validations.value.filter((v) => v.severity === 'info'),
      success: validations.value.filter((v) => v.severity === 'success'),
    }
  })

  /**
   * Verifica se há erros críticos
   */
  const hasErrors = computed(() => {
    return validationsBySeverity.value.errors.length > 0
  })

  /**
   * Verifica se há avisos
   */
  const hasWarnings = computed(() => {
    return validationsBySeverity.value.warnings.length > 0
  })

  return {
    validations,
    validationsBySeverity,
    hasErrors,
    hasWarnings,
    validateImage,
    validateVideo,
    validateCarousel,
    validateImageAspectRatio,
    validateVideoDuration,
    validateFileSize,
    validateImageResolution,
    validateFileFormat,
    clearValidations,
  }
}
