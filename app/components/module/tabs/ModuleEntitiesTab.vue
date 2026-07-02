<script setup lang="ts">
import type { ModuleDetail } from '~/types/metadata'

defineProps<{
  moduleData: ModuleDetail
}>()
</script>

<template>
  <div class="max-w-4xl space-y-4">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-database" class="size-5 text-(--ui-primary)" />
            <p class="text-sm font-semibold">
              Entities
            </p>
          </div>
          <span class="text-xs text-(--ui-text-muted)">
            {{ moduleData?.entities?.length ?? 0 }} total
          </span>
        </div>
      </template>

      <div v-if="moduleData?.entities?.length" class="space-y-2">
        <div
          v-for="entity in moduleData.entities"
          :key="entity.id"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg border border-(--ui-border)"
        >
          <div class="flex items-center gap-2 min-w-0">
            <div
              v-if="entity.icon"
              class="size-6 rounded flex items-center justify-center bg-(--ui-primary)/10 shrink-0"
            >
              <UIcon :name="entity.icon" class="size-3.5 text-(--ui-primary)" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">
                {{ entity.name }}
              </p>
              <p class="text-xs text-(--ui-text-muted) truncate">
                {{ entity.tableName }}
              </p>
            </div>
          </div>
          <span
            class="inline-block size-1.5 rounded-full shrink-0"
            :class="entity.isActive ? 'bg-(--ui-success)' : 'bg-(--ui-warning)'"
          />
        </div>
      </div>

      <div v-else class="py-12">
        <UEmpty
          icon="i-lucide-database"
          title="No entities assigned"
          :description="`This module doesn't have any entities yet. Create one from the Metadata page.`"
        />
      </div>
    </UCard>
  </div>
</template>
