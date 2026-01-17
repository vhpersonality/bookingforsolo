<script setup lang="ts">
import type { Event, Service } from '~/types'

const props = defineProps<{
  event?: Event | null
  service?: Service | null
}>()

const emit = defineEmits<{
  saved: []
  close: []
}>()

const toast = useToast()
const isOpen = defineModel<boolean>({ default: false })

const form = reactive({
  name: '',
  email: '',
  phone: '',
  notes: ''
})

const isSubmitting = ref(false)

function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.notes = ''
}

watch(isOpen, (open) => {
  if (!open) {
    resetForm()
  }
})

async function onSubmit() {
  if (!form.name || !form.email || !form.phone) {
    toast.add({
      title: 'Ошибка',
      description: 'Пожалуйста, заполните все обязательные поля',
      color: 'error'
    })
    return
  }

  isSubmitting.value = true

  try {
    if (props.event) {
      // Запись на событие - создаем бронирование и обновляем bookedSlots
      await $fetch('/api/bookings', {
        method: 'POST',
        body: {
          eventId: props.event.id,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          notes: form.notes,
          date: props.event.date,
          startTime: props.event.startTime,
          duration: props.event.duration
        }
      })
      
      // Обновляем bookedSlots события
      if (props.event.bookedSlots < props.event.maxParticipants) {
        await $fetch('/api/events', {
          method: 'PATCH',
          body: {
            id: props.event.id,
            bookedSlots: props.event.bookedSlots + 1
          }
        })
      }
    } else if (props.service) {
      // Запись на услугу
      await $fetch('/api/bookings', {
        method: 'POST',
        body: {
          serviceId: props.service.id,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          notes: form.notes
        }
      })
    }

    toast.add({
      title: 'Успешно',
      description: 'Запись успешно создана. Мы свяжемся с вами в ближайшее время.',
      color: 'success'
    })

    emit('saved')
    isOpen.value = false
  } catch (error: any) {
    toast.add({
      title: 'Ошибка',
      description: error.data?.message || 'Не удалось создать запись. Попробуйте позже.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

const modalTitle = computed(() => {
  if (props.event) {
    return `Запись на событие: ${props.event.name}`
  }
  if (props.service) {
    return `Запись на услугу: ${props.service.name}`
  }
  return 'Запись'
})

const modalDescription = computed(() => {
  if (props.event) {
    return `${props.event.description || ''} ${props.event.date} в ${props.event.startTime}`
  }
  if (props.service) {
    return props.service.description || ''
  }
  return ''
})
</script>

<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-lg' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold">{{ modalTitle }}</h3>
            <p v-if="modalDescription" class="text-sm text-gray-500 mt-1">{{ modalDescription }}</p>
          </div>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            square
            @click="isOpen = false"
          />
        </div>
      </template>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <UFormField label="Имя" required>
          <UInput
            v-model="form.name"
            placeholder="Введите ваше имя"
            required
          />
        </UFormField>

        <UFormField label="Email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="example@mail.com"
            required
          />
        </UFormField>

        <UFormField label="Телефон" required>
          <UInput
            v-model="form.phone"
            type="tel"
            placeholder="+7 (999) 999-99-99"
            required
          />
        </UFormField>

        <UFormField label="Комментарий (необязательно)">
          <UTextarea
            v-model="form.notes"
            placeholder="Дополнительная информация..."
            :rows="3"
          />
        </UFormField>

        <div v-if="event" class="p-3 bg-gray-50 rounded-lg text-sm">
          <div class="flex justify-between mb-1">
            <span class="text-gray-600">Свободных мест:</span>
            <span class="font-medium">{{ event.maxParticipants - event.bookedSlots }} из {{ event.maxParticipants }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <UButton
            label="Отмена"
            color="neutral"
            variant="ghost"
            type="button"
            @click="isOpen = false"
          />
          <UButton
            type="submit"
            label="Записаться"
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          />
        </div>
      </form>
    </UCard>
  </UModal>
</template>
