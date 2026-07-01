<script setup lang="ts">
const toast = useToast()
const loading = ref(false)

const state = reactive<Record<string, boolean>>({
  emailEnabled: true,
  desktopEnabled: false,
  weeklyDigest: false,
  productUpdates: true,
  importantUpdates: true
})

const sections = [{
  title: 'Notification channels',
  description: 'Where can we notify you?',
  fields: [{
    name: 'emailEnabled',
    label: 'Email',
    description: 'Receive a daily email digest.'
  }, {
    name: 'desktopEnabled',
    label: 'Desktop',
    description: 'Receive desktop notifications.'
  }]
}, {
  title: 'Account updates',
  description: 'Receive updates about Nexa.',
  fields: [{
    name: 'weeklyDigest',
    label: 'Weekly digest',
    description: 'Receive a weekly digest of news.'
  }, {
    name: 'productUpdates',
    label: 'Product updates',
    description: 'Receive a monthly email with all new features and updates.'
  }, {
    name: 'importantUpdates',
    label: 'Important updates',
    description: 'Receive emails about important updates like security fixes, maintenance, etc.'
  }]
}]

// ─── Load prefs on mount ──────────────────────────────────────────────
onMounted(async () => {
  try {
    const data = await $fetch<Record<string, boolean>>('/api/settings/notifications')
    Object.assign(state, data)
  } catch {
    // Use defaults
  }
})

async function onChange() {
  loading.value = true
  try {
    await $fetch('/api/settings/notifications', {
      method: 'POST',
      body: state
    })
  } catch {
    toast.add({ title: 'Failed to save preferences', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-for="(section, index) in sections" :key="index">
    <UPageCard
      :title="section.title"
      :description="section.description"
      variant="naked"
      class="mb-4"
    />

    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-default' }">
      <UFormField
        v-for="field in section.fields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :description="field.description"
        class="flex items-center justify-between not-last:pb-4 gap-2"
      >
        <USwitch
          :model-value="state[field.name]"
          :loading="loading"
          @update:model-value="state[field.name] = $event; onChange()"
        />
      </UFormField>
    </UPageCard>
  </div>
</template>
