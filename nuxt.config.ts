// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt'
  ],

  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },

  devtools: {
    enabled: true
  },

  devServer: {
    port: 4000
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    },
    // Static pages - prerender at build time
    '/': { prerender: true },
    '/pricing': { prerender: true },
    '/blog': { prerender: true },
    '/changelog': { prerender: true },
    '/docs': { prerender: true },
    // Dynamic routes - prerender all at build time
    '/blog/**': { prerender: true },
    '/docs/**': { prerender: true }
  },

  compatibilityDate: '2024-07-11',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
