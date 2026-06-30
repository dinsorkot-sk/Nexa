<script setup lang="ts">
import type { Entity } from '~/types/metadata'

defineProps<{
  entities: Entity[]
  fieldCounts: { entityId: number, count: number }[]
}>()
</script>

<template>
  <div>
    <!-- Header with count -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold">
          Module Entities ({{ entities.length }})
        </h2>
        <p class="text-sm text-(--ui-text-muted)">
          Entities linked to this module
        </p>
      </div>
      <UButton
        label="Manage Entities"
        icon="i-lucide-external-link"
        color="primary"
        variant="outline"
        size="sm"
        to="/metadata"
        trailing
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="entities.length === 0"
      class="flex flex-col items-center justify-center py-16"
    >
      <UIcon name="i-lucide-database" class="size-12 text-(--ui-text-muted) opacity-30 mb-3" />
      <p class="text-sm text-(--ui-text-muted)">
        No entities linked to this module
      </p>
      <UButton
        label="Add Entities"
        color="primary"
        variant="outline"
        size="sm"
        class="mt-3"
        to="/metadata"
      />
    </div>

    <!-- Entity List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <UCard
        v-for="entity in entities"
        :key="entity.id"
        :ui="{ body: 'p-3' }"
        class="hover:border-(--ui-primary)/30 transition-colors cursor-pointer"
        @click="navigateTo(`/metadata/${entity.id}`)"
      >
        <div class="flex items-center gap-3">
          <UAvatar
            :icon="entity.icon || 'i-lucide-table-2'"
            square
            size="md"
            color="primary"
          />
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium truncate">
              {{ entity.name }}
            </div>
            <div class="text-xs text-(--ui-text-muted) truncate">
              {{ entity.slug }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold">
              {{ fieldCounts.find(fc => fc.entityId === entity.id)?.count ?? 0 }}
            </div>
            <div class="text-xs text-(--ui-text-muted)">
              fields
            </div>
          </div>
        </div>
        <div class="mt-2 flex items-center gap-2">
          <UBadge
            :color="entity.isActive ? 'success' : 'warning'"
            variant="subtle"
            size="sm"
          >
            {{ entity.isActive ? 'Active' : 'Inactive' }}
          </UBadge>
          <span class="text-xs text-(--ui-text-muted)">{{ entity.description || 'No description' }}</span>
        </div>
      </UCard>
    </div>
  </div>
</template>
