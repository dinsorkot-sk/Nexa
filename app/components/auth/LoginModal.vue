<script setup lang="ts">
const emit = defineEmits<{
  close: []
  loggedIn: []
}>()

const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Email and password are required'
    return
  }
  submitting.value = true
  error.value = ''

  try {
    await login(email.value, password.value)
    emit('loggedIn')
    emit('close')
  } catch (e: unknown) {
    error.value = (e as { data?: { statusMessage?: string }, message?: string })?.data?.statusMessage || (e as Error)?.message || 'Login failed. Check your credentials.'
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
            Sign In
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
          Sign in with your email and password.
        </p>

        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          :title="error"
          icon="i-lucide-circle-alert"
        />

        <UFormField label="Email" required>
          <UInput
            v-model="email"
            type="email"
            placeholder="admin@nexa.dev"
            class="w-full"
            :disabled="submitting"
            @keyup.enter="handleLogin"
          />
        </UFormField>

        <UFormField label="Password" required>
          <UInput
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full"
            :disabled="submitting"
            @keyup.enter="handleLogin"
          />
        </UFormField>
      </div>

      <template #footer>
        <UButton
          color="primary"
          :loading="submitting"
          class="w-full"
          @click="handleLogin"
        >
          Sign In
        </UButton>
      </template>
    </UCard>
  </UModal>
</template>
