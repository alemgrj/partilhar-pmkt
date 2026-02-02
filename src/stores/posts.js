import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from 'boot/supabase'
import { useAuthStore } from './auth'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const loading = ref(false)
  const selectedPost = ref(null)
  const updating = ref(new Set()) // IDs dos posts sendo atualizados

  const postsByStatus = computed(() => {
    const grouped = {
      ideas: [],
      in_production: [],
      ready_for_review: [],
      adjustments_requested: [],
      validated: [],
      published: [],
    }

    posts.value.forEach((post) => {
      if (post.deleted_at === null && grouped[post.status]) {
        grouped[post.status].push(post)
      }
    })

    return grouped
  })

  const postsByDate = computed(() => {
    const grouped = {}

    posts.value.forEach((post) => {
      if (post.deleted_at === null) {
        const date = new Date(post.scheduled_date).toISOString().split('T')[0]
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(post)
      }
    })

    return grouped
  })

  async function fetchPosts() {
    loading.value = true
    try {
      const { data, error } = await supabase
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
        .order('scheduled_date', { ascending: true })

      if (error) throw error

      posts.value = data || []
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching posts:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function fetchPostById(id) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          created_by_user:created_by(id, name, avatar_url),
          responsible_user:responsible_user_id(id, name, avatar_url),
          post_creatives(*),
          post_tags(*),
          post_comments(*, user:user_id(id, name, avatar_url))
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      selectedPost.value = data
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching post:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function createPost(postData) {
    const authStore = useAuthStore()
    loading.value = true

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          created_by: authStore.user.id,
          responsible_user_id: postData.responsible_user_id || authStore.user.id,
        })
        .select()
        .single()

      if (error) throw error

      posts.value.push(data)
      return { success: true, data }
    } catch (error) {
      console.error('Error creating post:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function updatePost(id, updates) {
    loading.value = true
    try {
      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError

      // Buscar dados completos atualizados (com relacionamentos)
      const { data, error: selectError } = await supabase
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
        .eq('id', id)
        .single()

      if (selectError) throw selectError

      // Atualizar no array de posts (in-place, sem criar novo array)
      const index = posts.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        // Object.assign mantém a referência do array e apenas atualiza o objeto
        Object.assign(posts.value[index], data)
      }

      // Atualizar selectedPost se for o mesmo
      if (selectedPost.value?.id === id) {
        selectedPost.value = data
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error updating post:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id, newStatus) {
    // Evitar múltiplas atualizações simultâneas do mesmo post
    if (updating.value.has(id)) {
      console.warn('⚠️ Post já está sendo atualizado:', id)
      return { success: false, error: 'Operação em andamento' }
    }

    updating.value.add(id)

    try {
      return await updatePost(id, { status: newStatus })
    } finally {
      updating.value.delete(id)
    }
  }

  async function deletePost(id) {
    loading.value = true
    try {
      const { error } = await supabase
        .from('posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      posts.value = posts.value.filter((p) => p.id !== id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting post:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function addComment(postId, comment) {
    const authStore = useAuthStore()
    loading.value = true

    try {
      // Buscar status atual do post
      const post = posts.value.find((p) => p.id === postId) || selectedPost.value

      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: authStore.user.id,
          comment,
          phase_status: post?.status, // Vincular à fase atual
          role_id: authStore.user.role_id, // Papel do usuário
        })
        .select('*, user:user_id(id, name, avatar_url, role_id), role:role_id(id, name, color, icon)')
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error adding comment:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  return {
    posts,
    loading,
    selectedPost,
    postsByStatus,
    postsByDate,
    fetchPosts,
    fetchPostById,
    createPost,
    updatePost,
    updateStatus,
    deletePost,
    addComment,
  }
})
