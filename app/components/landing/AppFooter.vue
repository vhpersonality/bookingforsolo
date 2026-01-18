<script setup lang="ts">
const columns = [{
  label: 'Ресурсы',
  children: [{
    label: 'Центр помощи'
  }, {
    label: 'Документация'
  }, {
    label: 'Дорожная карта'
  }, {
    label: 'Обновления'
  }]
}, {
  label: 'Возможности',
  children: [{
    label: 'Функции'
  }, {
    label: 'Интеграции'
  }, {
    label: 'API'
  }, {
    label: 'Партнеры'
  }]
}, {
  label: 'Компания',
  children: [{
    label: 'О нас'
  }, {
    label: 'Цены'
  }, {
    label: 'Вакансии'
  }, {
    label: 'Блог'
  }]
}]

const toast = useToast()

const email = ref('')
const loading = ref(false)

function onSubmit() {
  loading.value = true

  toast.add({
    title: 'Подписка оформлена!',
    description: 'Вы подписались на нашу рассылку.'
  })
  
  setTimeout(() => {
    loading.value = false
    email.value = ''
  }, 1000)
}
</script>

<template>
  <USeparator
    icon="i-simple-icons-nuxtdotjs"
    class="h-px"
  />

  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <form @submit.prevent="onSubmit">
              <UFormField
                name="email"
                label="Подпишитесь на нашу рассылку"
                size="lg"
              >
                <UInput
                  v-model="email"
                  type="email"
                  class="w-full"
                  placeholder="Введите ваш email"
                >
                  <template #trailing>
                    <UButton
                      type="submit"
                      size="xs"
                      color="neutral"
                      label="Подписаться"
                      :loading="loading"
                    />
                  </template>
                </UInput>
              </UFormField>
            </form>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-muted text-sm">
        Создано с Nuxt UI • © {{ new Date().getFullYear() }}
      </p>
    </template>

    <template #right>
      <UButton
        to="https://go.nuxt.com/discord"
        target="_blank"
        icon="i-simple-icons-discord"
        aria-label="Discord"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://go.nuxt.com/x"
        target="_blank"
        icon="i-simple-icons-x"
        aria-label="X"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://github.com/nuxt-ui-templates"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>