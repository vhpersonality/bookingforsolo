<script setup lang="ts">
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Event, Service, Member } from '~/types'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()

const viewMode = ref<'day' | 'week'>('week')
const selectedDate = ref<Date>(route.query.date ? new Date(route.query.date as string) : new Date())
const selectedEvent = ref<Event | null>(null)
const selectedService = ref<Service | null>(null)
const clickedTimeSlot = ref<{ date: Date, time: string } | null>(null)
const bookingModalOpen = ref(false)

const weekStart = computed(() => startOfWeek(selectedDate.value, { locale: ru, weekStartsOn: 1 }))
const weekEnd = computed(() => endOfWeek(selectedDate.value, { locale: ru, weekStartsOn: 1 }))
const weekDays = computed(() => eachDayOfInterval({ start: weekStart.value, end: weekEnd.value }))

const dayHours = Array.from({ length: 11 }, (_, i) => 10 + i) // 10:00 - 20:00

// Получаем все события для отображения в календаре (без фильтрации по дате)
const { data: allEvents, refresh: refreshEvents } = await useFetch<Event[]>('/api/events')

const { data: services } = await useFetch<Service[]>('/api/services', {
  default: () => []
})

const { data: members } = await useFetch<Member[]>('/api/members', {
  default: () => []
})

const events = computed(() => {
  if (!allEvents.value) return []
  if (viewMode.value === 'day') {
    const dateStr = format(selectedDate.value, 'yyyy-MM-dd')
    return allEvents.value.filter(e => e.date === dateStr)
  }
  // Для недельного вида возвращаем все события для отображения в календаре
  return allEvents.value
})

function getEventsForDate(date: Date): Event[] {
  if (!allEvents.value) return []
  const dateStr = format(date, 'yyyy-MM-dd')
  return allEvents.value.filter(e => e.date === dateStr)
}

function getEventPosition(event: Event, date: Date): { top: string, height: string } {
  const [startHour, startMinute] = event.startTime.split(':').map(Number)
  const duration = event.duration

  const startMinutes = startHour * 60 + startMinute
  const endMinutes = startMinutes + duration

  const dayStartMinutes = 10 * 60 // 10:00 AM
  const relativeStart = startMinutes - dayStartMinutes
  const totalDayMinutes = 11 * 60 // 10:00 AM - 21:00 (11 hours)

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

function getEventEmployeeName(employeeId?: number): string {
  if (!employeeId || !members.value) return ''
  const member = members.value.find(m => m.id === employeeId)
  return member?.name || ''
}

function openBookingModal(event?: Event, date?: Date, time?: string) {
  selectedEvent.value = event || null
  selectedService.value = null
  
  if (!event && date && time) {
    // Клик на свободную ячейку
    clickedTimeSlot.value = { date, time }
  } else {
    clickedTimeSlot.value = null
  }
  
  bookingModalOpen.value = true
}

async function handleBookingSaved() {
  bookingModalOpen.value = false
  selectedEvent.value = null
  selectedService.value = null
  clickedTimeSlot.value = null
  // Обновляем данные событий после записи
  await refreshEvents()
}

function navigateDate(direction: 'prev' | 'next') {
  const days = viewMode.value === 'day' ? 1 : 7
  selectedDate.value = addDays(selectedDate.value, direction === 'prev' ? -days : days)
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

function handleTimeSlotClick(day: Date, hour: number) {
  const time = `${hour.toString().padStart(2, '0')}:00`
  openBookingModal(undefined, day, time)
}

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <UDashboardPanel id="schedule">
    <template #header>
      <UDashboardNavbar :title="viewMode === 'day' ? format(selectedDate, 'd MMMM, EEEE', { locale: ru }) : `Неделя ${format(weekStart, 'd MMM', { locale: ru })} - ${format(weekEnd, 'd MMM', { locale: ru })}`">
        <template #leading>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
              <span class="text-white font-bold text-lg">B</span>
            </div>
            <span class="text-lg font-semibold">BooklyLite</span>
          </div>
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <UButton
              :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
              color="neutral"
              variant="ghost"
              square
              @click="toggleColorMode"
            />
            
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="ghost"
              square
              @click="navigateDate('prev')"
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
              @click="navigateDate('next')"
            />

            <UTabs
              v-model="viewMode"
              :items="[
                { label: 'День', value: 'day' },
                { label: 'Неделя', value: 'week' }
              ]"
              size="sm"
            />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex-1 overflow-auto">
        <!-- Дневной вид -->
        <div v-if="viewMode === 'day'" class="relative h-full">
          <div class="flex">
            <!-- Временная шкала -->
            <div class="w-20 shrink-0 pt-12">
              <div
                v-for="hour in dayHours"
                :key="hour"
                class="h-24 border-b border-default flex items-start justify-end pr-2 text-xs text-muted"
              >
                {{ hour }}:00
              </div>
            </div>

            <!-- Расписание -->
            <div class="flex-1 relative pt-12">
              <div
                v-for="hour in dayHours"
                :key="hour"
                class="h-24 border-b border-default relative"
              >
                <!-- Полчаса -->
                <div class="absolute top-12 left-0 right-0 h-12 border-t border-dashed border-default/50" />
              </div>

              <!-- События -->
              <div class="absolute inset-0">
                <div
                  v-for="event in getEventsForDate(selectedDate)"
                  :key="`event-${event.id}`"
                  class="absolute left-2 right-2 rounded-md p-2 bg-purple-500 text-white text-sm cursor-pointer hover:opacity-90 transition-opacity border-2 border-purple-600 z-10"
                  :style="getEventPosition(event, selectedDate)"
                  @click.stop="openBookingModal(event)"
                >
                  <div class="font-medium">{{ event.startTime }} {{ event.name }}</div>
                  <div class="text-xs opacity-90">
                    <span v-if="event.serviceId">{{ getServiceName(event.serviceId) }}</span>
                    <span v-if="event.employeeId" :class="event.serviceId ? 'ml-2' : ''">{{ getEventEmployeeName(event.employeeId) }}</span>
                    <span class="ml-2">{{ event.bookedSlots }}/{{ event.maxParticipants }} мест</span>
                  </div>
                </div>
              </div>

              <!-- Кликабельные ячейки для записи (под событиями) -->
              <div class="absolute inset-0 pointer-events-none">
                <div
                  v-for="hour in dayHours"
                  :key="hour"
                  class="absolute left-0 right-0 cursor-pointer hover:bg-primary/5 transition-colors pointer-events-auto"
                  :style="{
                    top: `${((hour - 10) * 96)}px`,
                    height: '96px'
                  }"
                  @click="handleTimeSlotClick(selectedDate, hour)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Недельный вид -->
        <div v-else class="flex-1 overflow-auto">
          <div class="flex">
            <!-- Временная шкала -->
            <div class="w-20 shrink-0 pt-12">
              <div
                v-for="hour in dayHours"
                :key="hour"
                class="h-24 border-b border-default flex items-start justify-end pr-2 text-xs text-muted"
              >
                {{ hour }}:00
              </div>
            </div>

            <!-- Дни недели -->
            <div class="flex-1 grid grid-cols-7">
              <div
                v-for="day in weekDays"
                :key="day.getTime()"
                class="border-l border-default"
              >
                <!-- Заголовок дня -->
                <div
                  class="border-b border-default p-2 text-center"
                  :class="isSameDay(day, new Date()) ? 'bg-primary/10' : ''"
                >
                  <div class="text-xs text-muted">{{ format(day, 'EEE', { locale: ru }) }}</div>
                  <div class="text-sm font-medium">{{ format(day, 'd') }}</div>
                </div>

                <!-- Временные слоты -->
                <div class="relative">
                  <div
                    v-for="hour in dayHours"
                    :key="hour"
                    class="h-24 border-b border-default relative"
                  >
                    <div class="absolute top-12 left-0 right-0 h-12 border-t border-dashed border-default/50" />
                  </div>

                  <!-- События для этого дня -->
                  <div class="absolute inset-0">
                    <div
                      v-for="event in getEventsForDate(day)"
                      :key="`event-${event.id}`"
                      class="absolute left-1 right-1 rounded-md p-1.5 bg-purple-500 text-white text-xs cursor-pointer hover:opacity-90 transition-opacity border border-purple-600 z-10"
                      :style="getEventPosition(event, day)"
                      @click.stop="openBookingModal(event)"
                    >
                      <div class="font-medium truncate">{{ event.startTime }} {{ event.name }}</div>
                      <div class="truncate text-xs/90">
                        <span v-if="event.serviceId">{{ getServiceName(event.serviceId) }}</span>
                        <span v-if="event.employeeId" :class="event.serviceId ? 'ml-1' : ''">{{ getEventEmployeeName(event.employeeId) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Кликабельные ячейки для записи (под событиями) -->
                  <div class="absolute inset-0 pointer-events-none">
                    <div
                      v-for="hour in dayHours"
                      :key="hour"
                      class="absolute left-0 right-0 cursor-pointer hover:bg-primary/5 transition-colors pointer-events-auto"
                      :style="{
                        top: `${((hour - 10) * 96)}px`,
                        height: '96px'
                      }"
                      @click="handleTimeSlotClick(day, hour)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Booking Modal -->
  <PublicBookingModal
    v-model="bookingModalOpen"
    :event="selectedEvent"
    :service="selectedService"
    :time-slot="clickedTimeSlot"
    @saved="handleBookingSaved"
  />
</template>
