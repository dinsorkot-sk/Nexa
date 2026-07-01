import { createSharedComposable } from '@vueuse/core'

export interface UserSession {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  roles: Array<{ id: number, name: string, slug: string }>
}

const _useAuth = () => {
  const user = ref<UserSession | null>(null)
  const loading = ref(true)
  let fetchAttempted = false

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.roles.some(r => r.slug === 'admin') ?? false)

  /**
   * Fetch current user session from the API.
   * Idempotent — subsequent calls are no-ops once attempted.
   */
  async function fetchUser() {
    if (fetchAttempted) return
    fetchAttempted = true
    try {
      user.value = await $fetch<UserSession>('/api/auth/me')
    } catch {
      user.value = null
      // Session expired — redirect to login if on a protected page (not already there)
      if (import.meta.client && window.location.pathname !== '/login') {
        await navigateTo('/login')
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Login with email + password.
   */
  async function login(email: string, password: string) {
    const data = await $fetch<{ id: number, name: string, email: string, avatarUrl: string | null, roles: Array<{ id: number, name: string, slug: string }> }>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    user.value = {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl ?? null,
      roles: data.roles
    }
    // Reset fetchAttempted so subsequent fetchUser() calls work
    fetchAttempted = false
    return data
  }

  /**
   * Logout current session.
   */
  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchUser
  }
}

export const useAuth = createSharedComposable(_useAuth)
