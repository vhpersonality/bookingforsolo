<script setup lang="ts">
definePageMeta({
  layout: 'landing'
})

const title = 'Система управления бронированиями'
const description = 'Современная система для управления бронированиями и расписанием. Упростите свою работу с клиентами и услугами.'

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <div>
    <UPageHero
      title="Управляйте бронированиями легко"
      description="Современная система для управления расписанием, клиентами и услугами. Начните использовать прямо сейчас."
      :links="[{
        label: 'Начать',
        to: '/signup',
        color: 'primary',
        trailing: true
      }, {
        label: 'Узнать больше',
        to: '/#features',
        color: 'neutral',
        variant: 'outline'
      }]"
    >
      <template #top>
        <HeroBackground />
      </template>

      <template #default>
        <PromotionalVideo />
      </template>
    </UPageHero>

    <UPageSection
      id="features"
      title="Возможности"
      description="Всё, что нужно для управления вашим бизнесом"
    >
      <UPageGrid>
        <UPageCard
          title="Управление расписанием"
          description="Удобный календарь для просмотра и управления бронированиями"
          icon="i-lucide-calendar"
          spotlight
        />
        <UPageCard
          title="Клиентская база"
          description="Храните всю информацию о ваших клиентах в одном месте"
          icon="i-lucide-users"
          spotlight
        />
        <UPageCard
          title="Управление услугами"
          description="Создавайте и управляйте услугами, которые вы предоставляете"
          icon="i-lucide-scissors"
          spotlight
        />
        <UPageCard
          title="Аналитика"
          description="Отслеживайте статистику и анализируйте свой бизнес"
          icon="i-lucide-bar-chart"
          spotlight
        />
      </UPageGrid>
    </UPageSection>

    <UPageSection
      id="about"
      title="О нас"
      description="Мы помогаем малому бизнесу эффективно управлять бронированиями"
    >
      <div class="prose prose-invert max-w-none">
        <p>
          Наша система разработана специально для небольших предприятий и специалистов, 
          которые хотят упростить процесс управления бронированиями. 
          Простой и интуитивный интерфейс поможет вам сэкономить время и сосредоточиться на вашем бизнесе.
        </p>
      </div>
      <ImagePlaceholder />
    </UPageSection>

    <USeparator />

    <UPageCTA
      title="Готовы начать?"
      description="Создайте аккаунт и начните управлять своими бронированиями уже сегодня"
      :links="[{
        label: 'Создать аккаунт',
        to: '/signup',
        color: 'primary',
        trailing: true
      }, {
        label: 'Войти',
        to: '/login',
        color: 'neutral',
        variant: 'outline'
      }]"
      variant="naked"
      class="overflow-hidden"
    >
      <LazyStarsBg />
    </UPageCTA>
  </div>
</template>