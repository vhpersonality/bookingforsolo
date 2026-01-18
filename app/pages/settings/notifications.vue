<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const state = reactive<{ [key: string]: boolean }>({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true
})

const sections = [{
  title: 'Каналы уведомлений',
  description: 'Где мы можем уведомлять вас?',
  fields: [{
    name: 'email',
    label: 'Email',
    description: 'Получать ежедневную сводку по email.'
  }, {
    name: 'desktop',
    label: 'Рабочий стол',
    description: 'Получать уведомления на рабочем столе.'
  }]
}, {
  title: 'Обновления аккаунта',
  description: 'Получать обновления о Nuxt UI.',
  fields: [{
    name: 'weekly_digest',
    label: 'Еженедельная сводка',
    description: 'Получать еженедельную сводку новостей.'
  }, {
    name: 'product_updates',
    label: 'Обновления продукта',
    description: 'Получать ежемесячное письмо со всеми новыми функциями и обновлениями.'
  }, {
    name: 'important_updates',
    label: 'Важные обновления',
    description: 'Получать письма о важных обновлениях, таких как исправления безопасности, обслуживание и т.д.'
  }]
}]

async function onChange() {
  // Do something with data
  console.log(state)
}
</script>

<template>
  <div v-for="(section, index) in sections" :key="index">
    <UPageCard
      :title="section.title"
      :description="section.description"
      variant="naked"
      class="mb-4"
    />

    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-default' }">
      <UFormField
        v-for="field in section.fields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :description="field.description"
        class="flex items-center justify-between not-last:pb-4 gap-2"
      >
        <USwitch
          v-model="state[field.name]"
          @update:model-value="onChange"
        />
      </UFormField>
    </UPageCard>
  </div>
</template>
