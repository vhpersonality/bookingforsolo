<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Service, Member } from '~/types'
import { h, resolveComponent } from 'vue'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()

const { data: services, refresh: refreshServices } = await useFetch<Service[]>('/api/services', {
  default: () => []
})

const { data: members } = await useFetch<Member[]>('/api/members', {
  default: () => []
})

const q = ref('')

const filteredServices = computed(() => {
  if (!q.value) return services.value
  return services.value.filter((service) => {
    return service.name.toLowerCase().includes(q.value.toLowerCase()) ||
           service.description?.toLowerCase().includes(q.value.toLowerCase())
  })
})

function getMemberName(memberId: number): string {
  const index = memberId - 1
  return members.value[index]?.name || `Сотрудник #${memberId}`
}

const editingService = ref<Service | null>(null)

function getRowItems(service: Service) {
  return [
    {
      type: 'label',
      label: 'Действия'
    },
    {
      label: 'Редактировать',
      icon: 'i-lucide-edit',
      onSelect: () => {
        editingService.value = service
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Удалить',
      icon: 'i-lucide-trash',
      color: 'error' as const,
      onSelect: () => {
        toast.add({
          title: 'Услуга удалена',
          description: `Услуга "${service.name}" была удалена`,
          color: 'success'
        })
      }
    }
  ]
}

const columns: TableColumn<Service>[] = [
  {
    accessorKey: 'name',
    header: 'Название',
    cell: ({ row }) => {
      return h('div', { class: 'flex flex-col' }, [
        h('p', { class: 'font-medium text-highlighted' }, row.original.name),
        row.original.description
          ? h('p', { class: 'text-sm text-muted line-clamp-1' }, row.original.description)
          : null
      ])
    }
  },
  {
    accessorKey: 'duration',
    header: 'Длительность',
    cell: ({ row }) => {
      const duration = row.original.duration
      return duration ? `${duration} мин` : '-'
    }
  },
  {
    accessorKey: 'price',
    header: 'Цена',
    cell: ({ row }) => {
      const price = row.original.price
      return price
        ? h('span', { class: 'font-medium' }, `${price.toLocaleString('ru-RU')} ₽`)
        : '-'
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row.original)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
]
</script>

<template>
  <UDashboardPanel id="services">
    <template #header>
      <UDashboardNavbar title="Услуги">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <ServicesServiceModal
            :service="editingService || undefined"
            @saved="() => { refreshServices(); editingService = null }"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5 mb-4">
        <UInput
          v-model="q"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Поиск услуг..."
        />
      </div>

      <UTable
        :data="filteredServices"
        :columns="columns"
        class="shrink-0"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }"
      />
    </template>
  </UDashboardPanel>
</template>

