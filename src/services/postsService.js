import { supabase } from 'boot/supabase'

/**
 * Serviço para operações relacionadas a posts
 */
export const postsService = {
  /**
   * Adiciona criativos a um post
   * @param {string} postId - ID do post
   * @param {Array<{url: string, type: string}>} creatives - Array de criativos
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async addCreatives(postId, creatives) {
    try {
      const creativesData = creatives.map((creative, index) => ({
        post_id: postId,
        file_url: creative.url,
        file_type: creative.type,
        order_index: index,
      }))

      const { data, error } = await supabase
        .from('post_creatives')
        .insert(creativesData)
        .select()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error adding creatives:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Remove um criativo
   * @param {string} creativeId - ID do criativo
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async removeCreative(creativeId) {
    try {
      const { error } = await supabase
        .from('post_creatives')
        .delete()
        .eq('id', creativeId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error removing creative:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Adiciona tags a um post
   * @param {string} postId - ID do post
   * @param {Array<{type: string, value: string}>} tags - Array de tags
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async addTags(postId, tags) {
    try {
      const tagsData = tags.map((tag) => ({
        post_id: postId,
        tag_type: tag.type,
        tag_value: tag.value,
      }))

      const { data, error } = await supabase
        .from('post_tags')
        .insert(tagsData)
        .select()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error adding tags:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Remove uma tag
   * @param {string} tagId - ID da tag
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async removeTag(tagId) {
    try {
      const { error } = await supabase
        .from('post_tags')
        .delete()
        .eq('id', tagId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error removing tag:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Busca posts com filtros
   * @param {Object} filters - Filtros a aplicar
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async searchPosts(filters = {}) {
    try {
      let query = supabase
        .from('posts')
        .select(
          `
          *,
          created_by_user:created_by(id, name, avatar_url),
          responsible_user:responsible_user_id(id, name, avatar_url),
          post_creatives(*),
          post_tags(*)
        `
        )
        .is('deleted_at', null)

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.social_network) {
        query = query.eq('social_network', filters.social_network)
      }

      if (filters.post_type) {
        query = query.eq('post_type', filters.post_type)
      }

      if (filters.responsible_user_id) {
        query = query.eq('responsible_user_id', filters.responsible_user_id)
      }

      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by)
      }

      if (filters.start_date) {
        query = query.gte('scheduled_date', filters.start_date)
      }

      if (filters.end_date) {
        query = query.lte('scheduled_date', filters.end_date)
      }

      if (filters.search) {
        query = query.or(
          `campaign_name.ilike.%${filters.search}%,caption.ilike.%${filters.search}%`
        )
      }

      query = query.order('scheduled_date', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error searching posts:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Busca estatísticas de posts
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getStatistics() {
    try {
      // Buscar todos os posts não deletados
      const { data: posts, error } = await supabase
        .from('posts')
        .select('status, social_network, post_type')
        .is('deleted_at', null)

      if (error) throw error

      // Calcular estatísticas
      const stats = {
        total: posts.length,
        byStatus: {},
        bySocialNetwork: {},
        byType: {
          organic: 0,
          paid: 0,
        },
      }

      posts.forEach((post) => {
        // Por status
        stats.byStatus[post.status] = (stats.byStatus[post.status] || 0) + 1

        // Por rede social
        stats.bySocialNetwork[post.social_network] =
          (stats.bySocialNetwork[post.social_network] || 0) + 1

        // Por tipo
        stats.byType[post.post_type]++
      })

      return { success: true, data: stats }
    } catch (error) {
      console.error('Error getting statistics:', error)
      return { success: false, error: error.message }
    }
  },
}

export default postsService
