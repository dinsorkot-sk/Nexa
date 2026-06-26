<script setup lang="ts">
import type { Member } from '~/types'

const { isNotificationsSlideoverOpen } = useDashboard()

const { data: members } = await useFetch<Member[]>('/api/members', { default: () => [] })

const q = ref('')

const filteredMembers = computed(() => {
  return members.value.filter((member) => {
    return member.name.search(new RegExp(q.value, 'i')) !== -1 || member.username.search(new RegExp(q.value, 'i')) !== -1
  })
})
</script>

<template>
  <UDashboardPanel id="members">
    <template #header>
      <UDashboardNavbar title="Members">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton color="neutral" variant="ghost" square
              @click="isNotificationsSlideoverOpen = true">
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <UContainer class="py-8">
        <UPageCard
          title="Members"
          description="Invite new members by email address."
          variant="naked"
          orientation="horizontal"
          class="mb-4"
        >
          <UButton
            label="Invite people"
            color="neutral"
            class="w-fit lg:ms-auto"
          />
        </UPageCard>

        <UPageCard variant="subtle" :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
          <template #header>
            <UInput
              v-model="q"
              icon="i-lucide-search"
              placeholder="Search members"
              autofocus
              class="w-full"
            />
          </template>

          <SettingsMembersList :members="filteredMembers" />
        </UPageCard>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
