<script setup lang="ts">
import type { ModuleWorkflow } from '~/composables/useModuleDetail'

defineProps<{
  workflows: ModuleWorkflow[]
  loading: boolean
}>()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold">
          Workflows ({{ workflows.length }})
        </h2>
        <p class="text-sm text-(--ui-text-muted)">
          Automated workflows and triggers for this module
        </p>
      </div>
      <UButton
        label="+ New Workflow"
        icon="i-lucide-plus"
        color="primary"
        size="sm"
      />
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
      v-else-if="workflows.length === 0"
      class="flex flex-col items-center justify-center py-16"
    >
      <UIcon name="i-lucide-route" class="size-12 text-(--ui-text-muted) opacity-30 mb-3" />
      <p class="text-sm text-(--ui-text-muted)">
        No workflows configured yet
      </p>
      <p class="text-xs text-(--ui-text-muted) mb-3">
        Workflows run automatically based on entity events
      </p>
      <UButton
        label="Create First Workflow"
        color="primary"
        size="sm"
      />
    </div>

    <!-- Workflow List -->
    <div v-else class="space-y-2">
      <UCard
        v-for="wf in workflows"
        :key="wf.id"
        :ui="{ body: 'p-3' }"
      >
        <div class="flex items-center gap-3">
          <UAvatar
            icon="i-lucide-route"
            square
            size="sm"
            color="warning"
          />
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium">
              {{ wf.name }}
            </div>
            <div class="text-xs text-(--ui-text-muted)">
              {{ wf.entityName }} · Trigger: {{ wf.trigger }}
            </div>
          </div>
          <UBadge
            :color="wf.isActive ? 'success' : 'warning'"
            variant="subtle"
            size="sm"
          >
            {{ wf.isActive ? 'Active' : 'Inactive' }}
          </UBadge>
          <UButton
            icon="i-lucide-chevron-right"
            color="neutral"
            variant="ghost"
            square
            size="sm"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
