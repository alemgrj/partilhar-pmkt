import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from 'boot/supabase'
import { useAuthStore } from './auth'

export const useWorkflowStore = defineStore('workflow', () => {
  const phases = ref([])
  const loading = ref(false)

  async function fetchPhases() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('workflow_phases')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error

      phases.value = data || []
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching phases:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function createPhase(phaseData) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('workflow_phases')
        .insert(phaseData)
        .select()
        .single()

      if (error) throw error

      phases.value.push(data)
      phases.value.sort((a, b) => a.order_index - b.order_index)
      return { success: true, data }
    } catch (error) {
      console.error('Error creating phase:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function updatePhase(id, phaseData) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('workflow_phases')
        .update(phaseData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const index = phases.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        phases.value[index] = data
        phases.value.sort((a, b) => a.order_index - b.order_index)
      }
      return { success: true, data }
    } catch (error) {
      console.error('Error updating phase:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function deletePhase(id) {
    loading.value = true
    try {
      const { error } = await supabase
        .from('workflow_phases')
        .delete()
        .eq('id', id)

      if (error) throw error

      phases.value = phases.value.filter((p) => p.id !== id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting phase:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function approvePost(postId, phaseKey, note) {
    const authStore = useAuthStore()
    loading.value = true

    try {
      const phase = phases.value.find((p) => p.key === phaseKey)

      if (!phase) {
        throw new Error('Fase não encontrada')
      }

      // 1. Criar registro de aprovação
      const { error: approvalError } = await supabase
        .from('post_approvals')
        .insert({
          post_id: postId,
          phase_key: phaseKey,
          approved_by: authStore.user.id,
          approval_note: note,
        })

      if (approvalError) throw approvalError

      // 2. Adicionar tag de aprovação (tipo 'approval')
      if (phase.approval_tag_label) {
        const { error: tagError } = await supabase
          .from('post_tags')
          .insert({
            post_id: postId,
            tag_type: 'approval',
            tag_value: phase.approval_tag_label,
          })

        if (tagError) throw tagError
      }

      // 3. Mover para próxima fase
      if (phase.next_phase_key) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ status: phase.next_phase_key })
          .eq('id', postId)

        if (updateError) throw updateError
      }

      return { success: true }
    } catch (error) {
      console.error('Error approving post:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  function getPhaseByKey(key) {
    return phases.value.find((p) => p.key === key)
  }

  function getPhaseTitleByKey(key) {
    const phase = getPhaseByKey(key)
    return phase ? phase.title : key
  }

  return {
    phases,
    loading,
    fetchPhases,
    createPhase,
    updatePhase,
    deletePhase,
    approvePost,
    getPhaseByKey,
    getPhaseTitleByKey,
  }
})
