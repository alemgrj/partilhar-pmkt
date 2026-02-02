<template>
  <div class="creative-alerts">
    <q-banner
      v-for="(alert, index) in alerts"
      :key="index"
      :class="`bg-${getAlertColor(alert.severity)}`"
      class="q-mb-sm"
      dense
    >
      <template v-slot:avatar>
        <q-icon :name="getAlertIcon(alert.severity)" size="sm" />
      </template>

      <div class="text-body2">
        <strong>{{ getAlertTitle(alert.type) }}:</strong> {{ alert.message }}
      </div>

      <div v-if="alert.details" class="text-caption q-mt-xs">
        {{ formatDetails(alert) }}
      </div>
    </q-banner>

    <div v-if="alerts.length === 0 && showSuccess" class="text-center q-py-md">
      <q-icon name="check_circle" color="positive" size="md" />
      <div class="text-caption text-positive q-mt-xs">
        Todos os criativos estão dentro dos padrões
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  validations: {
    type: Array,
    default: () => [],
  },
  showSuccess: {
    type: Boolean,
    default: true,
  },
})

const alerts = computed(() => {
  // Filtrar apenas alertas (warnings e errors)
  return props.validations.filter(
    (v) => v.severity === 'error' || v.severity === 'warning' || v.severity === 'info'
  )
})

function getAlertColor(severity) {
  const colors = {
    error: 'negative',
    warning: 'warning',
    info: 'info',
    success: 'positive',
  }
  return colors[severity] || 'grey'
}

function getAlertIcon(severity) {
  const icons = {
    error: 'error',
    warning: 'warning',
    info: 'info',
    success: 'check_circle',
  }
  return icons[severity] || 'info'
}

function getAlertTitle(type) {
  const titles = {
    format: 'Formato',
    fileSize: 'Tamanho do Arquivo',
    duration: 'Duração',
    resolution: 'Resolução',
    aspectRatio: 'Proporção',
    carousel: 'Carrossel',
  }
  return titles[type] || 'Validação'
}

function formatDetails(alert) {
  if (!alert.details) return ''

  const details = []

  switch (alert.type) {
    case 'aspectRatio':
      if (alert.details.width && alert.details.height) {
        details.push(
          `Dimensões: ${alert.details.width}x${alert.details.height}`,
          `Proporção atual: ${alert.details.ratio.toFixed(2)}:1`
        )
      }
      break

    case 'resolution':
      if (alert.minResolution) {
        details.push(
          `Mínimo recomendado: ${alert.minResolution.width}x${alert.minResolution.height}`
        )
      }
      break

    case 'duration':
      if (alert.limits) {
        details.push(
          `Intervalo ideal: ${alert.limits.min}s - ${alert.limits.max}s`,
          `Duração ideal: ${alert.limits.ideal}s`
        )
      }
      break

    case 'fileSize':
      details.push(`Tamanho: ${alert.sizeMB}MB`)
      break

    case 'format':
      if (alert.allowedFormats) {
        details.push(`Formatos permitidos: ${alert.allowedFormats.join(', ')}`)
      }
      break
  }

  return details.join(' • ')
}
</script>

<style scoped lang="scss">
.creative-alerts {
  .q-banner {
    border-radius: 8px;
    border-left: 4px solid currentColor;
  }
}
</style>
