<script setup lang="ts">
import type { ModuleApi } from '~/composables/useModuleDetail'

defineProps<{
  apis: ModuleApi[]
  loading: boolean
}>()

function methodColor(method: string): string {
  switch (method) {
    case 'GET': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
    case 'POST': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
    case 'PUT':
    case 'PATCH': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
    case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold">
          API Endpoints ({{ apis.length }})
        </h2>
        <p class="text-sm text-(--ui-text-muted)">
          Auto-generated RESTful API endpoints for this module
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-16"
    >
      <ULoading icon="i-lucide-loader-circle" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="apis.length === 0"
      class="flex flex-col items-center justify-center py-16"
    >
      <UIcon name="i-lucide-api" class="size-12 text-(--ui-text-muted) opacity-30 mb-3" />
      <p class="text-sm text-(--ui-text-muted)">
        No API endpoints generated yet
      </p>
      <p class="text-xs text-(--ui-text-muted) mt-1">
        APIs are auto-generated when entities are added to the module
      </p>
    </div>

    <!-- API List -->
    <div v-else class="space-y-2">
      <UCard
        v-for="api in apis"
        :key="api.id"
        :ui="{ body: 'p-2.5' }"
      >
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold shrink-0"
            :class="methodColor(api.method)"
          >
            {{ api.method }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium truncate">
              {{ api.name }}
            </div>
            <code class="text-xs text-(--ui-text-muted) font-mono truncate block">
              {{ api.path }}
            </code>
          </div>
          <span class="text-xs text-(--ui-text-muted) shrink-0">{{ api.entityName }}</span>
          <UBadge
            :color="api.isActive ? 'success' : 'warning'"
            variant="subtle"
            size="sm"
          >
            {{ api.isActive ? 'Active' : 'Inactive' }}
          </UBadge>
        </div>
      </UCard>
    </div>
  </div>
</template>
