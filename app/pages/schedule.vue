<script setup lang="ts">
import { format, startOfDay, endOfDay, eachDayOfInterval, startOfWeek, endOfWeek, addDays, isSameDay, parse } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Booking, Member, Event, Service } from '~/types'
import { h, resolveComponent } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()

const UBadge = resolveComponent('UBadge')
const UAvatar = resolveComponent('UAvatar')

const viewMode = ref<'day' | 'week'>('week')

// Нормализуем дату из query параметра
function parseDateFromQuery(dateStr: string | undefined): Date {
  if (!dateStr) return startOfDay(new Date())
  try {
    return startOfDay(parse(dateStr, 'yyyy-MM-dd', new Date()))
  } catch {
    return startOfDay(new Date())
  }
}

const selectedDate = ref<Date>(route.query.date ? parseDateFromQuery(route.query.date as string) : startOfDay(new Date()))

const { data: bookings } = await useFetch<Booking[]>('/api/bookings', {
  query: computed(() => ({
    date: viewMode.value === 'day' ? format(selectedDate.value, 'yyyy-MM-dd') : undefined
  }))
})

const { data: services } = await useFetch<Service[]>('/api/services', {
  default: () => []
})

const { data: allBookings } = await useFetch<Booking[]>('/api/bookings')

const { data: allEvents, refresh: refreshEvents } = await useFetch<Event[]>('/api/events')

const events = computed(() => {
  if (!allEvents.value) return []
  if (viewMode.value === 'day') {
    const dateStr = format(selectedDate.value, 'yyyy-MM-dd')
    return allEvents.value.filter(e => e.date === dateStr)
  }
  // Для недельного вида возвращаем все события для отображения в календаре
  return allEvents.value
})

const eventModalOpen = ref(false)

// Получаем все даты с бронированиями для календаря
const bookingsDates = computed(() => {
  if (!allBookings.value) return []
  return [...new Set(allBookings.value.map(b => b.date))]
})

// Для недельного вида
const weekStart = computed(() => startOfWeek(selectedDate.value, { locale: ru }))
const weekEnd = computed(() => endOfWeek(selectedDate.value, { locale: ru }))
const weekDays = computed(() => eachDayOfInterval({ start: weekStart.value, end: weekEnd.value }))

// Для дневного вида - дни недели для мини-календаря
const dayViewWeekDays = computed(() => {
  const start = startOfWeek(selectedDate.value, { locale: ru, weekStartsOn: 1 })
  return eachDayOfInterval({ start, end: endOfWeek(selectedDate.value, { locale: ru, weekStartsOn: 1 }) })
})

// Для дневного вида
const dayHours = computed(() => {
  const hours = []
  for (let i = 1; i <= 24; i++) {
    hours.push(i)
  }
  return hours
})

function getBookingsForDate(date: Date): Booking[] {
  if (!bookings.value) return []
  const dateStr = format(date, 'yyyy-MM-dd')
  return bookings.value.filter(b => b.date === dateStr)
}

function getBookingsForTimeSlot(date: Date, hour: number, minute: number = 0): Booking[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  
  return (bookings.value || []).filter(b => {
    if (b.date !== dateStr) return false
    const [startHour, startMinute] = b.startTime.split(':').map(Number)
    const [endHour, endMinute] = b.endTime.split(':').map(Number)
    
    const slotTime = hour * 60 + minute
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute
    
    return slotTime >= startTime && slotTime < endTime
  })
}

function getBookingPosition(booking: Booking, date: Date): { top: string, height: string } {
  const [startHour, startMinute] = booking.startTime.split(':').map(Number)
  const [endHour, endMinute] = booking.endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  const duration = endMinutes - startMinutes
  
  // Начало дня в 1:00 = 60 минут
  const dayStartMinutes = 1 * 60
  const relativeStart = startMinutes - dayStartMinutes
  const totalDayMinutes = 24 * 60 // 1:00 - 24:00 = 24 часа
  
  const topPercent = (relativeStart / totalDayMinutes) * 100
  const heightPercent = (duration / totalDayMinutes) * 100
  
  return {
    top: `${topPercent}%`,
    height: `${heightPercent}%`
  }
}

function getEventPosition(event: Event, date: Date): { top: string, height: string } {
  const [startHour, startMinute] = event.startTime.split(':').map(Number)
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = startMinutes + event.duration
  
  // Начало дня в 1:00 = 60 минут
  const dayStartMinutes = 1 * 60
  const relativeStart = startMinutes - dayStartMinutes
  const totalDayMinutes = 24 * 60 // 1:00 - 24:00 = 24 часа
  
  const topPercent = (relativeStart / totalDayMinutes) * 100
  const heightPercent = (event.duration / totalDayMinutes) * 100
  
  return {
    top: `${topPercent}%`,
    height: `${heightPercent}%`
  }
}

function getEventsForDate(date: Date): Event[] {
  if (!allEvents.value) return []
  const dateStr = format(date, 'yyyy-MM-dd')
  return allEvents.value.filter(e => e.date === dateStr)
}

function getServiceName(serviceId?: number): string {
  if (!serviceId || !services.value) return ''
  const service = services.value.find(s => s.id === serviceId)
  return service?.name || ''
}

function handleEventSaved() {
  refreshEvents()
}

function navigateDate(direction: 'prev' | 'next') {
  if (viewMode.value === 'day') {
    selectedDate.value = addDays(selectedDate.value, direction === 'prev' ? -1 : 1)
  } else {
    selectedDate.value = addDays(selectedDate.value, direction === 'prev' ? -7 : 7)
  }
  updateRoute()
}

function goToToday() {
  selectedDate.value = new Date()
  updateRoute()
}

function updateRoute() {
  router.push({
    path: '/schedule',
    query: {
      date: format(selectedDate.value, 'yyyy-MM-dd'),
      view: viewMode.value
    }
  })
}

// Синхронизируем selectedDate с route.query.date
const isUpdatingFromRoute = ref(false)
watch(() => route.query.date, (dateStr) => {
  if (dateStr && typeof dateStr === 'string') {
    const newDate = parseDateFromQuery(dateStr)
    if (!isSameDay(newDate, selectedDate.value)) {
      isUpdatingFromRoute.value = true
      selectedDate.value = newDate
      nextTick(() => {
        isUpdatingFromRoute.value = false
      })
    }
  }
}, { immediate: true })

watch(selectedDate, () => {
  if (!isUpdatingFromRoute.value) {
    updateRoute()
  }
})
watch(viewMode, () => updateRoute())
</script>

<template>
  <UDashboardPanel id="schedule">
    <template #header>
      <UDashboardNavbar :title="viewMode === 'day' ? format(selectedDate, 'd MMMM, EEEE', { locale: ru }) : `Неделя ${format(weekStart, 'd MMM', { locale: ru })} - ${format(weekEnd, 'd MMM', { locale: ru })}`">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-external-link"
              color="neutral"
              variant="ghost"
              size="sm"
              label="Как это выглядит"
              @click="window.open('/booking', '_blank')"
            />
            <UButton
              icon="i-lucide-plus"
              color="primary"
              size="sm"
              @click="eventModalOpen = true"
            >
              Создать событие
            </UButton>
            
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
          <!-- Мини-календарь дней недели -->
          <div class="flex border-b border-default mb-2">
            <div class="w-20 shrink-0"></div>
            <div class="flex-1 grid grid-cols-7">
              <div
                v-for="day in dayViewWeekDays"
                :key="day.getTime()"
                class="border-l border-default p-2 text-center cursor-pointer transition-colors"
                :class="{
                  'bg-primary/10': isSameDay(day, selectedDate),
                  'hover:bg-elevated/50': !isSameDay(day, selectedDate)
                }"
                @click="selectedDate = day; updateRoute()"
              >
                <div class="text-xs text-muted">{{ format(day, 'EEE', { locale: ru }) }}</div>
                <div class="text-sm font-medium">{{ format(day, 'd') }}</div>
              </div>
            </div>
          </div>

          <div class="flex">
            <!-- Временная шкала -->
            <div class="w-20 shrink-0 pt-12">
              <div
                v-for="hour in dayHours"
                :key="hour"
                class="h-12 border-b border-default flex items-start justify-end pr-2 text-xs text-muted"
              >
                {{ hour }}:00
              </div>
            </div>

            <!-- Расписание -->
            <div class="flex-1 relative pt-12">
              <div
                v-for="hour in dayHours"
                :key="hour"
                class="h-12 border-b border-default relative"
              >
                <!-- Полчаса -->
                <div class="absolute top-6 left-0 right-0 h-6 border-t border-dashed border-default/50" />
              </div>

              <!-- Бронирования -->
              <div class="absolute inset-0">
                <div
                  v-for="booking in getBookingsForDate(selectedDate)"
                  :key="booking.id"
                  class="absolute left-2 right-2 rounded-md p-2 text-white text-sm cursor-pointer hover:opacity-90 transition-opacity"
                  :style="getBookingPosition(booking, selectedDate)"
                  :class="{
                    'bg-green-500': booking.status === 'confirmed',
                    'bg-yellow-500': booking.status === 'pending',
                    'bg-red-500': booking.status === 'cancelled',
                    'bg-blue-500': booking.status === 'completed'
                  }"
                >
                  <div class="font-medium">{{ booking.startTime }} {{ booking.serviceName }}</div>
                  <div class="text-xs opacity-90">{{ booking.customerName }}</div>
                </div>
              </div>

              <!-- События -->
              <div class="absolute inset-0">
                <div
                  v-for="event in getEventsForDate(selectedDate)"
                  :key="`event-${event.id}`"
                  class="absolute left-2 right-2 rounded-md p-2 bg-purple-500 text-white text-sm cursor-pointer hover:opacity-90 transition-opacity border-2 border-purple-600"
                  :style="getEventPosition(event, selectedDate)"
                >
                  <div class="font-medium">{{ event.startTime }} {{ event.name }}</div>
                  <div class="text-xs opacity-90">
                    <span v-if="event.serviceId">{{ getServiceName(event.serviceId) }}</span>
                    <span class="ml-2">{{ event.bookedSlots }}/{{ event.maxParticipants }} мест</span>
                  </div>
                </div>
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
                class="h-12 border-b border-default flex items-start justify-end pr-2 text-xs text-muted"
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
                    class="h-12 border-b border-default relative"
                  >
                    <div class="absolute top-6 left-0 right-0 h-6 border-t border-dashed border-default/50" />
                  </div>

                  <!-- Бронирования для этого дня -->
                  <div class="absolute inset-0">
                    <div
                      v-for="booking in getBookingsForDate(day)"
                      :key="booking.id"
                      class="absolute left-1 right-1 rounded-md p-1.5 text-white text-xs cursor-pointer hover:opacity-90 transition-opacity"
                      :style="getBookingPosition(booking, day)"
                      :class="{
                        'bg-green-500': booking.status === 'confirmed',
                        'bg-yellow-500': booking.status === 'pending',
                        'bg-red-500': booking.status === 'cancelled',
                        'bg-blue-500': booking.status === 'completed'
                      }"
                    >
                      <div class="font-medium truncate">{{ booking.startTime }}</div>
                      <div class="truncate">{{ booking.serviceName }}</div>
                    </div>

                    <!-- События для этого дня -->
                    <div
                      v-for="event in getEventsForDate(day)"
                      :key="`event-${event.id}`"
                      class="absolute left-1 right-1 rounded-md p-1.5 bg-purple-500 text-white text-xs cursor-pointer hover:opacity-90 transition-opacity border border-purple-600"
                      :style="getEventPosition(event, day)"
                    >
                      <div class="font-medium truncate">{{ event.startTime }} {{ event.name }}</div>
                      <div class="truncate text-xs/90">
                        <span v-if="event.serviceId">{{ getServiceName(event.serviceId) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <ScheduleEventModal
    v-model="eventModalOpen"
    :default-date="selectedDate"
    @saved="handleEventSaved"
  />
</template>