<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { Booking } from '~/types'
import { isSameDay, format, startOfDay, parse } from 'date-fns'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const open = ref(false)

// Нормализуем дату из query параметра
function parseDateFromQuery(dateStr: string | undefined): Date {
  if (!dateStr) return startOfDay(new Date())
  // Используем parse для правильной интерпретации даты в формате yyyy-MM-dd
  try {
    return startOfDay(parse(dateStr, 'yyyy-MM-dd', new Date()))
  } catch {
    return startOfDay(new Date())
  }
}

const selectedScheduleDate = ref<Date>(route.path === '/' && route.query.date ? parseDateFromQuery(route.query.date as string) : startOfDay(new Date()))

const { data: scheduleBookings } = await useFetch<Booking[]>('/api/bookings', {
  default: () => []
})

function handleDateSelect(date: Date) {
  // Нормализуем дату перед сохранением
  const normalizedDate = startOfDay(date)
  selectedScheduleDate.value = normalizedDate
  // Используем format вместо toISOString для правильной работы с локальным временем
  const dateStr = format(normalizedDate, 'yyyy-MM-dd')
  if (route.path !== '/') {
    router.push({
      path: '/',
      query: {
        date: dateStr
      }
    })
  } else {
    router.push({
      query: {
        ...route.query,
        date: dateStr
      }
    })
  }
}

// Синхронизируем selectedScheduleDate с route.query.date
watch(() => route.query.date, (dateStr) => {
  if (dateStr && typeof dateStr === 'string' && route.path === '/') {
    const newDate = parseDateFromQuery(dateStr)
    if (!isSameDay(newDate, selectedScheduleDate.value)) {
      selectedScheduleDate.value = newDate
    }
  }
}, { immediate: true })

const links = [[{
  label: 'Расписание',
  icon: 'i-lucide-calendar',
  to: '/',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Сотрудники',
  icon: 'i-lucide-user-circle',
  to: '/employees',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Услуги',
  icon: 'i-lucide-scissors',
  to: '/services',
  onSelect: () => {
    open.value = false
  }
}], [{
  label: 'Обратная связь',
  icon: 'i-lucide-message-circle',
  to: 'https://github.com/nuxt-ui-templates/dashboard',
  target: '_blank'
}, {
  label: 'Помощь и поддержка',
  icon: 'i-lucide-info',
  to: 'https://github.com/nuxt-ui-templates/dashboard',
  target: '_blank'
}]] satisfies NavigationMenuItem[][]

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'Мы используем собственные cookies для улучшения вашего опыта на нашем сайте.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Принять',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Отказаться',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <ScheduleSidebarCalendar
          v-if="!collapsed"
          :selected-date="selectedScheduleDate"
          :bookings="scheduleBookings"
          @update:selected-date="handleDateSelect"
          class="mb-4"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
