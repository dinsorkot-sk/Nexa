export interface AuthEvent {
  id: number
  timestamp: string
  eventType: string
  actor: string
  userId: number | null
  userName: string | null
  userEmail: string | null
  userAvatarUrl: string | null
  status: string
  metadata: Record<string, unknown> | null
}

export function useAuthConfig() {
  const config = useState('auth-config', () => ({
    providers: { password: true, oauth2: false, saml: false },
    session: { absoluteTimeout: 1440, idleTimeout: 30, refreshTokenTTL: 7 },
    security: { concurrentSessions: true, mfaEnabled: false }
  }))

  const events = useState<AuthEvent[]>('auth-events', () => [])
  const loading = ref(false)
  const saving = ref(false)
  const hasChanges = ref(false)

  async function loadConfig() {
    loading.value = true
    try {
      config.value = await $fetch('/api/auth/config')
      hasChanges.value = false
    } catch {
      // use defaults
    } finally {
      loading.value = false
    }
  }

  async function loadEvents(search?: string) {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const url = `/api/auth/events${params.toString() ? `?${params.toString()}` : ''}`
      events.value = await $fetch<AuthEvent[]>(url)
    } catch {
      events.value = []
    } finally {
      loading.value = false
    }
  }

  function markChanged() {
    hasChanges.value = true
  }

  async function saveConfig() {
    saving.value = true
    try {
      await $fetch('/api/auth/config', {
        method: 'POST',
        body: config.value
      })
      hasChanges.value = false
      await loadEvents()
      return true
    } catch {
      return false
    } finally {
      saving.value = false
    }
  }

  onMounted(() => {
    loadConfig()
    loadEvents()
  })

  return {
    config,
    events,
    loading,
    saving,
    hasChanges,
    loadConfig,
    loadEvents,
    markChanged,
    saveConfig
  }
}
