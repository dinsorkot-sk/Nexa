<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const loading = ref(false)
const sent = ref(false)
const resetUrl = ref('')

const form = reactive({ email: '' })

const schema = z.object({
  email: z.string().email('Please enter a valid email')
})
type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const data = await $fetch<{ success: boolean, message: string, resetUrl?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: payload.data.email }
    })
    sent.value = true
    resetUrl.value = data.resetUrl || ''
    toast.add({ title: 'Reset link sent', description: data.message, color: 'success' })
  } catch (e: unknown) {
    const msg = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Something went wrong'
    toast.add({ title: 'Error', description: msg, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">
            Forgot Password
          </h1>
          <p class="mt-1 text-sm text-(--ui-text-muted)">
            Enter your email and we'll send you a reset link.
          </p>
        </div>
      </template>

      <UAlert
        v-if="sent"
        color="success"
        variant="subtle"
        icon="i-lucide-check-circle"
        title="Check your email"
        :description="resetUrl ? `For development, use the link below:` : undefined"
        class="mb-4"
      >
        <template v-if="resetUrl" #description>
          <ULink :to="resetUrl" class="text-sm font-medium break-all">
            {{ resetUrl }}
          </ULink>
        </template>
      </UAlert>

      <UForm
        v-if="!sent"
        :schema="schema"
        :state="form"
        @submit="onSubmit"
      >
        <UFormField
          label="Email"
          name="email"
          required
          class="mb-4"
        >
          <UInput
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="loading"
        >
          Send Reset Link
        </UButton>
      </UForm>

      <div v-else class="text-center">
        <UButton
          color="neutral"
          variant="outline"
          to="/login"
        >
          Back to Login
        </UButton>
      </div>

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
