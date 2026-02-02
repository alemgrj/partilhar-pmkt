import { ref } from 'vue'
import { supabase } from 'boot/supabase'
import { uid } from 'quasar'

export function useFileUpload() {
  const uploading = ref(false)
  const progress = ref(0)

  /**
   * Faz upload de um arquivo para o Supabase Storage
   * @param {File} file - Arquivo para fazer upload
   * @param {string} bucket - Nome do bucket (default: 'post-creatives')
   * @param {string} folder - Pasta dentro do bucket (default: '')
   * @returns {Promise<{success: boolean, url?: string, path?: string, error?: string}>}
   */
  async function uploadFile(file, bucket = 'post-creatives', folder = '') {
    uploading.value = true
    progress.value = 0

    try {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use imagens (JPEG, PNG, GIF, WEBP) ou vídeos (MP4, WEBM, MOV)')
      }

      // Validar tamanho (50MB max)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 50MB')
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${uid()}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) throw error

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      progress.value = 100

      return {
        success: true,
        url: publicUrl,
        path: data.path,
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: error.message,
      }
    } finally {
      uploading.value = false
    }
  }

  /**
   * Faz upload de múltiplos arquivos
   * @param {File[]} files - Array de arquivos
   * @param {string} bucket - Nome do bucket
   * @param {string} folder - Pasta dentro do bucket
   * @returns {Promise<{success: boolean, files?: Array, errors?: Array}>}
   */
  async function uploadMultipleFiles(files, bucket = 'post-creatives', folder = '') {
    uploading.value = true
    const results = []
    const errors = []

    for (let i = 0; i < files.length; i++) {
      progress.value = Math.round(((i + 1) / files.length) * 100)

      const result = await uploadFile(files[i], bucket, folder)

      if (result.success) {
        results.push({
          url: result.url,
          path: result.path,
          name: files[i].name,
          type: files[i].type,
        })
      } else {
        errors.push({
          name: files[i].name,
          error: result.error,
        })
      }
    }

    uploading.value = false

    return {
      success: errors.length === 0,
      files: results,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  /**
   * Deleta um arquivo do Supabase Storage
   * @param {string} path - Caminho do arquivo
   * @param {string} bucket - Nome do bucket
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function deleteFile(path, bucket = 'post-creatives') {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path])

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting file:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Valida se um arquivo é imagem
   * @param {File} file - Arquivo para validar
   * @returns {boolean}
   */
  function isImage(file) {
    return file.type.startsWith('image/')
  }

  /**
   * Valida se um arquivo é vídeo
   * @param {File} file - Arquivo para validar
   * @returns {boolean}
   */
  function isVideo(file) {
    return file.type.startsWith('video/')
  }

  /**
   * Obtém dimensões de uma imagem
   * @param {File} file - Arquivo de imagem
   * @returns {Promise<{width: number, height: number, aspectRatio: number}>}
   */
  function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        const width = img.naturalWidth
        const height = img.naturalHeight
        const aspectRatio = width / height

        URL.revokeObjectURL(url)

        resolve({
          width,
          height,
          aspectRatio,
        })
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Erro ao carregar imagem'))
      }

      img.src = url
    })
  }

  /**
   * Obtém duração de um vídeo
   * @param {File} file - Arquivo de vídeo
   * @returns {Promise<number>} Duração em segundos
   */
  function getVideoDuration(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const url = URL.createObjectURL(file)

      video.onloadedmetadata = () => {
        const duration = video.duration
        URL.revokeObjectURL(url)
        resolve(duration)
      }

      video.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Erro ao carregar vídeo'))
      }

      video.src = url
    })
  }

  return {
    uploading,
    progress,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    isImage,
    isVideo,
    getImageDimensions,
    getVideoDuration,
  }
}
