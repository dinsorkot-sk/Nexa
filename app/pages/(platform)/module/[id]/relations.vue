<script setup lang="ts">
import type { ModuleDetail } from '~/types/metadata'

const route = useRoute()
const moduleId = computed(() => Number(route.params.id))

// Share state with parent [id].vue via the same useAsyncData key
const moduleData = useState<ModuleDetail | null>(`module-${moduleId.value}`)
</script>

<template>
  <div class="max-w-4xl">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-share-2" class="size-5 text-(--ui-primary)" />
          <p class="text-sm font-semibold">
            Relations
          </p>
        </div>
      </template>
      <div class="py-12 text-center">
        <UIcon name="i-lucide-share-2" class="size-12 text-(--ui-text-muted) mx-auto mb-3" />
        <p class="text-sm font-medium text-(--ui-text-highlighted)">
          Relation Manager — Coming Soon
        </p>
        <p class="text-xs text-(--ui-text-muted) mt-1">
          Define relationships between entities in {{ moduleData?.name || 'this module' }}.
        </p>
        <div class="mt-4 inline-flex items-center gap-2 text-xs text-(--ui-text-muted)">
          <UIcon name="i-lucide-clock" class="size-3" />
          Phase 3 — Relation Builder
        </div>
      </div>
    </UCard>
  </div>
</template>
