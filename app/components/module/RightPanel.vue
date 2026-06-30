<script setup lang="ts">
import type { Module } from '~/types/metadata'

const props = defineProps<{
  mod: Module
  activeTab: string
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
  return `${days}d ago`
}

const tabTips = {
  overview: {
    title: 'Module Overview',
    icon: 'i-lucide-info',
    tips: [
      'This tab shows the module summary and key metrics.',
      'Use Quick Actions for common tasks.',
      'The status indicator shows whether the module is active.'
    ]
  },
  entities: {
    title: 'About Entities',
    icon: 'i-lucide-database',
    tips: [
      'Entities are the data models in this module.',
      'Click an entity to view its fields and relations.',
      'Entities can be shared across modules.'
    ]
  },
  forms: {
    title: 'About Forms',
    icon: 'i-lucide-file-text',
    tips: [
      'Forms define how data is entered and displayed.',
      'Each entity can have multiple form layouts.',
      'Forms support custom validation rules.'
    ]
  },
  workflows: {
    title: 'About Workflows',
    icon: 'i-lucide-route',
    tips: [
      'Workflows automate business processes.',
      'Triggers fire on entity create, update, or delete.',
      'Workflows can send notifications and update records.'
    ]
  },
  apis: {
    title: 'About APIs',
    icon: 'i-lucide-api',
    tips: [
      'RESTful endpoints are auto-generated per entity.',
      'Each entity gets full CRUD endpoints.',
      'API paths follow REST conventions.'
    ]
  },
  permissions: {
    title: 'About Permissions',
    icon: 'i-lucide-shield',
    tips: [
      'Granular access control per role.',
      'Permissions cascade by role hierarchy.',
      'Super Administrator always has full access.'
    ]
  },
  settings: {
    title: 'About Settings',
    icon: 'i-lucide-settings-2',
    tips: [
      'Configure module name, key, and description.',
      'Toggle module active state on or off.',
      'Changes are saved immediately.'
    ]
  }
}

const currentTip = computed((): { title: string, icon: string, tips: string[] } => {
  return tabTips[props.activeTab as keyof typeof tabTips] ?? tabTips.overview
})
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Module Mini Card -->
    <UCard :ui="{ body: 'p-3' }">
      <div class="flex items-center gap-3 mb-2">
        <UAvatar
          :icon="mod.icon || 'i-lucide-puzzle'"
          square
          size="lg"
          color="primary"
        />
        <div class="min-w-0">
          <div class="text-sm font-semibold truncate">
            {{ mod.name }}
          </div>
          <UBadge
            :color="mod.isActive ? 'success' : 'warning'"
            variant="subtle"
            size="sm"
          >
            {{ mod.isActive ? 'Active' : 'Inactive' }}
          </UBadge>
        </div>
      </div>
      <p class="text-xs text-(--ui-text-muted) line-clamp-2">
        {{ mod.description || 'No description' }}
      </p>
      <USeparator class="my-2" />
      <div class="space-y-1.5 text-xs">
        <div class="flex justify-between">
          <span class="text-(--ui-text-muted)">Slug</span>
          <code class="font-mono">{{ mod.slug }}</code>
        </div>
        <div class="flex justify-between">
          <span class="text-(--ui-text-muted)">Category</span>
          <span>{{ mod.category || '—' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-(--ui-text-muted)">Version</span>
          <span>{{ mod.version || '1.0.0' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-(--ui-text-muted)">Created</span>
          <span>{{ mod.createdAt ? new Date(mod.createdAt).toLocaleDateString() : '-' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-(--ui-text-muted)">Updated</span>
          <span>{{ getTimeAgo(mod.updatedAt) }}</span>
        </div>
      </div>
    </UCard>

    <!-- Contextual Tips -->
    <UCard :ui="{ body: 'p-3' }">
      <div class="flex items-center gap-2 mb-3">
        <UIcon :name="currentTip.icon" class="size-4 text-(--ui-primary)" />
        <h4 class="text-xs font-semibold uppercase tracking-wider">
          {{ currentTip.title }}
        </h4>
      </div>
      <ul class="space-y-2">
        <li
          v-for="(tip, i) in currentTip.tips"
          :key="i"
          class="flex items-start gap-2 text-xs text-(--ui-text-muted)"
        >
          <UIcon name="i-lucide-lightbulb" class="size-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>{{ tip }}</span>
        </li>
      </ul>
    </UCard>

    <!-- Quick Links -->
    <UCard :ui="{ body: 'p-2' }">
      <h4 class="px-1 mb-1 text-xs font-semibold uppercase text-(--ui-text-muted)">
        Quick Links
      </h4>
      <div class="space-y-0.5">
        <UButton
          block
          color="neutral"
          variant="ghost"
          size="sm"
          class="justify-start"
          to="/metadata"
        >
          <template #leading>
            <UIcon name="i-lucide-database" class="size-4" />
          </template>
          Entity Manager
        </UButton>
        <UButton
          block
          color="neutral"
          variant="ghost"
          size="sm"
          class="justify-start"
          :to="`/module/create?edit=${mod.id}`"
        >
          <template #leading>
            <UIcon name="i-lucide-pencil" class="size-4" />
          </template>
          Edit Module
        </UButton>
        <UButton
          block
          color="neutral"
          variant="ghost"
          size="sm"
          class="justify-start"
          to="/module"
        >
          <template #leading>
            <UIcon name="i-lucide-arrow-left" class="size-4" />
          </template>
          Back to Modules
        </UButton>
      </div>
    </UCard>
  </div>
</template>
