<script setup lang="ts">
defineProps<{
  moduleName: string
  moduleSlug: string
  moduleDescription: string
  moduleIcon: string
  moduleColor: string
  moduleCategory: string
  moduleVersion: string
  moduleActive: boolean
  selectedEntityCount: number
}>()
</script>

<template>
  <div class="sticky top-6">
    <p class="text-xs font-medium text-(--ui-text-muted) mb-3 uppercase tracking-wider">
      Live Preview
    </p>
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <div
            class="size-8 rounded-lg flex items-center justify-center"
            :style="{ backgroundColor: moduleColor || 'var(--ui-primary)' }"
          >
            <UIcon :name="moduleIcon || 'i-lucide-package'" class="size-4 text-white" />
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-sm truncate">
              {{ moduleName || 'Module Name' }}
            </p>
            <p class="text-xs text-(--ui-text-muted) truncate">
              {{ moduleSlug || 'module-slug' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 mt-2">
          <span
            class="inline-block size-1.5 rounded-full"
            :class="moduleActive ? 'bg-(--ui-success)' : 'bg-(--ui-warning)'"
          />
          <span class="text-xs text-(--ui-text-muted)">{{ moduleActive ? 'Active' : 'Inactive' }}</span>
          <span class="text-xs text-(--ui-text-muted) mx-1">·</span>
          <span class="text-xs text-(--ui-text-muted)">v{{ moduleVersion }}</span>
        </div>
      </template>
      <div class="space-y-3">
        <div>
          <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
            Description
          </p>
          <p class="text-sm">
            {{ moduleDescription || '(no description)' }}
          </p>
        </div>
        <div>
          <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
            Category
          </p>
          <UBadge
            :label="moduleCategory"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </div>
        <div v-if="selectedEntityCount > 0">
          <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
            Entities
          </p>
          <UBadge
            :label="`${selectedEntityCount} entities`"
            color="success"
            variant="subtle"
            size="sm"
          />
        </div>
      </div>
    </UCard>

    <!-- What's next hint -->
    <UCard class="mt-4">
      <div class="space-y-1">
        <UIcon name="i-lucide-rocket" class="size-5 text-(--ui-primary)" />
        <p class="text-sm font-medium text-(--ui-text-highlighted)">
          Almost there!
        </p>
        <p class="text-xs text-(--ui-text-muted)">
          Review the details and click <strong>Create Module</strong> to finalize.
        </p>
      </div>
    </UCard>
  </div>
</template>
