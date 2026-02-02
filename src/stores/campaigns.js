import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from 'boot/supabase'
import { useAuthStore } from './auth'

export const useCampaignsStore = defineStore('campaigns', () => {
  const campaigns = ref([])
  const loading = ref(false)

  async function fetchCampaigns() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .is('deleted_at', null)
        .in('status', ['draft', 'active'])
        .order('name', { ascending: true })

      if (error) throw error

      campaigns.value = data || []
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function createCampaign(campaignData) {
    const authStore = useAuthStore()
    loading.value = true

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...campaignData,
          created_by: authStore.user.id,
        })
        .select()
        .single()

      if (error) throw error

      campaigns.value.push(data)
      return { success: true, data }
    } catch (error) {
      console.error('Error creating campaign:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  return {
    campaigns,
    loading,
    fetchCampaigns,
    createCampaign,
  }
})
