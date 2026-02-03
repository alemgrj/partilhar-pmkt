/**
 * Funções auxiliares para determinar tipo de formato e placement
 */

/**
 * Determina o tipo de placement (feed, reels, stories) baseado no formato
 * @param {string} platform - Plataforma (instagram, facebook, tiktok)
 * @param {string} postFormat - Formato da postagem (ex: 'reels', 'feed_square', 'default')
 * @returns {string} Tipo de placement: 'feed', 'reels', 'stories', ou 'default'
 */
export function getPlacementType(platform, postFormat) {
  if (!postFormat) return 'feed'

  const formatLower = postFormat.toLowerCase()

  // Detectar reels
  if (formatLower.includes('reels')) return 'reels'
  
  // Detectar stories
  if (formatLower.includes('stories')) return 'stories'

  // TikTok usa 'default'
  if (platform === 'tiktok' && formatLower === 'default') return 'default'

  // Padrão é feed
  return 'feed'
}

/**
 * Verifica se o formato é vertical (9:16 - Reels/Stories/TikTok)
 * @param {string} postFormat - Formato da postagem
 * @returns {boolean} True se for formato vertical
 */
export function isVerticalFormat(postFormat) {
  if (!postFormat) return false
  
  return (
    postFormat.includes('reels') ||
    postFormat.includes('stories') ||
    postFormat === 'default' // TikTok
  )
}

/**
 * Converte creative_type para media_type da Meta API
 * @param {string} creativeType - Tipo de criativo (image, video, carousel)
 * @returns {string} Tipo de mídia: 'IMAGE', 'VIDEO', 'CAROUSEL'
 */
export function getMediaType(creativeType) {
  const mapping = {
    image: 'IMAGE',
    video: 'VIDEO',
    carousel: 'CAROUSEL',
  }
  
  return mapping[creativeType] || 'IMAGE'
}

/**
 * Formata data para timestamp UNIX (Meta API)
 * @param {string} dateString - String de data (formato datetime-local)
 * @returns {number|null} Timestamp UNIX em segundos, ou null se inválido
 */
export function toUnixTimestamp(dateString) {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    return Math.floor(date.getTime() / 1000)
  } catch (error) {
    console.error('Erro ao converter data:', error)
    return null
  }
}

/**
 * Valida se a data é futura
 * @param {string} dateString - String de data
 * @param {number} maxDays - Máximo de dias no futuro permitido
 * @returns {object} { isValid: boolean, message: string }
 */
export function validateFutureDate(dateString, maxDays = 365) {
  if (!dateString) {
    return { isValid: false, message: 'Data é obrigatória' }
  }

  const selectedDate = new Date(dateString)
  const now = new Date()

  if (selectedDate <= now) {
    return {
      isValid: false,
      message: 'Data deve ser futura. Use "Publicar Agora" para publicação imediata.',
    }
  }

  const maxDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000)

  if (selectedDate > maxDate) {
    return {
      isValid: false,
      message: `Data não pode ser mais de ${maxDays} dias no futuro`,
    }
  }

  return { isValid: true, message: '' }
}

/**
 * Obtém o máximo de dias permitido para agendamento por plataforma
 * @param {string} platform - Plataforma (instagram, facebook, tiktok)
 * @returns {number} Máximo de dias
 */
export function getMaxScheduleDays(platform) {
  const limits = {
    instagram: 75,
    facebook: 365,
    tiktok: 30,
  }
  
  return limits[platform] || 365
}
