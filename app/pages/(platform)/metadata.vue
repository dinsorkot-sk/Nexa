<script setup lang="ts">
import type { Entity, EntityWithFields, Field, Relation } from '~/types/metadata'

const { isNotificationsSlideoverOpen } = useDashboard()
const meta = useMetadata()

const activeTab = ref('entities')
const showAddEntityModal = ref(false)
const showDeleteEntityConfirm = ref(false)
const showDeleteFieldConfirm = ref(false)
const showAddRelationModal = ref(false)
const editingRelation = ref<Relation | null>(null)
const showDeleteRelationConfirm = ref(false)
const showEditEntityModal = ref(false)

const modules = ref<{ id: number, name: string, slug: string }[]>([])
const moduleOptions = computed(() =>
  modules.value.map(m => ({ label: m.name, value: m.id }))
)

const entitySearch = ref('')

const filteredEntities = computed(() => {
  if (!entitySearch.value) return meta.entities.value
  const q = entitySearch.value.toLowerCase()
  return meta.entities.value.filter(e =>
    e.name.toLowerCase().includes(q)
    || e.slug.toLowerCase().includes(q)
    || (e.tableName && e.tableName.toLowerCase().includes(q))
  )
})

const entityIconOptions = [
  { label: 'Table', value: 'i-lucide-table-2' },
  { label: 'Folder', value: 'i-lucide-folder' },
  { label: 'Users', value: 'i-lucide-users' },
  { label: 'Shopping Cart', value: 'i-lucide-shopping-cart' },
  { label: 'File Text', value: 'i-lucide-file-text' },
  { label: 'Box', value: 'i-lucide-box' },
  { label: 'Tag', value: 'i-lucide-tag' },
  { label: 'Settings', value: 'i-lucide-settings' },
  { label: 'Activity', value: 'i-lucide-activity' },
  { label: 'Globe', value: 'i-lucide-globe' },
  { label: 'Credit Card', value: 'i-lucide-credit-card' },
  { label: 'Message Square', value: 'i-lucide-message-square' }
]

const entityForm = reactive({ name: '', slug: '', tableName: '', description: '', icon: '', moduleId: undefined as number | undefined })
const entityEditForm = reactive({ id: 0, name: '', slug: '', tableName: '', description: '', icon: '', moduleId: undefined as number | undefined })
const fieldForm = reactive({
  name: '', slug: '', fieldType: 'text',
  isRequired: false, isUnique: false, isActive: true, defaultValue: '', options: '', validationRules: ''
})
const relationForm = reactive({
  name: '', slug: '', relationType: '1:N', entityId: 0, relatedEntityId: 0,
  foreignKey: '', pivotTable: '', isRequired: false, onDelete: 'SET NULL'
})

const toast = useToast()

const tabs = [
  { label: 'Metadata', icon: 'i-lucide-database', value: 'entities' },
  { label: 'Relations', icon: 'i-lucide-share-2', value: 'relations' },
  { label: 'Diagrams', icon: 'i-lucide-panel-right-dashed', value: 'diagrams' }
]

onMounted(() => {
  meta.loadEntities()
  meta.loadRelations()
  $fetch<{ id: number, name: string, slug: string }[]>('/api/metadata/modules')
    .then((d) => { modules.value = d || [] })
    .catch(() => {})
})

const stats = computed(() => {
  const f = meta.selectedEntity.value?.fields || []
  return {
    total: f.length,
    nullable: f.filter(fi => !fi.isRequired).length,
    required: f.filter(fi => fi.isRequired).length,
    uniqued: f.filter(fi => fi.isUnique).length
  }
})

// ── Entity methods ─────────────────────────────────────────────────────
function openAddEntity() {
  Object.assign(entityForm, { name: '', slug: '', tableName: '', description: '', icon: '', moduleId: undefined })
  showAddEntityModal.value = true
}

async function saveEntity() {
  if (!entityForm.name || !entityForm.slug || !entityForm.tableName) {
    toast.add({ title: 'Missing fields', description: 'Name, slug, and table name are required', color: 'error' })
    return
  }
  await meta.createEntity({
    name: entityForm.name, slug: entityForm.slug, tableName: entityForm.tableName,
    description: entityForm.description || null, icon: entityForm.icon || null,
    moduleId: entityForm.moduleId
  })
  showAddEntityModal.value = false
  toast.add({ title: 'Entity created', color: 'success' })
}

async function confirmDeleteEntity() {
  if (!meta.selectedEntity.value) return
  await meta.deleteEntity(meta.selectedEntity.value.id)
  showDeleteEntityConfirm.value = false
  toast.add({ title: 'Entity deleted', color: 'success' })
}

function openEditEntity(entity: EntityWithFields) {
  Object.assign(entityEditForm, {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    tableName: entity.tableName,
    description: entity.description || '',
    icon: entity.icon || '',
    moduleId: entity.moduleId
  })
  showEditEntityModal.value = true
}

async function saveEditEntity() {
  if (!entityEditForm.name || !entityEditForm.slug || !entityEditForm.tableName) {
    toast.add({ title: 'Missing fields', description: 'Name, slug, and table name are required', color: 'error' })
    return
  }
  await meta.updateEntity(entityEditForm.id, {
    name: entityEditForm.name,
    slug: entityEditForm.slug,
    tableName: entityEditForm.tableName,
    description: entityEditForm.description || null,
    icon: entityEditForm.icon || null,
    moduleId: entityEditForm.moduleId
  })
  showEditEntityModal.value = false
  toast.add({ title: 'Entity updated', color: 'success' })
}

// ── Field methods ──────────────────────────────────────────────────────
function selectField(field: Field) {
  meta.selectedField.value = field
  Object.assign(fieldForm, {
    name: field.name,
    slug: field.slug,
    fieldType: field.fieldType,
    isRequired: !!field.isRequired,
    isUnique: !!field.isUnique,
    isActive: field.isActive !== false,
    defaultValue: field.defaultValue || '',
    options: field.options || '',
    validationRules: field.validationRules || ''
  })
}

function addNewField() {
  if (!meta.selectedEntity.value) return
  const slug = `field_${Date.now()}`
  meta.createField(meta.selectedEntity.value.id, {
    name: 'New Field', slug, fieldType: 'text',
    sortOrder: meta.selectedEntity.value.fields.length + 1
  }).then((field) => {
    selectField(field)
    toast.add({ title: 'Field added', color: 'success' })
  })
}

async function saveField() {
  if (!meta.selectedField.value) return
  await meta.updateField(meta.selectedField.value.id, { ...fieldForm })
  toast.add({ title: 'Field updated', color: 'success' })
}

async function confirmDeleteField() {
  if (!meta.selectedField.value) return
  const id = meta.selectedField.value.id
  meta.selectedField.value = null
  await meta.deleteField(id)
  showDeleteFieldConfirm.value = false
  toast.add({ title: 'Field deleted', color: 'success' })
}

async function onFieldBlur() {
  if (meta.selectedField.value) await saveField()
}

const fieldFormWatcher = watch(
  () => [fieldForm.name, fieldForm.slug, fieldForm.fieldType, fieldForm.isRequired, fieldForm.isUnique, fieldForm.isActive, fieldForm.defaultValue, fieldForm.validationRules],
  () => { if (meta.selectedField.value) debouncedSaveField() }
)

const debouncedSaveField = useDebounceFn(async () => {
  if (!meta.selectedField.value) return
  await meta.updateField(meta.selectedField.value.id, {
    name: fieldForm.name, slug: fieldForm.slug, fieldType: fieldForm.fieldType,
    isRequired: fieldForm.isRequired, isUnique: fieldForm.isUnique, isActive: fieldForm.isActive,
    defaultValue: fieldForm.defaultValue || null, options: fieldForm.options || null,
    validationRules: fieldForm.validationRules || null
  })
}, 800)

onUnmounted(() => fieldFormWatcher())

// ── Sync / Deploy ──────────────────────────────────────────────────────
async function syncCurrentEntity() {
  if (!meta.selectedEntity.value) return
  await meta.syncSchema(meta.selectedEntity.value.slug)
  toast.add({ title: 'Schema synced', color: 'success' })
}

async function deployAll() {
  toast.add({ title: 'Deploying...', color: 'info' })
  for (const entity of meta.entities.value) {
    await meta.syncSchema(entity.slug)
  }
  toast.add({ title: 'Deployment complete', color: 'success' })
}

async function exportEntityJSON() {
  if (!meta.selectedEntity.value) return
  const slug = meta.selectedEntity.value.slug
  window.open(`/api/metadata/export/${slug}`, '_blank')
}

async function moveField(index: number, direction: -1 | 1) {
  if (!meta.selectedEntity.value) return
  const fields = meta.selectedEntity.value.fields
  const target = index + direction
  if (target < 0 || target >= fields.length) return
  const a = fields[index]!
  const b = fields[target]!
  await meta.updateField(a.id, { sortOrder: b.sortOrder })
  await meta.updateField(b.id, { sortOrder: a.sortOrder })
  toast.add({ title: 'Field reordered', color: 'success' })
}

// ── Relation methods ────────────────────────────────────────────────────
function openAddRelation() {
  Object.assign(relationForm, {
    name: '', slug: '', relationType: '1:N',
    entityId: meta.selectedEntity.value?.id || 0, relatedEntityId: 0,
    foreignKey: '', pivotTable: '', isRequired: false, onDelete: 'SET NULL'
  })
  editingRelation.value = null
  showAddRelationModal.value = true
}

function editRelation(rel: Relation) {
  editingRelation.value = { ...rel }
  Object.assign(relationForm, {
    name: rel.name, slug: rel.slug, relationType: rel.relationType,
    entityId: rel.entityId, relatedEntityId: rel.relatedEntityId,
    foreignKey: rel.foreignKey || '', pivotTable: rel.pivotTable || '',
    isRequired: !!rel.isRequired, onDelete: rel.onDelete || 'SET NULL'
  })
  showAddRelationModal.value = true
}

async function saveRelation() {
  if (!relationForm.name || !relationForm.slug || !relationForm.relationType) return
  const payload = {
    name: relationForm.name, slug: relationForm.slug,
    relationType: relationForm.relationType as '1:1' | '1:N' | 'N:N' | 'self',
    entityId: relationForm.entityId, relatedEntityId: relationForm.relatedEntityId,
    foreignKey: relationForm.foreignKey || null, pivotTable: relationForm.pivotTable || null,
    isRequired: relationForm.isRequired, onDelete: relationForm.onDelete
  }
  if (editingRelation.value) {
    await meta.updateRelation(editingRelation.value.id, payload)
    toast.add({ title: 'Relation updated', color: 'success' })
  } else {
    await meta.createRelation(payload)
    toast.add({ title: 'Relation created', color: 'success' })
  }
  showAddRelationModal.value = false
  editingRelation.value = null
  if (meta.selectedEntity.value) meta.loadEntity(meta.selectedEntity.value.id)
}

async function confirmDeleteRelation(id: number) {
  await meta.deleteRelation(id)
  showDeleteRelationConfirm.value = false
  toast.add({ title: 'Relation deleted', color: 'success' })
  if (meta.selectedEntity.value) meta.loadEntity(meta.selectedEntity.value.id)
}

// ── Slug auto-generation ────────────────────────────────────────────────
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

watch(() => entityForm.name, (val) => {
  if (val && !entityForm.slug) entityForm.slug = generateSlug(val)
  if (val && !entityForm.tableName) entityForm.tableName = `_${generateSlug(val)}`
})
watch(() => fieldForm.name, (val) => {
  if (val && !fieldForm.slug) fieldForm.slug = generateSlug(val)
})
watch(() => relationForm.name, (val) => {
  if (val && !relationForm.slug) relationForm.slug = generateSlug(val)
})

function entityIcon(entity: Entity): string {
  return entity.icon || 'i-lucide-table-2'
}

function fieldTypeBadgeColor(type: string) {
  const map = {
    number: 'info', boolean: 'warning', uuid: 'success', text: 'neutral', date: 'secondary'
  } as const
  return map[type as keyof typeof map] ?? 'neutral'
}
</script>

<template>
  <UDashboardPanel id="metadata" :ui="{ body: 'p-0 sm:p-0' }">
    <!-- ── Header ── -->
    <template #header>
      <UDashboardNavbar
        :title="activeTab === 'entities' ? 'Metadata' : activeTab === 'relations' ? 'Relations' : 'Diagrams'"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <UTabs
          v-model="activeTab"
          :items="tabs"
          color="neutral"
          size="sm"
          :ui="{ root: 'gap-0!' }"
        />
        <template #right>
          <div class="flex items-center gap-2">
            <template v-if="activeTab === 'entities'">
              <UButton
                v-if="meta.selectedEntity.value"
                color="neutral"
                variant="outline"
                icon="i-lucide-refresh-cw"
                :loading="meta.saving.value"
                @click="syncCurrentEntity"
              >
                Sync Metadata
              </UButton>
              <UButton
                color="primary"
                icon="i-lucide-cloud-upload"
                :loading="meta.saving.value"
                @click="deployAll"
              >
                Deploy Schema
              </UButton>
            </template>
            <template v-else-if="activeTab === 'relations'">
              <UButton color="primary" icon="i-lucide-plus" @click="openAddRelation">
                Add Relation
              </UButton>
            </template>
            <UTooltip text="Notifications" :shortcuts="['N']">
              <UButton
                color="neutral"
                variant="ghost"
                square
                @click="() => { isNotificationsSlideoverOpen = true }"
              >
                <UChip color="error" inset>
                  <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
                </UChip>
              </UButton>
            </UTooltip>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <!-- ── Body ── -->
    <template #body>
      <!-- ─── ENTITIES TAB ─── -->
      <div v-if="activeTab === 'entities'" class="flex h-full overflow-hidden">
        <!-- Left: Entity List -->
        <div class="w-64 shrink-0 border-r border-(--ui-border) flex flex-col">
          <!-- Panel header -->
          <div class="px-4 py-3 border-b border-(--ui-border) flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm font-semibold">
              <UIcon name="i-lucide-database" class="size-4 text-(--ui-text-muted)" />
              Entites
            </div>
            <UButton
              color="primary"
              variant="ghost"
              size="xs"
              icon="i-lucide-plus"
              square
              @click="openAddEntity"
            />
          </div>
          <!-- Search -->
          <div class="px-3 py-2 border-b border-(--ui-border)">
            <UInput
              v-model="entitySearch"
              placeholder="Filter..."
              size="sm"
              icon="i-lucide-search"
              class="w-full"
            />
          </div>
          <!-- Entity list -->
          <div class="flex-1 overflow-y-auto divide-y divide-(--ui-border)">
            <button
              v-for="entity in filteredEntities"
              :key="entity.id"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-(--ui-bg-elevated)"
              :class="meta.selectedEntity.value?.id === entity.id
                ? 'text-(--ui-primary) font-medium bg-(--ui-primary)/8'
                : 'text-(--ui-text)'"
              @click="meta.selectEntity(entity)"
            >
              <UIcon
                :name="entityIcon(entity)"
                class="size-4 shrink-0"
                :class="meta.selectedEntity.value?.id === entity.id ? 'text-(--ui-primary)' : 'text-(--ui-text-muted)'"
              />
              <span class="truncate">{{ entity.name }}</span>
            </button>
          </div>
        </div>

        <!-- Center: Entity Details -->
        <div class="flex-1 flex flex-col overflow-hidden min-w-0">
          <template v-if="meta.selectedEntity.value">
            <!-- Entity header bar -->
            <div class="px-6 py-3 border-b border-(--ui-border) shrink-0 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon :name="entityIcon(meta.selectedEntity.value)" class="size-5 text-(--ui-primary)" />
                <h2 class="text-base font-semibold">
                  {{ meta.selectedEntity.value.name }}
                </h2>
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  color="neutral"
                  variant="outline"
                  size="sm"
                  icon="i-lucide-download"
                  @click="exportEntityJSON"
                >
                  Export Metadata
                </UButton>
                <UButton
                  color="neutral"
                  variant="outline"
                  size="sm"
                  icon="i-lucide-pencil"
                  @click="openEditEntity(meta.selectedEntity.value)"
                >
                  Edit
                </UButton>
                <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-(--ui-border) bg-(--ui-bg-elevated)/40">
                  <span class="text-xs text-(--ui-text-muted)">Active</span>
                  <USwitch
                    :model-value="meta.selectedEntity.value.isActive !== false"
                    color="primary"
                    size="sm"
                    @update:model-value="async (v) => {
                      if (meta.selectedEntity.value) {
                        await meta.updateEntity(meta.selectedEntity.value.id, { isActive: v })
                        toast.add({ title: v ? 'Entity enabled' : 'Entity disabled', color: 'success' })
                      }
                    }"
                  />
                </div>
                <UButton
                  color="error"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-trash-2"
                  square
                  @click="() => { showDeleteEntityConfirm = true }"
                />
              </div>
            </div>

            <!-- Scrollable content -->
            <div class="flex-1 overflow-y-auto">
              <!-- Stats -->
              <div class="grid grid-cols-4 gap-3 px-6 pt-5 pb-3">
                <div
                  v-for="(val, key) in { 'Total Field': stats.total, 'Nullable': stats.nullable, 'Required': stats.required, 'Uniqued': stats.uniqued }"
                  :key="key"
                  class="rounded-xl border border-(--ui-border) bg-(--ui-bg-elevated)/40 px-4 py-3"
                >
                  <div class="text-2xl font-bold">
                    {{ val }}
                  </div>
                  <div class="text-xs text-(--ui-text-muted) mt-0.5">
                    {{ key }}
                  </div>
                </div>
              </div>

              <!-- Fields section -->
              <div class="px-6 pb-6">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-sm font-semibold">
                    Fields
                  </h3>
                  <UButton
                    color="primary"
                    size="xs"
                    icon="i-lucide-plus"
                    @click="addNewField"
                  >
                    Add Field
                  </UButton>
                </div>

                <div class="rounded-xl border border-(--ui-border) overflow-hidden">
                  <table class="min-w-full">
                    <thead>
                      <tr class="border-b border-(--ui-border) bg-(--ui-bg-elevated)/60">
                        <th
                          class="px-4 py-2.5 text-left text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider w-12"
                        >
                          PK
                        </th>
                        <th
                          class="px-4 py-2.5 text-left text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          class="px-4 py-2.5 text-left text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider"
                        >
                          Type
                        </th>
                        <th
                          class="px-4 py-2.5 text-left text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider"
                        >
                          Nullable
                        </th>
                        <th
                          class="px-4 py-2.5 text-left text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider"
                        >
                          Default
                        </th>
                        <th class="px-4 py-2.5 w-16 text-center">
                          <UIcon name="i-lucide-arrow-up-down" class="size-3 text-(--ui-text-muted)" />
                        </th>
                        <th class="px-4 py-2.5 w-10" />
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-(--ui-border)">
                      <tr
                        v-for="(field, fi) in meta.selectedEntity.value.fields || []"
                        :key="field.id"
                        class="cursor-pointer transition-colors hover:bg-(--ui-bg-elevated)/60"
                        :class="[meta.selectedField.value?.id === field.id ? 'bg-(--ui-primary)/8' : '', field.isActive === false ? 'opacity-50' : '']"
                        @click="selectField(field)"
                      >
                        <td class="px-4 py-3 text-center">
                          <UIcon v-if="field.slug === 'id'" name="i-lucide-key-round" class="size-4 text-yellow-400" />
                        </td>
                        <td class="px-4 py-3 text-sm font-medium">
                          {{ field.name }}
                        </td>
                        <td class="px-4 py-3">
                          <UBadge
                            variant="subtle"
                            :color="fieldTypeBadgeColor(field.fieldType)"
                            size="xs"
                            class="uppercase"
                          >
                            {{ field.fieldType }}
                          </UBadge>
                        </td>
                        <td class="px-4 py-3 text-center">
                          <UIcon
                            :name="field.isRequired ? 'i-lucide-x' : 'i-lucide-check'"
                            :class="field.isRequired ? 'size-4 text-(--ui-text-muted)' : 'size-4 text-green-500'"
                          />
                        </td>
                        <td class="px-4 py-3 text-sm text-(--ui-text-muted) font-mono max-w-40 truncate">
                          {{ field.defaultValue || 'null' }}
                        </td>
                        <td class="px-4 py-3">
                          <div class="flex items-center justify-center gap-0.5">
                            <UButton
                              icon="i-lucide-chevron-up"
                              variant="ghost"
                              size="xs"
                              square
                              color="neutral"
                              :disabled="fi === 0"
                              @click.stop="moveField(fi, -1)"
                            />
                            <UButton
                              icon="i-lucide-chevron-down"
                              variant="ghost"
                              size="xs"
                              square
                              color="neutral"
                              :disabled="fi === (meta.selectedEntity.value?.fields?.length || 0) - 1"
                              @click.stop="moveField(fi, 1)"
                            />
                          </div>
                        </td>
                        <td class="px-4 py-3">
                          <UDropdownMenu
                            :items="[[
                              { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => selectField(field) },
                              { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => { meta.selectedField.value = field; showDeleteFieldConfirm = true } }
                            ]]"
                          >
                            <UButton
                              icon="i-lucide-ellipsis-vertical"
                              variant="ghost"
                              size="xs"
                              square
                              color="neutral"
                            />
                          </UDropdownMenu>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div
                    v-if="!meta.selectedEntity.value.fields?.length"
                    class="py-10 text-center text-sm text-(--ui-text-muted)"
                  >
                    No fields yet. Click "+ Add Field" to get started.
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Empty state -->
          <div v-else class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <UIcon name="i-lucide-database" class="size-12 mx-auto mb-4 text-(--ui-text-muted)" />
              <h3 class="text-base font-semibold mb-1">
                Select an Entity
              </h3>
              <p class="text-sm text-(--ui-text-muted) mb-4">
                Choose from the left panel or create a new one
              </p>
              <UButton color="primary" icon="i-lucide-plus" @click="openAddEntity">
                Create Entity
              </UButton>
            </div>
          </div>
        </div>

        <!-- Right: Field Properties -->
        <div
          v-if="meta.selectedField.value"
          :key="meta.selectedField.value.id"
          class="w-72 shrink-0 border-l border-(--ui-border) flex flex-col overflow-hidden"
        >
          <!-- Panel header -->
          <div class="px-4 py-3 border-b border-(--ui-border) shrink-0 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-settings-2" class="size-4 text-(--ui-text-muted)" />
              <span class="text-sm font-semibold">Field Properties</span>
            </div>
            <UBadge
              variant="subtle"
              color="neutral"
              size="xs"
              class="font-mono"
            >
              {{ meta.selectedField.value.slug?.toUpperCase() }}
            </UBadge>
          </div>

          <!-- Scrollable form -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <UFormField label="Field Name">
              <UInput v-model="fieldForm.name" class="w-full" @blur="onFieldBlur" />
            </UFormField>

            <UFormField label="Data Type">
              <USelect
                v-model="fieldForm.fieldType"
                :items="meta.fieldTypeOptions"
                class="w-full"
                @change="onFieldBlur"
              />
            </UFormField>

            <USeparator />

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Primary Key</span>
                <USwitch :model-value="meta.selectedField.value.slug === 'id'" :disabled="true" color="primary" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Is Nullable</span>
                <USwitch
                  :model-value="!fieldForm.isRequired"
                  color="primary"
                  @update:model-value="(v) => { fieldForm.isRequired = !v; onFieldBlur() }"
                />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Is Unique</span>
                <USwitch v-model="fieldForm.isUnique" color="primary" @change="onFieldBlur" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Active</span>
                <USwitch v-model="fieldForm.isActive" color="primary" @change="onFieldBlur" />
              </div>
            </div>

            <USeparator />

            <UFormField label="Default Value">
              <USelect
                v-model="fieldForm.defaultValue"
                :items="['null', 'now()', 'gen_random_uuid()', 'true', 'false', '0', '']"
                class="w-full"
                @change="onFieldBlur"
              />
            </UFormField>

            <UFormField label="Description (Optional)">
              <UTextarea
                v-model="fieldForm.options"
                placeholder="Enter description for API docs..."
                class="w-full"
                :rows="3"
                @blur="onFieldBlur"
              />
            </UFormField>

            <UFormField label="Validation Rules">
              <UTextarea
                v-model="fieldForm.validationRules"
                placeholder="e.g. {&quot;minLength&quot;: 2, &quot;maxLength&quot;: 50}"
                class="w-full"
                :rows="2"
                @blur="onFieldBlur"
              />
            </UFormField>
          </div>

          <!-- Footer action -->
          <div class="p-4 border-t border-(--ui-border) shrink-0">
            <UButton
              color="error"
              variant="soft"
              class="w-full"
              icon="i-lucide-trash-2"
              @click="() => { showDeleteFieldConfirm = true }"
            >
              Delete Field
            </UButton>
          </div>
        </div>
      </div>

      <!-- ─── RELATIONS TAB ─── -->
      <div v-else-if="activeTab === 'relations'" class="p-6">
        <div class="rounded-xl border border-(--ui-border) overflow-hidden">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-(--ui-border) bg-(--ui-bg-elevated)/60">
                <th class="px-4 py-3 text-left text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider">
                  Name
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider">
                  From
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider">
                  To
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider">
                  Type
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider">
                  FK
                  /
                  Pivot
                </th>
                <th class="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody class="divide-y divide-(--ui-border)">
              <tr
                v-for="rel in meta.relations.value"
                :key="rel.id"
                class="hover:bg-(--ui-bg-elevated)/40 transition-colors"
              >
                <td class="px-4 py-3 text-sm font-medium">
                  {{ rel.name }}
                </td>
                <td class="px-4 py-3 text-sm">
                  {{ rel.entityName || `Entity #${rel.entityId}` }}
                </td>
                <td class="px-4 py-3 text-sm">
                  {{ rel.relatedEntityName || `Entity #${rel.relatedEntityId}` }}
                </td>
                <td class="px-4 py-3">
                  <UBadge variant="subtle" color="info" size="xs">
                    {{ rel.relationType }}
                  </UBadge>
                </td>
                <td class="px-4 py-3 text-sm text-(--ui-text-muted) font-mono">
                  {{ rel.foreignKey || rel.pivotTable || '—' }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <UButton
                      icon="i-lucide-pencil"
                      variant="ghost"
                      size="xs"
                      square
                      color="neutral"
                      @click="editRelation(rel)"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      variant="ghost"
                      size="xs"
                      square
                      color="error"
                      @click="() => { editingRelation = rel; showDeleteRelationConfirm = true }"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!meta.relations.value.length" class="py-10 text-center text-sm text-(--ui-text-muted)">
            No relations defined yet. Click "+ Add Relation" to create one.
          </div>
        </div>
      </div>

      <!-- ─── DIAGRAMS TAB ─── -->
      <div v-else-if="activeTab === 'diagrams'" class="h-full min-h-[32rem]">
        <ClientOnly>
          <MetadataDiagram :entities="meta.entities.value" :relations="meta.relations.value" />
          <template #fallback>
            <div class="flex h-full items-center justify-center">
              <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-(--ui-text-muted)" />
            </div>
          </template>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>

  <!-- ─── Add Entity Slideover ─── -->
  <USlideover :open="showAddEntityModal" @update:open="(v) => { if (!v) showAddEntityModal = false }">
    <template #content>
      <div class="flex flex-col h-full">
        <!-- Fixed header -->
        <div class="px-4 py-3 border-b border-(--ui-border) flex items-center gap-3 shrink-0">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            square
            icon="i-lucide-x"
            @click="() => { showAddEntityModal = false }"
          />
          <span class="text-sm font-semibold">Create New Entity</span>
        </div>
        <!-- Scrollable body -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Name">
            <UInput
              v-model="entityForm.name"
              class="w-full"
              placeholder="e.g. Customer"
              autofocus
            />
          </UFormField>
          <UFormField label="Slug">
            <UInput v-model="entityForm.slug" class="w-full" placeholder="e.g. customer" />
          </UFormField>
          <UFormField label="Table Name">
            <UInput v-model="entityForm.tableName" class="w-full" placeholder="e.g. _customers" />
          </UFormField>
          <UFormField label="Description (Optional)">
            <UTextarea v-model="entityForm.description" class="w-full" placeholder="Brief description of this entity" />
          </UFormField>
          <UFormField label="Icon">
            <USelect
              v-model="entityForm.icon"
              :items="entityIconOptions"
              class="w-full"
              placeholder="Select icon..."
            />
          </UFormField>
          <UFormField label="Module (Optional)">
            <USelect
              v-model="entityForm.moduleId"
              :items="moduleOptions"
              class="w-full"
              placeholder="None"
              clearable
            />
          </UFormField>
        </div>
        <!-- Fixed footer -->
        <div class="px-4 py-3 border-t border-(--ui-border) flex justify-end gap-2 shrink-0">
          <UButton color="neutral" variant="ghost" @click="() => { showAddEntityModal = false }">
            Cancel
          </UButton>
          <UButton color="primary" :loading="meta.saving.value" @click="saveEntity">
            Create
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>

  <!-- ─── Delete Entity Confirm ─── -->
  <UModal v-model:open="showDeleteEntityConfirm" title="Delete Entity">
    <template #body>
      <p class="text-sm text-(--ui-text-muted)">
        Are you sure you want to delete <strong class="text-(--ui-text)">{{ meta.selectedEntity.value?.name }}</strong>?
        This will drop the table and remove all associated fields and relations. This action cannot be undone.
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="() => { showDeleteEntityConfirm = false }">
          Cancel
        </UButton>
        <UButton color="error" :loading="meta.saving.value" @click="confirmDeleteEntity">
          Delete
        </UButton>
      </div>
    </template>
  </UModal>

  <!-- ─── Edit Entity Slideover ─── -->
  <USlideover :open="showEditEntityModal" @update:open="(v) => { if (!v) showEditEntityModal = false }">
    <template #content>
      <div class="flex flex-col h-full">
        <!-- Fixed header -->
        <div class="px-4 py-3 border-b border-(--ui-border) flex items-center gap-3 shrink-0">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            square
            icon="i-lucide-x"
            @click="() => { showEditEntityModal = false }"
          />
          <span class="text-sm font-semibold">Edit Entity</span>
        </div>
        <!-- Scrollable body -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Name">
            <UInput
              v-model="entityEditForm.name"
              class="w-full"
              placeholder="e.g. Customer"
              autofocus
            />
          </UFormField>
          <UFormField label="Slug">
            <UInput v-model="entityEditForm.slug" class="w-full" placeholder="e.g. customer" />
          </UFormField>
          <UFormField label="Table Name">
            <UInput v-model="entityEditForm.tableName" class="w-full" placeholder="e.g. _customers" />
          </UFormField>
          <UFormField label="Description (Optional)">
            <UTextarea v-model="entityEditForm.description" class="w-full" placeholder="Brief description of this entity" />
          </UFormField>
          <UFormField label="Icon">
            <USelect
              v-model="entityEditForm.icon"
              :items="entityIconOptions"
              class="w-full"
              placeholder="Select icon..."
            />
          </UFormField>
          <UFormField label="Module">
            <USelect
              v-model="entityEditForm.moduleId"
              :items="moduleOptions"
              class="w-full"
              placeholder="None"
              clearable
            />
          </UFormField>
        </div>
        <!-- Fixed footer -->
        <div class="px-4 py-3 border-t border-(--ui-border) flex justify-end gap-2 shrink-0">
          <UButton color="neutral" variant="ghost" @click="() => { showEditEntityModal = false }">
            Cancel
          </UButton>
          <UButton color="primary" :loading="meta.saving.value" @click="saveEditEntity">
            Update
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>

  <!-- ─── Delete Field Confirm ─── -->
  <UModal v-model:open="showDeleteFieldConfirm" title="Delete Field">
    <template #body>
      <p class="text-sm text-(--ui-text-muted)">
        Are you sure you want to delete <strong class="text-(--ui-text)">{{ meta.selectedField.value?.name }}</strong>?
        This will remove the column from the database table.
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="() => { showDeleteFieldConfirm = false }">
          Cancel
        </UButton>
        <UButton color="error" :loading="meta.saving.value" @click="confirmDeleteField">
          Delete
        </UButton>
      </div>
    </template>
  </UModal>

  <!-- ─── Add / Edit Relation Slideover ─── -->
  <USlideover :open="showAddRelationModal" @update:open="(v) => { if (!v) { showAddRelationModal = false; editingRelation = null } }">
    <template #content>
      <div class="flex flex-col h-full">
        <!-- Fixed header -->
        <div class="px-4 py-3 border-b border-(--ui-border) flex items-center gap-3 shrink-0">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            square
            icon="i-lucide-x"
            @click="showAddRelationModal = false; editingRelation = null"
          />
          <span class="text-sm font-semibold">{{ editingRelation ? 'Edit Relation' : 'Add Relation' }}</span>
        </div>
        <!-- Scrollable body -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Name">
            <UInput
              v-model="relationForm.name"
              class="w-full"
              placeholder="e.g. Order Items"
              autofocus
            />
          </UFormField>
          <UFormField label="Slug">
            <UInput v-model="relationForm.slug" class="w-full" placeholder="e.g. order_items" />
          </UFormField>
          <UFormField label="Relation Type">
            <USelect v-model="relationForm.relationType" :items="meta.relationTypeOptions" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Source Entity">
              <USelect v-model="relationForm.entityId" :items="meta.entities.value.map(e => ({ label: e.name, value: e.id }))" class="w-full" />
            </UFormField>
            <UFormField label="Target Entity">
              <USelect v-model="relationForm.relatedEntityId" :items="meta.entities.value.map(e => ({ label: e.name, value: e.id }))" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Foreign Key (optional)">
            <UInput v-model="relationForm.foreignKey" class="w-full" placeholder="e.g. order_id" />
          </UFormField>
          <UFormField label="Pivot Table (for N:N)">
            <UInput v-model="relationForm.pivotTable" class="w-full" placeholder="e.g. orders_products" />
          </UFormField>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Is Required</span>
            <USwitch v-model="relationForm.isRequired" color="primary" />
          </div>
        </div>
        <!-- Fixed footer -->
        <div class="px-4 py-3 border-t border-(--ui-border) flex justify-end gap-2 shrink-0">
          <UButton color="neutral" variant="ghost" @click="showAddRelationModal = false; editingRelation = null">
            Cancel
          </UButton>
          <UButton color="primary" :loading="meta.saving.value" @click="saveRelation">
            {{ editingRelation ? 'Update' : 'Create' }}
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>

  <!-- ─── Delete Relation Confirm ─── -->
  <UModal v-model:open="showDeleteRelationConfirm" title="Delete Relation">
    <template #body>
      <p class="text-sm text-(--ui-text-muted)">
        Are you sure you want to delete <strong class="text-(--ui-text)">{{ editingRelation?.name }}</strong>?
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="() => { showDeleteRelationConfirm = false }">
          Cancel
        </UButton>
        <UButton color="error" @click="confirmDeleteRelation(editingRelation!.id)">
          Delete
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
