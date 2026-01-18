<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Регистрация',
  description: 'Создайте аккаунт, чтобы начать'
})

const toast = useToast()
const router = useRouter()

const fields = [{
  name: 'name',
  type: 'text' as const,
  label: 'Имя',
  placeholder: 'Введите ваше имя'
}, {
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Введите ваш email'
}, {
  name: 'password',
  label: 'Пароль',
  type: 'password' as const,
  placeholder: 'Введите ваш пароль'
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Регистрация через Google' })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: 'Регистрация через GitHub' })
  }
}]

const schema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  email: z.string().email('Неверный email'),
  password: z.string().min(8, 'Минимум 8 символов')
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload)
  // Здесь будет логика регистрации
  // После успешной регистрации перенаправляем на панель управления
  toast.add({
    title: 'Успешно!',
    description: 'Аккаунт успешно создан'
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
    title="Создать аккаунт"
    :submit="{ label: 'Создать аккаунт' }"
    @submit="onSubmit"
  >
    <template #description>
      Уже есть аккаунт? <ULink
        to="/login"
        class="text-primary font-medium"
      >Войти</ULink>.
    </template>

    <template #footer>
      Регистрируясь, вы соглашаетесь с нашими <ULink
        to="/"
        class="text-primary font-medium"
      >Условиями использования</ULink>.
    </template>
  </UAuthForm>
</template>