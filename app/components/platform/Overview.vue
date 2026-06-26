<script setup lang="ts">
const { data: stats } = await useAsyncData('platform-overview', () => Promise.resolve([{
  title: 'Modules',
  icon: 'i-lucide-puzzle',
  value: '12',
  variation: 2
}, {
  title: 'Entities',
  icon: 'i-lucide-database',
  value: '48',
  variation: 5
}, {
  title: 'Fields',
  icon: 'i-lucide-table-properties',
  value: '312',
  variation: 12
}, {
  title: 'Relations',
  icon: 'i-lucide-git-branch',
  value: '36',
  variation: -1
}]), { default: () => [] })
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>
        <UBadge
          :color="stat.variation > 0 ? 'success' : 'error'"
          variant="subtle"
          class="text-xs"
        >
          {{ stat.variation > 0 ? '+' : '' }}{{ stat.variation }}
        </UBadge>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
