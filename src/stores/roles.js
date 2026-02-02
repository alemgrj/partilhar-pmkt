import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from 'boot/supabase'

export const useRolesStore = defineStore('roles', () => {
  const roles = ref([])
  const loading = ref(false)

  async function fetchRoles() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      roles.value = data || []
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching roles:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function createRole(roleData) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert(roleData)
        .select()
        .single()

      if (error) throw error

      roles.value.push(data)
      roles.value.sort((a, b) => a.name.localeCompare(b.name))
      return { success: true, data }
    } catch (error) {
      console.error('Error creating role:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function updateRole(id, roleData) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('roles')
        .update(roleData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const index = roles.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        roles.value[index] = data
      }
      return { success: true, data }
    } catch (error) {
      console.error('Error updating role:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function deleteRole(id) {
    loading.value = true
    try {
      // Verificar se há usuários com este papel
      const { data: usersWithRole, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('role_id', id)
        .limit(1)

      if (checkError) throw checkError

      if (usersWithRole && usersWithRole.length > 0) {
        throw new Error('Não é possível excluir um papel que possui usuários vinculados')
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id)

      if (error) throw error

      roles.value = roles.value.filter((r) => r.id !== id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting role:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function getUserCountByRole(roleId) {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role_id', roleId)

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('Error counting users:', error)
      return 0
    }
  }

  return {
    roles,
    loading,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    getUserCountByRole,
  }
})
