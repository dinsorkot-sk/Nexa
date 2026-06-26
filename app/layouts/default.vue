<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)

const links = [[{
  label: 'Dashboard',
  icon: 'i-lucide-layout-dashboard',
  to: '/',
  onSelect: () => { open.value = false }
}, {
  label: 'Authentication',
  icon: 'i-lucide-shield',
  to: '/authentication',
  onSelect: () => { open.value = false }
}, {
  label: 'Authorization',
  icon: 'i-lucide-key-round',
  to: '/authorization',
  onSelect: () => { open.value = false }
}, {
  label: 'Members',
  icon: 'i-lucide-users',
  to: '/members',
  onSelect: () => { open.value = false }
}, {
  label: 'Metadata',
  icon: 'i-lucide-database',
  to: '/metadata',
  onSelect: () => { open.value = false }
}, {
  label: 'Module',
  icon: 'i-lucide-puzzle',
  to: '/module',
  onSelect: () => { open.value = false }
}, {
  label: 'Report',
  icon: 'i-lucide-bar-chart-3',
  to: '/report',
  onSelect: () => { open.value = false }
}, {
  label: 'Document',
  icon: 'i-lucide-file-text',
  to: '/document',
  onSelect: () => { open.value = false }
}], [{
  label: 'Settings',
  to: '/settings',
  icon: 'i-lucide-settings',
  defaultOpen: true,
  type: 'trigger',
  children: [{
    label: 'General',
    to: '/settings',
    exact: true,
    onSelect: () => { open.value = false }
  }, {
    label: 'Notifications',
    to: '/settings/notifications',
    onSelect: () => { open.value = false }
  }, {
    label: 'Security',
    to: '/settings/security',
    onSelect: () => { open.value = false }
  }]
}]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}])


</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
