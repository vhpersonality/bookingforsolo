<script setup lang="ts">
import type { Event } from '~/types'
import { format } from 'date-fns'

const props = defineProps<{
  event?: Event
  defaultDate?: Date
}>()

const emit = defineEmits<{
  saved: []
  close: []
}>()

const toast = useToast()
const isOpen = defineModel<boolean>({ default: false })

const form = reactive({
  name: '',
  description: '',
  maxParticipants: 10,
  date: props.defaultDate ? format(props.defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
  startTime: '10:00',
  duration: 60
})

const durationOptions = [
  { label: '30 минут', value: 30 },
  { label: '45 минут', value: 45 },
  { label: '1 час', value: 60 },
  { label: '1.5 часа', value: 90 },
  { label: '2 часа', value: 120 }
]

watch(() => props.event, (event) => {
  if (event) {
    form.name = event.name
    form.description = event.description || ''
    form.maxParticipants = event.maxParticipants
    form.date = event.date
    form.startTime = event.startTime
    form.duration = event.duration
  }
}, { immediate: true })

watch(() => props.defaultDate, (date) => {
  if (date) {
    form.date = format(date, 'yyyy-MM-dd')
  }
})

async function onSubmit() {
  try {
    if (props.event) {
      await $fetch('/api/events', {
        method: 'PATCH',
        body: {
          id: props.event.id,
          ...form
        }
      })
    } else {
      await $fetch('/api/events', {
        method: 'POST',
        body: form
      })
    }

    toast.add({
      title: 'Успешно',
      description: props.event ? 'Событие обновлено' : 'Событие создано',
      color: 'success'
    })

    emit('saved')
    isOpen.value = false
  } catch (error) {
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось сохранить событие',
      color: 'error'
    })
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="event ? 'Редактировать событие' : 'Создать событие'"
    :description="event ? 'Обновить информацию о событии' : 'Создать новое групповое занятие или событие'"
    :ui="{ width: 'sm:max-w-2xl' }"
  >
    <template #body>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <UFormField label="Название" required>
          <UInput
            v-model="form.name"
            placeholder="Например: Йога для начинающих"
            required
          />
        </UFormField>

        <UFormField label="Описание">
          <UTextarea
            v-model="form.description"
            placeholder="Описание события..."
            :rows="3"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Дата" required>
            <UInput
              v-model="form.date"
              type="date"
              required
            />
          </UFormField>

          <UFormField label="Время начала" required>
            <UInput
              v-model="form.startTime"
              type="time"
              required
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Продолжительность" required>
            <USelect
              v-model="form.duration"
              :items="durationOptions"
              required
            />
          </UFormField>

          <UFormField label="Количество мест" required>
            <UInput
              v-model.number="form.maxParticipants"
              type="number"
              min="1"
              required
            />
          </UFormField>
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
            label="Сохранить"
            color="primary"
          />
        </div>
      </form>
    </template>
  </UModal>
</template>
