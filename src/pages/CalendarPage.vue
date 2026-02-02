<template>
  <q-page class="calendar-page q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold">Calendário Editorial</div>
      <q-space />
        <q-btn
          color="primary"
          icon="add"
          label="Nova Postagem"
          to="/create"
        />
    </div>

    <div class="calendar-container">
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center q-mb-md">
            <q-btn
              flat
              round
              icon="chevron_left"
              @click="onPrev"
              class="q-mr-sm"
            />
            <div class="text-h6">{{ currentMonthYear }}</div>
            <q-btn
              flat
              round
              icon="chevron_right"
              @click="onNext"
              class="q-ml-sm"
            />
            <q-space />
            <q-btn flat label="Hoje" @click="onToday" />
          </div>

          <div class="calendar-grid">
            <div
              v-for="day in weekDays"
              :key="day"
              class="calendar-header-cell"
            >
              {{ day }}
            </div>

            <div
              v-for="day in calendarDays"
              :key="day.date"
              class="calendar-cell"
              :class="{
                'other-month': !day.isCurrentMonth,
                today: day.isToday,
              }"
            >
              <div class="day-number">{{ day.dayNumber }}</div>

              <div class="day-posts">
                <div
                  v-for="post in getPostsForDay(day.date)"
                  :key="post.id"
                  class="mini-post-card"
                  :class="`status-${post.status}`"
                  @click="openPostDetail(post.id)"
                >
                  <div class="mini-post-header">
                    <q-icon
                      :name="getSocialIcon(post.social_network)"
                      size="14px"
                    />
                    <div class="mini-post-time">
                      {{ formatTime(post.scheduled_date) }}
                    </div>
                  </div>
                  <div class="mini-post-title">
                    {{ post.campaign_name || 'Sem título' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Legenda de Status -->
      <q-card flat bordered class="q-mt-md">
        <q-card-section>
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            Legenda de Status
          </div>
          <div class="row q-gutter-md">
            <div
              v-for="status in statusLegend"
              :key="status.key"
              class="row items-center"
            >
              <div
                class="status-indicator"
                :style="{ backgroundColor: status.color }"
              ></div>
              <div class="text-caption">{{ status.label }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from 'stores/posts'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday as checkIsToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

const router = useRouter()
const postsStore = usePostsStore()

const currentDate = ref(new Date())

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const statusLegend = [
  { key: 'ideas', label: 'Ideias', color: '#9e9e9e' },
  { key: 'in_production', label: 'Em Produção', color: '#2196f3' },
  { key: 'ready_for_review', label: 'Pronto p/ Revisão', color: '#ff9800' },
  { key: 'adjustments_requested', label: 'Ajustes Solicitados', color: '#f44336' },
  { key: 'validated', label: 'Validado', color: '#4caf50' },
  { key: 'published', label: 'Publicado', color: '#9c27b0' },
]

const currentMonthYear = computed(() => {
  return format(currentDate.value, 'MMMM yyyy', { locale: ptBR })
})

const calendarDays = computed(() => {
  const monthStart = startOfMonth(currentDate.value)
  const monthEnd = endOfMonth(currentDate.value)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = []
  let day = calendarStart

  while (day <= calendarEnd) {
    days.push({
      date: format(day, 'yyyy-MM-dd'),
      dayNumber: format(day, 'd'),
      isCurrentMonth: isSameMonth(day, currentDate.value),
      isToday: checkIsToday(day),
    })
    day = addDays(day, 1)
  }

  return days
})

onMounted(() => {
  postsStore.fetchPosts()
})

function getPostsForDay(dateStr) {
  return postsStore.postsByDate[dateStr] || []
}

function getSocialIcon(network) {
  const icons = {
    instagram: 'photo_camera',
    tiktok: 'music_note',
    google_ads: 'ads_click',
    facebook: 'facebook',
  }
  return icons[network] || 'public'
}

function formatTime(date) {
  return format(new Date(date), 'HH:mm')
}

function onPrev() {
  currentDate.value = subMonths(currentDate.value, 1)
}

function onNext() {
  currentDate.value = addMonths(currentDate.value, 1)
}

function onToday() {
  currentDate.value = new Date()
}

function openPostDetail(postId) {
  router.push(`/post/${postId}`)
}
</script>

<style scoped lang="scss">
.calendar-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e0e0e0;
  border: 1px solid #e0e0e0;
}

.calendar-header-cell {
  background-color: #fff;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  color: #666;
}

.calendar-cell {
  background-color: #fff;
  min-height: 120px;
  padding: 8px;
  position: relative;

  &.other-month {
    background-color: #fafafa;
    opacity: 0.6;
  }

  &.today {
    background-color: #e3f2fd;

    .day-number {
      background-color: #2196f3;
      color: white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.day-number {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.day-posts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-post-card {
  background-color: #fff;
  border-left: 3px solid transparent;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 11px;

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &.status-ideas {
    border-left-color: #9e9e9e;
  }

  &.status-in_production {
    border-left-color: #2196f3;
  }

  &.status-ready_for_review {
    border-left-color: #ff9800;
  }

  &.status-adjustments_requested {
    border-left-color: #f44336;
  }

  &.status-validated {
    border-left-color: #4caf50;
  }

  &.status-published {
    border-left-color: #9c27b0;
  }
}

.mini-post-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.mini-post-time {
  font-weight: 600;
  color: #666;
}

.mini-post-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
}
</style>
