<template>
  <q-page class="post-detail-page">
    <PostDetailModal
      v-model="showModal"
      :post-id="postId"
      @update:model-value="handleClose"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PostDetailModal from 'components/PostDetailModal.vue'

const route = useRoute()
const router = useRouter()

const showModal = ref(false)
const postId = ref(route.params.id)

onMounted(() => {
  showModal.value = true
})

function handleClose(value) {
  if (!value) {
    router.back()
  }
}
</script>

<style scoped lang="scss">
.post-detail-page {
  background-color: #f5f5f5;
}
</style>
