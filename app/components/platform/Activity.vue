<script setup lang="ts">
interface ActivityItem {
  icon: string
  label: string
  description: string
  time: string
  color: 'info' | 'success' | 'warning' | 'error'
}

const { data: activities } = await useAsyncData('platform-activity', () => Promise.resolve([
  { icon: 'i-lucide-plus-circle', label: 'Entity Created', description: 'Posts entity was created in Content module', time: '2 min ago', color: 'success' },
  { icon: 'i-lucide-pencil', label: 'Field Added', description: 'email field added to Users entity', time: '15 min ago', color: 'info' },
  { icon: 'i-lucide-link', label: 'Relation Added', description: '1:N relation between Posts and Categories', time: '1 hour ago', color: 'info' },
  { icon: 'i-lucide-trash-2', label: 'Entity Deleted', description: 'Tags entity was removed', time: '3 hours ago', color: 'error' },
  { icon: 'i-lucide-refresh-cw', label: 'Migration Applied', description: 'Schema migration v2 applied successfully', time: '5 hours ago', color: 'warning' },
  { icon: 'i-lucide-user-plus', label: 'Module Installed', description: 'Forum module v1.2.0 installed', time: '1 day ago', color: 'success' }
] as ActivityItem[]), { default: () => [] })
</script>

<template>
  <UCard :ui="{ body: 'p-0!' }">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-activity" class="size-4 text-muted" />
        <span class="text-sm font-medium">Recent Activity</span>
      </div>
    </template>
    <div class="divide-y divide-default">
      <div
        v-for="(item, index) in activities"
        :key="index"
        class="flex items-start gap-3 px-4 py-3.5"
      >
        <UBadge :color="item.color" variant="subtle" class="rounded-full p-1.5 shrink-0">
          <UIcon :name="item.icon" class="size-3.5" />
        </UBadge>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-highlighted truncate">
            {{ item.label }}
          </p>
          <p class="text-xs text-muted truncate">
            {{ item.description }}
          </p>
        </div>
        <span class="text-xs text-muted shrink-0 mt-0.5">{{ item.time }}</span>
      </div>
    </div>
  </UCard>
</template>
