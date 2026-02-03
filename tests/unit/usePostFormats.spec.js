/**
 * Testes para o composable usePostFormats
 * 
 * Para executar:
 * npm run test:unit tests/unit/usePostFormats.spec.js
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { usePostFormats } from 'src/composables/usePostFormats'

describe('usePostFormats', () => {
  let composable

  beforeEach(() => {
    composable = usePostFormats()
    composable.reset()
  })

  describe('Inicialização', () => {
    it('deve iniciar com valores null', () => {
      expect(composable.selectedPlatform.value).toBeNull()
      expect(composable.selectedFormat.value).toBeNull()
    })

    it('deve ter availableFormats vazio inicialmente', () => {
      expect(composable.availableFormats.value).toEqual([])
    })

    it('deve ter currentFormatConfig null inicialmente', () => {
      expect(composable.currentFormatConfig.value).toBeNull()
    })
  })

  describe('setPlatform', () => {
    it('deve definir a plataforma corretamente', () => {
      composable.setPlatform('instagram')
      expect(composable.selectedPlatform.value).toBe('instagram')
    })

    it('deve auto-selecionar formato principal do Instagram', () => {
      composable.setPlatform('instagram')
      expect(composable.selectedFormat.value).toBe('reels')
    })

    it('deve auto-selecionar formato principal do Facebook', () => {
      composable.setPlatform('facebook')
      expect(composable.selectedFormat.value).toBe('feed_square')
    })

    it('deve auto-selecionar formato principal do TikTok', () => {
      composable.setPlatform('tiktok')
      expect(composable.selectedFormat.value).toBe('default')
    })

    it('deve popular availableFormats após selecionar plataforma', () => {
      composable.setPlatform('instagram')
      expect(composable.availableFormats.value).toHaveLength(3)
      expect(composable.availableFormats.value[0]).toHaveProperty('label')
      expect(composable.availableFormats.value[0]).toHaveProperty('value')
      expect(composable.availableFormats.value[0]).toHaveProperty('ratio')
    })
  })

  describe('setFormat', () => {
    it('deve definir formato manualmente', () => {
      composable.setPlatform('instagram')
      composable.setFormat('feed_square')
      expect(composable.selectedFormat.value).toBe('feed_square')
    })
  })

  describe('currentFormatConfig', () => {
    it('deve retornar config do formato Instagram Reels', () => {
      composable.setPlatform('instagram')
      composable.setFormat('reels')
      
      const config = composable.currentFormatConfig.value
      expect(config).toBeDefined()
      expect(config.ratio).toBe(9/16)
      expect(config.aspectRatio).toBe('9:16')
      expect(config.width).toBe(1080)
      expect(config.height).toBe(1920)
    })

    it('deve retornar config do formato Facebook Feed', () => {
      composable.setPlatform('facebook')
      composable.setFormat('feed_square')
      
      const config = composable.currentFormatConfig.value
      expect(config.ratio).toBe(1)
      expect(config.aspectRatio).toBe('1:1')
    })
  })

  describe('currentFormatTips', () => {
    it('deve retornar dicas para Instagram Reels', () => {
      composable.setPlatform('instagram')
      composable.setFormat('reels')
      
      const tips = composable.currentFormatTips.value
      expect(tips).toBeInstanceOf(Array)
      expect(tips.length).toBeGreaterThan(0)
    })

    it('deve retornar dicas para TikTok', () => {
      composable.setPlatform('tiktok')
      composable.setFormat('default')
      
      const tips = composable.currentFormatTips.value
      expect(tips).toBeInstanceOf(Array)
      expect(tips.length).toBeGreaterThan(0)
    })
  })

  describe('validateImageFormat', () => {
    beforeEach(() => {
      composable.setPlatform('instagram')
      composable.setFormat('reels')
    })

    it('deve validar proporção correta (9:16)', () => {
      const result = composable.validateImageFormat(1080, 1920)
      expect(result.isValid).toBe(true)
      expect(result.message).toContain('ideal')
    })

    it('deve invalidar proporção incorreta', () => {
      const result = composable.validateImageFormat(1920, 1080)
      expect(result.isValid).toBe(false)
      expect(result.message).toContain('fora')
    })

    it('deve aceitar tolerância de 5%', () => {
      // 1080:1910 é aproximadamente 9:16 com pequena diferença
      const result = composable.validateImageFormat(1080, 1910)
      expect(result.isValid).toBe(true)
    })

    it('deve rejeitar fora da tolerância', () => {
      const result = composable.validateImageFormat(1080, 1800)
      expect(result.isValid).toBe(false)
    })

    it('deve retornar null se não houver formato selecionado', () => {
      composable.reset()
      const result = composable.validateImageFormat(1080, 1920)
      expect(result.isValid).toBe(false)
      expect(result.message).toContain('Nenhum formato')
    })
  })

  describe('getIdealDimensions', () => {
    beforeEach(() => {
      composable.setPlatform('instagram')
      composable.setFormat('reels') // 9:16
    })

    it('deve calcular dimensões ideais para imagem mais larga', () => {
      // Imagem 1920x1080 (16:9) para 9:16
      const result = composable.getIdealDimensions(1920, 1080)
      expect(result.width).toBe(Math.round(1080 * (9/16)))
      expect(result.height).toBe(1080)
    })

    it('deve calcular dimensões ideais para imagem mais alta', () => {
      // Imagem 1080x2400 para 9:16
      const result = composable.getIdealDimensions(1080, 2400)
      expect(result.width).toBe(1080)
      expect(result.height).toBe(Math.round(1080 / (9/16)))
    })

    it('deve retornar dimensões originais se já estiver correto', () => {
      const result = composable.getIdealDimensions(1080, 1920)
      expect(result.width).toBe(1080)
      expect(result.height).toBe(1920)
    })
  })

  describe('getCropInfo', () => {
    beforeEach(() => {
      composable.setPlatform('instagram')
      composable.setFormat('feed_square') // 1:1
    })

    it('deve indicar crop horizontal necessário', () => {
      // Imagem landscape precisa crop nas laterais
      const info = composable.getCropInfo(1920, 1080)
      expect(info.needsCrop).toBe(true)
      expect(info.cropType).toBe('horizontal')
      expect(info.dimensions.height).toBe(1080)
      expect(info.dimensions.width).toBeLessThan(1920)
    })

    it('deve indicar crop vertical necessário', () => {
      // Imagem portrait precisa crop em cima/baixo
      const info = composable.getCropInfo(1080, 1920)
      expect(info.needsCrop).toBe(true)
      expect(info.cropType).toBe('vertical')
      expect(info.dimensions.width).toBe(1080)
      expect(info.dimensions.height).toBeLessThan(1920)
    })

    it('deve indicar que não precisa crop se já estiver correto', () => {
      const info = composable.getCropInfo(1080, 1080)
      expect(info.needsCrop).toBe(false)
      expect(info.cropType).toBeNull()
      expect(info.lossPercentage).toBe(0)
    })

    it('deve calcular percentual de perda', () => {
      const info = composable.getCropInfo(1920, 1080)
      expect(parseFloat(info.lossPercentage)).toBeGreaterThan(0)
      expect(parseFloat(info.lossPercentage)).toBeLessThan(100)
    })
  })

  describe('getPriorityColor', () => {
    it('deve retornar cor verde para principal', () => {
      expect(composable.getPriorityColor('principal')).toBe('green')
    })

    it('deve retornar cor azul para muito aceito', () => {
      expect(composable.getPriorityColor('muito aceito')).toBe('blue')
    })

    it('deve retornar cor laranja para aceito', () => {
      expect(composable.getPriorityColor('aceito')).toBe('orange')
    })

    it('deve retornar cor roxa para absoluto', () => {
      expect(composable.getPriorityColor('absoluto')).toBe('deep-purple')
    })

    it('deve retornar cinza para prioridade desconhecida', () => {
      expect(composable.getPriorityColor('desconhecido')).toBe('grey')
    })
  })

  describe('getAllFormats', () => {
    it('deve retornar todos os formatos', () => {
      const formats = composable.getAllFormats()
      expect(formats).toHaveProperty('instagram')
      expect(formats).toHaveProperty('facebook')
      expect(formats).toHaveProperty('tiktok')
    })

    it('deve ter estrutura correta para Instagram', () => {
      const formats = composable.getAllFormats()
      expect(formats.instagram).toHaveProperty('reels')
      expect(formats.instagram).toHaveProperty('feed_portrait')
      expect(formats.instagram).toHaveProperty('feed_square')
    })
  })

  describe('reset', () => {
    it('deve resetar todas as seleções', () => {
      composable.setPlatform('instagram')
      composable.setFormat('reels')
      
      expect(composable.selectedPlatform.value).not.toBeNull()
      expect(composable.selectedFormat.value).not.toBeNull()
      
      composable.reset()
      
      expect(composable.selectedPlatform.value).toBeNull()
      expect(composable.selectedFormat.value).toBeNull()
    })
  })

  describe('Fluxo completo', () => {
    it('deve simular fluxo completo de usuário', () => {
      // 1. Usuário seleciona plataforma
      composable.setPlatform('instagram')
      expect(composable.selectedPlatform.value).toBe('instagram')
      expect(composable.selectedFormat.value).toBe('reels') // auto-selecionado
      
      // 2. Verifica formatos disponíveis
      const formats = composable.availableFormats.value
      expect(formats.length).toBe(3)
      
      // 3. Usuário troca formato
      composable.setFormat('feed_square')
      expect(composable.selectedFormat.value).toBe('feed_square')
      
      // 4. Faz upload de imagem e valida
      const validation = composable.validateImageFormat(1080, 1080)
      expect(validation.isValid).toBe(true)
      
      // 5. Verifica info de crop (não precisa)
      const cropInfo = composable.getCropInfo(1080, 1080)
      expect(cropInfo.needsCrop).toBe(false)
      
      // 6. Obtém dicas
      const tips = composable.currentFormatTips.value
      expect(tips.length).toBeGreaterThan(0)
    })

    it('deve simular fluxo com necessidade de crop', () => {
      // 1. Seleciona TikTok (9:16 obrigatório)
      composable.setPlatform('tiktok')
      expect(composable.selectedFormat.value).toBe('default')
      
      // 2. Upload de imagem landscape
      const validation = composable.validateImageFormat(1920, 1080)
      expect(validation.isValid).toBe(false)
      
      // 3. Verifica info de crop
      const cropInfo = composable.getCropInfo(1920, 1080)
      expect(cropInfo.needsCrop).toBe(true)
      expect(cropInfo.cropType).toBe('horizontal')
      
      // 4. Calcula dimensões ideais
      const idealDims = composable.getIdealDimensions(1920, 1080)
      expect(idealDims.height).toBe(1080)
      expect(idealDims.width).toBeLessThan(1920)
      
      // 5. Após crop, valida novamente
      const newValidation = composable.validateImageFormat(
        idealDims.width,
        idealDims.height
      )
      expect(newValidation.isValid).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('deve lidar com plataforma inválida', () => {
      composable.setPlatform('inexistente')
      expect(composable.availableFormats.value).toEqual([])
    })

    it('deve lidar com formato inválido', () => {
      composable.setPlatform('instagram')
      composable.setFormat('inexistente')
      expect(composable.currentFormatConfig.value).toBeUndefined()
    })

    it('deve lidar com dimensões zero', () => {
      composable.setPlatform('instagram')
      composable.setFormat('reels')
      
      const result = composable.validateImageFormat(0, 0)
      expect(result.isValid).toBe(false)
    })

    it('deve lidar com dimensões negativas', () => {
      composable.setPlatform('instagram')
      composable.setFormat('reels')
      
      const result = composable.validateImageFormat(-1080, 1920)
      expect(result.isValid).toBe(false)
    })
  })
})
