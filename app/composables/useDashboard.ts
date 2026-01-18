import { createSharedComposable } from '@vueuse/core'

const _useDashboard = () => {
  const route = useRoute()
  const router = useRouter()

  defineShortcuts({
    'g-h': () => router.push('/'),
    'g-r': () => router.push('/schedule'),
    'g-v': () => router.push('/services'),
    'g-c': () => router.push('/customers'),
    'g-s': () => router.push('/settings')
  })

  return {}
}

export const useDashboard = createSharedComposable(_useDashboard)
