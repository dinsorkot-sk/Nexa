<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { user } = useAuth()
const toast = useToast()

// ── Profile form ──────────────────────────────────────────────────────────
const profileLoading = ref(false)
const profileForm = reactive({
  name: user.value?.name || '',
  email: user.value?.email || '',
  avatarUrl: user.value?.avatarUrl || ''
})

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  avatarUrl: z.string().optional()
})
type ProfileSchema = z.output<typeof profileSchema>

async function onSaveProfile(payload: FormSubmitEvent<ProfileSchema>) {
  profileLoading.value = true
  try {
    const updated = await $fetch<{ id: number, name: string, email: string, avatarUrl: string | null }>('/api/auth/profile', {
      method: 'PATCH',
      body: {
        name: payload.data.name,
        email: payload.data.email,
        avatarUrl: payload.data.avatarUrl || null
      }
    })
    user.value = { ...user.value!, name: updated.name, email: updated.email, avatarUrl: updated.avatarUrl }
    toast.add({ title: 'Profile updated', color: 'success' })
  } catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Failed to update profile'
    toast.add({ title: 'Error', description: msg, color: 'error' })
  } finally {
    profileLoading.value = false
  }
}
</script>

<template>
  <UPageCard
    title="Profile Information"
    description="Manage your personal information."
    variant="naked"
    orientation="horizontal"
    class="mb-4"
  >
    <UButton
      form="profile-form"
      label="Save Changes"
      color="neutral"
      type="submit"
      class="w-fit lg:ms-auto"
    />
  </UPageCard>

  <UForm
    id="profile-form"
    :schema="profileSchema"
    :state="profileForm"
    @submit="onSaveProfile"
  >
    <UPageCard variant="subtle">
      <div class="flex items-start gap-4 mb-4">
        <UAvatar
          :src="profileForm.avatarUrl || undefined"
          :text="(profileForm.name || '?').charAt(0).toUpperCase()"
          size="xl"
          class="shrink-0"
        />
        <UFormField label="Avatar URL" name="avatarUrl" class="flex-1">
          <UInput
            v-model="profileForm.avatarUrl"
            placeholder="https://example.com/avatar.jpg"
          />
        </UFormField>
      </div>

      <USeparator />

      <UFormField
        name="name"
        label="Name"
        description="Will appear on receipts, invoices, and other communication."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profileForm.name" autocomplete="off" />
      </UFormField>

      <USeparator />

      <UFormField
        name="email"
        label="Email"
        description="Used to sign in, for email receipts and product updates."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profileForm.email" type="email" autocomplete="off" />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
