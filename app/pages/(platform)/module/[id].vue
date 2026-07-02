<script setup lang="ts">
import type { ModuleRow, ModuleDetail } from '~/types/metadata'
import ModuleOverviewTab from '~/components/module/tabs/ModuleOverviewTab.vue'
import ModuleEntitiesTab from '~/components/module/tabs/ModuleEntitiesTab.vue'
import ModuleFormsTab from '~/components/module/tabs/ModuleFormsTab.vue'
import ModuleRelationsTab from '~/components/module/tabs/ModuleRelationsTab.vue'
import ModuleSettingsTab from '~/components/module/tabs/ModuleSettingsTab.vue'

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
const { data, error: loadError, pending: loading } = await useAsyncData<
  ModuleDetail | null
>(
  () => `module-${moduleId.value}`,
  async () => {
    if (!moduleId.value) return null
    try {
      return await $fetch<ModuleDetail>(`/api/metadata/modules/${moduleId.value}`)
    } catch (e: unknown) {
      throw e instanceof Error ? e : new Error('Failed to load module')
    }
  },
  {
    watch: [moduleId],
    deep: false
  }
)

const moduleData = computed<ModuleDetail | null>(() => data.value ?? null)
const moduleRow = computed<ModuleRow | null>(() => moduleData.value)

// ── Tab state (Approach B: dynamic component, no nested routes) ────────
type TabKey = 'overview' | 'entities' | 'forms' | 'relations' | 'settings'

const activeTab = ref<TabKey>('overview')

// Tab registry — drives UTabs items + dynamic component rendering
const tabItems = [
  { value: 'overview', label: 'Overview', icon: 'i-lucide-info' },
  { value: 'forms', label: 'Forms', icon: 'i-lucide-file-text' },
  { value: 'entities', label: 'Entities', icon: 'i-lucide-database' },
  { value: 'relations', label: 'Relations', icon: 'i-lucide-share-2' },
  { value: 'settings', label: 'Settings', icon: 'i-lucide-settings' }
] as const

const tabComponents = {
  overview: ModuleOverviewTab,
  entities: ModuleEntitiesTab,
  forms: ModuleFormsTab,
  relations: ModuleRelationsTab,
  settings: ModuleSettingsTab
} as const

const activeTabComponent = computed(() => tabComponents[activeTab.value])

function onTabChange(value: string | number) {
  if (typeof value === 'string' && value in tabComponents) {
    activeTab.value = value as TabKey
  }
}

// ── Actions ────────────────────────────────────────────────────────────
async function handleToggleActive() {
  if (!moduleData.value) return
  const newIsActive = !moduleData.value.isActive
  const ok = await updateModule(moduleData.value.id, { isActive: newIsActive })
  if (ok) {
    await refreshNuxtData(`module-${moduleId.value}`)
    toast.add({
      title: `Module ${newIsActive ? 'activated' : 'deactivated'}`,
      color: 'success'
    })
  }
}

// Tab event: child updated moduleData (e.g. settings saved)
function handleModuleRefreshed(updated: ModuleDetail) {
  if (data.value) {
    data.value = updated
  }
}

const showDeleteModal = ref(false)
const deleting = ref(false)

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
</script>

<template>
  <UDashboardPanel :id="`module-${moduleId}`">
    <template #header>
      <UDashboardNavbar :title="moduleRow?.name || 'Module'">
        <template #leading>
          <UDashboardSidebarCollapse />
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

      <!-- Horizontal tabs as sub-navbar (Nuxt UI v4 standard pattern) -->
      <UDashboardToolbar v-if="moduleData">
        <template #default>
          <UTabs
            :model-value="activeTab"
            :items="[...tabItems]"
            variant="link"
            class="w-full"
            @update:model-value="onTabChange"
          />
        </template>
      </UDashboardToolbar>
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

        <!-- Main content — tab body with quick actions footer -->
        <div v-else-if="moduleData" class="flex flex-col flex-1 min-h-0">
          <div class="flex-1 overflow-y-auto p-6">
            <KeepAlive>
              <component
                :is="activeTabComponent"
                :module-data="moduleData"
                @refreshed="handleModuleRefreshed"
              />
            </KeepAlive>
          </div>

          <!-- Quick actions toolbar — native Nuxt UI v4 pattern -->
          <UDashboardToolbar>
            <template #default>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    v-if="moduleRow?.icon"
                    class="size-7 rounded flex items-center justify-center bg-(--ui-primary)/10 shrink-0"
                  >
                    <UIcon :name="moduleRow.icon" class="size-4 text-(--ui-primary)" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">
                      {{ moduleRow?.name }}
                    </p>
                    <p class="text-xs text-(--ui-text-muted) truncate">
                      {{ moduleRow?.slug }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <UButton
                    :label="moduleRow?.isActive ? 'Deactivate' : 'Activate'"
                    :color="moduleRow?.isActive ? 'warning' : 'success'"
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
            </template>
          </UDashboardToolbar>
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
