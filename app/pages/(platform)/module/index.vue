<script setup lang="ts">
import type { ModuleRow } from '~/types/metadata'

const { isNotificationsSlideoverOpen } = useDashboard()
const {
  modules, loading, stats, categoryBreakdown,
  fetchModules, fetchModuleDetail, updateModule, deleteModule,
  searchQuery, categoryFilter, statusFilter, sortBy, sortOrder,
  filteredModules, categoryOptions, sortOptions, getStatusFilterOptions,
  cssVar
} = useModules()

const toast = useToast()
const showDetailSlideover = ref(false)
const selectedModule = ref<ModuleRow | null>(null)
const page = ref(1)
const pageSize = ref(10)

const catOptions = computed(() => [{ label: 'Category: All', value: '' }, ...categoryOptions.value])

const statusOpts = computed(() => getStatusFilterOptions())

function sel(items: { label: string; value: any }[], val: any) {
  return items.find(i => i.value === val) || items[0]
}

function upd(val: any, target: any) {
  if (val?.value !== undefined) target.value = val.value
}

const paginatedModules = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredModules.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredModules.value.length / pageSize.value))
)

watch([searchQuery, categoryFilter, statusFilter], () => { page.value = 1 })

function selectModule(row: ModuleRow) {
  selectedModule.value = row
  showDetailSlideover.value = true
}

function closeSlideover() {
  selectedModule.value = null
  showDetailSlideover.value = false
}

const columns = [
  { accessorKey: 'name', header: 'Module' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'entityCount', header: 'Entities' },
  { accessorKey: 'formCount', header: 'Forms' },
  { accessorKey: 'version', header: 'Version' },
  { accessorKey: 'updatedAt', header: 'Updated' }
]

onMounted(() => fetchModules())
</script>

<template>
  <UDashboardPanel id="module">
    <template #header>
      <UDashboardNavbar title="Module">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral" variant="ghost" square
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
      <UContainer class="py-8">
        <!-- ── Stat Cards (UCard, no :ui) ─────────────── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <UCard>
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-lg bg-(--ui-primary) flex items-center justify-center shrink-0">
                <UIcon name="i-lucide-puzzle" class="size-5 text-white" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-(--ui-text-muted)">Total Modules</p>
                <p class="text-2xl font-bold text-(--ui-text-highlighted)">{{ stats.total }}</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-lg bg-(--ui-success) flex items-center justify-center shrink-0">
                <UIcon name="i-lucide-check-circle" class="size-5 text-white" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-(--ui-text-muted)">Active</p>
                <p class="text-2xl font-bold text-(--ui-success)">{{ stats.active }}</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-lg bg-(--ui-warning) flex items-center justify-center shrink-0">
                <UIcon name="i-lucide-pause-circle" class="size-5 text-white" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-(--ui-text-muted)">Inactive</p>
                <p class="text-2xl font-bold text-(--ui-warning)">{{ stats.inactive }}</p>
              </div>
            </div>
          </UCard>

          <UCard v-if="categoryBreakdown[0]">
            <div class="flex items-center gap-3">
              <div
                class="size-10 rounded-lg flex items-center justify-center shrink-0"
                :style="{ backgroundColor: cssVar(categoryBreakdown[0].color) }"
              >
                <UIcon :name="categoryBreakdown[0].icon" class="size-5 text-white" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-(--ui-text-muted)">{{ categoryBreakdown[0].category }}</p>
                <p class="text-2xl font-bold text-(--ui-text-highlighted)">{{ categoryBreakdown[0].count }}</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- ── Main Card: Search + Table + Pagination ──── -->
        <UCard>
          <!-- Header slot = filter bar -->
          <template #header>
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <UInput
                v-model="searchQuery"
                icon="i-lucide-search"
                placeholder="Search modules..."
                class="w-full sm:w-64"
              />
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <USelectMenu
                  :model-value="sel(catOptions, categoryFilter)"
                  :items="catOptions"
                  @update:model-value="upd($event, categoryFilter)"
                  class="min-w-36"
                />
                <USelectMenu
                  :model-value="sel(statusOpts, statusFilter)"
                  :items="statusOpts"
                  @update:model-value="upd($event, statusFilter)"
                  class="min-w-32"
                />
                <UButton
                  label="Create Module"
                  icon="i-lucide-plus"
                  :to="'/module/create'"
                  class="shrink-0"
                />
                <UTooltip text="Refresh">
                  <UButton
                    icon="i-lucide-refresh-cw"
                    color="neutral" variant="ghost" square
                    :loading="loading"
                    @click="fetchModules"
                  />
                </UTooltip>
              </div>
            </div>

            <!-- Sort row -->
            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center gap-2">
                <span class="text-xs text-(--ui-text-muted)">Sort by:</span>
                <USelectMenu
                  :model-value="sel(sortOptions, sortBy)"
                  :items="sortOptions"
                  @update:model-value="upd($event, sortBy)"
                  size="xs"
                  class="min-w-32"
                />
                <UButton
                  :icon="sortOrder === 'asc' ? 'i-lucide-arrow-up-wide-narrow' : 'i-lucide-arrow-down-wide-narrow'"
                  color="neutral" variant="ghost" square size="xs"
                  @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
                />
              </div>
            </div>
          </template>

          <!-- Default slot = table -->
          <UTable
            :data="paginatedModules"
            :columns="columns"
            :loading="loading"
            @select="(event: Event, row: { original: ModuleRow }) => selectModule(row.original)"
          >
            <template #name-cell="{ row }">
              <div class="flex items-center gap-2">
                <div
                  v-if="row.original.icon"
                  class="size-6 rounded flex items-center justify-center bg-(--ui-primary)/10 shrink-0"
                >
                  <UIcon :name="row.original.icon" class="size-3.5 text-(--ui-primary)" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-sm text-(--ui-text-highlighted) truncate max-w-48">
                    {{ row.original.name }}
                  </p>
                  <p v-if="row.original.description" class="text-xs text-(--ui-text-muted) truncate max-w-48">
                    {{ row.original.description }}
                  </p>
                </div>
              </div>
            </template>

            <template #category-cell="{ row }">
              <span class="text-sm">{{ row.original.category || '—' }}</span>
            </template>

            <template #status-cell="{ row }">
              <div class="flex items-center gap-1.5">
                <span
                  class="inline-block size-1.5 rounded-full"
                  :class="row.original.isActive ? 'bg-(--ui-success)' : 'bg-(--ui-warning)'"
                />
                <span
                  class="text-sm"
                  :class="row.original.isActive ? 'text-(--ui-success)' : 'text-(--ui-warning)'"
                >
                  {{ row.original.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </template>

            <template #entityCount-cell="{ row }">
              <span class="text-sm">{{ row.original.entityCount ?? '—' }}</span>
            </template>

            <template #formCount-cell="{ row }">
              <span class="text-sm">{{ row.original.formCount ?? '—' }}</span>
            </template>

            <template #version-cell="{ row }">
              <span class="text-sm text-(--ui-text-muted)">{{ row.original.version || '—' }}</span>
            </template>

            <template #updatedAt-cell="{ row }">
              <span class="text-sm text-(--ui-text-muted)">
                {{ row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleDateString() : '—' }}
              </span>
            </template>
          </UTable>

          <!-- Pagination footer -->
          <div class="flex items-center justify-between pt-4 mt-4 border-t border-default">
            <div class="flex items-center gap-2">
              <span class="text-xs text-(--ui-text-muted)">Rows per page:</span>
              <USelectMenu
                :model-value="sel([{ label: '10 / page', value: 10 }, { label: '20 / page', value: 20 }, { label: '50 / page', value: 50 }], pageSize)"
                :items="[{ label: '10 / page', value: 10 }, { label: '20 / page', value: 20 }, { label: '50 / page', value: 50 }]"
                @update:model-value="(val: any) => { pageSize = val?.value ?? 10; page = 1 }"
                size="sm"
                class="min-w-28"
              />
            </div>
            <div class="flex items-center gap-1">
              <UButton
                icon="i-lucide-chevron-left"
                color="neutral" variant="ghost" square size="sm"
                :disabled="page <= 1"
                @click="page--"
              />
              <span class="text-xs text-(--ui-text-muted) px-2">{{ page }} / {{ totalPages }}</span>
              <UButton
                icon="i-lucide-chevron-right"
                color="neutral" variant="ghost" square size="sm"
                :disabled="page >= totalPages"
                @click="page++"
              />
            </div>
          </div>
        </UCard>
      </UContainer>
    </template>
  </UDashboardPanel>

  <!-- Detail Slideover -->
  <ModuleDetailSlideover
    v-if="showDetailSlideover && selectedModule"
    :module="selectedModule"
    @close="closeSlideover"
  />
</template>
