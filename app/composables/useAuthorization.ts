import type { Role } from './useMembers'

export interface Permission {
  resource: string
  icon: string
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
  approve: boolean
  export: boolean
}

const DEFAULT_PERMISSIONS: Permission[] = [
  { resource: 'Customer', icon: 'i-lucide-users', create: false, read: false, update: false, delete: false, approve: false, export: false },
  { resource: 'Invoice', icon: 'i-lucide-file-text', create: false, read: false, update: false, delete: false, approve: false, export: false },
  { resource: 'Project', icon: 'i-lucide-list-todo', create: false, read: false, update: false, delete: false, approve: false, export: false },
  { resource: 'System Config', icon: 'i-lucide-settings', create: false, read: false, update: false, delete: false, approve: false, export: false }
]

export function useAuthorization() {
  const roles = useState<Role[]>('authz-roles', () => [])
  const permissions = useState<Permission[]>('authz-permissions', () => JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)))
  const selectedRoleId = useState<number | null>('authz-selected-role', () => null)
  const loading = ref(false)
  const hasChanges = ref(false)

  const selectedRole = computed(() =>
    roles.value.find(r => r.id === selectedRoleId.value) || null
  )

  async function loadRoles() {
    try {
      roles.value = await $fetch<Role[]>('/api/auth/roles')
      if (!selectedRoleId.value && roles.value.length > 0) {
        selectedRoleId.value = roles.value[0]!.id
      }
    } catch {
      roles.value = []
    }
  }

  function selectRole(roleId: number) {
    selectedRoleId.value = roleId
  }

  async function createRole(name: string, slug: string, description?: string) {
    await $fetch('/api/auth/roles', {
      method: 'POST',
      body: { name, slug, description: description || null }
    })
    await loadRoles()
  }

  async function deleteRole(roleId: number) {
    await $fetch(`/api/auth/roles/${roleId}`, { method: 'DELETE' })
    if (selectedRoleId.value === roleId) {
      selectedRoleId.value = roles.value[0]?.id || null
    }
    await loadRoles()
  }

  function togglePermission(resource: string, field: keyof Omit<Permission, 'resource' | 'icon'>) {
    const perm = permissions.value.find(p => p.resource === resource)
    if (perm) {
      perm[field] = !perm[field]
      hasChanges.value = true
    }
  }

  function markChanged() {
    hasChanges.value = true
  }

  async function savePermissions() {
    // Store permissions in auth-config for now (extend later)
    try {
      await $fetch('/api/auth/config', {
        method: 'POST',
        body: {
          providers: { password: true, oauth2: false, saml: false },
          session: { absoluteTimeout: 1440, idleTimeout: 30, refreshTokenTTL: 7 },
          security: { concurrentSessions: true, mfaEnabled: false },
          permissions: permissions.value
        }
      })
      hasChanges.value = false
    } catch {
      // ignore
    }
  }

  onMounted(() => {
    loadRoles()
  })

  return {
    roles,
    permissions,
    selectedRole,
    selectedRoleId,
    loading,
    hasChanges,
    loadRoles,
    selectRole,
    createRole,
    deleteRole,
    togglePermission,
    markChanged,
    savePermissions
  }
}
