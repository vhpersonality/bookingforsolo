<script setup lang="ts">
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, startOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Event, Service, Member } from '~/types'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()

const selectedDate = ref<Date>(route.query.date ? new Date(route.query.date as string) : new Date())
const selectedEvent = ref<Event | null>(null)
const selectedService = ref<Service | null>(null)
const bookingModalOpen = ref(false)

const weekStart = computed(() => startOfWeek(selectedDate.value, { locale: ru, weekStartsOn: 1 }))
const weekEnd = computed(() => endOfWeek(selectedDate.value, { locale: ru, weekStartsOn: 1 }))
const weekDays = computed(() => eachDayOfInterval({ start: weekStart.value, end: weekEnd.value }))

const { data: events, refresh: refreshEvents } = await useFetch<Event[]>('/api/events', {
  query: computed(() => ({
    date: format(selectedDate.value, 'yyyy-MM-dd')
  }))
})

const { data: services } = await useFetch<Service[]>('/api/services', {
  default: () => []
})

const { data: members } = await useFetch<Member[]>('/api/members', {
  default: () => []
})

function getEventsForDate(date: Date): Event[] {
  if (!events.value) return []
  const dateStr = format(date, 'yyyy-MM-dd')
  return events.value.filter(e => e.date === dateStr)
}

function getServicesForDate(date: Date): Service[] {
  // Показываем все доступные услуги для записи
  return services.value || []
}

function getEventPosition(event: Event, date: Date): { top: string, height: string } {
  const [startHour, startMinute] = event.startTime.split(':').map(Number)
  const duration = event.duration

  const startMinutes = startHour * 60 + startMinute
  const endMinutes = startMinutes + duration

  const dayStartMinutes = 10 * 60 // 10:00 AM
  const totalDayMinutes = 11 * 60 // 10:00 AM - 9:00 PM (11 hours)

  const relativeStart = startMinutes - dayStartMinutes
  const topPercent = (relativeStart / totalDayMinutes) * 100
  const heightPercent = (duration / totalDayMinutes) * 100

  return {
    top: `${topPercent}%`,
    height: `${heightPercent}%`
  }
}

function getServiceName(serviceId?: number): string {
  if (!serviceId || !services.value) return ''
  const service = services.value.find(s => s.id === serviceId)
  return service?.name || ''
}

function getEmployeeName(employeeId?: number): string {
  if (!employeeId || !members.value) return ''
  const member = members.value.find(m => m.id === employeeId)
  return member?.name || ''
}

function openBookingModal(event?: Event, service?: Service) {
  selectedEvent.value = event || null
  selectedService.value = service || null
  bookingModalOpen.value = true
}

async function handleBookingSaved() {
  bookingModalOpen.value = false
  selectedEvent.value = null
  selectedService.value = null
  // Обновляем данные событий после записи
  await refreshEvents()
}

function navigateWeek(direction: 'prev' | 'next') {
  selectedDate.value = addDays(selectedDate.value, direction === 'prev' ? -7 : 7)
  router.push({
    query: {
      ...route.query,
      date: format(selectedDate.value, 'yyyy-MM-dd')
    }
  })
}

function goToToday() {
  selectedDate.value = new Date()
  router.push({
    query: {
      ...route.query,
      date: format(selectedDate.value, 'yyyy-MM-dd')
    }
  })
}

const hours = Array.from({ length: 11 }, (_, i) => 10 + i) // 10:00 - 20:00
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header с логотипом -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">B</span>
          </div>
          <h1 class="text-xl font-semibold text-gray-900">BooklyLite</h1>
        </div>
        <div class="text-sm text-gray-500">
          Онлайн-запись
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Navigation -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-chevron-left"
            color="neutral"
            variant="ghost"
            square
            @click="navigateWeek('prev')"
          />
          <UButton
            label="Сегодня"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="goToToday"
          />
          <UButton
            icon="i-lucide-chevron-right"
            color="neutral"
            variant="ghost"
            square
            @click="navigateWeek('next')"
          />
          <h2 class="text-lg font-semibold text-gray-900 ml-4">
            {{ format(weekStart, 'd MMM', { locale: ru }) }} - {{ format(weekEnd, 'd MMM', { locale: ru }) }}
          </h2>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="flex">
          <!-- Time Column -->
          <div class="w-20 border-r border-gray-200 pt-12">
            <div
              v-for="hour in hours"
              :key="hour"
              class="h-20 border-b border-gray-100 flex items-start justify-end pr-2 pt-1"
            >
              <span class="text-xs text-gray-500">{{ hour }}:00</span>
            </div>
          </div>

          <!-- Week Days -->
          <div class="flex-1 grid grid-cols-7">
            <div
              v-for="day in weekDays"
              :key="day.getTime()"
              class="border-l border-gray-200"
            >
              <!-- Day Header -->
              <div class="border-b border-gray-200 p-3 text-center bg-gray-50">
                <div class="text-sm font-medium text-gray-900">
                  {{ format(day, 'EEEE', { locale: ru }) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ format(day, 'd MMM', { locale: ru }) }}
                </div>
              </div>

              <!-- Day Content -->
              <div class="relative">
                <!-- Hour Lines -->
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="h-20 border-b border-gray-100"
                />

                <!-- Events and Services -->
                <div class="absolute inset-0">
                  <!-- Events -->
                  <div
                    v-for="event in getEventsForDate(day)"
                    :key="`event-${event.id}`"
                    class="absolute left-1 right-1 rounded-md p-2 bg-purple-500 text-white text-xs cursor-pointer hover:opacity-90 transition-opacity border border-purple-600"
                    :style="getEventPosition(event, day)"
                    @click="openBookingModal(event)"
                  >
                    <div class="font-medium truncate">{{ event.startTime }} {{ event.name }}</div>
                    <div class="truncate text-xs/90 mt-0.5">
                      <span v-if="event.serviceId">{{ getServiceName(event.serviceId) }}</span>
                      <span v-if="event.employeeId" :class="event.serviceId ? 'ml-1' : ''">{{ getEmployeeName(event.employeeId) }}</span>
                      <span class="ml-1">({{ event.bookedSlots }}/{{ event.maxParticipants }})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Services List -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Доступные услуги</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard
            v-for="service in services"
            :key="service.id"
            class="cursor-pointer hover:shadow-md transition-shadow"
            @click="openBookingModal(undefined, service)"
          >
            <div class="p-4">
              <h4 class="font-medium text-gray-900 mb-1">{{ service.name }}</h4>
              <p class="text-sm text-gray-500 mb-3">{{ service.description }}</p>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">{{ service.duration }} мин</span>
                <span class="font-semibold text-primary-600">{{ service.price }} ₽</span>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </main>

    <!-- Booking Modal -->
    <PublicBookingModal
      v-model="bookingModalOpen"
      :event="selectedEvent"
      :service="selectedService"
      @saved="handleBookingSaved"
    />
  </div>
</template>
