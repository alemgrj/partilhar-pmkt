/**
 * Constantes de formatos de postagem por plataforma
 * Define as proporções aceitas e preferências de cada rede social
 */

export const POST_FORMATS = {
  instagram: {
    reels: {
      label: 'Reels / Stories',
      ratio: 9 / 16,
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      priority: 'principal',
      description: 'Formato vertical ideal para Reels e Stories',
    },
    feed_portrait: {
      label: 'Feed (Retrato)',
      ratio: 4 / 5,
      aspectRatio: '4:5',
      width: 1080,
      height: 1350,
      priority: 'muito aceito',
      description: 'Formato vertical muito aceito no feed',
    },
    feed_square: {
      label: 'Feed (Quadrado)',
      ratio: 1,
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      priority: 'aceito',
      description: 'Formato quadrado clássico do Instagram',
    },
  },
  facebook: {
    feed_square: {
      label: 'Feed (Quadrado)',
      ratio: 1,
      aspectRatio: '1:1',
      width: 1200,
      height: 1200,
      priority: 'principal',
      description: 'Formato principal para feed do Facebook',
    },
    feed_portrait: {
      label: 'Feed (Retrato)',
      ratio: 4 / 5,
      aspectRatio: '4:5',
      width: 1080,
      height: 1350,
      priority: 'muito aceito',
      description: 'Formato vertical muito aceito no feed',
    },
    stories: {
      label: 'Stories / Reels',
      ratio: 9 / 16,
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      priority: 'aceito',
      description: 'Formato vertical para Stories e Reels',
    },
  },
  tiktok: {
    default: {
      label: 'Padrão',
      ratio: 9 / 16,
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      priority: 'absoluto',
      description: 'Padrão absoluto do TikTok',
    },
    square: {
      label: 'Quadrado',
      ratio: 1,
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      priority: 'aceito',
      description: 'Formato quadrado aceito',
    },
  },
}

/**
 * Retorna os formatos disponíveis para uma plataforma
 */
export function getFormatsByPlatform(platform) {
  return POST_FORMATS[platform] || {}
}

/**
 * Retorna o formato principal de uma plataforma
 */
export function getMainFormat(platform) {
  const formats = getFormatsByPlatform(platform)
  return Object.values(formats).find((f) => f.priority === 'principal' || f.priority === 'absoluto')
}

/**
 * Retorna options para o Quasar Select
 */
export function getFormatOptions(platform) {
  const formats = getFormatsByPlatform(platform)
  return Object.entries(formats).map(([key, format]) => ({
    label: `${format.label} (${format.aspectRatio}) - ${format.priority}`,
    value: key,
    ratio: format.ratio,
    ...format,
  }))
}

/**
 * Valida se a proporção está dentro da tolerância
 */
export function validateAspectRatio(width, height, targetRatio, tolerance = 0.05) {
  const currentRatio = width / height
  return Math.abs(currentRatio - targetRatio) <= tolerance
}

/**
 * Calcula dimensões ideais mantendo a proporção
 */
export function calculateIdealDimensions(currentWidth, currentHeight, targetRatio) {
  const currentRatio = currentWidth / currentHeight

  if (currentRatio > targetRatio) {
    // Imagem mais larga, ajustar largura
    return {
      width: Math.round(currentHeight * targetRatio),
      height: currentHeight,
    }
  } else {
    // Imagem mais alta, ajustar altura
    return {
      width: currentWidth,
      height: Math.round(currentWidth / targetRatio),
    }
  }
}

/**
 * Retorna dicas por formato
 */
export function getFormatTips(platform, formatKey) {
  const tips = {
    instagram: {
      reels: [
        'Vídeos de 15-90 segundos têm melhor performance',
        'Use música trending para mais alcance',
        'Vertical completo aproveitando toda a tela',
      ],
      feed_portrait: [
        'Formato que ocupa mais espaço no feed',
        'Ideal para fotos de produto com detalhes',
        'Melhor visualização no mobile',
      ],
      feed_square: [
        'Formato clássico e equilibrado',
        'Boa opção para mosaico no perfil',
        'Compatível com todas as funcionalidades',
      ],
    },
    facebook: {
      feed_square: [
        'Formato mais comum e familiar',
        'Boa visualização em desktop e mobile',
        'Recomendado para fotos de perfil e capas',
      ],
      feed_portrait: [
        'Ocupa mais espaço no feed mobile',
        'Ideal para storytelling vertical',
        'Melhor engajamento em mobile',
      ],
      stories: [
        'Formato imersivo de tela cheia',
        'Duração recomendada: 5-15 segundos',
        'Bom para conteúdo efêmero',
      ],
    },
    tiktok: {
      default: [
        'Use os primeiros 3 segundos para capturar atenção',
        'Legendas e texto na parte central da tela',
        'Música é essencial para o algoritmo',
      ],
      square: [
        'Não aproveita toda a tela',
        'Use apenas se o conteúdo exigir',
        'Pode ter menos alcance que o vertical',
      ],
    },
  }

  return tips[platform]?.[formatKey] || []
}
