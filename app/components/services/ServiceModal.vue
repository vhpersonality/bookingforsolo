<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Service } from '~/types'

const props = defineProps<{
  service?: Service
}>()

const emit = defineEmits<{
  saved: []
  close: []
}>()

const schema = z.object({
  name: z.string().min(2, 'Слишком короткое'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Минимум 1 минута').optional(),
  price: z.number().min(0, 'Цена не может быть отрицательной').optional(),
  active: z.boolean().default(true)
})

type Schema = z.output<typeof schema>

const open = ref(false)

watch(() => props.service, (service) => {
  if (service) {
    open.value = true
  }
})
const state = reactive<Partial<Schema>>({
  name: undefined,
  description: undefined,
  duration: undefined,
  price: undefined,
  active: true
})

watch(() => props.service, (service) => {
  if (service) {
    state.name = service.name
    state.description = service.description
    state.duration = service.duration
    state.price = service.price
    state.active = service.active
  } else {
    state.name = undefined
    state.description = undefined
    state.duration = undefined
    state.price = undefined
    state.active = true
  }
}, { immediate: true })

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Успешно',
    description: props.service ? `Услуга "${event.data.name}" обновлена` : `Новая услуга "${event.data.name}" создана`,
    color: 'success'
  })
  open.value = false
  // Сброс формы
  state.name = undefined
  state.description = undefined
  state.duration = undefined
  state.price = undefined
  state.active = true
  emit('saved')
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="service ? 'Редактировать услугу' : 'Новая услуга'"
    :description="service ? 'Изменить информацию об услуге' : 'Создать новую услугу'"
  >
    <UButton
      :label="service ? 'Редактировать' : 'Новая услуга'"
      icon="i-lucide-plus"
    />

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Название" placeholder="Название услуги" name="name" required>
          <UInput v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField label="Описание" placeholder="Описание услуги" name="description">
          <UTextarea v-model="state.description" class="w-full" :rows="3" />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Длительность (мин)" placeholder="30" name="duration">
            <UInput v-model.number="state.duration" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Цена (₽)" placeholder="1000" name="price">
            <UInput v-model.number="state.price" type="number" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Активна" name="active">
          <USwitch v-model="state.active" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Отмена"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton
            :label="service ? 'Сохранить' : 'Создать'"
            color="primary"
            variant="solid"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

