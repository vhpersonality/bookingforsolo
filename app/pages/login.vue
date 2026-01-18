<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Вход',
  description: 'Войдите в свой аккаунт для продолжения'
})

const toast = useToast()
const router = useRouter()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Введите ваш email',
  required: true
}, {
  name: 'password',
  label: 'Пароль',
  type: 'password' as const,
  placeholder: 'Введите ваш пароль'
}, {
  name: 'remember',
  label: 'Запомнить меня',
  type: 'checkbox' as const
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Вход через Google' })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: 'Вход через GitHub' })
  }
}]

const schema = z.object({
  email: z.string().email('Неверный email'),
  password: z.string().min(8, 'Минимум 8 символов')
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload)
  // Здесь будет логика авторизации
  // После успешной авторизации перенаправляем на панель управления
  toast.add({
    title: 'Успешно!',
    description: 'Вы успешно вошли в систему'
  })
  
  // Перенаправляем на панель управления
  setTimeout(() => {
    router.push('/schedule')
  }, 1000)
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Добро пожаловать"
    icon="i-lucide-lock"
    @submit="onSubmit"
  >
    <template #description>
      Нет аккаунта? <ULink
        to="/signup"
        class="text-primary font-medium"
      >Зарегистрироваться</ULink>.
    </template>

    <template #password-hint>
      <ULink
        to="/"
        class="text-primary font-medium"
        tabindex="-1"
      >Забыли пароль?</ULink>
    </template>

    <template #footer>
      Входя в систему, вы соглашаетесь с нашими <ULink
        to="/"
        class="text-primary font-medium"
      >Условиями использования</ULink>.
    </template>
  </UAuthForm>
</template>