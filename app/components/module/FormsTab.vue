<script setup lang="ts">
import type { ModuleForm } from '~/composables/useModuleDetail'

defineProps<{
  forms: ModuleForm[]
  loading: boolean
}>()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold">
          Forms ({{ forms.length }})
        </h2>
        <p class="text-sm text-(--ui-text-muted)">
          Forms and views configured for this module
        </p>
      </div>
      <UButton
        label="+ New Form"
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
      v-else-if="forms.length === 0"
      class="flex flex-col items-center justify-center py-16"
    >
      <UIcon name="i-lucide-file-text" class="size-12 text-(--ui-text-muted) opacity-30 mb-3" />
      <p class="text-sm text-(--ui-text-muted)">
        No forms configured yet
      </p>
      <UButton
        label="Create First Form"
        color="primary"
        size="sm"
        class="mt-3"
      />
    </div>

    <!-- Form List -->
    <div v-else class="space-y-2">
      <UCard
        v-for="form in forms"
        :key="form.id"
        :ui="{ body: 'p-3' }"
      >
        <div class="flex items-center gap-3">
          <UAvatar
            icon="i-lucide-file-text"
            square
            size="sm"
            color="primary"
          />
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium">
              {{ form.name }}
            </div>
            <div class="text-xs text-(--ui-text-muted)">
              {{ form.slug }}
            </div>
          </div>
          <UBadge
            :color="form.isActive ? 'success' : 'warning'"
            variant="subtle"
            size="sm"
          >
            {{ form.isActive ? 'Active' : 'Inactive' }}
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
