/**
 * Constantes de ícones de interação por plataforma e formato
 * Define a ordem e posicionamento dos ícones para cada rede social
 */

export const PLATFORM_ICONS = {
  instagram: {
    feed: {
      position: 'bottom',
      icons: [
        { name: 'favorite_border', label: 'Curtir', action: 'like' },
        { name: 'chat_bubble_outline', label: 'Comentar', action: 'comment' },
        { name: 'send', label: 'Enviar', action: 'send' },
      ],
      rightIcon: { name: 'bookmark_border', label: 'Salvar', action: 'save' },
    },
    reels: {
      position: 'side',
      icons: [
        { name: 'favorite_border', label: 'Curtir', count: '1.2K' },
        { name: 'chat_bubble_outline', label: 'Comentar', count: '89' },
        { name: 'send', label: 'Enviar' },
        { name: 'more_vert', label: 'Mais' },
      ],
    },
    stories: {
      position: 'side',
      icons: [
        { name: 'favorite_border', label: 'Curtir' },
        { name: 'chat_bubble_outline', label: 'Comentar' },
        { name: 'send', label: 'Enviar' },
        { name: 'more_vert', label: 'Mais' },
      ],
    },
  },
  facebook: {
    feed: {
      position: 'bottom',
      icons: [
        { name: 'thumb_up_outline', label: 'Curtir', action: 'like' },
        { name: 'chat_bubble_outline', label: 'Comentar', action: 'comment' },
        { name: 'share', label: 'Compartilhar', action: 'share' },
      ],
      rightIcon: null, // Salvar em menu secundário
    },
    reels: {
      position: 'side',
      icons: [
        { name: 'thumb_up_outline', label: 'Curtir', count: '1.2K' },
        { name: 'chat_bubble_outline', label: 'Comentar', count: '89' },
        { name: 'share', label: 'Compartilhar' },
      ],
    },
    stories: {
      position: 'side',
      icons: [
        { name: 'thumb_up_outline', label: 'Curtir' },
        { name: 'chat_bubble_outline', label: 'Comentar' },
        { name: 'share', label: 'Compartilhar' },
      ],
    },
  },
  tiktok: {
    default: {
      position: 'side',
      icons: [
        { name: 'favorite_border', label: 'Curtir', count: '24.5K' },
        { name: 'chat_bubble_outline', label: 'Comentar', count: '892' },
        { name: 'bookmark_border', label: 'Salvar', count: '1.8K' },
        { name: 'share', label: 'Compartilhar' },
      ],
    },
  },
}

/**
 * Obtém os ícones de interação para uma plataforma e formato específicos
 * @param {string} platform - Plataforma (instagram, facebook, tiktok)
 * @param {string} placementType - Tipo de placement (feed, reels, stories, default)
 * @returns {object} Objeto com position e icons
 */
export function getPlatformIcons(platform, placementType) {
  if (!platform || !PLATFORM_ICONS[platform]) {
    return {
      position: 'bottom',
      icons: [],
      rightIcon: null,
    }
  }

  const platformConfig = PLATFORM_ICONS[platform]
  
  // TikTok sempre usa 'default'
  if (platform === 'tiktok') {
    return platformConfig.default || platformConfig.feed
  }

  // Para outras plataformas, usar o placementType fornecido
  return platformConfig[placementType] || platformConfig.feed
}
