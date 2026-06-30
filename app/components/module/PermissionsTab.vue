<script setup lang="ts">
import type { ModulePermission } from '~/composables/useModuleDetail'

defineProps<{
  permissions: ModulePermission[]
}>()

const roleColorMap: Record<string, string> = {
  superAdmin: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  user: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

const actions = [
  { key: 'view', label: 'View', icon: 'i-lucide-eye' },
  { key: 'create', label: 'Create', icon: 'i-lucide-plus' },
  { key: 'edit', label: 'Edit', icon: 'i-lucide-pencil' },
  { key: 'delete', label: 'Delete', icon: 'i-lucide-trash-2' },
  { key: 'export', label: 'Export', icon: 'i-lucide-download' }
]
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="text-lg font-semibold">
        Role Permissions
      </h2>
      <p class="text-sm text-(--ui-text-muted)">
        Access control permissions for this module
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-if="permissions.length === 0"
      class="flex flex-col items-center justify-center py-16"
    >
      <UIcon name="i-lucide-shield" class="size-12 text-(--ui-text-muted) opacity-30 mb-3" />
      <p class="text-sm text-(--ui-text-muted)">
        No permissions configured
      </p>
    </div>

    <!-- Permission Matrix -->
    <div v-else class="space-y-3">
      <UCard
        v-for="perm in permissions"
        :key="perm.roleId"
        :ui="{ body: 'p-0' }"
      >
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-(--ui-border) bg-(--ui-bg-elevated)/50"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-circle-user" class="size-4 text-(--ui-text-muted)" />
            <span class="text-sm font-medium">{{ perm.roleName }}</span>
          </div>
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            :class="roleColorMap[perm.roleId] || ''"
          >
            {{ perm.roleId }}
          </span>
        </div>
        <div class="flex items-center gap-0 divide-x divide-(--ui-border)">
          <div
            v-for="action in actions"
            :key="action.key"
            class="flex items-center gap-1.5 px-3 py-2.5 text-xs"
            :class="perm[action.key as keyof typeof perm] ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''"
          >
            <UIcon
              :name="perm[action.key as keyof typeof perm] ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
              class="size-3.5"
              :class="perm[action.key as keyof typeof perm] ? 'text-emerald-500' : 'text-(--ui-text-muted)'"
            />
            <span class="text-(--ui-text-muted)">{{ action.label }}</span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
