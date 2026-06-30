<script setup lang="ts">
import type { Module } from '~/types/metadata'

const props = defineProps<{
  mod: Module
  entityCount: number
  formCount: number
  workflowCount: number
  apiCount: number
}>()

function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '-'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

const overviewStats = computed(() => [
  { label: 'Status', value: props.mod.isActive ? 'Active' : 'Inactive', color: props.mod.isActive ? 'success' : 'warning', icon: props.mod.isActive ? 'i-lucide-check-circle' : 'i-lucide-pause-circle' },
  { label: 'Category', value: props.mod.category || '—', color: 'neutral', icon: 'i-lucide-folder' },
  { label: 'Version', value: props.mod.version || '1.0.0', color: 'neutral', icon: 'i-lucide-tag' },
  { label: 'Entities', value: String(props.entityCount), color: 'primary', icon: 'i-lucide-database' },
  { label: 'Forms', value: String(props.formCount), color: 'info', icon: 'i-lucide-file-text' },
  { label: 'Workflows', value: String(props.workflowCount), color: 'warning', icon: 'i-lucide-route' },
  { label: 'APIs', value: String(props.apiCount), color: 'success', icon: 'i-lucide-api' },
  { label: 'Created', value: props.mod.createdAt ? new Date(props.mod.createdAt).toLocaleDateString() : '-', color: 'neutral', icon: 'i-lucide-calendar' },
  { label: 'Last Updated', value: getTimeAgo(props.mod.updatedAt), color: 'neutral', icon: 'i-lucide-clock' }
])
</script>

<template>
  <div class="space-y-6">
    <!-- Module Hero -->
    <div class="flex items-start gap-4">
      <UAvatar
        :icon="mod.icon || 'i-lucide-puzzle'"
        square
        size="xl"
        color="primary"
      />
      <div class="min-w-0 flex-1">
        <h2 class="text-xl font-bold">
          {{ mod.name }}
        </h2>
        <p class="text-sm text-(--ui-text-muted) mt-1">
          {{ mod.description || 'No description provided.' }}
        </p>
        <div class="flex items-center gap-2 mt-2">
          <UBadge :color="mod.isActive ? 'success' : 'warning'" variant="subtle" size="sm">
            {{ mod.isActive ? 'Active' : 'Inactive' }}
          </UBadge>
          <UBadge variant="subtle" color="neutral" size="sm">
            {{ mod.slug }}
          </UBadge>
          <UBadge
            v-if="mod.category"
            variant="subtle"
            color="primary"
            size="sm"
          >
            {{ mod.category }}
          </UBadge>
        </div>
      </div>
    </div>

    <USeparator />

    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-3">
      <UCard
        v-for="stat in overviewStats"
        :key="stat.label"
        :ui="{ body: 'p-3' }"
      >
        <div class="flex items-center gap-2">
          <div
            class="flex size-8 items-center justify-center rounded-lg shrink-0"
            :class="{
              'bg-green-100 dark:bg-green-900/30': stat.color === 'success',
              'bg-orange-100 dark:bg-orange-900/30': stat.color === 'warning',
              'bg-blue-100 dark:bg-blue-900/30': stat.color === 'primary' || stat.color === 'info',
              'bg-gray-100 dark:bg-gray-800': stat.color === 'neutral'
            }"
          >
            <UIcon
              :name="stat.icon"
              class="size-4"
              :class="{
                'text-green-600 dark:text-green-400': stat.color === 'success',
                'text-orange-600 dark:text-orange-400': stat.color === 'warning',
                'text-blue-600 dark:text-blue-400': stat.color === 'primary' || stat.color === 'info',
                'text-gray-600 dark:text-gray-400': stat.color === 'neutral'
              }"
            />
          </div>
          <div>
            <div class="text-lg font-bold">
              {{ stat.value }}
            </div>
            <div class="text-xs text-(--ui-text-muted)">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <USeparator />

    <!-- Quick Actions -->
    <div>
      <h3 class="text-sm font-semibold mb-3">
        Quick Actions
      </h3>
      <div class="flex flex-wrap gap-2">
        <UButton
          label="Manage Entities"
          icon="i-lucide-database"
          color="neutral"
          variant="outline"
          size="sm"
          to="/metadata"
        />
        <UButton
          label="Edit Module"
          icon="i-lucide-pencil"
          color="primary"
          variant="outline"
          size="sm"
          :to="`/module/create?edit=${mod.id}`"
        />
        <UButton
          label="View Logs"
          icon="i-lucide-scroll-text"
          color="neutral"
          variant="outline"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>
