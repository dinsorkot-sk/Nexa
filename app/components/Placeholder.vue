<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<template>
  <div class="flex items-center justify-center rounded-lg border-2 border-dashed border-default bg-elevated/25">
    <p v-if="label" class="text-sm text-muted">
      {{ label }}
    </p>
  </div>
</template>
