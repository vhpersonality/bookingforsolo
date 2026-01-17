<script setup lang="ts">
import type { Event, Service } from '~/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const props = defineProps<{
  event?: Event | null
  service?: Service | null
  timeSlot?: { date: Date, time: string } | null
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
  notes: '',
  date: '',
  time: ''
})

const isSubmitting = ref(false)

const { data: services } = await useFetch<Service[]>('/api/services', {
  default: () => []
})

const selectedServiceId = ref<number | null>(null)

function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.notes = ''
  form.date = ''
  form.time = ''
}

watch(isOpen, (open) => {
  if (open) {
    if (props.timeSlot) {
      form.date = format(props.timeSlot.date, 'yyyy-MM-dd')
      form.time = props.timeSlot.time
      selectedServiceId.value = null
    } else if (props.event) {
      form.date = props.event.date
      form.time = props.event.startTime
      selectedServiceId.value = props.event.serviceId || null
    } else {
      form.date = format(new Date(), 'yyyy-MM-dd')
      form.time = '10:00'
      selectedServiceId.value = null
    }
  } else {
    resetForm()
    selectedServiceId.value = null
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

  // Если запись на свободное время - требуется выбор услуги
  if (props.timeSlot && !selectedServiceId.value) {
    toast.add({
      title: 'Ошибка',
      description: 'Пожалуйста, выберите услугу',
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
    } else if (props.service || selectedServiceId.value) {
      // Запись на услугу (через клик на услугу или выбор в модальном окне)
      const serviceId = selectedServiceId.value || props.service?.id
      const service = services.value?.find(s => s.id === serviceId)
      
      if (!service) {
        throw new Error('Услуга не найдена')
      }

      await $fetch('/api/bookings', {
        method: 'POST',
        body: {
          serviceId: service.id,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          notes: form.notes,
          date: form.date || format(new Date(), 'yyyy-MM-dd'),
          startTime: form.time || '10:00',
          duration: service.duration
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
  if (props.timeSlot) {
    return 'Запись на свободное время'
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
  if (props.timeSlot) {
    return `${format(props.timeSlot.date, 'd MMMM', { locale: ru })} в ${props.timeSlot.time}`
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

        <!-- Поля даты и времени для записи на свободное время -->
        <div v-if="timeSlot" class="grid grid-cols-2 gap-4">
          <UFormField label="Дата" required>
            <UInput
              v-model="form.date"
              type="date"
              required
            />
          </UFormField>

          <UFormField label="Время" required>
            <UInput
              v-model="form.time"
              type="time"
              required
            />
          </UFormField>
        </div>

        <!-- Выбор услуги для записи на свободное время -->
        <UFormField v-if="timeSlot" label="Услуга" required>
          <USelect
            v-model="selectedServiceId"
            :items="[
              { label: 'Выберите услугу', value: null },
              ...(services || []).map(s => ({ label: `${s.name} (${s.duration} мин, ${s.price} ₽)`, value: s.id }))
            ]"
            placeholder="Выберите услугу"
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
