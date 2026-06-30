<script setup lang="ts">
import type { ModuleSetting } from '~/composables/useModuleDetail'

const props = defineProps<{
  settings: ModuleSetting[]
  loading: boolean
}>()

const emit = defineEmits<{
  save: [key: string, value: string | boolean | number]
}>()

const localSettings = reactive<Record<string, string | boolean | number>>({})

watch(() => props.settings, (settings) => {
  settings.forEach((s) => {
    localSettings[s.key] = s.value
  })
}, { immediate: true })

function handleSave(key: string) {
  const value = localSettings[key]
  if (value !== undefined) {
    emit('save', key, value)
  }
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="text-lg font-semibold">
        Module Settings
      </h2>
      <p class="text-sm text-(--ui-text-muted)">
        Configure module properties and behavior
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-if="settings.length === 0"
      class="flex flex-col items-center justify-center py-16"
    >
      <UIcon name="i-lucide-settings-2" class="size-12 text-(--ui-text-muted) opacity-30 mb-3" />
      <p class="text-sm text-(--ui-text-muted)">
        No settings available
      </p>
    </div>

    <!-- Settings Form -->
    <div v-else class="space-y-4 max-w-xl">
      <UCard
        v-for="setting in settings"
        :key="setting.key"
        :ui="{ body: 'p-4' }"
      >
        <UFormField :label="setting.label" :description="setting.description">
          <!-- Text Input -->
          <UInput
            v-if="setting.type === 'text'"
            v-model="localSettings[setting.key]"
            class="w-full"
            @blur="handleSave(setting.key)"
          />

          <!-- Toggle Switch -->
          <div
            v-else-if="setting.type === 'toggle'"
            class="flex items-center gap-2"
          >
            <USwitch
              :model-value="localSettings[setting.key] as boolean"
              color="primary"
              @update:model-value="(val: boolean) => { localSettings[setting.key] = val; handleSave(setting.key) }"
            />
            <span
              class="text-sm"
              :class="localSettings[setting.key] ? 'text-emerald-600' : 'text-(--ui-text-muted)'"
            >
              {{ localSettings[setting.key] ? 'Enabled' : 'Disabled' }}
            </span>
          </div>

          <!-- Select -->
          <USelect
            v-else-if="setting.type === 'select'"
            :model-value="localSettings[setting.key] as string"
            :items="setting.options || []"
            class="w-full"
            @update:model-value="(val: string) => { localSettings[setting.key] = val; handleSave(setting.key) }"
          />

          <!-- Number -->
          <UInput
            v-else-if="setting.type === 'number'"
            v-model="localSettings[setting.key]"
            type="number"
            class="w-full"
            @blur="handleSave(setting.key)"
          />
        </UFormField>
      </UCard>

      <!-- Save indicator -->
      <div v-if="loading" class="flex items-center gap-2 text-sm text-(--ui-text-muted)">
        <ULoading icon="i-lucide-loader-circle" class="size-4" />
        Saving changes...
      </div>
    </div>
  </div>
</template>
