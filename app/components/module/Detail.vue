<script setup lang="ts">
import type { ModuleRow, ModuleDetail } from '~/types/metadata'

const props = defineProps<{
  module: ModuleRow
  open?: boolean
}>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:module': [module: ModuleRow]
}>()

const router = useRouter()
const { fetchModuleDetail, updateModule, deleteModule } = useModules()
const toast = useToast()

const detail = ref<ModuleDetail | null>(null)
const loading = ref(false)
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

function handleOpenFullEditor() {
  // Close slideover and navigate to dedicated detail page
  emit('update:open', false)
  router.push(`/module/${props.module.id}`)
}

async function handleToggleActive() {
  const newIsActive = !props.module.isActive
  const ok = await updateModule(props.module.id, {
    isActive: newIsActive
  })
  if (ok) {
    emit('update:module', { ...props.module, isActive: newIsActive })
    toast.add({
      title: `Module ${newIsActive ? 'activated' : 'deactivated'}`,
      color: 'success'
    })
  }
}

async function handleDelete() {
  deleting.value = true
  const ok = await deleteModule(props.module.id)
  deleting.value = false
  if (ok) {
    showDeleteModal.value = false
    handleClose()
  }
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
    @update:open="(v) => { if (!v) emit('update:open', false) }"
  >
    <template #header>
      <div class="flex items-center gap-2">
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
    </template>

    <template #body>
      <!-- Quick info section -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
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

        <div v-if="module.description" class="text-sm text-(--ui-text-muted)">
          {{ module.description }}
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-xs text-(--ui-text-muted)">
              Category
            </p>
            <p class="font-medium">
              {{ module.category || '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-(--ui-text-muted)">
              Version
            </p>
            <p class="font-medium">
              {{ module.version || '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-(--ui-text-muted)">
              Entities
            </p>
            <p class="font-medium">
              {{ module.entityCount ?? 0 }}
            </p>
          </div>
          <div>
            <p class="text-xs text-(--ui-text-muted)">
              Forms
            </p>
            <p class="font-medium">
              {{ module.formCount ?? 0 }}
            </p>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="space-y-2 pt-2 border-t border-(--ui-border)">
          <UButton
            label="Open Full Editor"
            color="primary"
            variant="solid"
            icon="i-lucide-external-link"
            block
            @click="handleOpenFullEditor"
          />
          <UButton
            :label="module.isActive ? 'Deactivate' : 'Activate'"
            :color="module.isActive ? 'warning' : 'success'"
            variant="outline"
            block
            @click="handleToggleActive"
          />
        </div>

        <!-- Entities list (read-only preview) -->
        <div v-if="loading" class="py-8 text-center">
          <UIcon name="i-lucide-loader-circle" class="size-6 text-(--ui-text-muted) animate-spin mx-auto mb-2" />
          <p class="text-sm text-(--ui-text-muted)">
            Loading entities...
          </p>
        </div>

        <div v-else-if="detail?.entities?.length" class="pt-2 border-t border-(--ui-border)">
          <p class="text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider mb-2">
            Entities ({{ detail.entities.length }})
          </p>
          <div class="space-y-1 max-h-64 overflow-y-auto">
            <div
              v-for="entity in detail.entities"
              :key="entity.id"
              class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-(--ui-bg-elevated) cursor-pointer"
              @click="handleOpenFullEditor"
            >
              <div
                v-if="entity.icon"
                class="size-5 rounded flex items-center justify-center bg-(--ui-primary)/10 shrink-0"
              >
                <UIcon :name="entity.icon" class="size-3 text-(--ui-primary)" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium truncate">
                  {{ entity.name }}
                </p>
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
          <p class="text-xs text-(--ui-text-muted) mt-2 italic">
            Click any entity to open the full editor
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <UButton
          color="error"
          variant="ghost"
          size="sm"
          icon="i-lucide-trash-2"
          @click="() => { showDeleteModal = true }"
        >
          Delete
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          @click="handleClose"
        >
          Close
        </UButton>
      </div>
    </template>
  </USlideover>

  <!-- Delete confirmation -->
  <UModal v-model:open="showDeleteModal" title="Delete Module">
    <template #body>
      <p class="text-sm text-(--ui-text-muted)">
        Are you sure you want to delete
        <strong class="text-(--ui-text-highlighted)">{{ module.name }}</strong>?
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
</template>
