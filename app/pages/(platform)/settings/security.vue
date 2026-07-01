<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { logout } = useAuth()
const toast = useToast()
const router = useRouter()
const confirmDelete = ref(false)
const deleting = ref(false)

// ── Change Password ───────────────────────────────────────────────────────
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

// ── Active Sessions ───────────────────────────────────────────────────────
interface Session {
  id: number
  createdAt: string
  expiresAt: string
  isCurrent: boolean
}

const sessions = ref<Session[]>([])
const sessionsLoading = ref(true)
const revokingId = ref<number | null>(null)

async function loadSessions() {
  sessionsLoading.value = true
  try {
    const data = await $fetch<Session[]>('/api/auth/sessions')
    sessions.value = data
  } catch {
    // Ignore
  } finally {
    sessionsLoading.value = false
  }
}

async function revokeSession(id: number) {
  revokingId.value = id
  try {
    await $fetch(`/api/auth/sessions/${id}`, { method: 'DELETE' })
    sessions.value = sessions.value.filter(s => s.id !== id)
    toast.add({ title: 'Session revoked', color: 'success' })
  } catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Failed to revoke session'
    toast.add({ title: 'Error', description: msg, color: 'error' })
  } finally {
    revokingId.value = null
  }
}

onMounted(loadSessions)

// ── Danger: Delete Account ────────────────────────────────────────────────
async function deleteAccount() {
  deleting.value = true
  try {
    await $fetch('/api/auth/account', { method: 'DELETE' })
    toast.add({ title: 'Account deleted', color: 'success' })
    await logout()
    await router.push('/login')
  } catch {
    toast.add({ title: 'Failed to delete account', color: 'error' })
  } finally {
    deleting.value = false
    confirmDelete.value = false
  }
}
</script>

<template>
  <!-- Change Password -->
  <UPageCard
    title="Change Password"
    description="Confirm your current password before setting a new one."
    variant="naked"
    orientation="horizontal"
    class="mb-4"
  >
    <UButton
      form="password-form"
      label="Update"
      color="neutral"
      type="submit"
      class="w-fit lg:ms-auto"
    />
  </UPageCard>

  <UPageCard variant="subtle">
    <UForm
      id="password-form"
      :schema="passwordSchema"
      :state="passwordForm"
      @submit="onChangePassword"
    >
      <UAlert
        v-if="passwordError"
        color="error"
        variant="subtle"
        :title="passwordError"
        icon="i-lucide-circle-alert"
        class="mb-4"
      />

      <UFormField
        name="currentPassword"
        label="Current Password"
        required
        class="mb-4"
      >
        <UInput
          v-model="passwordForm.currentPassword"
          type="password"
          placeholder="Current password"
          class="w-full"
        />
      </UFormField>

      <UFormField
        name="newPassword"
        label="New Password"
        required
        help="At least 8 characters"
        class="mb-4"
      >
        <UInput
          v-model="passwordForm.newPassword"
          type="password"
          placeholder="New password"
          class="w-full"
        />
      </UFormField>

      <UFormField name="confirmPassword" label="Confirm New Password" required>
        <UInput
          v-model="passwordForm.confirmPassword"
          type="password"
          placeholder="Confirm new password"
          class="w-full"
        />
      </UFormField>
    </UForm>
  </UPageCard>

  <!-- Active Sessions -->
  <UPageCard
    title="Active Sessions"
    description="Manage your active login sessions across devices."
    variant="naked"
    class="mt-8 mb-4"
  />

  <UPageCard variant="subtle">
    <template v-if="sessionsLoading">
      <div class="flex items-center justify-center py-8">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-(--ui-text-muted)" />
      </div>
    </template>

    <template v-else-if="sessions.length === 0">
      <p class="text-sm text-(--ui-text-muted) text-center py-4">
        No active sessions.
      </p>
    </template>

    <ul v-else class="divide-y divide-default">
      <li v-for="session in sessions" :key="session.id" class="flex items-center justify-between py-3">
        <div class="flex flex-col gap-0.5">
          <span class="text-sm font-medium">
            Session #{{ session.id }}
            <UBadge
              v-if="session.isCurrent"
              color="info"
              variant="solid"
              size="xs"
            >Current</UBadge>
          </span>
          <span class="text-xs text-(--ui-text-muted)">
            Created: {{ new Date(session.createdAt).toLocaleString() }}
          </span>
          <span class="text-xs text-(--ui-text-muted)">
            Expires: {{ new Date(session.expiresAt).toLocaleString() }}
          </span>
        </div>
        <UButton
          v-if="!session.isCurrent"
          color="error"
          variant="ghost"
          size="sm"
          icon="i-lucide-x-circle"
          :loading="revokingId === session.id"
          @click="revokeSession(session.id)"
        >
          Revoke
        </UButton>
      </li>
    </ul>
  </UPageCard>

  <!-- Danger Zone: Delete Account -->
  <UPageCard
    title="Delete Account"
    description="No longer want to use our service? You can delete your account here. This action is not reversible."
    variant="naked"
    class="mt-8 mb-4"
  />

  <UPageCard
    variant="subtle"
    class="bg-linear-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UModal v-if="confirmDelete">
        <UCard>
          <template #header>
            <span class="text-lg font-semibold text-(--ui-error)">Confirm Deletion</span>
          </template>
          <p class="text-sm text-(--ui-text-muted) mb-4">
            Are you sure you want to delete your account? This action is permanent and cannot be undone.
          </p>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" @click="confirmDelete = false">
              Cancel
            </UButton>
            <UButton color="error" :loading="deleting" @click="deleteAccount">
              Delete My Account
            </UButton>
          </div>
        </UCard>
      </UModal>

      <UButton
        label="Delete account"
        color="error"
        @click="confirmDelete = true"
      />
    </template>
  </UPageCard>

  <UPageCard
    title="Sign Out"
    variant="naked"
    class="mt-8 mb-4"
  />

  <UPageCard variant="subtle">
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
  </UPageCard>
</template>
