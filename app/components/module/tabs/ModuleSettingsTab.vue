<script setup lang="ts">
import type { ModuleDetail } from '~/types/metadata'

const props = defineProps<{
  moduleData: ModuleDetail
}>()

const emit = defineEmits<{
  refreshed: [ModuleDetail]
}>()

// Local form state — bound to moduleData
const form = reactive({
  name: props.moduleData.name,
  slug: props.moduleData.slug,
  description: props.moduleData.description || '',
  category: props.moduleData.category || '',
  version: props.moduleData.version || '1.0.0'
})

// Re-sync when parent moduleData changes (e.g. after refresh)
watch(() => props.moduleData, (m) => {
  form.name = m.name
  form.slug = m.slug
  form.description = m.description || ''
  form.category = m.category || ''
  form.version = m.version || '1.0.0'
}, { deep: true })

const dirty = computed(() => {
  return form.name !== props.moduleData.name
    || form.slug !== props.moduleData.slug
    || (form.description || '') !== (props.moduleData.description || '')
    || (form.category || '') !== (props.moduleData.category || '')
    || form.version !== (props.moduleData.version || '1.0.0')
})

const saving = ref(false)
const { updateModule } = useModules()
const toast = useToast()

async function save() {
  if (!dirty.value) return
  saving.value = true
  try {
    const ok = await updateModule(props.moduleData.id, {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      category: form.category || undefined,
      version: form.version
    })
    if (ok) {
      emit('refreshed', {
        ...props.moduleData,
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        category: form.category || null,
        version: form.version
      })
      toast.add({ title: 'Settings saved', color: 'success' })
    }
  } finally {
    saving.value = false
  }
}

function discard() {
  form.name = props.moduleData.name
  form.slug = props.moduleData.slug
  form.description = props.moduleData.description || ''
  form.category = props.moduleData.category || ''
  form.version = props.moduleData.version || '1.0.0'
}

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
</script>

<template>
  <div class="max-w-3xl space-y-4">
    <UCard>
      <template #header>
        <p class="text-sm font-semibold">
          Module Information
        </p>
        <p class="text-xs text-(--ui-text-muted)">
          Update basic details for {{ moduleData?.name || 'this module' }}.
        </p>
      </template>

      <div class="space-y-4">
        <UFormField label="Name" required>
          <UInput v-model="form.name" class="w-full" />
        </UFormField>

        <UFormField
          label="Slug"
          description="Unique key used in APIs. Cannot be changed freely — affects routes."
          required
        >
          <UInput v-model="form.slug" class="w-full" />
        </UFormField>

        <UFormField label="Description">
          <UTextarea v-model="form.description" class="w-full" :rows="3" />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Category">
            <USelect
              v-model="form.category"
              :items="categoryOptions"
              class="w-full"
              placeholder="Select category..."
            />
          </UFormField>

          <UFormField label="Version">
            <UInput v-model="form.version" class="w-full" placeholder="1.0.0" />
          </UFormField>
        </div>
      </div>
    </UCard>

    <div v-if="dirty" class="flex items-center justify-end gap-2 sticky bottom-4">
      <UButton
        label="Discard"
        color="neutral"
        variant="ghost"
        @click="discard"
      />
      <UButton
        label="Save Changes"
        color="primary"
        icon="i-lucide-check"
        :loading="saving"
        @click="save"
      />
    </div>
  </div>
</template>
