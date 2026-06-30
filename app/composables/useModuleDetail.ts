// Types used via useMetadata() — no direct imports needed for interfaces in this composable

export interface ModuleForm {
  id: number
  name: string
  slug: string
  entityId: number
  fields: string[]
  isActive: boolean
}

export interface ModuleWorkflow {
  id: number
  name: string
  entityId: number
  entityName: string
  trigger: string
  isActive: boolean
}

export interface ModuleApi {
  id: number
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  entityId: number
  entityName: string
  isActive: boolean
}

export interface ModulePermission {
  roleId: string
  roleName: string
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  export: boolean
}

export interface ModuleSetting {
  key: string
  label: string
  type: 'text' | 'toggle' | 'select' | 'number'
  value: string | boolean | number
  options?: { label: string, value: string }[]
  description: string
}

export function useModuleDetail() {
  const meta = useMetadata()
  const toast = useToast()

  // Tab state
  const activeTab = ref('overview')

  // Forms
  const forms = ref<ModuleForm[]>([])

  // Workflows
  const workflows = ref<ModuleWorkflow[]>([])

  // APIs
  const apis = ref<ModuleApi[]>([])

  // Permissions (parsed from module permConfig)
  const permissions = ref<ModulePermission[]>([])

  // Settings (parsed from module data or defaults)
  const settings = ref<ModuleSetting[]>([])

  // Loading states
  const loadingForms = ref(false)
  const loadingWorkflows = ref(false)
  const loadingApis = ref(false)
  const saving = ref(false)

  const tabs = [
    { label: 'Overview', icon: 'i-lucide-info', value: 'overview' },
    { label: 'Entities', icon: 'i-lucide-database', value: 'entities' },
    { label: 'Forms', icon: 'i-lucide-file-text', value: 'forms' },
    { label: 'Workflows', icon: 'i-lucide-route', value: 'workflows' },
    { label: 'APIs', icon: 'i-lucide-wifi', value: 'apis' },
    { label: 'Permissions', icon: 'i-lucide-shield', value: 'permissions' },
    { label: 'Settings', icon: 'i-lucide-settings-2', value: 'settings' }
  ]

  const rightPanelContent = computed(() => {
    const selected = meta.selectedModule.value
    if (!selected) return null
    return {
      name: selected.name,
      slug: selected.slug,
      icon: selected.icon || 'i-lucide-puzzle',
      isActive: selected.isActive,
      description: selected.description,
      category: selected.category,
      version: selected.version,
      entityCount: meta.moduleEntities.value.length,
      formCount: forms.value.length,
      apiCount: apis.value.length,
      workflowCount: workflows.value.length,
      createdAt: selected.createdAt,
      updatedAt: selected.updatedAt
    }
  })

  function loadForms(_modId: number) {
    loadingForms.value = true
    try {
      // Load forms from parsed navConfig or defaults
      const mod = meta.selectedModule.value
      if (mod?.navConfig) {
        const nav = JSON.parse(mod.navConfig)
        forms.value = nav
          .filter((n: { type: string }) => n.type === 'Entity')
          .map((n: { label: string, linkedTo: string }, i: number) => ({
            id: i + 1,
            name: n.label,
            slug: n.linkedTo?.toLowerCase().replace(/\s+/g, '-') || `form-${i + 1}`,
            entityId: 0,
            fields: [],
            isActive: true
          }))
      } else {
        forms.value = []
      }
    } catch {
      forms.value = []
    } finally {
      loadingForms.value = false
    }
  }

  function loadWorkflows() {
    loadingWorkflows.value = true
    try {
      workflows.value = meta.moduleEntities.value.map((entity, i) => ({
        id: i + 1,
        name: `Create ${entity.name}`,
        entityId: entity.id,
        entityName: entity.name,
        trigger: 'Record Created',
        isActive: true
      }))
    } catch {
      workflows.value = []
    } finally {
      loadingWorkflows.value = false
    }
  }

  function loadApis() {
    loadingApis.value = true
    try {
      apis.value = meta.moduleEntities.value.flatMap((entity) => {
        const base = `/api/${entity.slug}`
        return [
          { id: entity.id * 4 + 1, name: `List ${entity.name}s`, method: 'GET' as const, path: base, entityId: entity.id, entityName: entity.name, isActive: true },
          { id: entity.id * 4 + 2, name: `Create ${entity.name}`, method: 'POST' as const, path: base, entityId: entity.id, entityName: entity.name, isActive: true },
          { id: entity.id * 4 + 3, name: `Get ${entity.name}`, method: 'GET' as const, path: `${base}/[id]`, entityId: entity.id, entityName: entity.name, isActive: true },
          { id: entity.id * 4 + 4, name: `Update ${entity.name}`, method: 'PUT' as const, path: `${base}/[id]`, entityId: entity.id, entityName: entity.name, isActive: true },
          { id: entity.id * 4 + 5, name: `Delete ${entity.name}`, method: 'DELETE' as const, path: `${base}/[id]`, entityId: entity.id, entityName: entity.name, isActive: true }
        ]
      })
    } catch {
      apis.value = []
    } finally {
      loadingApis.value = false
    }
  }

  function loadPermissions() {
    try {
      const mod = meta.selectedModule.value
      if (mod?.permConfig) {
        const raw = JSON.parse(mod.permConfig) as Record<string, Record<string, boolean>>
        const roleNames: Record<string, string> = {
          superAdmin: 'Super Administrator',
          admin: 'Administrator',
          manager: 'Manager',
          user: 'User',
          viewer: 'Viewer'
        }
        permissions.value = Object.entries(raw).map(([roleId, perms]) => ({
          roleId,
          roleName: roleNames[roleId] || roleId,
          view: perms.View ?? false,
          create: perms.Create ?? false,
          edit: perms.Edit ?? false,
          delete: perms.Delete ?? false,
          export: perms.Export ?? false
        }))
      } else {
        permissions.value = []
      }
    } catch {
      permissions.value = []
    }
  }

  function loadSettings() {
    const mod = meta.selectedModule.value
    if (!mod) {
      settings.value = []
      return
    }
    settings.value = [
      { key: 'name', label: 'Module Name', type: 'text', value: mod.name, description: 'Display name of the module' },
      { key: 'slug', label: 'Module Key', type: 'text', value: mod.slug, description: 'Unique system identifier' },
      { key: 'description', label: 'Description', type: 'text', value: mod.description || '', description: 'Brief description of the module' },
      { key: 'isActive', label: 'Active', type: 'toggle', value: mod.isActive, description: 'Enable or disable this module' },
      { key: 'version', label: 'Version', type: 'text', value: mod.version || '1.0.0', description: 'Current version number' },
      { key: 'category', label: 'Category', type: 'select', value: mod.category || 'none', options: [
        { label: 'None', value: 'none' },
        { label: 'Business', value: 'Business' },
        { label: 'HRM', value: 'HRM' },
        { label: 'Inventory', value: 'Inventory' },
        { label: 'Accounting', value: 'Accounting' },
        { label: 'Sales', value: 'Sales' }
      ], description: 'Module category' }
    ]
  }

  function loadAll(id: number) {
    meta.loadModule(id)
    loadForms(id)
    loadWorkflows()
    loadApis()
    loadPermissions()
    loadSettings()
  }

  async function saveSetting(key: string, value: string | boolean | number) {
    if (!meta.selectedModule.value) return
    saving.value = true
    try {
      const updateData: Record<string, unknown> = {}
      if (key === 'name') updateData.name = value as string
      else if (key === 'slug') updateData.slug = value as string
      else if (key === 'description') updateData.description = value as string
      else if (key === 'isActive') updateData.isActive = value as boolean
      else if (key === 'version') updateData.version = value as string
      else if (key === 'category') {
        updateData.category = (value === 'none') ? null : value as string
      }

      if (Object.keys(updateData).length > 0) {
        await meta.updateModule(meta.selectedModule.value.id, updateData)
        // Update local settings state
        const setting = settings.value.find(s => s.key === key)
        if (setting) setting.value = value
        toast.add({ title: 'Setting updated', color: 'success' })
      }
    } catch {
      toast.add({ title: 'Error', description: 'Could not update setting', color: 'error' })
    } finally {
      saving.value = false
    }
  }

  return {
    // State
    meta,
    activeTab,
    tabs,
    forms,
    workflows,
    apis,
    permissions,
    settings,
    rightPanelContent,

    // Loading
    loadingForms,
    loadingWorkflows,
    loadingApis,
    saving,

    // Methods
    loadAll,
    loadForms,
    loadWorkflows,
    loadApis,
    loadPermissions,
    loadSettings,
    saveSetting
  }
}
