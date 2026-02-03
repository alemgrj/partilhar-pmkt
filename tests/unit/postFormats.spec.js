/**
 * Testes para as constantes e funções de postFormats
 */

import { describe, it, expect } from 'vitest'
import {
  POST_FORMATS,
  getFormatsByPlatform,
  getMainFormat,
  getFormatOptions,
  getFormatTips,
  validateAspectRatio,
  calculateIdealDimensions,
} from 'src/constants/postFormats'

describe('postFormats', () => {
  describe('POST_FORMATS', () => {
    it('deve ter formatos para Instagram', () => {
      expect(POST_FORMATS.instagram).toBeDefined()
      expect(POST_FORMATS.instagram.reels).toBeDefined()
      expect(POST_FORMATS.instagram.feed_portrait).toBeDefined()
      expect(POST_FORMATS.instagram.feed_square).toBeDefined()
    })

    it('deve ter formatos para Facebook', () => {
      expect(POST_FORMATS.facebook).toBeDefined()
      expect(POST_FORMATS.facebook.feed_square).toBeDefined()
      expect(POST_FORMATS.facebook.feed_portrait).toBeDefined()
      expect(POST_FORMATS.facebook.stories).toBeDefined()
    })

    it('deve ter formatos para TikTok', () => {
      expect(POST_FORMATS.tiktok).toBeDefined()
      expect(POST_FORMATS.tiktok.default).toBeDefined()
      expect(POST_FORMATS.tiktok.square).toBeDefined()
    })

    it('deve ter estrutura correta para cada formato', () => {
      const format = POST_FORMATS.instagram.reels
      expect(format).toHaveProperty('label')
      expect(format).toHaveProperty('ratio')
      expect(format).toHaveProperty('aspectRatio')
      expect(format).toHaveProperty('width')
      expect(format).toHaveProperty('height')
      expect(format).toHaveProperty('priority')
      expect(format).toHaveProperty('description')
    })
  })

  describe('getFormatsByPlatform', () => {
    it('deve retornar formatos do Instagram', () => {
      const formats = getFormatsByPlatform('instagram')
      expect(formats).toHaveProperty('reels')
      expect(formats).toHaveProperty('feed_portrait')
      expect(formats).toHaveProperty('feed_square')
    })

    it('deve retornar formatos do Facebook', () => {
      const formats = getFormatsByPlatform('facebook')
      expect(formats).toHaveProperty('feed_square')
      expect(formats).toHaveProperty('feed_portrait')
      expect(formats).toHaveProperty('stories')
    })

    it('deve retornar objeto vazio para plataforma inexistente', () => {
      const formats = getFormatsByPlatform('inexistente')
      expect(formats).toEqual({})
    })
  })

  describe('getMainFormat', () => {
    it('deve retornar formato principal do Instagram (Reels)', () => {
      const mainFormat = getMainFormat('instagram')
      expect(mainFormat).toBeDefined()
      expect(mainFormat.priority).toBe('principal')
      expect(mainFormat.aspectRatio).toBe('9:16')
    })

    it('deve retornar formato principal do Facebook (Feed Square)', () => {
      const mainFormat = getMainFormat('facebook')
      expect(mainFormat).toBeDefined()
      expect(mainFormat.priority).toBe('principal')
      expect(mainFormat.aspectRatio).toBe('1:1')
    })

    it('deve retornar formato absoluto do TikTok', () => {
      const mainFormat = getMainFormat('tiktok')
      expect(mainFormat).toBeDefined()
      expect(mainFormat.priority).toBe('absoluto')
      expect(mainFormat.aspectRatio).toBe('9:16')
    })

    it('deve retornar undefined para plataforma inexistente', () => {
      const mainFormat = getMainFormat('inexistente')
      expect(mainFormat).toBeUndefined()
    })
  })

  describe('getFormatOptions', () => {
    it('deve retornar options formatadas para Instagram', () => {
      const options = getFormatOptions('instagram')
      expect(options).toBeInstanceOf(Array)
      expect(options).toHaveLength(3)
      
      options.forEach(opt => {
        expect(opt).toHaveProperty('label')
        expect(opt).toHaveProperty('value')
        expect(opt).toHaveProperty('ratio')
        expect(opt).toHaveProperty('priority')
      })
    })

    it('deve incluir prioridade no label', () => {
      const options = getFormatOptions('instagram')
      const reelsOption = options.find(opt => opt.value === 'reels')
      expect(reelsOption.label).toContain('principal')
    })

    it('deve retornar array vazio para plataforma inexistente', () => {
      const options = getFormatOptions('inexistente')
      expect(options).toEqual([])
    })
  })

  describe('getFormatTips', () => {
    it('deve retornar dicas para Instagram Reels', () => {
      const tips = getFormatTips('instagram', 'reels')
      expect(tips).toBeInstanceOf(Array)
      expect(tips.length).toBeGreaterThan(0)
    })

    it('deve retornar dicas para TikTok padrão', () => {
      const tips = getFormatTips('tiktok', 'default')
      expect(tips).toBeInstanceOf(Array)
      expect(tips.length).toBeGreaterThan(0)
    })

    it('deve retornar array vazio para combinação inexistente', () => {
      const tips = getFormatTips('inexistente', 'inexistente')
      expect(tips).toEqual([])
    })
  })

  describe('validateAspectRatio', () => {
    it('deve validar proporção 9:16 corretamente', () => {
      const isValid = validateAspectRatio(1080, 1920, 9/16)
      expect(isValid).toBe(true)
    })

    it('deve validar proporção 1:1 corretamente', () => {
      const isValid = validateAspectRatio(1080, 1080, 1)
      expect(isValid).toBe(true)
    })

    it('deve validar proporção 4:5 corretamente', () => {
      const isValid = validateAspectRatio(1080, 1350, 4/5)
      expect(isValid).toBe(true)
    })

    it('deve aceitar pequenas variações dentro da tolerância', () => {
      // 1080:1910 é aproximadamente 9:16 com 0.5% de diferença
      const isValid = validateAspectRatio(1080, 1910, 9/16, 0.05)
      expect(isValid).toBe(true)
    })

    it('deve rejeitar proporções fora da tolerância', () => {
      const isValid = validateAspectRatio(1080, 1500, 9/16, 0.05)
      expect(isValid).toBe(false)
    })

    it('deve usar tolerância padrão de 0.05', () => {
      const isValid = validateAspectRatio(1080, 1900, 9/16)
      expect(isValid).toBe(true)
    })
  })

  describe('calculateIdealDimensions', () => {
    it('deve ajustar largura para imagem landscape em formato portrait', () => {
      // Imagem 1920x1080 para proporção 9:16
      const dims = calculateIdealDimensions(1920, 1080, 9/16)
      expect(dims.height).toBe(1080)
      expect(dims.width).toBeLessThan(1920)
      expect(dims.width).toBe(Math.round(1080 * (9/16)))
    })

    it('deve ajustar altura para imagem portrait em formato landscape', () => {
      // Imagem 1080x1920 para proporção 16:9
      const dims = calculateIdealDimensions(1080, 1920, 16/9)
      expect(dims.width).toBe(1080)
      expect(dims.height).toBeLessThan(1920)
      expect(dims.height).toBe(Math.round(1080 / (16/9)))
    })

    it('deve manter dimensões se já estiver na proporção correta', () => {
      const dims = calculateIdealDimensions(1080, 1920, 9/16)
      expect(dims.width).toBe(1080)
      expect(dims.height).toBe(1920)
    })

    it('deve calcular para proporção quadrada', () => {
      // Imagem 1920x1080 para 1:1
      const dims = calculateIdealDimensions(1920, 1080, 1)
      expect(dims.width).toBe(1080)
      expect(dims.height).toBe(1080)
    })

    it('deve retornar números inteiros', () => {
      const dims = calculateIdealDimensions(1920, 1080, 9/16)
      expect(Number.isInteger(dims.width)).toBe(true)
      expect(Number.isInteger(dims.height)).toBe(true)
    })
  })

  describe('Proporções específicas por plataforma', () => {
    it('Instagram Reels deve ser 9:16', () => {
      const format = POST_FORMATS.instagram.reels
      expect(format.ratio).toBeCloseTo(9/16, 5)
      expect(format.aspectRatio).toBe('9:16')
    })

    it('Instagram Feed Portrait deve ser 4:5', () => {
      const format = POST_FORMATS.instagram.feed_portrait
      expect(format.ratio).toBeCloseTo(4/5, 5)
      expect(format.aspectRatio).toBe('4:5')
    })

    it('Instagram Feed Square deve ser 1:1', () => {
      const format = POST_FORMATS.instagram.feed_square
      expect(format.ratio).toBe(1)
      expect(format.aspectRatio).toBe('1:1')
    })

    it('Facebook Feed Square deve ser 1:1', () => {
      const format = POST_FORMATS.facebook.feed_square
      expect(format.ratio).toBe(1)
      expect(format.aspectRatio).toBe('1:1')
    })

    it('TikTok padrão deve ser 9:16', () => {
      const format = POST_FORMATS.tiktok.default
      expect(format.ratio).toBeCloseTo(9/16, 5)
      expect(format.aspectRatio).toBe('9:16')
    })
  })

  describe('Prioridades', () => {
    it('Instagram Reels deve ter prioridade principal', () => {
      const format = POST_FORMATS.instagram.reels
      expect(format.priority).toBe('principal')
    })

    it('Facebook Feed Square deve ter prioridade principal', () => {
      const format = POST_FORMATS.facebook.feed_square
      expect(format.priority).toBe('principal')
    })

    it('TikTok default deve ter prioridade absoluto', () => {
      const format = POST_FORMATS.tiktok.default
      expect(format.priority).toBe('absoluto')
    })

    it('Instagram Feed Portrait deve ter prioridade muito aceito', () => {
      const format = POST_FORMATS.instagram.feed_portrait
      expect(format.priority).toBe('muito aceito')
    })

    it('Instagram Feed Square deve ter prioridade aceito', () => {
      const format = POST_FORMATS.instagram.feed_square
      expect(format.priority).toBe('aceito')
    })
  })

  describe('Dimensões recomendadas', () => {
    it('Instagram Reels deve ter dimensões 1080x1920', () => {
      const format = POST_FORMATS.instagram.reels
      expect(format.width).toBe(1080)
      expect(format.height).toBe(1920)
    })

    it('Instagram Feed Portrait deve ter dimensões 1080x1350', () => {
      const format = POST_FORMATS.instagram.feed_portrait
      expect(format.width).toBe(1080)
      expect(format.height).toBe(1350)
    })

    it('Facebook Feed Square deve ter dimensões 1200x1200', () => {
      const format = POST_FORMATS.facebook.feed_square
      expect(format.width).toBe(1200)
      expect(format.height).toBe(1200)
    })
  })
})
