<script setup lang="ts">
import type { ModuleDetail } from '~/types/metadata'

defineProps<{
  moduleData: ModuleDetail
}>()
</script>

<template>
  <div class="max-w-4xl">
    <UEmpty
      icon="i-lucide-file-plus"
      title="Form Builder — Coming Soon"
      :description="`Build forms for ${moduleData?.name || 'this module'} with a visual drag-and-drop editor.`"
    >
      <template #actions>
        <UBadge color="neutral" variant="subtle" size="sm">
          <template #default>
            <UIcon name="i-lucide-clock" class="size-3" />
            Phase 2 — Form Builder
          </template>
        </UBadge>
      </template>
    </UEmpty>
  </div>
</template>
