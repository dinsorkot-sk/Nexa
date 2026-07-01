<script setup lang="ts">
import type { Entity } from '~/types/metadata'

const router = useRouter()
const { createModule } = useModules()
const toast = useToast()

// ── Wizard Steps ──────────────────────────────────────────────────────
const currentStep = ref(0)
const totalSteps = 5

const steps = computed(() => [
  { label: 'Basic Info', completed: currentStep.value > 0 },
  { label: 'Entities', completed: currentStep.value > 1 },
  { label: 'Navigation', completed: currentStep.value > 2 },
  { label: 'Permissions', completed: currentStep.value > 3 },
  { label: 'Review', completed: currentStep.value > 4 }
])

function goToStep(i: number) {
  if (i <= currentStep.value + 1) currentStep.value = i
}

// ── Step 1: Basic Info ───────────────────────────────────────────────
const moduleName = ref('')
const moduleSlug = ref('')
const moduleDescription = ref('')
const moduleIcon = ref('i-lucide-package')
const moduleColor = ref('#10B981')
const moduleCategory = ref('Business')
const moduleVersion = ref('1.0.0')
const moduleActive = ref(true)

watch(moduleName, (val) => {
  if (!val) {
    moduleSlug.value = ''
    return
  }
  moduleSlug.value = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
})

const categoryOptions = [
  { label: 'Business', value: 'Business' },
  { label: 'Inventory', value: 'Inventory' },
  { label: 'HRM', value: 'HRM' },
  { label: 'Accounting', value: 'Accounting' },
  { label: 'Sales', value: 'Sales' },
  { label: 'Support', value: 'Support' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Procurement', value: 'Procurement' },
  { label: 'Other', value: 'Other' }
]

const iconOptions = [
  { label: 'Package', value: 'i-lucide-package' },
  { label: 'Box', value: 'i-lucide-box' },
  { label: 'Database', value: 'i-lucide-database' },
  { label: 'Layers', value: 'i-lucide-layers' },
  { label: 'Grid', value: 'i-lucide-grid-3x3' },
  { label: 'Settings', value: 'i-lucide-settings' },
  { label: 'Shield', value: 'i-lucide-shield' },
  { label: 'Activity', value: 'i-lucide-activity' }
]

const step1Valid = computed(() =>
  moduleName.value.trim().length > 0 && moduleSlug.value.trim().length > 0
)

// ── Step 2: Entities ─────────────────────────────────────────────────
const allEntities = ref<Entity[]>([])
const selectedEntityIds = ref<Set<number>>(new Set())
const entitySearch = ref('')
const entityTab = ref<string | number>('all')
const entitiesLoading = ref(false)

const filteredEntities = computed(() => {
  let list = allEntities.value
  if (entitySearch.value) {
    const q = entitySearch.value.toLowerCase()
    list = list.filter(e =>
      e.name.toLowerCase().includes(q)
      || (e.description || '').toLowerCase().includes(q)
    )
  }
  if (entityTab.value === 'selected') {
    list = list.filter(e => selectedEntityIds.value.has(e.id))
  }
  return list
})

function toggleEntity(id: number) {
  const s = new Set(selectedEntityIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedEntityIds.value = s
}

function selectAllEntities() {
  selectedEntityIds.value = new Set(filteredEntities.value.map(e => e.id))
}

function deselectAllEntities() {
  selectedEntityIds.value = new Set()
}

async function fetchEntities() {
  entitiesLoading.value = true
  try {
    allEntities.value = await $fetch<Entity[]>('/api/metadata/entities')
  } catch {
    toast.add({ title: 'Failed to load entities', color: 'error' })
  } finally {
    entitiesLoading.value = false
  }
}

// ── Step 3: Navigation (placeholder) ──────────────────────────────────
const navMenuLabel = ref(moduleName.value || 'New Module')
const navIcon = ref(moduleIcon.value)
const navOrder = ref(0)

watch(moduleName, (val) => {
  if (val && navMenuLabel.value === '') navMenuLabel.value = val
})

// ── Step 4: Permissions (placeholder) ────────────────────────────────
const permPreset = ref('admin_only')

// ── Step 5: Review + Submit ──────────────────────────────────────────
const submitting = ref(false)

async function handleSubmit() {
  if (!step1Valid.value) return
  submitting.value = true
  try {
    const payload = {
      name: moduleName.value,
      slug: moduleSlug.value,
      description: moduleDescription.value || undefined,
      icon: moduleIcon.value,
      color: moduleColor.value,
      category: moduleCategory.value,
      version: moduleVersion.value,
      isActive: moduleActive.value,
      navConfig: JSON.stringify({ label: navMenuLabel.value, icon: navIcon.value, order: navOrder.value }),
      permConfig: JSON.stringify({ preset: permPreset.value }),
      entityIds: Array.from(selectedEntityIds.value)
    }
    const mod = await createModule(payload)
    if (mod) router.push('/module')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchEntities()
})
</script>

<template>
  <UDashboardPanel id="module-create">
    <template #header>
      <UDashboardNavbar title="Create Module">
        <template #leading>
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            square
            :to="'/module'"
          />
        </template>
        <template #right>
          <UButton
            v-if="currentStep === totalSteps - 1"
            label="Create Module"
            icon="i-lucide-check"
            :loading="submitting"
            :disabled="!step1Valid"
            @click="handleSubmit"
          />
          <UButton
            v-else
            label="Next Step"
            icon="i-lucide-arrow-right"
            trailing
            :disabled="currentStep === 0 && !step1Valid"
            @click="currentStep < totalSteps - 1 && currentStep++"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UContainer class="py-8">
        <!-- ── Step Indicator ──────────────────────────── -->
        <div class="flex items-center gap-2 mb-8 overflow-x-auto">
          <template v-for="(step, i) in steps" :key="i">
            <button
              class="flex items-center gap-2 shrink-0"
              @click="goToStep(i)"
            >
              <span
                class="size-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                :class="{
                  'bg-(--ui-primary) text-white': currentStep === i,
                  'bg-(--ui-success) text-white': step.completed,
                  'bg-(--ui-bg-accented) text-(--ui-text-muted)': !step.completed && currentStep !== i
                }"
              >
                <UIcon v-if="step.completed" name="i-lucide-check" class="size-4" />
                <span v-else>{{ i + 1 }}</span>
              </span>
              <span
                class="text-sm whitespace-nowrap hidden sm:inline"
                :class="currentStep === i ? 'text-(--ui-text-highlighted) font-medium' : 'text-(--ui-text-muted)'"
              >
                {{ step.label }}
              </span>
            </button>
            <UIcon
              v-if="i < totalSteps - 1"
              name="i-lucide-chevron-right"
              class="size-4 text-(--ui-text-muted) shrink-0"
            />
          </template>
        </div>

        <!-- ── Step Content ─────────────────────────── -->
        <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <!-- Form Column -->
          <div class="xl:col-span-3">
            <!-- ═════ Step 1: Basic Info ═════ -->
            <div v-if="currentStep === 0">
              <UCard>
                <template #header>
                  <p class="text-lg font-bold text-(--ui-text-highlighted)">
                    Basic Information
                  </p>
                  <p class="text-sm text-(--ui-text-muted)">
                    Define the core details of your module.
                  </p>
                </template>
                <div class="space-y-5">
                  <UFormField label="Module Name" required>
                    <UInput
                      v-model="moduleName"
                      placeholder="e.g. Customer Management"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField label="Module Slug" required>
                    <UInput
                      v-model="moduleSlug"
                      placeholder="customer-management"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField label="Description">
                    <UTextarea
                      v-model="moduleDescription"
                      placeholder="Brief description of this module..."
                      class="w-full"
                    />
                  </UFormField>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UFormField label="Icon">
                      <USelectMenu
                        :model-value="iconOptions.find(o => o.value === moduleIcon) ?? iconOptions[0]"
                        :items="iconOptions"
                        class="w-full"
                        @update:model-value="moduleIcon = ($event?.value as string) ?? 'i-lucide-puzzle'"
                      />
                    </UFormField>

                    <UFormField label="Color">
                      <div class="flex items-center gap-2">
                        <input
                          v-model="moduleColor"
                          type="color"
                          class="size-9 rounded border border-default cursor-pointer shrink-0"
                        >
                        <code class="text-xs text-(--ui-text-muted)">{{ moduleColor }}</code>
                      </div>
                    </UFormField>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UFormField label="Category">
                      <USelectMenu
                        :model-value="categoryOptions.find(o => o.value === moduleCategory) ?? categoryOptions[0]"
                        :items="categoryOptions"
                        class="w-full"
                        @update:model-value="moduleCategory = ($event?.value as string) ?? 'Business'"
                      />
                    </UFormField>

                    <UFormField label="Version">
                      <UInput
                        v-model="moduleVersion"
                        placeholder="1.0.0"
                        class="w-full"
                      />
                    </UFormField>
                  </div>

                  <UFormField label="Status">
                    <div class="flex items-center gap-3">
                      <USwitch v-model="moduleActive" />
                      <span
                        class="text-sm font-medium"
                        :class="moduleActive ? 'text-(--ui-success)' : 'text-(--ui-text-muted)'"
                      >
                        {{ moduleActive ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                  </UFormField>
                </div>
              </UCard>
            </div>

            <!-- ═════ Step 2: Entities ═════ -->
            <div v-if="currentStep === 1">
              <UCard>
                <template #header>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-lg font-bold text-(--ui-text-highlighted)">
                        Entities
                      </p>
                      <p class="text-sm text-(--ui-text-muted)">
                        Select entities to include in this module.
                      </p>
                    </div>
                    <span class="text-xs font-medium text-(--ui-success)">{{ selectedEntityIds.size }} selected</span>
                  </div>
                </template>

                <!-- Filter bar -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                  <UTabs
                    v-model="entityTab"
                    :items="[
                      { label: 'All Entities', value: 'all' },
                      { label: `Selected (${selectedEntityIds.size})`, value: 'selected' }
                    ]"
                  />
                  <UInput
                    v-model="entitySearch"
                    icon="i-lucide-search"
                    placeholder="Search entities..."
                    size="sm"
                    class="w-full sm:w-56"
                  />
                  <div class="flex-1" />
                  <div v-if="entityTab === 'all'" class="flex gap-1">
                    <UButton
                      label="Select All"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="selectAllEntities"
                    />
                    <UButton
                      label="Clear"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="deselectAllEntities"
                    />
                  </div>
                </div>

                <!-- Entity list -->
                <div v-if="entitiesLoading" class="py-12 text-center">
                  <UIcon name="i-lucide-loader-circle" class="size-6 text-(--ui-text-muted) animate-spin mx-auto mb-2" />
                  <p class="text-sm text-(--ui-text-muted)">
                    Loading entities...
                  </p>
                </div>
                <div v-else-if="filteredEntities.length === 0" class="py-12 text-center">
                  <UIcon name="i-lucide-search-x" class="size-8 text-(--ui-text-muted) mx-auto mb-2" />
                  <p class="text-sm text-(--ui-text-muted)">
                    No entities found
                  </p>
                </div>
                <div v-else class="space-y-1 max-h-96 overflow-y-auto">
                  <div
                    v-for="entity in filteredEntities"
                    :key="entity.id"
                    class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                    :class="selectedEntityIds.has(entity.id) ? 'bg-(--ui-primary)/10' : 'hover:bg-(--ui-bg-accented)'"
                    @click="toggleEntity(entity.id)"
                  >
                    <UCheckbox
                      :model-value="selectedEntityIds.has(entity.id)"
                      :label="entity.name"
                      @click.stop="toggleEntity(entity.id)"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-(--ui-text-muted) truncate">
                        {{ entity.tableName }}
                      </p>
                    </div>
                    <span
                      class="inline-block size-1.5 rounded-full shrink-0"
                      :class="entity.isActive ? 'bg-(--ui-success)' : 'bg-(--ui-warning)'"
                    />
                  </div>
                </div>
              </UCard>
            </div>

            <!-- ═════ Step 3: Navigation ═════ -->
            <div v-if="currentStep === 2">
              <UCard>
                <template #header>
                  <p class="text-lg font-bold text-(--ui-text-highlighted)">
                    Navigation Settings
                  </p>
                  <p class="text-sm text-(--ui-text-muted)">
                    Configure how this module appears in the sidebar.
                  </p>
                </template>
                <div class="space-y-5">
                  <UFormField label="Menu Label">
                    <UInput
                      v-model="navMenuLabel"
                      placeholder="Module name"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Menu Icon">
                    <div class="flex items-center gap-2">
                      <div class="size-8 rounded flex items-center justify-center bg-(--ui-primary)/10">
                        <UIcon :name="navIcon" class="size-4 text-(--ui-primary)" />
                      </div>
                      <USelectMenu
                        :model-value="iconOptions.find(o => o.value === navIcon) ?? iconOptions[0]"
                        :items="iconOptions"
                        class="w-full"
                        @update:model-value="navIcon = ($event?.value as string) ?? 'i-lucide-folder'"
                      />
                    </div>
                  </UFormField>
                  <UFormField label="Sort Order">
                    <UInput
                      v-model="navOrder"
                      type="number"
                      min="0"
                      class="w-24"
                    />
                  </UFormField>
                </div>
              </UCard>
            </div>

            <!-- ═════ Step 4: Permissions ═════ -->
            <div v-if="currentStep === 3">
              <UCard>
                <template #header>
                  <p class="text-lg font-bold text-(--ui-text-highlighted)">
                    Permissions
                  </p>
                  <p class="text-sm text-(--ui-text-muted)">
                    Define access control for this module.
                  </p>
                </template>
                <div class="space-y-4">
                  <USelectMenu
                    :model-value="([
                      { label: 'Admin Only', value: 'admin_only' },
                      { label: 'Admin + Manager', value: 'admin_manager' },
                      { label: 'All Roles', value: 'all_roles' }
                    ] as const).find(o => o.value === permPreset) ?? { label: 'Admin Only', value: 'admin_only' }"
                    :items="[
                      { label: 'Admin Only', value: 'admin_only' },
                      { label: 'Admin + Manager', value: 'admin_manager' },
                      { label: 'All Roles', value: 'all_roles' }
                    ]"
                    class="w-full"
                    @update:model-value="permPreset = ($event?.value as string) ?? 'admin_only'"
                  />
                  <p class="text-xs text-(--ui-text-muted)">
                    Fine-grained permissions coming in a future release.
                  </p>
                </div>
              </UCard>
            </div>

            <!-- ═════ Step 5: Review ═════ -->
            <div v-if="currentStep === 4">
              <UCard>
                <template #header>
                  <p class="text-lg font-bold text-(--ui-text-highlighted)">
                    Review &amp; Create
                  </p>
                  <p class="text-sm text-(--ui-text-muted)">
                    Verify module details before creating.
                  </p>
                </template>
                <div class="space-y-6">
                  <!-- Summary Grid -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-xs font-medium text-(--ui-text-muted)">
                        Name
                      </p>
                      <p class="text-sm font-medium">
                        {{ moduleName }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-(--ui-text-muted)">
                        Slug
                      </p>
                      <p class="text-sm">
                        {{ moduleSlug }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-(--ui-text-muted)">
                        Category
                      </p>
                      <p class="text-sm">
                        {{ moduleCategory }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-(--ui-text-muted)">
                        Version
                      </p>
                      <p class="text-sm">
                        {{ moduleVersion }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-(--ui-text-muted)">
                        Status
                      </p>
                      <div class="flex items-center gap-1.5">
                        <span
                          class="inline-block size-1.5 rounded-full"
                          :class="moduleActive ? 'bg-(--ui-success)' : 'bg-(--ui-warning)'"
                        />
                        <span class="text-sm">{{ moduleActive ? 'Active' : 'Inactive' }}</span>
                      </div>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-(--ui-text-muted)">
                        Entities
                      </p>
                      <p class="text-sm">
                        {{ selectedEntityIds.size }} selected
                      </p>
                    </div>
                  </div>

                  <!-- Description -->
                  <div v-if="moduleDescription">
                    <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                      Description
                    </p>
                    <p class="text-sm">
                      {{ moduleDescription }}
                    </p>
                  </div>

                  <!-- Pills -->
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-for="id in Array.from(selectedEntityIds)"
                      :key="id"
                      color="success"
                      variant="subtle"
                      size="sm"
                    >
                      {{ allEntities.find(e => e.id === id)?.name || `Entity #${id}` }}
                    </UBadge>
                  </div>
                </div>
              </UCard>
            </div>
          </div>

          <!-- ── Live Preview (xl+) ─────────────────── -->
          <div class="hidden xl:block xl:col-span-2">
            <div class="sticky top-6">
              <p class="text-xs font-medium text-(--ui-text-muted) mb-3 uppercase tracking-wider">
                Live Preview
              </p>
              <UCard>
                <template #header>
                  <div class="flex items-center gap-2">
                    <div
                      class="size-8 rounded-lg flex items-center justify-center"
                      :style="{ backgroundColor: moduleColor || 'var(--ui-primary)' }"
                    >
                      <UIcon :name="moduleIcon || 'i-lucide-package'" class="size-4 text-white" />
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-sm truncate">
                        {{ moduleName || 'Module Name' }}
                      </p>
                      <p class="text-xs text-(--ui-text-muted) truncate">
                        {{ moduleSlug || 'module-slug' }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 mt-2">
                    <span
                      class="inline-block size-1.5 rounded-full"
                      :class="moduleActive ? 'bg-(--ui-success)' : 'bg-(--ui-warning)'"
                    />
                    <span class="text-xs text-(--ui-text-muted)">{{ moduleActive ? 'Active' : 'Inactive' }}</span>
                    <span class="text-xs text-(--ui-text-muted) mx-1">·</span>
                    <span class="text-xs text-(--ui-text-muted)">v{{ moduleVersion }}</span>
                  </div>
                </template>
                <div class="space-y-3">
                  <div>
                    <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                      Description
                    </p>
                    <p class="text-sm">
                      {{ moduleDescription || '(no description)' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                      Category
                    </p>
                    <UBadge
                      :label="moduleCategory"
                      color="neutral"
                      variant="subtle"
                      size="sm"
                    />
                  </div>
                  <div v-if="selectedEntityIds.size > 0">
                    <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                      Entities
                    </p>
                    <UBadge
                      :label="`${selectedEntityIds.size} entities`"
                      color="success"
                      variant="subtle"
                      size="sm"
                    />
                  </div>
                </div>
              </UCard>

              <!-- What's next hint -->
              <UCard class="mt-4">
                <div class="space-y-1">
                  <UIcon name="i-lucide-rocket" class="size-5 text-(--ui-primary)" />
                  <p class="text-sm font-medium text-(--ui-text-highlighted)">
                    Almost there!
                  </p>
                  <p class="text-xs text-(--ui-text-muted)">
                    Review the details and click <strong>Create Module</strong> to finalize.
                  </p>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
