# Conventions

Coding patterns specific to Nuxt UI.

## Auto-registered modules

Nuxt UI automatically registers `@nuxt/icon`, `@nuxt/fonts`, and `@nuxtjs/color-mode`. Do **not** add them to your `modules` array.

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  icon: { /* @nuxt/icon options */ },
  fonts: { /* @nuxt/fonts options */ },
  colorMode: { /* @nuxtjs/color-mode options */ }
})
```

## Content module integration

`@nuxt/content` must come **after** `@nuxt/ui`:

```ts
modules: ['@nuxt/ui', '@nuxt/content']
```

Add `@source` for content paths:

```css
@source "../../../content/**/*";
```

## UApp wrapper

Always wrap your app in `UApp` — provides toast container, tooltip provider, programmatic overlay context, and i18n locale support.

```vue
<UApp :locale="fr">
  <NuxtPage />
</UApp>
```

## Icons

Format: `i-{collection}-{name}`. Prefer `lucide` collection.

```vue
<UIcon name="i-lucide-sun" class="size-5" />
<UButton icon="i-lucide-plus" label="Add" />
```

Install collections locally for reliable SSR:

```bash
pnpm i @iconify-json/lucide
pnpm i @iconify-json/simple-icons
```

### Default icon overrides

```ts
// app.config.ts
export default defineAppConfig({
  ui: {
    icons: {
      loading: 'i-lucide-refresh-cw',
      close: 'i-lucide-x',
      check: 'i-lucide-check',
      chevronDown: 'i-lucide-chevron-down'
    }
  }
})
```

## Slot patterns

| Slot | Used by | Purpose |
|---|---|---|
| `#header` | Card, Modal, Slideover, DashboardPanel | Top section |
| `#body` | DashboardPanel | Scrollable content area |
| `#footer` | Card, Modal, Slideover, DashboardPanel | Bottom section |
| `#left` | Page, DashboardNavbar | Left sidebar or content |
| `#right` | Page, DashboardNavbar, Header | Right sidebar or content |
| `#leading` | Input, Button, Alert | Before main content (icon area) |
| `#trailing` | Input, Button | After main content (icon area) |
| `#content` | Modal, Slideover, Popover, Tooltip | Full content override |
| `#default` | Most components | Main content area |

## Items arrays

**Flat array** — plain list:

```ts
const items = [
  { label: 'Edit', icon: 'i-lucide-pencil' },
  { label: 'Delete', icon: 'i-lucide-trash', color: 'error' }
]
```

**Nested array** — groups with automatic separators between them:

```ts
const items = [
  [{ label: 'Edit', icon: 'i-lucide-pencil' }],
  [{ label: 'Delete', icon: 'i-lucide-trash', color: 'error' }]
]
```

Components supporting nested arrays: `UDropdownMenu`, `UContextMenu`, `UCommandPalette`, `UNavigationMenu`.

## Composables

### useToast

```ts
const toast = useToast()

toast.add({
  title: 'Success',
  description: 'Item saved',
  color: 'success',
  icon: 'i-lucide-check-circle',
  actions: [{ label: 'Undo', onClick: () => {} }]
})
```

### useOverlay

```ts
const overlay = useOverlay()
const modal = overlay.create(MyComponent)
const instance = modal.open({ title: 'Confirm?' })
if (await instance.result) { /* confirmed */ }
```

### defineShortcuts

```ts
defineShortcuts({
  meta_k: () => openSearch(),
  escape: () => close()
})
```

### extractShortcuts

```ts
defineShortcuts(extractShortcuts(items))
```

### Internationalization (i18n)

```vue
<script setup lang="ts">
import { fr } from '@nuxt/ui/locale'
</script>

<template>
  <UApp :locale="fr">
    <NuxtPage />
  </UApp>
</template>
```

## Color mode

Nuxt UI registers `@nuxtjs/color-mode` automatically. Built-in components: `UColorModeButton`, `UColorModeSwitch`, `UColorModeSelect`, `UColorModeAvatar`, `UColorModeImage`.

For custom UI:

```vue
<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v) => { colorMode.preference = v ? 'dark' : 'light' }
})
</script>

<template>
  <ClientOnly>
    <USwitch v-model="isDark" />
  </ClientOnly>
</template>
```

## Official templates

```bash
npx nuxi@latest init -t ui              # Starter
npx nuxi@latest init -t ui/dashboard    # Dashboard
npx nuxi@latest init -t ui/docs         # Docs
npx nuxi@latest init -t ui/landing      # Landing page
npx nuxi@latest init -t ui/saas         # SaaS
npx nuxi@latest init -t ui/chat         # AI chat
npx nuxi@latest init -t ui/editor       # Rich text editor
npx nuxi@latest init -t ui/portfolio    # Portfolio
npx nuxi@latest init -t ui/changelog    # Changelog
```
