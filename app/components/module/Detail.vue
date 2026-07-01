<script setup lang="ts">
import type { ModuleRow, ModuleDetail } from '~/types/metadata'

const props = defineProps<{
  module: ModuleRow
  open?: boolean
}>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { fetchModuleDetail, updateModule, deleteModule } = useModules()
const toast = useToast()

const detail = ref<ModuleDetail | null>(null)
const loading = ref(false)
const tab = ref<string | number>('overview')
const showDeleteModal = ref(false)
const deleting = ref(false)

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await fetchModuleDetail(props.module.id)
  } finally {
    loading.value = false
  }
}

function handleClose() {
  emit('update:open', false)
}

async function handleToggleActive() {
  const ok = await updateModule(props.module.id, {
    isActive: !props.module.isActive
  })
  if (ok) {
    toast.add({
      title: `Module ${props.module.isActive ? 'deactivated' : 'activated'}`,
      color: 'success'
    })
  }
}

async function handleDelete() {
  deleting.value = true
  const ok = await deleteModule(props.module.id)
  if (ok) {
    showDeleteModal.value = false
    handleClose()
  }
  deleting.value = false
}

watch(() => props.module.id, () => {
  detail.value = null
  loadDetail()
}, { immediate: true })
</script>

<template>
  <USlideover
    side="right"
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <!-- ─── Custom Header ─── -->
    <template #header>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          square
          @click="() => { handleClose() }"
        />
        <div class="flex items-center gap-2 min-w-0">
          <div
            v-if="module.icon"
            class="size-7 rounded flex items-center justify-center bg-(--ui-primary)/10 shrink-0"
          >
            <UIcon :name="module.icon" class="size-4 text-(--ui-primary)" />
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-sm truncate">
              {{ module.name }}
            </p>
            <p class="text-xs text-(--ui-text-muted) truncate">
              {{ module.slug }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- ─── Content ─── -->
    <template #content>
      <!-- Tab bar -->
      <UTabs
        v-model="tab"
        :items="[
          { label: 'Overview', value: 'overview' },
          { label: 'Entities', value: 'entities' },
          { label: 'Relations', value: 'relations' }
        ]"
      />

      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <!-- ════════ Overview Tab ════════ -->
        <div v-if="tab === 'overview'" class="space-y-4">
          <UCard>
            <div class="space-y-4">
              <div>
                <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                  Status
                </p>
                <div class="flex items-center gap-1.5">
                  <span
                    class="inline-block size-1.5 rounded-full"
                    :class="module.isActive ? 'bg-(--ui-success)' : 'bg-(--ui-warning)'"
                  />
                  <span
                    class="text-sm font-medium"
                    :class="module.isActive ? 'text-(--ui-success)' : 'text-(--ui-warning)'"
                  >
                    {{ module.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>

              <div v-if="module.description">
                <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                  Description
                </p>
                <p class="text-sm">
                  {{ module.description }}
                </p>
              </div>

              <div>
                <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                  Category
                </p>
                <p class="text-sm">
                  {{ module.category || '—' }}
                </p>
              </div>

              <div>
                <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                  Version
                </p>
                <p class="text-sm">
                  {{ module.version || '—' }}
                </p>
              </div>

              <div>
                <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                  Entities
                </p>
                <p class="text-sm">
                  {{ module.entityCount ?? 0 }}
                </p>
              </div>

              <div>
                <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                  Forms
                </p>
                <p class="text-sm">
                  {{ module.formCount ?? 0 }}
                </p>
              </div>

              <div>
                <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                  Created
                </p>
                <p class="text-sm">
                  {{ module.createdAt ? new Date(module.createdAt).toLocaleDateString() : '—' }}
                </p>
              </div>

              <div>
                <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
                  Last Updated
                </p>
                <p class="text-sm">
                  {{ module.updatedAt ? new Date(module.updatedAt).toLocaleDateString() : '—' }}
                </p>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <p class="text-sm font-medium">
                Quick Actions
              </p>
            </template>
            <div class="space-y-2">
              <UButton
                :label="module.isActive ? 'Deactivate Module' : 'Activate Module'"
                :color="module.isActive ? 'warning' : 'success'"
                variant="outline"
                block
                @click="handleToggleActive"
              />
              <UButton
                label="Edit Module"
                color="neutral"
                variant="outline"
                block
                disabled
              />
              <UButton
                label="Delete Module"
                color="error"
                variant="outline"
                block
                @click="() => { showDeleteModal = true }"
              />
            </div>
          </UCard>
        </div>

        <!-- ════════ Entities Tab ════════ -->
        <div v-if="tab === 'entities'">
          <div v-if="loading" class="py-8 text-center">
            <UIcon name="i-lucide-loader-circle" class="size-6 text-(--ui-text-muted) animate-spin mx-auto mb-2" />
            <p class="text-sm text-(--ui-text-muted)">
              Loading entities...
            </p>
          </div>

          <div v-else-if="detail?.entities?.length" class="space-y-2">
            <UCard v-for="entity in detail.entities" :key="entity.id">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    v-if="entity.icon"
                    class="size-6 rounded flex items-center justify-center bg-(--ui-primary)/10 shrink-0"
                  >
                    <UIcon :name="entity.icon" class="size-3.5 text-(--ui-primary)" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">
                      {{ entity.name }}
                    </p>
                    <p class="text-xs text-(--ui-text-muted) truncate">
                      {{ entity.tableName }}
                    </p>
                  </div>
                </div>
                <span
                  class="inline-block size-1.5 rounded-full shrink-0"
                  :class="entity.isActive ? 'bg-(--ui-success)' : 'bg-(--ui-warning)'"
                />
              </div>
            </UCard>
          </div>

          <div v-else class="py-8 text-center">
            <UIcon name="i-lucide-database" class="size-8 text-(--ui-text-muted) mx-auto mb-2" />
            <p class="text-sm text-(--ui-text-muted)">
              No entities assigned
            </p>
          </div>
        </div>

        <!-- ════════ Relations Tab ════════ -->
        <div v-if="tab === 'relations'" class="py-8 text-center">
          <UIcon name="i-lucide-share-2" class="size-8 text-(--ui-text-muted) mx-auto mb-2" />
          <p class="text-sm text-(--ui-text-muted)">
            Relations coming soon
          </p>
        </div>
      </div>
    </template>

    <!-- ─── Footer ─── -->
    <template #footer="{ close }">
      <div class="flex items-center justify-between px-4 py-3 border-t border-(--ui-border)">
        <p class="text-xs text-(--ui-text-muted)">
          ID: {{ module.id }}
        </p>
        <UButton
          label="Close"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="close"
        />
      </div>
    </template>
  </USlideover>

  <!-- ─── Delete Confirmation Modal ─── -->
  <UModal v-if="showDeleteModal" :open="true" @update:open="showDeleteModal = $event">
    <UCard>
      <template #header>
        <p class="font-semibold">
          Delete Module
        </p>
      </template>
      <p class="text-sm text-(--ui-text-muted)">
        Are you sure you want to delete <strong class="text-(--ui-text-highlighted)">{{ module.name }}</strong>?
        This action cannot be undone.
      </p>
      <template #footer>
        <div class="flex items-center justify-end gap-2">
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
    </UCard>
  </UModal>
</template>
