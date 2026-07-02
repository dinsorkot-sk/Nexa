<script setup lang="ts">
import type { ModuleDetail } from '~/types/metadata'

defineProps<{
  moduleData: ModuleDetail
}>()
</script>

<template>
  <div class="max-w-4xl">
    <UEmpty
      icon="i-lucide-share-2"
      title="Relation Manager — Coming Soon"
      :description="`Define relationships between entities in ${moduleData?.name || 'this module'}.`"
    >
      <template #actions>
        <UBadge color="neutral" variant="subtle" size="sm">
          <template #default>
            <UIcon name="i-lucide-clock" class="size-3" />
            Phase 3 — Relation Builder
          </template>
        </UBadge>
      </template>
    </UEmpty>
  </div>
</template>
