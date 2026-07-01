<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { isNotificationsSlideoverOpen } = useDashboard()
const { user, logout } = useAuth()
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

// ── Password form ─────────────────────────────────────────────────────────
const passwordLoading = ref(false)
const passwordError = ref('')

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})
type PasswordSchema = z.output<typeof passwordSchema>

async function onChangePassword(payload: FormSubmitEvent<PasswordSchema>) {
  passwordLoading.value = true
  passwordError.value = ''
  try {
    await $fetch('/api/auth/password', {
      method: 'PATCH',
      body: {
        currentPassword: payload.data.currentPassword,
        newPassword: payload.data.newPassword
      }
    })
    toast.add({ title: 'Password changed', color: 'success' })
    Object.assign(passwordForm, { currentPassword: '', newPassword: '', confirmPassword: '' })
  } catch (e: unknown) {
    passwordError.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Failed to change password'
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="profile">
    <template #header>
      <UDashboardNavbar title="Profile">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <UTooltip text="Notifications" :shortcuts="['N']">
              <UButton
                color="neutral"
                variant="ghost"
                square
                @click="isNotificationsSlideoverOpen = true"
              >
                <UChip color="error" inset>
                  <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
                </UChip>
              </UButton>
            </UTooltip>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 flex flex-col gap-8 h-full max-w-2xl">
        <!-- Header -->
        <div>
          <div class="flex items-center gap-1.5 text-sm text-(--ui-text-muted) mb-1">
            <UIcon name="i-lucide-user" class="size-3.5" />
            <span>Account</span>
          </div>
          <h1 class="text-3xl font-bold text-(--ui-text-highlighted)">
            My Profile
          </h1>
          <p class="mt-1 text-sm text-(--ui-text-muted)">
            Manage your personal information and account security.
          </p>
        </div>

        <!-- Profile Card -->
        <UCard>
          <template #header>
            <span class="text-lg font-semibold">Profile Information</span>
          </template>

          <UForm
            :schema="profileSchema"
            :state="profileForm"
            class="space-y-4"
            @submit="onSaveProfile"
          >
            <div class="flex items-start gap-6">
              <UAvatar
                :src="profileForm.avatarUrl || undefined"
                :text="(profileForm.name || '?').charAt(0).toUpperCase()"
                size="xl"
                class="shrink-0"
              />
              <div class="flex-1 space-y-4">
                <UFormField label="Avatar URL" name="avatarUrl">
                  <UInput
                    v-model="profileForm.avatarUrl"
                    placeholder="https://example.com/avatar.jpg"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </div>

            <UFormField label="Name" name="name" required>
              <UInput
                v-model="profileForm.name"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Email" name="email" required>
              <UInput
                v-model="profileForm.email"
                type="email"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end pt-2">
              <UButton
                type="submit"
                color="primary"
                :loading="profileLoading"
              >
                Save Changes
              </UButton>
            </div>
          </UForm>
        </UCard>

        <!-- Change Password Card -->
        <UCard>
          <template #header>
            <span class="text-lg font-semibold">Change Password</span>
          </template>

          <UForm
            :schema="passwordSchema"
            :state="passwordForm"
            class="space-y-4"
            @submit="onChangePassword"
          >
            <UAlert
              v-if="passwordError"
              color="error"
              variant="subtle"
              :title="passwordError"
              icon="i-lucide-circle-alert"
            />

            <UFormField
              label="Current Password"
              name="currentPassword"
              required
            >
              <UInput
                v-model="passwordForm.currentPassword"
                type="password"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="New Password"
              name="newPassword"
              required
              help="At least 8 characters"
            >
              <UInput
                v-model="passwordForm.newPassword"
                type="password"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Confirm New Password"
              name="confirmPassword"
              required
            >
              <UInput
                v-model="passwordForm.confirmPassword"
                type="password"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end pt-2">
              <UButton
                type="submit"
                color="primary"
                :loading="passwordLoading"
              >
                Change Password
              </UButton>
            </div>
          </UForm>
        </UCard>

        <!-- Danger Zone -->
        <UCard variant="subtle" :ui="{ root: 'border-(--ui-error)/30' }">
          <template #header>
            <span class="text-lg font-semibold text-(--ui-error)">Sign Out</span>
          </template>
          <p class="text-sm text-(--ui-text-muted) mb-4">
            Sign out of your current session. You will be redirected to the login page.
          </p>
          <UButton
            color="error"
            variant="outline"
            @click="logout"
          >
            <UIcon name="i-lucide-log-out" class="size-4" />
            Sign Out
          </UButton>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
