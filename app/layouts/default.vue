<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { Booking } from '~/types'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const open = ref(false)
const selectedScheduleDate = ref<Date>(route.path === '/' && route.query.date ? new Date(route.query.date as string) : new Date())

const { data: scheduleBookings } = await useFetch<Booking[]>('/api/bookings', {
  default: () => []
})

function handleDateSelect(date: Date) {
  selectedScheduleDate.value = date
  if (route.path !== '/') {
    router.push({
      path: '/',
      query: {
        date: date.toISOString().split('T')[0]
      }
    })
  } else {
    router.push({
      query: {
        ...route.query,
        date: date.toISOString().split('T')[0]
      }
    })
  }
}

watch(() => route.query.date, (date) => {
  if (date && route.path === '/') {
    selectedScheduleDate.value = new Date(date as string)
  }
})

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
