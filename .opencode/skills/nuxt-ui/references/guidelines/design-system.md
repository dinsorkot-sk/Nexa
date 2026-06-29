# Design System

## Semantic colors

Nuxt UI uses 7 semantic colors. Never use raw Tailwind palette colors in components — always use these semantic names.

| Color | Default | When to use |
|---|---|---|
| `primary` | green | CTAs, active states, brand accent, links |
| `secondary` | blue | Secondary actions, complementary highlights |
| `success` | green | Success messages, confirmations, positive states |
| `info` | blue | Informational alerts, tips, neutral highlights |
| `warning` | yellow | Warnings, caution states, pending actions |
| `error` | red | Errors, destructive actions, validation failures |
| `neutral` | slate | Text, borders, backgrounds, disabled states, chrome |

### Choosing colors for components

- **Primary action** on a page (submit, save, confirm) → `color="primary"`
- **Secondary actions** (cancel, back, alternative) → `color="neutral"` with `variant="outline"` or `"ghost"`
- **Destructive actions** (delete, remove) → `color="error"`
- **Status indicators** → match the semantic meaning: `success`, `warning`, `error`, `info`
- **Navigation and chrome** → `color="neutral"`

### Configuring colors

```ts
// Nuxt — app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'indigo',
      secondary: 'violet',
      success: 'emerald',
      error: 'rose',
      neutral: 'zinc'
    }
  }
})
```

```ts
// Vue — vite.config.ts
ui({
  ui: {
    colors: { primary: 'indigo', secondary: 'violet', neutral: 'zinc' }
  }
})
```

### Adding custom brand colors

1. Define all 11 shades in CSS:

```css
@theme static {
  --color-brand-50: #fef2f2;
  --color-brand-100: #fee2e2;
  --color-brand-200: #fecaca;
  --color-brand-300: #fca5a5;
  --color-brand-400: #f87171;
  --color-brand-500: #ef4444;
  --color-brand-600: #dc2626;
  --color-brand-700: #b91c1c;
  --color-brand-800: #991b1b;
  --color-brand-900: #7f1d1d;
  --color-brand-950: #450a0a;
}
```

2. Assign it: `ui: { colors: { primary: 'brand' } }`

### Extending with new semantic color names

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']
    }
  }
})
```

## Semantic utility classes

### Text
- `text-default` — primary body text
- `text-muted` — secondary text (descriptions, hints)
- `text-toned` — medium-emphasis text
- `text-dimmed` — tertiary text (placeholders, disabled)
- `text-highlighted` — emphasized text (headings, important labels)
- `text-inverted` — text on inverted backgrounds

### Backgrounds
- `bg-default` — page background
- `bg-muted` — subtle backgrounds (hover states, alternating rows)
- `bg-elevated` — raised surfaces (cards, dropdowns)
- `bg-accented` — accent backgrounds (active states, selected items)
- `bg-inverted` — inverse background

### Borders
- `border-default` — standard borders
- `border-muted` — subtle borders (dividers, separators)
- `border-accented` — accent borders (active states)
- `border-inverted` — inverse borders

## Variants

| Variant | Weight | When to use |
|---|---|---|
| `solid` | Highest | Primary actions, main CTAs |
| `outline` | Medium | Secondary actions, form fields |
| `soft` | Medium-low | Tags, badges, subtle buttons |
| `subtle` | Low | Background highlights, less prominent actions |
| `ghost` | Lowest | Inline actions, icon buttons, navigation items |
| `link` | Lowest | Text-only links inside content |

## Customizing components

### `ui` prop — override theme slots per instance

```vue
<UButton :ui="{ base: 'font-bold', trailingIcon: 'size-3 rotate-90' }" />
<UCard :ui="{ header: 'bg-muted', body: 'p-8' }" />
```

### `class` prop — override root slot

```vue
<UButton class="font-bold" />
```

### Global config

```ts
// Nuxt — app.config.ts
export default defineAppConfig({
  ui: {
    button: {
      slots: { base: 'font-bold' },
      defaultVariants: { color: 'neutral', variant: 'outline' }
    }
  }
})
```

### Replace instead of merge

```vue
<UButton :ui="{ label: () => 'text-base font-bold' }" />
```

### Theme component (scoped overrides)

```vue
<UTheme :ui="{ button: { slots: { base: 'rounded-full' } } }">
  <UButton label="Rounded" />
  <UButton label="Also rounded" />
</UTheme>
```

### Tree-shaking with `componentDetection`

```ts
export default defineNuxtConfig({
  ui: {
    experimental: {
      componentDetection: true
    }
  }
})
```

## CSS `@theme` customization

```css
@theme {
  --font-sans: 'Public Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

## CSS variables

```css
:root {
  --ui-radius: 0.25rem;
  --ui-container: 80rem;
  --ui-header-height: 4rem;
}
```

### Color shade overrides

```css
:root {
  --ui-primary: var(--ui-color-primary-700);
}
.dark {
  --ui-primary: var(--ui-color-primary-200);
}
```
