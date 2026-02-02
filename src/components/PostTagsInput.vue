<template>
  <div class="post-tags-input">
    <div class="tags-list q-mb-sm">
      <q-chip
        v-for="tag in tags"
        :key="tag.id"
        removable
        @remove="removeTag(tag)"
        :color="getTagColor(tag.tag_type)"
        text-color="white"
        size="md"
      >
        <q-icon
          :name="getTagIcon(tag.tag_type)"
          size="sm"
          class="q-mr-xs"
        />
        {{ tag.tag_value }}
      </q-chip>
    </div>

    <div class="row q-gutter-sm">
      <q-select
        v-model="newTagType"
        :options="tagTypeOptions"
        label="Tipo de Tag"
        outlined
        dense
        style="min-width: 150px"
        emit-value
        map-options
      />

      <q-input
        v-model="newTagValue"
        label="Valor da Tag"
        outlined
        dense
        class="col"
        @keyup.enter="addTag"
      >
        <template v-slot:append>
          <q-btn
            round
            dense
            flat
            icon="add"
            @click="addTag"
            :disable="!canAddTag"
          />
        </template>
      </q-input>
    </div>

    <!-- Tags Sugeridas -->
    <div v-if="suggestedTags.length > 0" class="suggested-tags q-mt-sm">
      <div class="text-caption text-grey-7 q-mb-xs">Tags Sugeridas:</div>
      <div class="row q-gutter-xs">
        <q-chip
          v-for="(tag, index) in suggestedTags"
          :key="index"
          clickable
          @click="addSuggestedTag(tag)"
          :color="getTagColor(tag.type)"
          text-color="white"
          size="sm"
        >
          <q-icon :name="getTagIcon(tag.type)" size="xs" class="q-mr-xs" />
          {{ tag.value }}
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const tags = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const newTagType = ref('objective')
const newTagValue = ref('')

const tagTypeOptions = [
  { label: 'Objetivo', value: 'objective' },
  { label: 'Produto', value: 'product' },
]

const suggestedTags = ref([
  { type: 'objective', value: 'Venda' },
  { type: 'objective', value: 'Conteúdo' },
  { type: 'objective', value: 'Autoridade' },
  { type: 'objective', value: 'Engajamento' },
  { type: 'product', value: 'Partilhar' },
  { type: 'product', value: 'Blog' },
  { type: 'product', value: 'Landing Page' },
  { type: 'product', value: 'Consultoria' },
])

const canAddTag = computed(() => {
  return newTagType.value && newTagValue.value.trim().length > 0
})

function getTagColor(type) {
  const colors = {
    objective: 'purple',
    product: 'blue',
  }
  return colors[type] || 'grey'
}

function getTagIcon(type) {
  const icons = {
    objective: 'flag',
    product: 'inventory_2',
  }
  return icons[type] || 'label'
}

function addTag() {
  if (!canAddTag.value) return

  const newTag = {
    id: `temp-${Date.now()}`,
    tag_type: newTagType.value,
    tag_value: newTagValue.value.trim(),
  }

  tags.value = [...tags.value, newTag]
  newTagValue.value = ''
}

function addSuggestedTag(tag) {
  // Verificar se a tag já existe
  const exists = tags.value.some(
    (t) => t.tag_type === tag.type && t.tag_value === tag.value
  )

  if (exists) return

  const newTag = {
    id: `temp-${Date.now()}`,
    tag_type: tag.type,
    tag_value: tag.value,
  }

  tags.value = [...tags.value, newTag]
}

function removeTag(tag) {
  tags.value = tags.value.filter((t) => t.id !== tag.id)
}
</script>

<style scoped lang="scss">
.post-tags-input {
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .suggested-tags {
    padding: 12px;
    background: #f5f5f5;
    border-radius: 8px;
  }
}
</style>
