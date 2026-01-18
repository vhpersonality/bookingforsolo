<script setup lang="ts">
definePageMeta({
  layout: 'landing'
})

const { data: page, error } = await useAsyncData('index', () => queryCollection('index').first(), {
  default: () => null
})

if (error.value) {
  console.error('Error loading index page:', error.value)
}

const title = page.value?.seo?.title || page.value?.title || 'Система управления бронированиями'
const description = page.value?.seo?.description || page.value?.description || 'Современная система для управления бронированиями'

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <!-- Fallback content if page failed to load -->
  <div v-if="error && !page" class="min-h-screen flex items-center justify-center p-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">Ошибка загрузки контента</h1>
      <p class="text-muted mb-4">Не удалось загрузить данные страницы</p>
      <pre class="text-xs text-muted mt-4">{{ error }}</pre>
    </div>
  </div>

  <div v-else-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.hero.links"
    >
      <template #top>
        <HeroBackground />
        </template>

      <template #title>
        <MDC
          :value="page.title"
          unwrap="p"
        />
      </template>

      <PromotionalVideo />
    </UPageHero>

    <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      :title="section.title"
      :description="section.description"
      :orientation="section.orientation"
      :reverse="section.reverse"
      :features="section.features"
    >
      <ImagePlaceholder />
    </UPageSection>

    <UPageSection
      :title="page.features.title"
      :description="page.features.description"
    >
      <UPageGrid>
        <UPageCard
          v-for="(item, index) in page.features.items"
          :key="index"
          v-bind="item"
          spotlight
        />
      </UPageGrid>
    </UPageSection>

    <UPageSection
      id="testimonials"
      :headline="page.testimonials.headline"
      :title="page.testimonials.title"
      :description="page.testimonials.description"
    >
      <UPageColumns class="xl:columns-4">
        <UPageCard
          v-for="(testimonial, index) in page.testimonials.items"
          :key="index"
          variant="subtle"
          :description="testimonial.quote"
          :ui="{ description: 'before:content-[open-quote] after:content-[close-quote]' }"
        >
          <template #footer>
            <UUser
              v-bind="testimonial.user"
              size="lg"
            />
        </template>
        </UPageCard>
      </UPageColumns>
    </UPageSection>

    <USeparator />

    <UPageCTA
      v-bind="page.cta"
      variant="naked"
      class="overflow-hidden"
    >
      <LazyStarsBg />
    </UPageCTA>
            </div>

  <!-- Loading state -->
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-muted">Загрузка...</p>
        </div>
      </div>
</template>