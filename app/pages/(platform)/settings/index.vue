<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AppConfigData } from '~~/server/utils/app-config'

const toast = useToast()
const loading = ref(false)

const config = reactive<AppConfigData>({
  siteName: 'Nexa',
  locale: 'en',
  timezone: 'UTC',
  logoUrl: null
})

// Wrapping logoUrl since UInput v-model uses string|undefined
const logoUrl = computed({
  get: () => config.logoUrl ?? undefined,
  set: (v: string | undefined) => { config.logoUrl = v ?? null }
})

// ─── Load config on mount ─────────────────────────────────────────────
onMounted(async () => {
  try {
    const data = await $fetch<AppConfigData>('/api/settings/general')
    Object.assign(config, data)
  } catch {
    // Use defaults
  }
})

const schema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  locale: z.string().min(1, 'Locale is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  logoUrl: z.string().nullable()
})
type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await $fetch('/api/settings/general', {
      method: 'PUT',
      body: payload.data
    })
    toast.add({ title: 'Settings saved', color: 'success' })
  } catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Failed to save settings'
    toast.add({ title: 'Error', description: msg, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UPageCard
    title="General Settings"
    description="Configure your application's basic information."
    variant="naked"
    orientation="horizontal"
    class="mb-4"
  >
    <UButton
      form="general-settings"
      label="Save Changes"
      color="primary"
      type="submit"
      class="w-fit lg:ms-auto"
    />
  </UPageCard>

  <UForm
    id="general-settings"
    :schema="schema"
    :state="config"
    @submit="onSubmit"
  >
    <UPageCard variant="subtle">
      <UFormField
        name="siteName"
        label="Site Name"
        description="The name of your application as displayed to users."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="config.siteName" autocomplete="off" />
      </UFormField>

      <USeparator />

      <UFormField
        name="locale"
        label="Default Locale"
        description="Default language/locale for the application."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <USelect
          v-model="config.locale"
          :items="[
            { label: 'English (US)', value: 'en' },
            { label: 'Thai', value: 'th' },
            { label: 'Japanese', value: 'ja' },
            { label: 'Chinese (Simplified)', value: 'zh-CN' }
          ]"
          class="min-w-48"
        />
      </UFormField>

      <USeparator />

      <UFormField
        name="timezone"
        label="Timezone"
        description="Default timezone for dates and times."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <USelect
          v-model="config.timezone"
          :items="[
            { label: 'UTC', value: 'UTC' },
            { label: 'Bangkok (ICT)', value: 'Asia/Bangkok' },
            { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
            { label: 'US Eastern', value: 'America/New_York' },
            { label: 'US Pacific', value: 'America/Los_Angeles' }
          ]"
          class="min-w-48"
        />
      </UFormField>

      <USeparator />

      <UFormField
        name="logoUrl"
        label="Logo URL"
        description="URL to your custom logo image."
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="logoUrl" placeholder="https://example.com/logo.png" />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
