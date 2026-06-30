<script setup lang="ts">
import type { Module } from '~/types/metadata'

const { isNotificationsSlideoverOpen } = useDashboard()
const meta = useMetadata()
const toast = useToast()

const activeTab = ref('modules')
const search = ref('')
const statusFilter = ref('all')
const sortColumn = ref('name')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const pageSize = ref(10)
const showSidePanel = ref(false)
const showCreateModal = ref(false)
const showDeactivateConfirm = ref(false)
const viewMode = ref<'list' | 'grid'>('list')
const detailTab = ref('overview')

const createForm = reactive({ name: '', slug: '', description: '', icon: 'i-lucide-puzzle' })

const tabs = [
  { label: 'All Modules', icon: 'i-lucide-layout-grid', value: 'modules' },
  { label: 'Module Categories', icon: 'i-lucide-folder-tree', value: 'categories' }
]

const detailTabs = [
  { label: 'Overview', value: 'overview' },
  { label: 'Entities', value: 'entities' },
  { label: 'Forms', value: 'forms' },
  { label: 'Users', value: 'users' }
]

const stats = computed(() => {
  const list = meta.modules.value
  return {
    total: list.length,
    active: list.filter(m => m.isActive).length,
    inactive: list.filter(m => !m.isActive).length,
    business: list.length
  }
})

const filteredModules = computed(() => {
  let list = [...meta.modules.value]

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(m => m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q))
  }

  if (statusFilter.value !== 'all') {
    const active = statusFilter.value === 'active'
    list = list.filter(m => m.isActive === active)
  }

  list.sort((a, b) => {
    const dir = sortDirection.value === 'asc' ? 1 : -1
    const aVal = (a[sortColumn.value as keyof typeof a] ?? '') as string
    const bVal = (b[sortColumn.value as keyof typeof b] ?? '') as string
    return String(aVal).localeCompare(String(bVal)) * dir
  })

  return list
})

const paginatedModules = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredModules.value.slice(start, start + pageSize.value)
})

const statusOptions = [
  { label: 'Status: All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const columns = [
  { id: 'name', header: 'Module Name' },
  { id: 'slug', header: 'Key' },
  { id: 'category', header: 'Category' },
  { id: 'status', header: 'Status' },
  { id: 'entityCount', header: 'Entities' },
  { id: 'forms', header: 'Forms' },
  { id: 'updatedAt', header: 'Last Updated' },
  { id: 'actions', header: 'Actions' }
]

const pageSizeOptions = [5, 10, 20, 50]

onMounted(() => {
  meta.loadModules()
})

function toggleSort(col: string) {
  if (sortColumn.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = col
    sortDirection.value = 'asc'
  }
}

function sortIcon(col: string) {
  if (sortColumn.value !== col) return 'i-lucide-arrow-up-down'
  return sortDirection.value === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'
}

function openCreate() {
  Object.assign(createForm, { name: '', slug: '', description: '', icon: 'i-lucide-puzzle' })
  showCreateModal.value = true
}

async function handleCreate() {
  if (!createForm.name || !createForm.slug) {
    toast.add({ title: 'Missing fields', description: 'Name and slug are required', color: 'error' })
    return
  }
  const slug = createForm.slug.toLowerCase().replace(/\s+/g, '-')
  try {
    await meta.createModule({ ...createForm, slug })
    showCreateModal.value = false
    toast.add({ title: 'Module created', color: 'success' })
  } catch {
    toast.add({ title: 'Error', description: 'Could not create module', color: 'error' })
  }
}

function openSidePanel(mod: Module) {
  meta.selectModule(mod)
  showSidePanel.value = true
  detailTab.value = 'overview'
}

function closeSidePanel() {
  showSidePanel.value = false
  meta.selectedModule.value = null
}

async function handleDeactivate() {
  const mod = meta.selectedModule.value
  if (!mod) return
  const active = !mod.isActive
  try {
    await meta.toggleModuleActive(mod.id, active)
    showDeactivateConfirm.value = false
    toast.add({ title: active ? 'Module activated' : 'Module deactivated', color: 'success' })
  } catch {
    toast.add({ title: 'Error', description: 'Could not update module', color: 'error' })
  }
}

function handleRowSelect(_e: Event, row: { original: unknown }): void {
  openSidePanel(m(row))
}

function m(row: { original: unknown }): Module {
  return row.original as Module
}

function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '-'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>

<template>
  <UDashboardPanel id="module" :ui="{body:'gap-4 sm:gap-4'}">
    <template #header>
      <UDashboardNavbar title="Module Management">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="+ Create Module"
            color="primary"
            variant="solid"
            @click="openCreate"
          />
          <UDropdownMenu
            :items="[[{ label: 'Import Modules', icon: 'i-lucide-upload' }, { label: 'Export Modules', icon: 'i-lucide-download' }]]"
          >
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              square
            />
          </UDropdownMenu>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <UTabs v-model="activeTab" :items="tabs" variant="link" />
      <div class="flex h-full gap-3">
        <div class="flex flex-col w-full gap-3">
          <!-- Stats Row -->
          <div class="grid grid-cols-4 gap-4">
            <UCard>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-lg bg-green-100">
                  <UIcon name="i-lucide-layers" class="size-5 text-green-600" />
                </div>
                <div>
                  <div class="text-2xl font-bold">
                    {{ stats.total }}
                  </div>
                  <div class="text-sm text-(--ui-text-muted)">
                    Total Modules
                  </div>
                </div>
              </div>
              <div class="mt-2 text-xs text-green-600">
                ↑ 2 this month
              </div>
            </UCard>
            <UCard>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-lg bg-green-100">
                  <UIcon name="i-lucide-check-circle" class="size-5 text-green-600" />
                </div>
                <div>
                  <div class="text-2xl font-bold">
                    {{ stats.active }}
                  </div>
                  <div class="text-sm text-(--ui-text-muted)">
                    Active Modules
                  </div>
                </div>
              </div>
              <div class="mt-2 text-xs text-green-600">
                {{ stats.total ? Math.round(stats.active / stats.total * 100) : 0 }}% of total
              </div>
            </UCard>
            <UCard>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-lg bg-orange-100">
                  <UIcon name="i-lucide-pause-circle" class="size-5 text-orange-600" />
                </div>
                <div>
                  <div class="text-2xl font-bold">
                    {{ stats.inactive }}
                  </div>
                  <div class="text-sm text-(--ui-text-muted)">
                    Inactive Modules
                  </div>
                </div>
              </div>
              <div class="mt-2 text-xs text-orange-600">
                {{ stats.total ? Math.round(stats.inactive / stats.total * 100) : 0 }}% of total
              </div>
            </UCard>
            <UCard>
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                  <UIcon name="i-lucide-briefcase" class="size-5 text-blue-600" />
                </div>
                <div>
                  <div class="text-2xl font-bold">
                    {{ stats.business }}
                  </div>
                  <div class="text-sm text-(--ui-text-muted)">
                    Business Modules
                  </div>
                </div>
              </div>
              <div class="mt-2 text-xs text-blue-600">
                {{ stats.total ? Math.round(stats.business / stats.total * 100) : 0 }}% of total
              </div>
            </UCard>
          </div>

          <!-- Toolbar -->
          <div class="flex items-center justify-end">
            <div class="flex items-center gap-2">
              <UInput
                v-model="search"
                placeholder="Search modules..."
                icon="i-lucide-search"
                class="w-56"
              />
              <USelect v-model="statusFilter" :items="statusOptions" class="w-36" />
              <UButton
                :label="'Sort by: ' + sortColumn"
                trailing-icon="i-lucide-chevron-down"
                color="neutral"
                variant="outline"
                disabled
                class="cursor-not-allowed opacity-50"
              />
              <UButton
                :icon="viewMode === 'list' ? 'i-lucide-list' : 'i-lucide-grid-2x2'"
                color="neutral"
                variant="ghost"
                square
                @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
              />
              <UButton
                icon="i-lucide-settings-2"
                color="neutral"
                variant="ghost"
                square
              />
            </div>
          </div>

          <!-- Active Tab: All Modules -->
          <div v-if="activeTab === 'modules'">
            <UCard :ui="{ body: 'sm:p-0 p-0' }">
              <template #default>
                <UTable
                  :columns="columns"
                  :data="paginatedModules"
                  divide
                  hover
                  :on-select="handleRowSelect"
                >
                  <template #header-name>
                    <span class="inline-flex items-center gap-1 cursor-pointer" @click="toggleSort('name')">
                      Module Name <UIcon :name="sortIcon('name')" class="size-3.5" />
                    </span>
                  </template>
                  <template #header-slug>
                    <span class="inline-flex items-center gap-1 cursor-pointer" @click="toggleSort('slug')">
                      Key <UIcon :name="sortIcon('slug')" class="size-3.5" />
                    </span>
                  </template>
                  <template #header-category>
                    Category
                  </template>
                  <template #header-status>
                    <span class="inline-flex items-center gap-1 cursor-pointer" @click="toggleSort('isActive')">
                      Status <UIcon :name="sortIcon('isActive')" class="size-3.5" />
                    </span>
                  </template>
                  <template #header-entityCount>
                    <span class="inline-flex items-center gap-1">
                      Entities
                    </span>
                  </template>
                  <template #header-forms>
                    Forms
                  </template>
                  <template #header-updatedAt>
                    <span class="inline-flex items-center gap-1 cursor-pointer" @click="toggleSort('updatedAt')">
                      Last Updated <UIcon :name="sortIcon('updatedAt')" class="size-3.5" />
                    </span>
                  </template>
                  <template #header-actions>
                    Actions
                  </template>

                  <template #name-cell="{ row }">
                    <div class="flex items-center gap-3">
                      <UAvatar
                        :icon="m(row).icon || 'i-lucide-puzzle'"
                        square
                        size="md"
                        color="primary"
                      />
                      <div>
                        <div class="font-medium text-sm">
                          {{ m(row).name }}
                        </div>
                        <div class="text-xs text-(--ui-text-muted)">
                          {{ m(row).description || 'No description' }}
                        </div>
                      </div>
                    </div>
                  </template>
                  <template #slug-cell="{ row }">
                    <UBadge variant="subtle" color="neutral">
                      {{ m(row).slug }}
                    </UBadge>
                  </template>
                  <template #category-cell>
                    <UBadge variant="subtle" color="neutral">
                      —
                    </UBadge>
                  </template>
                  <template #status="{ row }">
                    <UBadge :color="m(row).isActive ? 'success' : 'warning'" variant="subtle">
                      <template #leading>
                        <span class="relative flex size-2">
                          <span
                            class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                            :class="m(row).isActive ? 'bg-green-400' : 'bg-orange-400'"
                          />
                          <span
                            class="relative inline-flex size-2 rounded-full"
                            :class="m(row).isActive ? 'bg-green-500' : 'bg-orange-500'"
                          />
                        </span>
                      </template>
                      {{ m(row).isActive ? 'Active' : 'Inactive' }}
                    </UBadge>
                  </template>
                  <template #entityCount-cell="{ row }">
                    <span class="text-right text-sm">{{ m(row).entityCount ?? 0 }}</span>
                  </template>
                  <template #forms-cell>
                    <span class="text-right text-sm">0</span>
                  </template>
                  <template #updatedAt-cell="{ row }">
                    <span class="text-sm text-(--ui-text-muted)">{{ getTimeAgo(m(row).updatedAt) }}</span>
                  </template>
                  <template #actions-cell>
                    <div class="flex items-center gap-1">
                      <UButton
                        icon="i-lucide-eye"
                        color="neutral"
                        variant="ghost"
                        square
                        size="sm"
                      />
                      <UButton
                        icon="i-lucide-pencil"
                        color="neutral"
                        variant="ghost"
                        square
                        size="sm"
                      />
                      <UDropdownMenu
                        :items="[[{ label: 'Duplicate', icon: 'i-lucide-copy' }, { label: 'Export', icon: 'i-lucide-download' }, { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' }]]"
                      >
                        <UButton
                          icon="i-lucide-ellipsis-vertical"
                          color="neutral"
                          variant="ghost"
                          square
                          size="sm"
                        />
                      </UDropdownMenu>
                    </div>
                  </template>
                  <template #empty>
                    <div class="py-12 text-center text-sm text-(--ui-text-muted)">
                      <UIcon name="i-lucide-package-x" class="mx-auto mb-2 size-8 opacity-50" />
                      No modules found
                    </div>
                  </template>
                </UTable>
              </template>
              <template #footer>
                <div v-if="meta.modules.value.length > 0" class="flex items-center justify-between">
                  <div class="text-sm text-(--ui-text-muted)">
                    Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize,
                                                                                  filteredModules.length) }} of
                    {{ filteredModules.length }} results
                  </div>
                  <UPagination v-model="currentPage" :total="filteredModules.length" :page-size="pageSize" />
                  <div class="flex items-center gap-2 text-sm text-(--ui-text-muted)">
                    <USelect v-model="pageSize" :items="pageSizeOptions" /> / page
                  </div>
                </div>
              </template>
            </UCard>
          </div>

          <!-- Active Tab: Module Categories -->
          <div v-else class="flex flex-col items-center justify-center py-16">
            <UIcon name="i-lucide-folder-tree" class="mb-3 size-12 text-(--ui-text-muted) opacity-30" />
            <p class="text-sm text-(--ui-text-muted)">
              No module categories yet
            </p>
          </div>
        </div>

        <!-- Side Panel -->
        <Transition name="slide-panel">
          <UCard
            v-if="showSidePanel && meta.selectedModule.value"
            class="h-full flex flex-col w-96"
            :ui="{ header:'flex justify-between p-2' ,body:'sm:p-0 p-0 h-full'}"
          >
            <!-- Panel Header -->
            <template #header>
                <h3 class="font-semibold text-sm">
                  Module Details
                </h3>
                <UButton
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  square
                  size="sm"
                  @click="closeSidePanel"
                />
            </template>

            <!-- Module Hero -->
            <div class="border-b border-(--ui-border) flex flex-col gap-2 p-2">
              <div class="flex items-center gap-3">
                <UAvatar
                  :icon="meta.selectedModule.value.icon || 'i-lucide-puzzle'"
                  square
                  size="lg"
                  class="bg-green-100 text-green-700"
                />
                <div class="min-w-0">
                  <div class="font-semibold text-sm truncate">
                    {{ meta.selectedModule.value.name }}
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <UBadge
                      :color="meta.selectedModule.value.isActive ? 'success' : 'warning'"
                      variant="subtle"
                      size="sm"
                    >
                      {{ meta.selectedModule.value.isActive ? 'Active' : 'Inactive' }}
                    </UBadge>
                    <UBadge variant="subtle" color="neutral" size="sm">
                      {{ meta.selectedModule.value.slug }}
                    </UBadge>
                  </div>
                </div>
              </div>
              <UTabs v-model="detailTab" :items="detailTabs" size="xs"/>
            </div>

            <!-- Tab Content -->
            <div class="flex-1 overflow-auto h-full">
              <!-- Overview Tab -->
              <div v-if="detailTab === 'overview'">
                <div class="p-4">
                  <h4 class="mb-1 text-xs font-semibold uppercase text-(--ui-text-muted)">
                    Description
                  </h4>
                  <p class="text-sm">
                    {{ meta.selectedModule.value.description || 'No description provided.' }}
                  </p>
                </div>

                <USeparator/>

                <div class="p-3 space-y-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-(--ui-text-muted)">Category</span>
                    <span>—</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-(--ui-text-muted)">Status</span>
                    <span class="flex items-center gap-1.5">
                      <span class="relative flex size-2">
                        <span
                          class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                          :class="meta.selectedModule.value.isActive ? 'bg-green-400' : 'bg-orange-400'"
                        />
                        <span
                          class="relative inline-flex size-2 rounded-full"
                          :class="meta.selectedModule.value.isActive ? 'bg-green-500' : 'bg-orange-500'"
                        />
                      </span>
                      {{ meta.selectedModule.value.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-(--ui-text-muted)">Version</span>
                    <span>1.0</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-(--ui-text-muted)">Entities</span>
                    <span>{{ meta.selectedModule.value.entityCount ?? 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-(--ui-text-muted)">Forms</span>
                    <span>0</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-(--ui-text-muted)">Created</span>
                    <span>{{ meta.selectedModule.value.createdAt ? new
                      Date(meta.selectedModule.value.createdAt).toLocaleDateString() : '-' }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-(--ui-text-muted)">Last Updated</span>
                    <span>{{ getTimeAgo(meta.selectedModule.value.updatedAt) }}</span>
                  </div>
                </div>

                <USeparator />

                <h4 class="p-2 text-xs font-semibold uppercase text-(--ui-text-muted)">
                  Quick Actions
                </h4>
                <div class="p-1 space-y-1">
                  <UButton
                    block
                    color="neutral"
                    variant="ghost"
                    trailing-icon="i-lucide-arrow-right"
                    class="justify-between"
                  >
                    <span class="flex items-center gap-2">
                      <UIcon name="i-lucide-eye" class="size-4" /> View Module
                    </span>
                  </UButton>
                  <UButton
                    block
                    color="neutral"
                    variant="ghost"
                    trailing-icon="i-lucide-arrow-right"
                    class="justify-between"
                  >
                    <span class="flex items-center gap-2">
                      <UIcon name="i-lucide-database" class="size-4" /> Manage Entities
                    </span>
                  </UButton>
                  <UButton
                    block
                    color="neutral"
                    variant="ghost"
                    trailing-icon="i-lucide-arrow-right"
                    class="justify-between"
                  >
                    <span class="flex items-center gap-2">
                      <UIcon name="i-lucide-file-text" class="size-4" /> Manage Forms
                    </span>
                  </UButton>
                  <UButton
                    block
                    color="neutral"
                    variant="ghost"
                    trailing-icon="i-lucide-arrow-right"
                    class="justify-between"
                  >
                    <span class="flex items-center gap-2">
                      <UIcon name="i-lucide-settings-2" class="size-4" /> Module Settings
                    </span>
                  </UButton>
                  <UButton
                    block
                    color="neutral"
                    variant="ghost"
                    trailing-icon="i-lucide-arrow-right"
                    class="justify-between"
                  >
                    <span class="flex items-center gap-2">
                      <UIcon name="i-lucide-shield" class="size-4" /> Manage Permissions
                    </span>
                  </UButton>
                </div>
              </div>

              <!-- Entities Tab -->
              <div v-else-if="detailTab === 'entities'">
                <div
                  v-if="meta.moduleEntities.value.length === 0"
                  class="py-8 text-center text-sm text-(--ui-text-muted)"
                >
                  <UIcon name="i-lucide-database" class="mx-auto mb-2 size-6 opacity-50" />
                  No entities in this module
                </div>
                <div v-else class="p-2 space-y-2">
                  <div
                    v-for="entity in meta.moduleEntities.value"
                    :key="entity.id"
                    class="flex items-center gap-3 rounded-lg border border-(--ui-border) px-3 py-2.5"
                  >
                    <UAvatar
                      :icon="entity.icon || 'i-lucide-table-2'"
                      square
                      size="sm"
                      class="bg-(--ui-bg-elevated) text-(--ui-text-muted)"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-medium">
                        {{ entity.name }}
                      </div>
                      <div class="text-xs text-(--ui-text-muted)">
                        {{ entity.slug }}
                      </div>
                    </div>
                    <span class="text-xs text-(--ui-text-muted)">
                      {{ (meta.moduleFieldCounts.value.find(fc => fc.entityId === entity.id)?.count ?? 0) }} fields
                    </span>
                  </div>
                </div>
              </div>

              <!-- Forms Tab -->
              <div v-else-if="detailTab === 'forms'" class="py-8 text-center text-sm text-(--ui-text-muted) flex flex-col">
                <UIcon name="i-lucide-file-text" class="mx-auto mb-2 size-6 opacity-50" />
                No forms yet
              </div>

              <!-- Users Tab -->
              <div v-else class="py-8 text-center text-sm text-(--ui-text-muted) flex flex-col">
                <UIcon name="i-lucide-users" class="mx-auto mb-2 size-6 opacity-50" />
                No users assigned
              </div>
            </div>

            <!-- Panel Footer -->
            <template #footer>
              <UButton
                block
                :color="meta.selectedModule.value.isActive ? 'error' : 'success'"
                :variant="meta.selectedModule.value.isActive ? 'outline' : 'solid'"
                :icon="meta.selectedModule.value.isActive ? 'i-lucide-power' : 'i-lucide-play'"
                @click="showDeactivateConfirm = true"
              >
                {{ meta.selectedModule.value.isActive ? 'Deactivate Module' : 'Activate Module' }}
              </UButton>
            </template>

          </UCard>
        </Transition>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Create Module Modal -->
  <UModal v-model:open="showCreateModal" title="Create Module">
    <template #body>
      <UForm class="space-y-4">
        <UFormField label="Module Name" required>
          <UInput v-model="createForm.name" placeholder="e.g. Customer Management" />
        </UFormField>
        <UFormField label="Slug" required>
          <UInput v-model="createForm.slug" placeholder="e.g. customer-management" />
        </UFormField>
        <UFormField label="Description">
          <UTextarea v-model="createForm.description" placeholder="What does this module do?" />
        </UFormField>
        <UFormField label="Icon">
          <UInput v-model="createForm.icon" placeholder="i-lucide-puzzle" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="showCreateModal = false"
          />
          <UButton label="Create" color="primary" @click="handleCreate" />
        </div>
      </UForm>
    </template>
  </UModal>

  <!-- Deactivate Confirmation Modal -->
  <UModal
    v-model:open="showDeactivateConfirm"
    :title="meta.selectedModule.value && meta.selectedModule.value.isActive ? 'Deactivate Module' : 'Activate Module'"
  >
    <template #body>
      <p class="text-sm text-(--ui-text-muted)">
        Are you sure you want to <strong>{{ meta.selectedModule.value && meta.selectedModule.value.isActive
          ? 'deactivate' : 'activate' }}</strong>
        "<strong>{{ meta.selectedModule.value?.name }}</strong>"?
        {{ meta.selectedModule.value && meta.selectedModule.value.isActive ? ' This will disable all related entities.'
          : '' }}
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancel"
          color="neutral"
          variant="outline"
          @click="showDeactivateConfirm = false"
        />
        <UButton
          :label="meta.selectedModule.value && meta.selectedModule.value.isActive ? 'Deactivate' : 'Activate'"
          :color="meta.selectedModule.value && meta.selectedModule.value.isActive ? 'error' : 'success'"
          @click="handleDeactivate"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
