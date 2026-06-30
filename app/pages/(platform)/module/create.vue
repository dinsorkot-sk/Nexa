<script setup lang="ts">
definePageMeta({
  title: 'Module Builder'
})

const toast = useToast()
const router = useRouter()
const meta = useMetadata()

const step = ref(1)
const totalSteps = 5

const form = reactive({
  name: '',
  key: '',
  description: '',
  icon: 'i-lucide-puzzle',
  color: '#10B981',
  category: '',
  version: '1.0.0',
  status: true,
  entities: ['Customer', 'Contact', 'Lead'] as string[],
  navigation: [
    { label: 'Overview', type: 'Dashboard', linkedTo: 'Overview (Default)', active: true },
    { label: 'Customers', type: 'Entity', linkedTo: 'Customer', active: true },
    { label: 'Contacts', type: 'Entity', linkedTo: 'Contact', active: true },
    { label: 'Leads', type: 'Entity', linkedTo: 'Lead', active: true },
    { label: 'Activities', type: 'Entity', linkedTo: 'Activity', active: true },
    { label: 'Reports', type: 'Custom', linkedTo: 'Report (Custom)', active: true },
    { label: 'Settings', type: 'Custom', linkedTo: 'Settings (Custom)', active: true }
  ],
  permissions: {
    superAdmin: 'Full system access',
    admin: 'Manage system and settings',
    manager: 'Manage team and data',
    user: 'Regular system user',
    viewer: 'Read-only access'
  } as Record<string, string>
})

const formErrors = reactive<Record<string, string>>({})

watch(() => form.name, (_newName) => {
  if (!form.key || form.key === form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) {
    form.key = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }
})

function validateStep(stepNum: number): boolean {
  clearErrors()
  if (stepNum === 1) {
    if (!form.name.trim()) {
      formErrors.name = 'Module name is required'
      return false
    }
    if (!form.key.trim()) {
      formErrors.key = 'Module key is required'
      return false
    }
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(form.key)) {
      formErrors.key = 'Key must be lowercase alphanumeric, underscore or hyphen'
      return false
    }
  }
  return true
}

function clearErrors() {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  Object.keys(formErrors).forEach(k => delete formErrors[k])
}

const steps = [
  { num: 1, label: 'Basic Information', subtitle: 'Define module details', icon: 'i-lucide-info' },
  { num: 2, label: 'Entities', subtitle: 'Select entities for this module', icon: 'i-lucide-database' },
  { num: 3, label: 'Navigation', subtitle: 'Configure module menu', icon: 'i-lucide-menu' },
  { num: 4, label: 'Permissions', subtitle: 'Set access permissions', icon: 'i-lucide-shield' },
  { num: 5, label: 'Review', subtitle: 'Review and create module', icon: 'i-lucide-eye' }
]

const categoryOptions = [
  { label: 'Business', value: 'Business' },
  { label: 'HRM', value: 'HRM' },
  { label: 'Inventory', value: 'Inventory' },
  { label: 'Accounting', value: 'Accounting' },
  { label: 'Sales', value: 'Sales' }
]

const iconOptions = [
  { label: 'Puzzle', value: 'i-lucide-puzzle' },
  { label: 'Users', value: 'i-lucide-users' },
  { label: 'Building', value: 'i-lucide-building' },
  { label: 'Shopping Cart', value: 'i-lucide-shopping-cart' },
  { label: 'File Text', value: 'i-lucide-file-text' },
  { label: 'Settings', value: 'i-lucide-settings' },
  { label: 'Bar Chart', value: 'i-lucide-bar-chart-3' },
  { label: 'Calendar', value: 'i-lucide-calendar' },
  { label: 'Mail', value: 'i-lucide-mail' },
  { label: 'Message Circle', value: 'i-lucide-message-circle' }
]

const colorOptions = [
  { value: '#10B981', class: 'bg-emerald-500' },
  { value: '#3B82F6', class: 'bg-blue-500' },
  { value: '#8B5CF6', class: 'bg-violet-500' },
  { value: '#F59E0B', class: 'bg-amber-500' },
  { value: '#EF4444', class: 'bg-red-500' },
  { value: '#EC4899', class: 'bg-pink-500' },
  { value: '#14B8A6', class: 'bg-teal-500' },
  { value: '#F97316', class: 'bg-orange-500' }
]

const allEntities = [
  { name: 'Customer', category: 'Business', description: 'Manage customer information and relationships' },
  { name: 'Contact', category: 'Business', description: 'Store contact details and communication logs' },
  { name: 'Lead', category: 'Business', description: 'Track and manage sales leads' },
  { name: 'Product', category: 'Inventory', description: 'Manage product catalog and inventory' },
  { name: 'Employee', category: 'HRM', description: 'Manage employee records and information' },
  { name: 'Invoice', category: 'Accounting', description: 'Create and manage invoices' },
  { name: 'Order', category: 'Sales', description: 'Process and track customer orders' },
  { name: 'Vendor', category: 'Inventory', description: 'Manage vendor and supplier information' }
]

const roles = [
  { id: 'superAdmin', label: 'Super Administrator', description: 'Full system access', level: 'Full Control' },
  { id: 'admin', label: 'Administrator', description: 'Manage system and settings', level: 'Manage' },
  { id: 'manager', label: 'Manager', description: 'Manage team and data', level: 'Edit' },
  { id: 'user', label: 'User', description: 'Regular system user', level: 'Create' },
  { id: 'viewer', label: 'Viewer', description: 'Read-only access', level: 'View' }
]

const permissionsMatrix = [
  { action: 'View', icon: 'i-lucide-eye' },
  { action: 'Create', icon: 'i-lucide-plus' },
  { action: 'Edit', icon: 'i-lucide-pencil' },
  { action: 'Delete', icon: 'i-lucide-trash-2' },
  { action: 'Export', icon: 'i-lucide-download' }
]

const perms = reactive<Record<string, Record<string, boolean>>>({
  superAdmin: { View: true, Create: true, Edit: true, Delete: true, Export: true },
  admin: { View: true, Create: true, Edit: true, Delete: true, Export: true },
  manager: { View: true, Create: true, Edit: true, Delete: false, Export: true },
  user: { View: true, Create: true, Edit: false, Delete: false, Export: false },
  viewer: { View: true, Create: false, Edit: false, Delete: false, Export: false }
})

const entitySearch = ref('')
const entityTab = ref<'all' | 'selected'>('all')

const filteredEntities = computed(() => {
  let list = allEntities
  if (entitySearch.value) {
    const q = entitySearch.value.toLowerCase()
    list = list.filter(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
  }
  if (entityTab.value === 'selected') {
    list = list.filter(e => form.entities.includes(e.name))
  }
  return list
})

const selectedEntityCount = computed(() => form.entities.length)

function toggleEntity(name: string) {
  const idx = form.entities.indexOf(name)
  if (idx >= 0) {
    form.entities.splice(idx, 1)
  } else {
    form.entities.push(name)
  }
}

function addNavItem() {
  form.navigation.push({ label: '', type: 'Entity', linkedTo: '', active: true })
}

function removeNavItem(idx: number) {
  form.navigation.splice(idx, 1)
}

function togglePerm(roleId: string, action: string) {
  const key = roleId as keyof typeof perms
  if (perms[key]) {
    perms[key][action] = !perms[key][action]
  }
}

const isLastStep = computed(() => step.value === totalSteps)
const isFirstStep = computed(() => step.value === 1)
const draftSaving = ref(false)
const draftLoaded = ref(false)

function nextStep() {
  if (!validateStep(step.value)) return
  if (step.value < totalSteps) step.value++
}

function prevStep() {
  if (step.value > 1) step.value--
}

function goToStep(n: number) {
  if (n <= step.value) step.value = n
}

async function handleCreate() {
  if (!validateStep(1)) {
    step.value = 1
    return
  }
  try {
    await meta.createModule({
      name: form.name,
      slug: form.key,
      description: form.description || undefined,
      icon: form.icon,
      color: form.color,
      category: form.category || undefined,
      version: form.version,
      isActive: form.status,
      navConfig: JSON.stringify(form.navigation),
      permConfig: JSON.stringify(perms),
      entityConfig: JSON.stringify(form.entities)
    })
    toast.add({ title: 'Module created', description: `"${form.name}" has been created successfully.`, color: 'success' })
    clearDraft()
    router.push('/module')
  } catch {
    toast.add({ title: 'Error', description: 'Failed to create module', color: 'error' })
  }
}

const DRAFT_KEY = 'nexa_module_draft'

function saveDraft() {
  draftSaving.value = true
  try {
    const data = {
      form: { ...form },
      perms: { ...perms },
      step: step.value
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
    toast.add({ title: 'Draft saved', description: 'You can continue later.', color: 'success' })
  } catch {
    toast.add({ title: 'Error', description: 'Could not save draft', color: 'error' })
  } finally {
    draftSaving.value = false
  }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    Object.assign(form, data.form)
    Object.assign(perms, data.perms)
    step.value = data.step || 1
    draftLoaded.value = true
    toast.add({ title: 'Draft restored', color: 'info' })
  } catch {
    // silent fail for draft load
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

function cancel() {
  router.push('/module')
}

onMounted(() => {
  loadDraft()
})

function rolePerms(roleId: string): Record<string, boolean> {
  return perms[roleId as keyof typeof perms] ?? {}
}

function getEntityCategoryColor(cat: string): string {
  const colors: Record<string, string> = {
    Business: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    HRM: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Inventory: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    Accounting: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    Sales: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
  }
  return colors[cat] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
}

const navTypeColorMap: Record<string, string> = {
  Dashboard: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  Entity: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Custom: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
}

const roleColorMap: Record<string, string> = {
  superAdmin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  user: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
}
</script>

<template>
  <UDashboardPanel id="module" :ui="{ body: 'gap-4 sm:gap-4 sm:p-0 p-0' }">
    <!-- Top Bar -->
    <template #header>
      <UDashboardNavbar title="Module / Create Module">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="cancel"
          />
          <UButton
            v-if="!isLastStep"
            label="Save Draft"
            color="neutral"
            variant="outline"
            :loading="draftSaving"
            @click="saveDraft"
          />
          <UButton
            v-if="isLastStep"
            label="Create Module"
            color="primary"
            icon="i-lucide-check"
            @click="handleCreate"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Main 3-Column Layout -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Left: Stepper (240px) -->
        <div class="w-60 shrink-0 border-r border-(--ui-border) bg-(--ui-bg-elevated)/50 p-4">
          <nav class="space-y-1">
            <button
              v-for="s in steps"
              :key="s.num"
              :disabled="s.num > step"
              class="flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors"
              :class="[
                s.num === step
                  ? 'bg-(--ui-primary)/10 text-(--ui-primary)'
                  : s.num < step
                    ? 'text-(--ui-text) hover:bg-(--ui-bg-elevated) cursor-pointer'
                    : 'text-(--ui-text-muted) cursor-not-allowed'
              ]"
              @click="goToStep(s.num)"
            >
              <span
                class="flex items-center justify-center size-7 shrink-0 rounded-full text-xs font-semibold border-2 transition-colors"
                :class="[
                  s.num === step
                    ? 'border-(--ui-primary) bg-(--ui-primary) text-white'
                    : s.num < step
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-(--ui-border) text-(--ui-text-muted)'
                ]"
              >
                <UIcon v-if="s.num < step" name="i-lucide-check" class="size-3.5" />
                <span v-else>{{ s.num }}</span>
              </span>
              <div class="min-w-0">
                <div class="text-sm font-medium leading-tight">
                  {{ s.label }}
                </div>
                <div class="text-xs text-(--ui-text-muted) mt-0.5">
                  {{ s.subtitle }}
                </div>
              </div>
            </button>
          </nav>
        </div>

        <!-- Center: Form Area -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Step 1: Basic Information -->
          <div v-if="step === 1" class="max-w-2xl">
            <h2 class="text-lg font-semibold">
              Basic Information
            </h2>
            <p class="text-sm text-(--ui-text-muted) mb-6">
              Define the basic details of your module.
            </p>

            <UForm class="space-y-4">
              <UFormField label="Module Name" required :error="formErrors.name">
                <UInput v-model="form.name" placeholder="Customer Relationship Management" class="w-full" />
              </UFormField>
              <UFormField label="Module Key" required :error="formErrors.key">
                <UInput v-model="form.key" placeholder="crm" class="w-full" />
                <template #hint>
                  Unique key used in system (lowercase, alphanumeric and underscore only)
                </template>
              </UFormField>
              <UFormField label="Description">
                <UTextarea
                  v-model="form.description"
                  placeholder="Manage customers, leads, opportunities..."
                  :rows="3"
                  class="w-full"
                />
              </UFormField>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Module Icon">
                  <USelect v-model="form.icon" :items="iconOptions" class="w-full" />
                </UFormField>
                <UFormField label="Module Color">
                  <div class="flex items-center gap-2">
                    <div class="flex flex-wrap gap-1">
                      <button
                        v-for="c in colorOptions"
                        :key="c.value"
                        :class="['size-6 rounded-full border-2 transition-all', c.class, form.color === c.value ? 'border-(--ui-primary) ring-2 ring-(--ui-primary)/30 scale-110' : 'border-transparent']"
                        @click="form.color = c.value"
                      />
                    </div>
                    <span class="text-xs font-mono text-(--ui-text-muted) ml-1">{{ form.color }}</span>
                  </div>
                </UFormField>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Module Category">
                  <USelect
                    v-model="form.category"
                    :items="categoryOptions"
                    placeholder="Select category"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Version">
                  <UInput v-model="form.version" placeholder="1.0.0" class="w-full" />
                  <template #hint>
                    Initial version of this module
                  </template>
                </UFormField>
              </div>
              <UFormField label="Module Status">
                <div class="flex items-center gap-2">
                  <USwitch v-model="form.status" color="primary" />
                  <span class="text-sm" :class="form.status ? 'text-emerald-600' : 'text-(--ui-text-muted)'">
                    {{ form.status ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </UFormField>
            </UForm>
          </div>

          <!-- Step 2: Entities -->
          <div v-if="step === 2">
            <h2 class="text-lg font-semibold">
              Entities
            </h2>
            <p class="text-sm text-(--ui-text-muted) mb-6">
              Select entities to include in this module.
            </p>

            <div class="mb-4 flex items-center gap-2">
              <UTabs
                v-model="entityTab"
                :items="[
                  { label: 'All Entities', value: 'all' },
                  { label: `Selected Entities (${selectedEntityCount})`, value: 'selected' }
                ]"
                variant="link"
              />
              <div class="flex-1" />
              <UInput
                v-model="entitySearch"
                placeholder="Search entities..."
                icon="i-lucide-search"
                class="max-w-xs"
              />
            </div>

            <UCard :ui="{ body: 'p-0' }">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-(--ui-border) text-left">
                    <th class="w-10 px-4 py-3" />
                    <th class="px-4 py-3 font-medium text-(--ui-text-muted)">
                      Entity Name
                    </th>
                    <th class="px-4 py-3 font-medium text-(--ui-text-muted)">
                      Category
                    </th>
                    <th class="px-4 py-3 font-medium text-(--ui-text-muted)">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="entity in filteredEntities"
                    :key="entity.name"
                    class="border-b border-(--ui-border) transition-colors hover:bg-(--ui-bg-elevated) cursor-pointer"
                    :class="{ 'bg-emerald-50/50 dark:bg-emerald-950/20': form.entities.includes(entity.name) }"
                    @click="toggleEntity(entity.name)"
                  >
                    <td class="px-4 py-3">
                      <UCheckbox
                        :checked="form.entities.includes(entity.name)"
                        :model-value="form.entities.includes(entity.name)"
                        @click.stop
                        @update:model-value="toggleEntity(entity.name)"
                      />
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <UIcon
                          :name="entity.name === 'Customer' ? 'i-lucide-users' : entity.name === 'Contact' ? 'i-lucide-phone' : entity.name === 'Lead' ? 'i-lucide-target' : entity.name === 'Product' ? 'i-lucide-package' : entity.name === 'Employee' ? 'i-lucide-user-circle' : entity.name === 'Invoice' ? 'i-lucide-file-invoice' : entity.name === 'Order' ? 'i-lucide-shopping-cart' : 'i-lucide-truck'"
                          class="size-4 text-(--ui-text-muted)"
                        />
                        <span class="font-medium">{{ entity.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="getEntityCategoryColor(entity.category)"
                      >
                        {{ entity.category }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-(--ui-text-muted) text-xs">
                      {{ entity.description }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="px-4 py-3 text-xs text-(--ui-text-muted) border-t border-(--ui-border)">
                Showing 1 to {{ filteredEntities.length }} of {{ allEntities.length }} entities
              </div>
            </UCard>
          </div>

          <!-- Step 3: Navigation -->
          <div v-if="step === 3">
            <h2 class="text-lg font-semibold">
              Navigation
            </h2>
            <p class="text-sm text-(--ui-text-muted) mb-6">
              Configure the navigation menu for this module.
            </p>

            <UCard class="mb-4">
              <template #header>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Navigation Structure</span>
                  <UButton
                    label="+ Add Menu Item"
                    color="primary"
                    variant="outline"
                    size="sm"
                    @click="addNavItem"
                  />
                </div>
                <p class="text-xs text-(--ui-text-muted) mt-1">
                  Add, remove, or reorder menu items for the module sidebar.
                </p>
              </template>
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-(--ui-border) text-left">
                    <th class="w-8 px-2 py-2" />
                    <th class="px-3 py-2 font-medium text-(--ui-text-muted)">
                      Menu Label
                    </th>
                    <th class="px-3 py-2 font-medium text-(--ui-text-muted)">
                      Type
                    </th>
                    <th class="px-3 py-2 font-medium text-(--ui-text-muted)">
                      Linked To
                    </th>
                    <th class="px-3 py-2 font-medium text-(--ui-text-muted)">
                      Status
                    </th>
                    <th class="w-12 px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in form.navigation"
                    :key="idx"
                    class="border-b border-(--ui-border) hover:bg-(--ui-bg-elevated) transition-colors"
                  >
                    <td class="px-2 py-2 text-(--ui-text-muted) cursor-grab">
                      <UIcon name="i-lucide-grip-vertical" class="size-4" />
                    </td>
                    <td class="px-3 py-2">
                      <UInput
                        v-model="item.label"
                        placeholder="Menu label"
                        class="max-w-40"
                        size="sm"
                      />
                    </td>
                    <td class="px-3 py-2">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="navTypeColorMap[item.type] || ''"
                      >
                        {{ item.type }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-(--ui-text-muted) text-xs">
                      {{ item.linkedTo }}
                    </td>
                    <td class="px-3 py-2">
                      <USwitch v-model="item.active" size="xs" color="primary" />
                    </td>
                    <td class="px-3 py-2">
                      <UButton
                        icon="i-lucide-x"
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        square
                        @click="removeNavItem(idx)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </UCard>

            <UCard>
              <template #header>
                <span class="text-sm font-medium">Navigation Settings</span>
              </template>
              <div class="space-y-3">
                <UCheckbox label="Show module in main navigation" :model-value="true" />
                <UCheckbox label="Show module icon" :model-value="true" />
                <UCheckbox label="Use collapsible menu" :model-value="true" />
                <UCheckbox label="Set as default landing page" :model-value="false" />
              </div>
            </UCard>
          </div>

          <!-- Step 4: Permissions -->
          <div v-if="step === 4">
            <h2 class="text-lg font-semibold">
              Permissions
            </h2>
            <p class="text-sm text-(--ui-text-muted) mb-6">
              Set access permissions for this module.
            </p>

            <div class="space-y-3">
              <div v-for="role in roles" :key="role.id" class="border border-(--ui-border) rounded-lg overflow-hidden">
                <div class="flex items-center justify-between px-4 py-3 bg-(--ui-bg-elevated)/50">
                  <div class="flex items-center gap-3">
                    <UIcon name="i-lucide-circle-user" class="size-5 text-(--ui-text-muted)" />
                    <div>
                      <div class="text-sm font-medium">
                        {{ role.label }}
                      </div>
                      <div class="text-xs text-(--ui-text-muted)">
                        {{ role.description }}
                      </div>
                    </div>
                  </div>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="roleColorMap[role.id] || ''"
                  >
                    {{ role.level }}
                  </span>
                </div>
                <div class="flex items-center gap-0 border-t border-(--ui-border) divide-x divide-(--ui-border)">
                  <div
                    v-for="perm in permissionsMatrix"
                    :key="perm.action"
                    class="flex items-center gap-1.5 px-4 py-2.5 text-xs"
                    :class="rolePerms(role.id)[perm.action] ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''"
                  >
                    <UCheckbox
                      :checked="rolePerms(role.id)[perm.action]"
                      :model-value="rolePerms(role.id)[perm.action]"
                      :disabled="role.id === 'superAdmin'"
                      @update:model-value="togglePerm(role.id, perm.action)"
                    />
                    <UIcon :name="perm.icon" class="size-3.5 text-(--ui-text-muted)" />
                    <span class="text-(--ui-text-muted)">{{ perm.action }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Review -->
          <div v-if="step === 5" class="max-w-2xl">
            <div
              class="flex items-center gap-2 p-3 mb-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900"
            >
              <UIcon name="i-lucide-circle-check" class="size-5 text-emerald-600 shrink-0" />
              <p class="text-sm text-emerald-800 dark:text-emerald-200">
                All required information is complete. You can create the module.
              </p>
            </div>

            <div class="space-y-4">
              <UCard>
                <template #header>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Basic Information</span>
                    <UButton
                      label="Edit"
                      icon="i-lucide-pencil"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="step = 1"
                    />
                  </div>
                </template>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-(--ui-text-muted) text-xs">Module Name</span>
                    <p class="font-medium">
                      {{ form.name || '—' }}
                    </p>
                  </div>
                  <div>
                    <span class="text-(--ui-text-muted) text-xs">Module Key</span>
                    <p class="font-medium">
                      {{ form.key || '—' }}
                    </p>
                  </div>
                  <div class="col-span-2">
                    <span class="text-(--ui-text-muted) text-xs">Description</span>
                    <p class="text-sm">
                      {{ form.description || '—' }}
                    </p>
                  </div>
                </div>
              </UCard>

              <UCard>
                <template #header>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Entities ({{ form.entities.length }})</span>
                    <UButton
                      label="Edit"
                      icon="i-lucide-pencil"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="step = 2"
                    />
                  </div>
                </template>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="e in form.entities"
                    :key="e"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-(--ui-bg-elevated)"
                  >
                    <span class="size-1.5 rounded-full bg-emerald-500" />
                    {{ e }}
                  </span>
                </div>
              </UCard>

              <UCard>
                <template #header>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Navigation</span>
                    <UButton
                      label="Edit"
                      icon="i-lucide-pencil"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="step = 3"
                    />
                  </div>
                </template>
                <div class="flex flex-wrap gap-2">
                  <span class="text-xs text-(--ui-text-muted)">{{ form.navigation.length }} menu items configured</span>
                  <span
                    v-for="item in form.navigation"
                    :key="item.label"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-(--ui-bg-elevated)"
                  >
                    {{ item.label }}
                  </span>
                </div>
              </UCard>

              <UCard>
                <template #header>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Permissions</span>
                    <UButton
                      label="Edit"
                      icon="i-lucide-pencil"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="step = 4"
                    />
                  </div>
                </template>
                <div class="space-y-2">
                  <div v-for="role in roles" :key="role.id" class="flex items-center gap-2 text-sm">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="roleColorMap[role.id] || ''"
                    >{{ role.label }}</span>
                    <span class="text-xs text-(--ui-text-muted)">{{ role.description }}</span>
                  </div>
                </div>
              </UCard>

              <UCard>
                <template #header>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Additional Settings</span>
                    <UButton
                      label="Edit"
                      icon="i-lucide-pencil"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="step = 1"
                    />
                  </div>
                </template>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-check-circle" class="size-4 text-emerald-500" />
                    <span>Version: <strong>{{ form.version }}</strong></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-check-circle" class="size-4 text-emerald-500" />
                    <span>Status: <strong>{{ form.status ? 'Active' : 'Inactive' }}</strong></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-check-circle" class="size-4 text-emerald-500" />
                    <span>Color: <span
                      class="inline-block size-3 rounded-full align-middle"
                      :style="{ backgroundColor: form.color }"
                    /></span>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>

        <!-- Right: Panel (300px) -->
        <div class="w-75 shrink-0 border-l border-(--ui-border) bg-(--ui-bg-elevated)/30 p-5 overflow-y-auto">
          <!-- Step 1 Preview -->
          <div v-if="step === 1">
            <h3 class="text-sm font-semibold">
              Preview
            </h3>
            <p class="text-xs text-(--ui-text-muted) mb-4">
              This is how your module will appear in the system.
            </p>

            <UCard :ui="{ body: 'p-4' }">
              <div class="flex items-center gap-3 mb-3">
                <UAvatar
                  :icon="form.icon || 'i-lucide-puzzle'"
                  square
                  size="lg"
                  color="primary"
                />
                <div class="min-w-0">
                  <div class="font-semibold text-sm truncate">
                    {{ form.name || 'Module Name' }}
                  </div>
                  <UBadge variant="subtle" color="neutral" size="sm">
                    {{ form.key || 'key' }}
                  </UBadge>
                </div>
              </div>
              <p class="text-xs text-(--ui-text-muted) mb-3 line-clamp-2">
                {{ form.description || 'No description provided.' }}
              </p>
              <USeparator class="mb-3" />
              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-(--ui-text-muted)">Category</span>
                  <span>{{ form.category || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-(--ui-text-muted)">Status</span>
                  <span class="flex items-center gap-1">
                    <span class="size-1.5 rounded-full" :class="form.status ? 'bg-emerald-500' : 'bg-gray-400'" />
                    {{ form.status ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-(--ui-text-muted)">Version</span>
                  <span>{{ form.version }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-(--ui-text-muted)">Entities</span>
                  <span>{{ form.entities.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-(--ui-text-muted)">Created By</span>
                  <span>You</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-(--ui-text-muted)">Created At</span>
                  <span>{{ new Date().toLocaleDateString() }}</span>
                </div>
              </div>
            </UCard>

            <div class="mt-4">
              <h4 class="text-xs font-semibold uppercase text-(--ui-text-muted) mb-2">
                Preview in Sidebar
              </h4>
              <div class="rounded-lg border border-(--ui-border) bg-gray-900 p-3 text-white">
                <div class="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                  <UIcon :name="form.icon || 'i-lucide-puzzle'" class="size-4 text-emerald-400" />
                  <span class="text-sm font-medium">{{ form.name || 'Module' }}</span>
                </div>
                <div class="space-y-1 text-xs">
                  <div class="flex items-center gap-2 px-2 py-1 rounded bg-gray-800 text-emerald-400">
                    <UIcon name="i-lucide-layout-dashboard" class="size-3.5" />
                    <span>Overview</span>
                  </div>
                  <div class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 text-gray-400">
                    <UIcon name="i-lucide-users" class="size-3.5" />
                    <span>Customers</span>
                  </div>
                  <div class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 text-gray-400">
                    <UIcon name="i-lucide-phone" class="size-3.5" />
                    <span>Contacts</span>
                  </div>
                  <div class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 text-gray-400">
                    <UIcon name="i-lucide-target" class="size-3.5" />
                    <span>Leads</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2 About Entities -->
          <div v-if="step === 2">
            <h3 class="text-sm font-semibold">
              About Entities
            </h3>
            <p class="text-xs text-(--ui-text-muted) mb-4">
              Entities are the core building blocks of your module. Each entity represents a data model with its own
              fields and
              relationships.
            </p>

            <div
              class="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 mb-4"
            >
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-lucide-check-circle" class="size-4 text-emerald-600" />
                <span class="text-sm font-medium text-emerald-800 dark:text-emerald-200">Selected {{ selectedEntityCount
                }}
                  entities</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="e in form.entities"
                  :key="e"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                >
                  <span class="size-1.5 rounded-full bg-emerald-500" />
                  {{ e }}
                </span>
              </div>
            </div>

            <div class="text-xs space-y-2">
              <h4 class="font-medium text-(--ui-text)">
                Tips
              </h4>
              <ul class="space-y-2 text-(--ui-text-muted)">
                <li class="flex gap-2">
                  <UIcon name="i-lucide-lightbulb" class="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Select entities that are relevant to your module's purpose.</span>
                </li>
                <li class="flex gap-2">
                  <UIcon name="i-lucide-lightbulb" class="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>You can always add or remove entities later.</span>
                </li>
                <li class="flex gap-2">
                  <UIcon name="i-lucide-lightbulb" class="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Entities can be shared between multiple modules.</span>
                </li>
              </ul>
            </div>

            <USeparator class="my-4" />
            <UButton
              label="Manage Entities"
              icon="i-lucide-arrow-right"
              color="neutral"
              variant="ghost"
              size="sm"
              trailing
            />
          </div>

          <!-- Step 3 About Navigation -->
          <div v-if="step === 3">
            <div
              class="p-3 mb-4 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20"
            >
              <h4 class="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                Tips
              </h4>
              <ul class="space-y-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                <li class="flex gap-2">
                  <UIcon name="i-lucide-check" class="size-3.5 shrink-0 mt-0.5" />
                  <span>Drag items to reorder navigation</span>
                </li>
                <li class="flex gap-2">
                  <UIcon name="i-lucide-check" class="size-3.5 shrink-0 mt-0.5" />
                  <span>Use Entity type to link to module entities</span>
                </li>
                <li class="flex gap-2">
                  <UIcon name="i-lucide-check" class="size-3.5 shrink-0 mt-0.5" />
                  <span>Create custom links for external pages</span>
                </li>
                <li class="flex gap-2">
                  <UIcon name="i-lucide-check" class="size-3.5 shrink-0 mt-0.5" />
                  <span>Toggle to show or hide menu items</span>
                </li>
              </ul>
            </div>

            <h4 class="text-xs font-semibold uppercase text-(--ui-text-muted) mb-2">
              Live Preview
            </h4>
            <div class="rounded-lg border border-(--ui-border) bg-gray-900 p-3 text-white">
              <div class="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                <UIcon :name="form.icon || 'i-lucide-puzzle'" class="size-4 text-emerald-400" />
                <span class="text-sm font-medium">{{ form.name || 'Module' }}</span>
              </div>
              <div class="space-y-1 text-xs">
                <div
                  v-for="(item, idx) in form.navigation"
                  :key="idx"
                  class="flex items-center gap-2 px-2 py-1 rounded"
                  :class="idx === 0 ? 'bg-gray-800 text-emerald-400' : 'text-gray-400 hover:bg-gray-800'"
                >
                  <UIcon name="i-lucide-circle" class="size-3" />
                  <span>{{ item.label || 'Menu Item' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4 About Permissions -->
          <div v-if="step === 4">
            <h3 class="text-sm font-semibold">
              About Permissions
            </h3>
            <p class="text-xs text-(--ui-text-muted) mb-4">
              Role-based access control (RBAC) allows you to define what each user role can do within this module.
            </p>

            <div class="text-xs space-y-3">
              <div class="p-3 rounded-lg border border-(--ui-border)">
                <h4 class="font-medium mb-1">
                  Inheritance
                </h4>
                <p class="text-(--ui-text-muted)">
                  Permissions cascade downward by default. Higher roles inherit the permissions of lower roles.
                </p>
              </div>
              <div class="p-3 rounded-lg border border-(--ui-border)">
                <h4 class="font-medium mb-1">
                  Defaults
                </h4>
                <p class="text-(--ui-text-muted)">
                  New modules start with standard permission presets. You can customize these at any time.
                </p>
              </div>
              <div class="p-3 rounded-lg border border-(--ui-border)">
                <h4 class="font-medium mb-1">
                  Custom Roles
                </h4>
                <p class="text-(--ui-text-muted)">
                  Additional roles can be created in the Roles & Permissions settings page.
                </p>
              </div>
              <div
                class="p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20"
              >
                <div class="flex gap-2">
                  <UIcon name="i-lucide-alert-triangle" class="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 class="font-medium text-amber-800 dark:text-amber-200">
                      Super Administrator
                    </h4>
                    <p class="text-amber-700 dark:text-amber-300">
                      This role always has full access and cannot be modified.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5 About Review -->
          <div v-if="step === 5">
            <h3 class="text-sm font-semibold">
              What's next?
            </h3>
            <p class="text-xs text-(--ui-text-muted) mb-4">
              After creating the module, you'll be able to:
            </p>

            <ul class="space-y-2 text-xs mb-6">
              <li class="flex items-center gap-2 text-emerald-600">
                <UIcon name="i-lucide-check-circle" class="size-4" />
                <span>Configure entity fields and relationships</span>
              </li>
              <li class="flex items-center gap-2 text-emerald-600">
                <UIcon name="i-lucide-check-circle" class="size-4" />
                <span>Set up forms and views for each entity</span>
              </li>
              <li class="flex items-center gap-2 text-emerald-600">
                <UIcon name="i-lucide-check-circle" class="size-4" />
                <span>Assign users and teams to the module</span>
              </li>
              <li class="flex items-center gap-2 text-emerald-600">
                <UIcon name="i-lucide-check-circle" class="size-4" />
                <span>Deploy to production environment</span>
              </li>
            </ul>

            <div class="mb-4">
              <h4 class="text-xs font-semibold uppercase text-(--ui-text-muted) mb-2">
                Live Preview
              </h4>
              <div class="rounded-lg border border-(--ui-border) bg-gray-900 p-3 text-white">
                <div class="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                  <UIcon :name="form.icon || 'i-lucide-puzzle'" class="size-4 text-emerald-400" />
                  <span class="text-sm font-medium">{{ form.name || 'Module' }}</span>
                </div>
                <div class="space-y-1 text-xs">
                  <div
                    v-for="(item, idx) in form.navigation"
                    :key="idx"
                    class="flex items-center gap-2 px-2 py-1 rounded"
                    :class="idx === 0 ? 'bg-gray-800 text-emerald-400' : 'text-gray-400 hover:bg-gray-800'"
                  >
                    <UIcon name="i-lucide-circle" class="size-3" />
                    <span>{{ item.label || 'Menu Item' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <UCard :ui="{ body: 'p-3' }">
              <h4 class="text-xs font-semibold mb-2">
                Summary
              </h4>
              <div class="space-y-1.5 text-xs">
                <div class="flex justify-between">
                  <span class="text-(--ui-text-muted)">Entities</span>
                  <span class="font-medium">{{ form.entities.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-(--ui-text-muted)">Menu Items</span>
                  <span class="font-medium">{{ form.navigation.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-(--ui-text-muted)">Roles</span>
                  <span class="font-medium">{{ roles.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-(--ui-text-muted)">Permissions</span>
                  <span class="font-medium">{{ permissionsMatrix.length }} actions</span>
                </div>
              </div>
              <USeparator class="my-2" />
              <div class="flex items-center gap-2 text-emerald-600">
                <UIcon name="i-lucide-check-circle" class="size-4" />
                <span class="text-xs font-medium">Ready to create</span>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between gap-2 p-3 border-t border-(--ui-border)">
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          @click="cancel"
        />
        <div class="flex items-center gap-2">
          <UButton
            v-if="!isFirstStep"
            label="Back"
            color="neutral"
            variant="outline"
            @click="prevStep"
          />
          <UButton
            v-if="!isLastStep"
            label="Next →"
            color="primary"
            trailing
            @click="nextStep"
          />
          <UButton
            v-if="isLastStep"
            label="Create Module"
            color="primary"
            icon="i-lucide-check"
            @click="handleCreate"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
