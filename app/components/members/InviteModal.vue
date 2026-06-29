<script setup lang="ts">
import type { Role } from '~/composables/useMembers'

defineProps<{
  roles: Role[]
}>()

const emit = defineEmits<{
  invite: [email: string, roleSlug?: string]
  close: []
}>()

const email = ref('')
const selectedRole = ref<string>('member')
const error = ref('')
const submitting = ref(false)

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

async function handleInvite() {
  const trimmed = email.value.trim()
  if (!trimmed) {
    error.value = 'Email is required'
    return
  }
  if (!isValidEmail(trimmed)) {
    error.value = 'Invalid email address'
    return
  }

  submitting.value = true
  error.value = ''

  try {
    await emit('invite', trimmed, selectedRole.value || undefined)
    email.value = ''
    selectedRole.value = 'member'
  } catch {
    error.value = 'Failed to send invite. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UModal>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold">
            Invite People
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            square
            icon="i-lucide-x"
            @click="emit('close')"
          />
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-(--ui-text-muted)">
          Send an email invitation to join this workspace.
        </p>

        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          :title="error"
          icon="i-lucide-circle-alert"
        />

        <UFormField label="Email address" required>
          <UInput
            v-model="email"
            type="email"
            placeholder="colleague@company.com"
            class="w-full"
            :disabled="submitting"
          />
        </UFormField>

        <UFormField label="Role">
          <USelect
            v-model="selectedRole"
            :items="roles.map(r => ({ label: r.name, value: r.slug }))"
            class="w-full"
            :disabled="submitting"
          />
        </UFormField>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="submitting"
            @click="emit('close')"
          >
            Cancel
          </UButton>
          <UButton
            color="primary"
            :loading="submitting"
            @click="handleInvite"
          >
            Send Invite
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
