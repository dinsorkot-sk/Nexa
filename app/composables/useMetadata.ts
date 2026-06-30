import type { Entity, EntityWithFields, Field, Module, Relation } from '~/types/metadata'

/**
 * Composable for managing metadata (entities, fields, relations).
 * Provides CRUD operations and reactive state.
 */
export function useMetadata() {
  // ── Entity state ────────────────────────────────────────────────────────
  const entities = ref<Entity[]>([])
  const selectedEntity = ref<EntityWithFields | null>(null)
  const selectedField = ref<Field | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  // ── Fetch all entities ─────────────────────────────────────────────────
  async function loadEntities() {
    loading.value = true
    try {
      entities.value = await $fetch<Entity[]>('/api/metadata/entities')
    } finally {
      loading.value = false
    }
  }

  // ── Fetch single entity with fields & relations ────────────────────────
  async function loadEntity(id: number) {
    loading.value = true
    try {
      selectedEntity.value = await $fetch<EntityWithFields>(`/api/metadata/entities/${id}`)
    } finally {
      loading.value = false
    }
  }

  // ── Select an entity ───────────────────────────────────────────────────
  function selectEntity(entity: Entity) {
    selectedField.value = null
    if (selectedEntity.value && selectedEntity.value.id !== entity.id) {
      selectedEntity.value = null as unknown as EntityWithFields
    }
    loadEntity(entity.id)
  }

  // ── Create entity ──────────────────────────────────────────────────────
  async function createEntity(data: Partial<Entity>): Promise<Entity> {
    saving.value = true
    try {
      const result = await $fetch<Entity>('/api/metadata/entities', {
        method: 'POST',
        body: data
      })
      await loadEntities()
      return result
    } finally {
      saving.value = false
    }
  }

  // ── Update entity ──────────────────────────────────────────────────────
  async function updateEntity(id: number, data: Partial<Entity>): Promise<Entity> {
    saving.value = true
    try {
      const result = await $fetch<Entity>(`/api/metadata/entities/${id}`, {
        method: 'PUT',
        body: data
      })
      await loadEntities()
      if (selectedEntity.value?.id === id) {
        await loadEntity(id)
      }
      return result
    } finally {
      saving.value = false
    }
  }

  // ── Delete entity ──────────────────────────────────────────────────────
  async function deleteEntity(id: number): Promise<void> {
    saving.value = true
    try {
      await $fetch(`/api/metadata/entities/${id}`, { method: 'DELETE' })
      if (selectedEntity.value?.id === id) {
        selectedEntity.value = null
        selectedField.value = null
      }
      await loadEntities()
    } finally {
      saving.value = false
    }
  }

  // ── Create field ───────────────────────────────────────────────────────
  async function createField(entityId: number, data: Partial<Field>): Promise<Field> {
    saving.value = true
    try {
      const result = await $fetch<Field>(`/api/metadata/entities/${entityId}/fields`, {
        method: 'POST',
        body: data
      })
      await loadEntity(entityId)
      return result
    } finally {
      saving.value = false
    }
  }

  // ── Update field ───────────────────────────────────────────────────────
  async function updateField(id: number, data: Partial<Field>): Promise<Field> {
    saving.value = true
    try {
      const result = await $fetch<Field>(`/api/metadata/fields/${id}`, {
        method: 'PUT',
        body: data
      })
      if (selectedEntity.value) {
        await loadEntity(selectedEntity.value.id)
      }
      return result
    } finally {
      saving.value = false
    }
  }

  // ── Delete field ───────────────────────────────────────────────────────
  async function deleteField(id: number): Promise<void> {
    saving.value = true
    try {
      await $fetch(`/api/metadata/fields/${id}`, { method: 'DELETE' })
      selectedField.value = null
      if (selectedEntity.value) {
        await loadEntity(selectedEntity.value.id)
      }
    } finally {
      saving.value = false
    }
  }

  // ── Sync entity schema ─────────────────────────────────────────────────
  async function syncSchema(slug: string): Promise<void> {
    saving.value = true
    try {
      await $fetch(`/api/metadata/sync/${slug}`, { method: 'POST' })
    } finally {
      saving.value = false
    }
  }

  // ── Relations ──────────────────────────────────────────────────────────
  const relations = ref<Relation[]>([])

  async function loadRelations() {
    try {
      relations.value = await $fetch<Relation[]>('/api/metadata/relations')
    } catch {
      relations.value = []
    }
  }

  async function createRelation(data: Partial<Relation>): Promise<Relation> {
    const result = await $fetch<Relation>('/api/metadata/relations', {
      method: 'POST',
      body: data
    })
    await loadRelations()
    return result
  }

  async function updateRelation(id: number, data: Partial<Relation>): Promise<Relation> {
    const result = await $fetch<Relation>(`/api/metadata/relations/${id}`, {
      method: 'PUT',
      body: data
    })
    await loadRelations()
    return result
  }

  async function deleteRelation(id: number): Promise<void> {
    await $fetch(`/api/metadata/relations/${id}`, { method: 'DELETE' })
    await loadRelations()
  }

  // ── Module state ────────────────────────────────────────────────────────
  const modules = ref<Module[]>([])
  const selectedModule = ref<Module | null>(null)
  const moduleEntities = ref<Entity[]>([])
  const moduleFieldCounts = ref<{ entityId: number, count: number }[]>([])

  async function loadModules() {
    try {
      modules.value = await $fetch<Module[]>('/api/metadata/modules')
    } catch {
      modules.value = []
    }
  }

  async function loadModule(id: number) {
    try {
      const result = await $fetch<Module & { entities: Entity[], fieldCounts: { entityId: number, count: number }[] }>(`/api/metadata/modules/${id}`)
      selectedModule.value = result
      moduleEntities.value = result.entities
      moduleFieldCounts.value = result.fieldCounts
    } catch {
      selectedModule.value = null
      moduleEntities.value = []
      moduleFieldCounts.value = []
    }
  }

  function selectModule(mod: Module) {
    if (selectedModule.value?.id !== mod.id) {
      loadModule(mod.id)
    } else {
      selectedModule.value = null
      moduleEntities.value = []
      moduleFieldCounts.value = []
    }
  }

  async function createModule(data: { name: string, slug: string, description?: string, icon?: string, color?: string, category?: string, version?: string, isActive?: boolean, navConfig?: string, permConfig?: string, entityConfig?: string }): Promise<Module> {
    const result = await $fetch<Module>('/api/metadata/modules', {
      method: 'POST',
      body: data
    })
    await loadModules()
    return result
  }

  async function updateModule(id: number, data: Partial<Module>): Promise<Module> {
    const result = await $fetch<Module>(`/api/metadata/modules/${id}`, {
      method: 'PUT',
      body: data
    })
    await loadModules()
    if (selectedModule.value?.id === id) {
      await loadModule(id)
    }
    return result
  }

  async function deleteModule(id: number): Promise<void> {
    await $fetch(`/api/metadata/modules/${id}`, { method: 'DELETE' })
    if (selectedModule.value?.id === id) {
      selectedModule.value = null
      moduleEntities.value = []
      moduleFieldCounts.value = []
    }
    await loadModules()
  }

  async function toggleModuleActive(id: number, isActive: boolean): Promise<Module> {
    return updateModule(id, { isActive } as Partial<Module>)
  }

  // ── Field type options ─────────────────────────────────────────────────
  const fieldTypeOptions = [
    { label: 'Text', value: 'text' },
    { label: 'Textarea', value: 'textarea' },
    { label: 'Number', value: 'number' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'Date', value: 'date' },
    { label: 'Email', value: 'email' },
    { label: 'URL', value: 'url' },
    { label: 'Select', value: 'select' },
    { label: 'JSON', value: 'json' }
  ]

  const relationTypeOptions = [
    { label: 'One to One (1:1)', value: '1:1' },
    { label: 'One to Many (1:N)', value: '1:N' },
    { label: 'Many to Many (N:N)', value: 'N:N' },
    { label: 'Self Reference', value: 'self' }
  ]

  return {
    // State
    entities,
    selectedEntity,
    selectedField,
    relations,
    modules,
    selectedModule,
    moduleEntities,
    moduleFieldCounts,
    loading,
    saving,
    fieldTypeOptions,
    relationTypeOptions,

    // Entity
    loadEntities,
    loadEntity,
    selectEntity,
    createEntity,
    updateEntity,
    deleteEntity,
    syncSchema,

    // Field
    createField,
    updateField,
    deleteField,

    // Relation
    loadRelations,
    createRelation,
    updateRelation,
    deleteRelation,

    // Module
    loadModules,
    loadModule,
    selectModule,
    createModule,
    updateModule,
    deleteModule,
    toggleModuleActive
  }
}
