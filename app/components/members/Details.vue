<script setup lang="ts">
import type { Member } from '~/types'
import type { Role } from '~/composables/useMembers'

const props = defineProps<{
  member: Member
  roles: Role[]
}>()

const emit = defineEmits<{
  close: []
  updateRoles: [memberId: number, roleIds: number[]]
  toggleStatus: [memberId: number, isActive: boolean]
}>()

const saving = ref(false)

const selectedRoleIds = ref<number[]>(props.member.roles.map(r => r.id))

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

function toggleRole(roleId: number) {
  const idx = selectedRoleIds.value.indexOf(roleId)
  if (idx === -1) {
    selectedRoleIds.value.push(roleId)
  } else {
    selectedRoleIds.value.splice(idx, 1)
  }
}

const hasRoleChanges = computed(() => {
  const original = props.member.roles.map(r => r.id).sort()
  const current = [...selectedRoleIds.value].sort()
  if (original.length !== current.length) return true
  return original.some((id, i) => id !== current[i])
})

async function saveRoles() {
  saving.value = true
  try {
    emit('updateRoles', props.member.id, selectedRoleIds.value)
    await nextTick()
  } finally {
    saving.value = false
  }
}

function getRelativeDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days} days ago`
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <USlideover :open="true" @update:open="(v) => { if (!v) emit('close') }">
    <template #content>
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-(--ui-border) flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              square
              icon="i-lucide-x"
              @click="emit('close')"
            />
            <span class="text-sm font-semibold">Member Details</span>
          </div>
          <UBadge
            variant="subtle"
            :color="member.isActive ? 'success' : 'neutral'"
            size="xs"
          >
            {{ member.isActive ? 'Active' : 'Inactive' }}
          </UBadge>
        </div>

        <!-- Scrollable body -->
        <div class="flex-1 overflow-y-auto">
          <!-- Profile section -->
          <div class="p-6 text-center border-b border-(--ui-border)">
            <UAvatar
              :src="member.avatarUrl || undefined"
              size="2xl"
              :text="getInitials(member.name)"
              class="mx-auto mb-3"
            />
            <h3 class="text-lg font-semibold">
              {{ member.name }}
            </h3>
            <p class="text-sm text-(--ui-text-muted)">
              {{ member.email }}
            </p>
            <div class="flex items-center justify-center gap-2 mt-2">
              <UBadge
                v-for="role in member.roles"
                :key="role.id"
                :color="getRoleColor(role.slug)"
                size="sm"
                variant="subtle"
              >
                {{ role.name }}
              </UBadge>
            </div>
          </div>

          <!-- Info section -->
          <div class="p-4 space-y-3 border-b border-(--ui-border)">
            <h4 class="text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider">
              Details
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-(--ui-text-muted)">
                  Username
                </p>
                <p class="text-sm font-medium">
                  {{ member.username || '—' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-(--ui-text-muted)">
                  Joined
                </p>
                <p class="text-sm font-medium">
                  {{ getRelativeDate(member.createdAt) }}
                </p>
              </div>
            </div>
            <div>
              <p class="text-xs text-(--ui-text-muted)">
                Avatar URL
              </p>
              <p class="text-sm font-mono truncate">
                {{ member.avatarUrl || '—' }}
              </p>
            </div>
          </div>

          <!-- Roles management section -->
          <div class="p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-semibold text-(--ui-text-muted) uppercase tracking-wider">
                Roles
              </h4>
              <UButton
                v-if="hasRoleChanges"
                size="xs"
                color="primary"
                :loading="saving"
                @click="saveRoles"
              >
                Save Changes
              </UButton>
            </div>
            <p class="text-xs text-(--ui-text-muted) mb-2">
              Select the roles assigned to this member.
            </p>
            <div class="space-y-2">
              <UCheckbox
                v-for="role in roles"
                :key="role.id"
                :model-value="selectedRoleIds.includes(role.id)"
                variant="card"
                indicator="start"
                :color="getRoleColor(role.slug)"
                @click="toggleRole(role.id)"
              >
                <template #label>
                  <div class="flex items-center justify-between w-full">
                    <span class="text-sm font-medium">{{ role.name }}</span>
                    <UBadge
                      :color="getRoleColor(role.slug)"
                      size="xs"
                      variant="solid"
                    >
                      {{ role.slug }}
                    </UBadge>
                  </div>
                </template>
                <template #description>
                  <p v-if="role.description" class="text-xs text-(--ui-text-muted) truncate">
                    {{ role.description }}
                  </p>
                </template>
              </UCheckbox>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-(--ui-border) shrink-0 flex items-center justify-between">
          <UButton
            color="error"
            variant="ghost"
            size="sm"
            :disabled="member.roles.some(r => r.slug === 'admin')"
            @click="emit('toggleStatus', member.id, !member.isActive)"
          >
            {{ member.isActive ? 'Deactivate' : 'Activate' }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            @click="emit('close')"
          >
            Close
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>
