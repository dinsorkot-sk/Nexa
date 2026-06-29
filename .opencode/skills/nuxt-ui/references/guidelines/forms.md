# Forms

## Basic pattern

```vue
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters')
})

type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({ email: '', password: '' })

function onSubmit(event: FormSubmitEvent<Schema>) {
  // event.data is validated
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="email" label="Email" required>
      <UInput v-model="state.email" type="email" placeholder="you@example.com" />
    </UFormField>

    <UFormField name="password" label="Password" required>
      <UInput v-model="state.password" type="password" placeholder="Min 8 characters" />
    </UFormField>

    <UButton type="submit" label="Sign in" />
  </UForm>
</template>
```

## Key rules

- Always use `UFormField` around inputs — it connects validation errors via the `name` prop
- The `name` prop on `UFormField` must match the schema field name exactly
- Use `reactive<Partial<Schema>>({})` for state — `Partial` allows empty initial values
- `@submit` only fires when validation passes
- For nested objects, use dot notation: `name="address.city"`

## UFormField props

| Prop | Purpose |
|---|---|
| `name` | Links to schema field for validation errors |
| `label` | Visible label text |
| `description` | Help text below the input |
| `hint` | Right-aligned hint text (e.g., "Optional") |
| `required` | Shows required indicator |
| `size` | Inherits to child input |

## Field layout patterns

### Vertical stack (default)

```vue
<UForm :schema="schema" :state="state" class="space-y-4">
  <UFormField name="name" label="Name">
    <UInput v-model="state.name" />
  </UFormField>
  <UFormField name="email" label="Email">
    <UInput v-model="state.email" />
  </UFormField>
</UForm>
```

### Inline fields with UFieldGroup

```vue
<UFieldGroup>
  <UFormField name="firstName" label="First name">
    <UInput v-model="state.firstName" />
  </UFormField>
  <UFormField name="lastName" label="Last name">
    <UInput v-model="state.lastName" />
  </UFormField>
</UFieldGroup>
```

### Grid layout

```vue
<UForm :schema="schema" :state="state" class="grid grid-cols-2 gap-4">
  <UFormField name="firstName" label="First name">
    <UInput v-model="state.firstName" />
  </UFormField>
  <UFormField name="lastName" label="Last name">
    <UInput v-model="state.lastName" />
  </UFormField>
  <UFormField name="email" label="Email" class="col-span-2">
    <UInput v-model="state.email" type="email" />
  </UFormField>
</UForm>
```

## Common field patterns

See component-selection for which input to use per use case.

## Programmatic validation

```vue
<script setup lang="ts">
const form = useTemplateRef('form')

async function validateAndSubmit() {
  const result = await form.value?.validate()
  if (result) { /* valid — submit */ }
}

function setServerError() {
  form.value?.setErrors([{ name: 'email', message: 'Email already taken' }])
}
</script>

<template>
  <UForm ref="form" :schema="schema" :state="state" @submit="onSubmit">
    <!-- fields -->
  </UForm>
</template>
```

## Form in a modal

```vue
<UModal v-model:open="isOpen" title="Edit profile">
  <template #body>
    <UForm id="profile-form" :schema="schema" :state="state" class="space-y-4" @submit="onSave">
      <UFormField name="name" label="Name">
        <UInput v-model="state.name" />
      </UFormField>
    </UForm>
  </template>
  <template #footer="{ close }">
    <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
    <UButton type="submit" form="profile-form" label="Save" />
  </template>
</UModal>
```
