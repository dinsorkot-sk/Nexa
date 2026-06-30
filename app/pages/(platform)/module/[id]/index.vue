<script setup lang="ts">
definePageMeta({
  title: 'Module Detail'
})

const route = useRoute()
const router = useRouter()
const detail = useModuleDetail()
const { isNotificationsSlideoverOpen } = useDashboard()
const toast = useToast()

const moduleId = computed(() => parseInt(route.params.id as string))

const showDeactivateConfirm = ref(false)

onMounted(() => {
  if (moduleId.value) {
    detail.loadAll(moduleId.value)
  }
})

const mod = computed(() => detail.meta.selectedModule.value)

async function handleToggleActive() {
  if (!mod.value) return
  try {
    await detail.meta.toggleModuleActive(mod.value.id, !mod.value.isActive)
    showDeactivateConfirm.value = false
    toast.add({ title: mod.value.isActive ? 'Module activated' : 'Module deactivated', color: 'success' })
    detail.loadAll(moduleId.value)
  } catch {
    toast.add({ title: 'Error', description: 'Could not update module', color: 'error' })
  }
}

function goBack() {
  router.push('/module')
}
</script>

<template>
  <UDashboardPanel id="module-detail" :ui="{ body: 'gap-0 sm:gap-0 sm:p-0 p-0' }">
    <!-- Top Bar -->
    <template #header>
      <UDashboardNavbar :title="mod?.name || 'Module Detail'">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #left>
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            square
            @click="goBack"
          />
        </template>
        <template #right>
          <UTooltip text="Toggle Active State">
            <UButton
              :icon="mod?.isActive ? 'i-lucide-power' : 'i-lucide-play'"
              :color="mod?.isActive ? 'error' : 'success'"
              :variant="mod?.isActive ? 'outline' : 'solid'"
              size="sm"
              @click="showDeactivateConfirm = true"
            >
              {{ mod?.isActive ? 'Deactivate' : 'Activate' }}
            </UButton>
          </UTooltip>
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
      <!-- Loading State -->
      <div
        v-if="!mod && detail.meta.loading.value"
        class="flex items-center justify-center h-full"
      >
        <ULoading icon="i-lucide-loader-circle" />
      </div>

      <!-- Not Found -->
      <div
        v-else-if="!mod"
        class="flex flex-col items-center justify-center h-full gap-3"
      >
        <UIcon name="i-lucide-package-x" class="size-12 text-(--ui-text-muted) opacity-30" />
        <p class="text-sm text-(--ui-text-muted)">
          Module not found
        </p>
        <UButton label="Back to Modules" color="primary" @click="goBack" />
      </div>

      <!-- Content -->
      <div v-else class="flex h-full">
        <!-- Left: Tabs Content -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- Tabs Header -->
          <div class="px-4 pt-2">
            <UTabs
              v-model="detail.activeTab.value"
              :items="detail.tabs"
              variant="link"
            />
          </div>

          <!-- Tab Content -->
          <div class="flex-1 overflow-y-auto p-4">
            <ModuleOverviewTab
              v-if="detail.activeTab.value === 'overview'"
              :mod="mod"
              :entity-count="detail.meta.moduleEntities.value.length"
              :form-count="detail.forms.value.length"
              :workflow-count="detail.workflows.value.length"
              :api-count="detail.apis.value.length"
            />
            <ModuleEntitiesTab
              v-else-if="detail.activeTab.value === 'entities'"
              :entities="detail.meta.moduleEntities.value"
              :field-counts="detail.meta.moduleFieldCounts.value"
            />
            <ModuleFormsTab
              v-else-if="detail.activeTab.value === 'forms'"
              :forms="detail.forms.value"
              :loading="detail.loadingForms.value"
            />
            <ModuleWorkflowsTab
              v-else-if="detail.activeTab.value === 'workflows'"
              :workflows="detail.workflows.value"
              :loading="detail.loadingWorkflows.value"
            />
            <ModuleApisTab
              v-else-if="detail.activeTab.value === 'apis'"
              :apis="detail.apis.value"
              :loading="detail.loadingApis.value"
            />
            <ModulePermissionsTab
              v-else-if="detail.activeTab.value === 'permissions'"
              :permissions="detail.permissions.value"
            />
            <ModuleSettingsTab
              v-else-if="detail.activeTab.value === 'settings'"
              :settings="detail.settings.value"
              :loading="detail.saving.value"
              @save="detail.saveSetting"
            />
          </div>
        </div>

        <!-- Right: Contextual Panel (300px) -->
        <div class="w-75 shrink-0 border-l border-(--ui-border) bg-(--ui-bg-elevated)/30 overflow-y-auto">
          <ModuleRightPanel
            :mod="mod"
            :active-tab="detail.activeTab.value"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Deactivate Confirmation Modal -->
  <UModal
    v-model:open="showDeactivateConfirm"
    :title="mod?.isActive ? 'Deactivate Module' : 'Activate Module'"
  >
    <template #body>
      <p class="text-sm text-(--ui-text-muted)">
        Are you sure you want to <strong>{{ mod?.isActive ? 'deactivate' : 'activate' }}</strong>
        "<strong>{{ mod?.name }}</strong>"?
        {{ mod?.isActive ? ' This will disable all related entities.' : '' }}
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
          :label="mod?.isActive ? 'Deactivate' : 'Activate'"
          :color="mod?.isActive ? 'error' : 'success'"
          @click="handleToggleActive"
        />
      </div>
    </template>
  </UModal>
</template>
