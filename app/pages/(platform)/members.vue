<script setup lang="ts">
import type { Member } from '~/types'
import type { DropdownMenuItem } from '@nuxt/ui'

const { isNotificationsSlideoverOpen } = useDashboard()
const {
  members, roles, selectedMember,
  showInviteModal, showSlideover,
  selectMember,
  inviteMember, updateMemberRoles, toggleMemberStatus
} = useMembers()

// Watch for slideover close to clear selected member
watch(showSlideover, (open) => {
  if (!open) {
    selectedMember.value = null
  }
})

const q = ref('')

const filteredMembers = computed(() => {
  if (!q.value) return members.value
  const needle = q.value.toLowerCase()
  return members.value.filter(m =>
    m.name.toLowerCase().includes(needle)
    || m.email.toLowerCase().includes(needle)
  )
})

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getRoleColor(slug: string) {
  switch (slug) {
    case 'admin': return 'warning' as const
    case 'member': return 'primary' as const
    default: return 'neutral' as const
  }
}

function getDropdownActions(member: Member): DropdownMenuItem[] {
  return [
    {
      label: 'Edit member',
      icon: 'i-lucide-pencil',
      onSelect: () => selectMember(member)
    },
    {
      label: member.isActive ? 'Deactivate' : 'Activate',
      icon: member.isActive ? 'i-lucide-pause-circle' : 'i-lucide-play-circle',
      onSelect: () => toggleMemberStatus(member.id, !member.isActive)
    }
  ]
}

async function handleInvite(email: string, roleSlug?: string) {
  await inviteMember(email, roleSlug)
  showInviteModal.value = false
}

function handleUpdateRoles(memberId: number, roleIds: number[]) {
  updateMemberRoles(memberId, roleIds)
}

function handleToggleStatus(memberId: number, isActive: boolean) {
  toggleMemberStatus(memberId, isActive)
}
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
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="() => { isNotificationsSlideoverOpen = true }"
            >
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
            @click="() => { showInviteModal = true }"
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

          <ul v-if="filteredMembers.length > 0" role="list" class="divide-y divide-default">
            <li
              v-for="member in filteredMembers"
              :key="member.id"
              class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6 cursor-pointer hover:bg-(--ui-bg-elevated) transition-colors"
              @click="selectMember(member)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <UAvatar
                  :src="member.avatarUrl || undefined"
                  :text="getInitials(member.name)"
                  size="md"
                />

                <div class="text-sm min-w-0">
                  <p class="text-highlighted font-medium truncate flex items-center gap-2">
                    {{ member.name }}
                    <UBadge
                      v-if="!member.isActive"
                      variant="subtle"
                      color="neutral"
                      size="xs"
                    >
                      Inactive
                    </UBadge>
                  </p>
                  <p class="text-muted truncate">
                    {{ member.email }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0" @click.stop>
                <div class="flex items-center gap-1">
                  <UBadge
                    v-for="role in member.roles"
                    :key="role.id"
                    :color="getRoleColor(role.slug)"
                    size="xs"
                    variant="subtle"
                  >
                    {{ role.name }}
                  </UBadge>
                </div>

                <UDropdownMenu :items="[getDropdownActions(member)]" :content="{ align: 'end' }">
                  <UButton
                    icon="i-lucide-ellipsis-vertical"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    square
                  />
                </UDropdownMenu>
              </div>
            </li>
          </ul>

          <div v-else class="py-10 text-center">
            <UIcon name="i-lucide-users" class="size-10 mx-auto mb-3 text-(--ui-text-muted)" />
            <p class="text-sm text-(--ui-text-muted)">
              {{ q ? 'No members match your search.' : 'No members yet. Invite someone to get started.' }}
            </p>
          </div>
        </UPageCard>
      </UContainer>

      <!-- Invite Modal -->
      <MembersInvite
        v-if="showInviteModal"
        v-model:open="showInviteModal"
        :roles="roles"
        @invite="handleInvite"
      />

      <!-- Member Details -->
      <MembersDetails
        v-if="showSlideover && selectedMember"
        v-model:open="showSlideover"
        :member="selectedMember"
        :roles="roles"
        @update-roles="handleUpdateRoles"
        @toggle-status="handleToggleStatus"
      />
    </template>
  </UDashboardPanel>
</template>
