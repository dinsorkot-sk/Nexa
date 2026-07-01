import type { ModuleRow, ModuleDetail, CreateModulePayload } from '~/types/metadata'

export function useModules() {
  const modules = ref<ModuleRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toast = useToast()

  // ── CRUD ──────────────────────────────────────────────────────────────

  async function fetchModules() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ModuleRow[]>('/api/metadata/modules')
      modules.value = data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch modules'
      toast.add({ title: error.value!, color: 'error' })
    } finally {
      loading.value = false
    }
  }

  async function fetchModuleDetail(id: number): Promise<ModuleDetail | null> {
    try {
      return await $fetch<ModuleDetail>(`/api/metadata/modules/${id}`)
    } catch (e: unknown) {
      toast.add({ title: e instanceof Error ? e.message : 'Failed to fetch detail', color: 'error' })
      return null
    }
  }

  async function createModule(payload: CreateModulePayload): Promise<ModuleRow | null> {
    loading.value = true
    try {
      const mod = await $fetch<ModuleRow>('/api/metadata/modules', {
        method: 'POST',
        body: payload
      })
      modules.value.unshift(mod)
      toast.add({ title: `"${mod.name}" created`, color: 'success' })
      return mod
    } catch (e: unknown) {
      toast.add({ title: e instanceof Error ? e.message : 'Failed to create', color: 'error' })
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateModule(id: number, data: Partial<ModuleRow>): Promise<boolean> {
    try {
      const updated = await $fetch<ModuleRow>(`/api/metadata/modules/${id}`, {
        method: 'PUT',
        body: data
      })
      const idx = modules.value.findIndex(m => m.id === id)
      if (idx !== -1) modules.value[idx] = updated
      return true
    } catch (e: unknown) {
      toast.add({ title: e instanceof Error ? e.message : 'Failed to update', color: 'error' })
      return false
    }
  }

  async function deleteModule(id: number): Promise<boolean> {
    try {
      await $fetch(`/api/metadata/modules/${id}`, { method: 'DELETE' })
      modules.value = modules.value.filter(m => m.id !== id)
      toast.add({ title: 'Module deleted', color: 'success' })
      return true
    } catch (e: unknown) {
      toast.add({ title: e instanceof Error ? e.message : 'Failed to delete', color: 'error' })
      return false
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────

  const stats = computed(() => {
    const total = modules.value.length
    const active = modules.value.filter(m => m.isActive).length
    const inactive = total - active
    return { total, active, inactive }
  })

  const categoryBreakdown = computed(() => {
    const map = new Map<string, { count: number, color: string, icon: string }>()
    const defaults: Record<string, { color: string, icon: string }> = {
      Business: { color: 'success', icon: 'i-lucide-briefcase' },
      Inventory: { color: 'info', icon: 'i-lucide-package' },
      HRM: { color: 'warning', icon: 'i-lucide-users' },
      Accounting: { color: 'error', icon: 'i-lucide-calculator' },
      Sales: { color: 'primary', icon: 'i-lucide-shopping-cart' },
      Support: { color: 'neutral', icon: 'i-lucide-life-buoy' },
      Marketing: { color: 'info', icon: 'i-lucide-megaphone' },
      Procurement: { color: 'neutral', icon: 'i-lucide-clipboard-list' }
    }
    for (const m of modules.value) {
      const cat = m.category || 'Uncategorized'
      if (!map.has(cat)) {
        const cfg = defaults[cat] ?? { color: 'neutral', icon: 'i-lucide-folder' }
        map.set(cat, { count: 0, color: cfg.color, icon: cfg.icon })
      }
      map.get(cat)!.count++
    }
    return Array.from(map.entries()).map(([category, val]) => ({ category, ...val }))
  })

  // ── Filter / Sort / Search ────────────────────────────────────────────

  const searchQuery = ref('')
  const categoryFilter = ref<string | null>(null)
  const statusFilter = ref<string | null>(null)
  const sortBy = ref<string>('updatedAt')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  const filteredModules = computed(() => {
    let list = [...modules.value]

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(m =>
        m.name.toLowerCase().includes(q)
        || (m.description || '').toLowerCase().includes(q)
        || (m.category || '').toLowerCase().includes(q)
      )
    }

    if (categoryFilter.value) {
      list = list.filter(m => m.category === categoryFilter.value)
    }

    if (statusFilter.value === 'active') list = list.filter(m => m.isActive)
    else if (statusFilter.value === 'inactive') list = list.filter(m => !m.isActive)

    list.sort((a, b) => {
      let cmp
      switch (sortBy.value) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'status':
          cmp = Number(a.isActive) - Number(b.isActive)
          break
        case 'category':
          cmp = (a.category || '').localeCompare(b.category || '')
          break
        default:
          cmp = (a.updatedAt || '').localeCompare(b.updatedAt || '')
          break
      }
      return sortOrder.value === 'desc' ? -cmp : cmp
    })

    return list
  })

  const categoryOptions = computed(() => {
    const cats = new Set(modules.value.map(m => m.category).filter(Boolean))
    return Array.from(cats).sort().map(c => ({ label: c as string, value: c as string }))
  })

  const sortOptions = [
    { label: 'Last Updated', value: 'updatedAt' },
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Status', value: 'status' },
    { label: 'Category', value: 'category' }
  ]

  function getStatusFilterOptions() {
    return [
      { label: 'All Status', value: '' },
      { label: 'Active Only', value: 'active' },
      { label: 'Inactive Only', value: 'inactive' }
    ]
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  /** Map CSS variable name by semantic color key */
  const cssVar = (color: string): string => {
    const map: Record<string, string> = {
      success: 'var(--ui-success)',
      info: 'var(--ui-info)',
      warning: 'var(--ui-warning)',
      error: 'var(--ui-error)',
      primary: 'var(--ui-primary)',
      neutral: 'var(--ui-text-muted)'
    }
    return map[color] || 'var(--ui-text-muted)'
  }

  return {
    modules, loading, error,
    fetchModules, fetchModuleDetail,
    createModule, updateModule, deleteModule,
    stats, categoryBreakdown,
    searchQuery, categoryFilter, statusFilter,
    sortBy, sortOrder, filteredModules,
    categoryOptions, sortOptions, getStatusFilterOptions,
    cssVar
  }
}
