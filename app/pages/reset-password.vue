<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Reset Password',
  description: 'Enter your new password below'
})


const route = useRoute()
const router = useRouter()
const toast = useToast()

const token = computed(() => (route.query.token as string) || '')

const loading = ref(false)

const form = reactive({
  password: '',
  confirmPassword: ''
})

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})
type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  if (!token.value) {
    toast.add({ title: 'Error', description: 'Missing reset token', color: 'error' })
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, password: payload.data.password }
    })
    toast.add({ title: 'Password reset!', description: 'You can now log in with your new password.', color: 'success' })
    await router.push('/login')
  } catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Failed to reset password'
    toast.add({ title: 'Error', description: msg, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <UCard v-if="!token" class="w-full max-w-sm">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">
            Invalid Link
          </h1>
          <p class="mt-1 text-sm text-(--ui-text-muted)">
            This password reset link is invalid or missing a token.
          </p>
        </div>
      </template>

      <UButton
        color="primary"
        variant="outline"
        to="/forgot-password"
        block
      >
        Request New Reset Link
      </UButton>

      <template #footer>
        <div class="text-center text-sm">
          <ULink to="/login" class="text-primary font-medium">
            Back to Login
          </ULink>
        </div>
      </template>
    </UCard>

    <UCard v-else class="w-full max-w-sm">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">
            Reset Password
          </h1>
          <p class="mt-1 text-sm text-(--ui-text-muted)">
            Enter your new password below.
          </p>
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="form"
        @submit="onSubmit"
      >
        <UFormField
          label="New Password"
          name="password"
          required
          class="mb-4"
        >
          <UInput
            v-model="form.password"
            type="password"
            placeholder="At least 8 characters"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Confirm Password"
          name="confirmPassword"
          required
          class="mb-4"
        >
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="Re-enter your new password"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="loading"
        >
          Reset Password
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-center text-sm">
          <ULink to="/login" class="text-primary font-medium">
            Back to Login
          </ULink>
        </div>
      </template>
    </UCard>
  </div>
</template>
