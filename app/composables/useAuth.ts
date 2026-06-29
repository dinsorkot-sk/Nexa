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

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.roles.some(r => r.slug === 'admin') ?? false)

  /**
   * Fetch current user session from the API.
   */
  async function fetchUser() {
    try {
      user.value = await $fetch<UserSession>('/api/auth/me')
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Login with email + password.
   */
  async function login(email: string, password: string) {
    const data = await $fetch<{ id: number, name: string, email: string, roles: Array<{ id: number, name: string, slug: string }> }>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    user.value = {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: null,
      roles: data.roles
    }
    return data
  }

  /**
   * Register a new user.
   */
  async function register(name: string, email: string, password: string) {
    return $fetch('/api/auth/register', {
      method: 'POST',
      body: { name, email, password }
    })
  }

  /**
   * Logout current session.
   */
  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/')
  }

  // Initialize on mount
  onMounted(() => fetchUser())

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchUser
  }
}

export const useAuth = createSharedComposable(_useAuth)
