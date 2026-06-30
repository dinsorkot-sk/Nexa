<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [[{
  label: 'New entity',
  icon: 'i-lucide-database-plus',
  to: '/metadata'
}, {
  label: 'New module',
  icon: 'i-lucide-puzzle-plus',
  to: '/module'
}, {
  label: 'New report',
  icon: 'i-lucide-chart-bar',
  to: '/report'
}]] satisfies DropdownMenuItem[][]
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>
          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <PlatformOverview />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlatformEntities />
        <PlatformActivity />
      </div>
    </template>
  </UDashboardPanel>
</template>
