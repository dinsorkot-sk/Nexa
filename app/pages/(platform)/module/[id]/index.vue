<script setup lang="ts">
import type { ModuleDetail } from '~/types/metadata'

const route = useRoute()
const moduleId = computed(() => Number(route.params.id))

// Share state with parent [id].vue via the same useAsyncData key
const detail = useState<ModuleDetail | null>(`module-${moduleId.value}`)
</script>

<template>
  <div v-if="detail" class="space-y-4 max-w-4xl">
    <UCard>
      <div class="space-y-4">
        <div>
          <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
            Status
          </p>
          <div class="flex items-center gap-1.5">
            <span
              class="inline-block size-1.5 rounded-full"
              :class="detail.isActive ? 'bg-(--ui-success)' : 'bg-(--ui-warning)'"
            />
            <span
              class="text-sm font-medium"
              :class="detail.isActive ? 'text-(--ui-success)' : 'text-(--ui-warning)'"
            >
              {{ detail.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <div v-if="detail.description">
          <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
            Description
          </p>
          <p class="text-sm">
            {{ detail.description }}
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
              Category
            </p>
            <p class="text-sm">
              {{ detail.category || '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
              Version
            </p>
            <p class="text-sm">
              {{ detail.version || '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
              Entities
            </p>
            <p class="text-sm">
              {{ detail.entityCount ?? 0 }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
              Forms
            </p>
            <p class="text-sm">
              {{ detail.formCount ?? 0 }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
              Created
            </p>
            <p class="text-sm">
              {{ detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium text-(--ui-text-muted) mb-1">
              Last Updated
            </p>
            <p class="text-sm">
              {{ detail.updatedAt ? new Date(detail.updatedAt).toLocaleDateString() : '—' }}
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="detail?.entities?.length">
      <template #header>
        <p class="text-sm font-medium">
          Quick Stats
        </p>
      </template>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p class="text-2xl font-bold text-(--ui-primary)">
            {{ detail.entities.length }}
          </p>
          <p class="text-xs text-(--ui-text-muted)">
            Entities
          </p>
        </div>
        <div>
          <p class="text-2xl font-bold text-(--ui-success)">
            {{ detail.entities.filter(e => e.isActive).length }}
          </p>
          <p class="text-xs text-(--ui-text-muted)">
            Active
          </p>
        </div>
        <div>
          <p class="text-2xl font-bold text-(--ui-warning)">
            {{ detail.entities.filter(e => !e.isActive).length }}
          </p>
          <p class="text-xs text-(--ui-text-muted)">
            Inactive
          </p>
        </div>
        <div>
          <p class="text-2xl font-bold text-(--ui-info)">
            0
          </p>
          <p class="text-xs text-(--ui-text-muted)">
            Forms
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
