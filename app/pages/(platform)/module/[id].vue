<script setup lang="ts">
import type { ModuleRow, ModuleDetail } from '~/types/metadata'

const route = useRoute()
const router = useRouter()
const { isNotificationsSlideoverOpen } = useDashboard()
const { updateModule, deleteModule } = useModules()
const toast = useToast()

// ── Module id from route ───────────────────────────────────────────────
const moduleId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) && id > 0 ? id : 0
})

// ── Async data loading (Nuxt 4 standard pattern) ───────────────────────
// useAsyncData keys are scoped to the component instance, so using
// `module-${id}` makes the cache invalidate when navigating between modules
// while remaining stable when switching tabs.
const { data, error: loadError, pending: loading } = await useAsyncData<
  ModuleDetail | null
>(
  () => `module-${moduleId.value}`,
  async () => {
    if (!moduleId.value) return null
    try {
      return await $fetch<ModuleDetail>(`/api/metadata/modules/${moduleId.value}`)
    } catch (e: unknown) {
      // Re-throw so useAsyncData sets error state
      throw e instanceof Error ? e : new Error('Failed to load module')
    }
  },
  {
    watch: [moduleId],
    // Don't refetch when only the tab sub-path changes
    deep: false
  }
)

// Derived state — ref-backed so children can useState the same key
const moduleData = computed<ModuleRow | null>(() => data.value ?? null)

// ── Tab navigation ─────────────────────────────────────────────────────
// Derive active tab from URL path. /module/5/forms → 'forms'.
const activeTab = computed<string>(() => {
  const segments = route.path.split('/').filter(Boolean)
  const last = segments[segments.length - 1] ?? ''
  const knownTabs = ['forms', 'entities', 'relations', 'settings']
  return knownTabs.includes(last) ? last : ''
})

function navigateToTab(value: string) {
  const base = `/module/${moduleId.value}`
  router.push(value ? `${base}/${value}` : base)
}

const showDeleteModal = ref(false)
const deleting = ref(false)

// ── Actions ────────────────────────────────────────────────────────────
async function handleToggleActive() {
  if (!moduleData.value) return
  const newIsActive = !moduleData.value.isActive
  const ok = await updateModule(moduleData.value.id, { isActive: newIsActive })
  if (ok) {
    // Refresh async data so children pick up the new isActive
    await refreshNuxtData(`module-${moduleId.value}`)
    toast.add({
      title: `Module ${newIsActive ? 'activated' : 'deactivated'}`,
      color: 'success'
    })
  }
}

async function handleDelete() {
  if (!moduleData.value) return
  deleting.value = true
  const ok = await deleteModule(moduleData.value.id)
  deleting.value = false
  if (ok) {
    showDeleteModal.value = false
    await router.push('/module')
  }
}

function handleRetry() {
  refreshNuxtData(`module-${moduleId.value}`)
}

// Keep parent mounted across tab switches — keyed only by module id, NOT
// by fullPath. Without this, navigating /module/5 → /module/5/forms
// would remount the whole page and re-run the load.
definePageMeta({
  key: 'module-detail'
})
</script>

<template>
  <UDashboardPanel :id="`module-${moduleId}`">
    <template #header>
      <UDashboardNavbar :title="moduleData?.name || 'Module'">
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
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col h-full">
        <!-- Loading state (first load only — keep data visible if cached) -->
        <div v-if="loading && !moduleData" class="flex items-center justify-center py-16 flex-1">
          <UIcon name="i-lucide-loader-circle" class="size-6 text-(--ui-text-muted) animate-spin" />
        </div>

        <!-- Error state -->
        <div
          v-else-if="loadError || (!loading && !moduleData && moduleId)"
          class="flex flex-col items-center justify-center py-16 flex-1 gap-3"
        >
          <UIcon name="i-lucide-alert-circle" class="size-10 text-(--ui-error)" />
          <p class="text-sm text-(--ui-text-muted)">
            {{ loadError?.message || `Module #${moduleId} not found` }}
          </p>
          <div class="flex gap-2">
            <UButton
              label="Retry"
              icon="i-lucide-refresh-cw"
              size="sm"
              @click="handleRetry"
            />
            <UButton
              label="Back to list"
              color="neutral"
              variant="ghost"
              size="sm"
              :to="'/module'"
            />
          </div>
        </div>

        <!-- Main content -->
        <div v-else-if="moduleData" class="flex flex-col flex-1 min-h-0">
          <div class="flex flex-1 min-h-0">
            <!-- Tabs sidebar -->
            <div class="w-56 shrink-0 border-r border-(--ui-border) bg-(--ui-bg-elevated)/30 p-3">
              <UTabs
                :model-value="activeTab"
                :items="[
                  { value: '', label: 'Overview', icon: 'i-lucide-info' },
                  { value: 'forms', label: 'Forms', icon: 'i-lucide-file-text' },
                  { value: 'entities', label: 'Entities', icon: 'i-lucide-database' },
                  { value: 'relations', label: 'Relations', icon: 'i-lucide-share-2' },
                  { value: 'settings', label: 'Settings', icon: 'i-lucide-settings' }
                ]"
                orientation="vertical"
                :ui="{ root: 'w-full' }"
                @update:model-value="(v: string | number) => { if (typeof v === 'string') navigateToTab(v) }"
              />
            </div>

            <!-- Tab content (rendered by child route) -->
            <div class="flex-1 overflow-y-auto p-6">
              <NuxtPage />
            </div>
          </div>

          <!-- Quick actions footer -->
          <div class="border-t border-(--ui-border) px-6 py-3 bg-(--ui-bg-elevated)/30 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div
                v-if="moduleData.icon"
                class="size-7 rounded flex items-center justify-center bg-(--ui-primary)/10 shrink-0"
              >
                <UIcon :name="moduleData.icon" class="size-4 text-(--ui-primary)" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium truncate">
                  {{ moduleData.name }}
                </p>
                <p class="text-xs text-(--ui-text-muted) truncate">
                  {{ moduleData.slug }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <UButton
                :label="moduleData.isActive ? 'Deactivate' : 'Activate'"
                :color="moduleData.isActive ? 'warning' : 'success'"
                variant="outline"
                size="sm"
                @click="handleToggleActive"
              />
              <UButton
                label="Delete"
                color="error"
                variant="outline"
                size="sm"
                icon="i-lucide-trash-2"
                @click="() => { showDeleteModal = true }"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Delete confirmation modal -->
    <UModal v-model:open="showDeleteModal" title="Delete Module">
      <template #body>
        <p class="text-sm text-(--ui-text-muted)">
          Are you sure you want to delete
          <strong class="text-(--ui-text-highlighted)">{{ moduleData?.name }}</strong>?
          This action cannot be undone.
        </p>
      </template>
      <template #footer>
        <div class="flex items-center justify-end gap-2 w-full">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="() => { showDeleteModal = false }"
          />
          <UButton
            label="Delete"
            color="error"
            :loading="deleting"
            @click="handleDelete"
          />
        </div>
      </template>
    </UModal>
  </UDashboardPanel>
</template>
