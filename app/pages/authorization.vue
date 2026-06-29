<script setup lang="ts">
import type { Role } from '~/composables/useMembers'

const { isNotificationsSlideoverOpen } = useDashboard()
const {
  roles, permissions, selectedRoleId, hasChanges,
  selectRole, createRole, deleteRole,
  togglePermission, savePermissions
} = useAuthorization()

const showCreateDialog = ref(false)
const newRoleName = ref('')
const newRoleSlug = ref('')
const newRoleDesc = ref('')

const roleIcons: Record<string, string> = {
  admin: 'i-lucide-shield',
  super_admin: 'i-lucide-shield-check',
  manager: 'i-lucide-user-cog',
  member: 'i-lucide-user',
  employee: 'i-lucide-id-card',
  guest: 'i-lucide-user-round'
}

function getRoleIcon(slug: string) {
  return roleIcons[slug] || 'i-lucide-user-circle'
}

async function handleCreateRole() {
  if (!newRoleName.value || !newRoleSlug.value) return
  try {
    await createRole(newRoleName.value, newRoleSlug.value, newRoleDesc.value || undefined)
    newRoleName.value = ''
    newRoleSlug.value = ''
    newRoleDesc.value = ''
    showCreateDialog.value = false
  } catch {
    // error handled by toast
  }
}

async function handleDeleteRole(role: Role) {
  if (role.isSystem) return
  try {
    await deleteRole(role.id)
  } catch {
    // system roles can't be deleted
  }
}

function canDelete(role: Role) {
  return !role.isSystem
}
</script>

<template>
  <UDashboardPanel id="authorization">
    <template #header>
      <UDashboardNavbar title="Authorization">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <UButton
              color="primary"
              :loading="false"
              :disabled="!hasChanges"
              @click="savePermissions"
            >
              <UIcon name="i-lucide-save" class="size-4" />
              Save Policy Changes
            </UButton>
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
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UContainer class="py-8">
        <div class="max-w-6xl">
          <!-- Page header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-(--ui-text-highlighted)">
              Role-Based Access Control
            </h1>
            <p class="mt-1 text-sm text-(--ui-text-muted)">
              Manage organizational roles and map granular permissions to resources.
            </p>
          </div>

          <div class="grid grid-cols-[280px_1fr] gap-6">
            <!-- Left: System Roles -->
            <UPageCard title="System Roles" variant="subtle" class="h-fit">
              <template #header>
                <div class="flex items-center justify-between w-full">
                  <span>System Roles</span>
                  <UButton
                    color="primary"
                    variant="ghost"
                    size="xs"
                    square
                    icon="i-lucide-plus"
                    @click="showCreateDialog = true"
                  />
                </div>
              </template>
              <div class="space-y-1">
                <div
                  v-for="role in roles"
                  :key="role.id"
                  class="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                  :class="selectedRoleId === role.id
                    ? 'bg-[var(--ui-primary)]/10 text-[var(--ui-primary)] ring-1 ring-[var(--ui-primary)]/20'
                    : 'hover:bg-(--ui-bg-elevated)'"
                  @click="selectRole(role.id)"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      class="size-8 rounded-lg flex items-center justify-center shrink-0"
                      :class="selectedRoleId === role.id ? 'bg-[var(--ui-primary)]/15' : 'bg-(--ui-bg-elevated)'"
                    >
                      <UIcon
                        :name="getRoleIcon(role.slug)"
                        class="size-4"
                      />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium truncate">
                        {{ role.name }}
                      </p>
                      <p v-if="role.isSystem" class="text-xs text-(--ui-text-muted)">
                        System
                      </p>
                    </div>
                  </div>
                  <UButton
                    v-if="canDelete(role)"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    square
                    icon="i-lucide-trash-2"
                    class="opacity-0 group-hover:opacity-100"
                    @click.stop="handleDeleteRole(role)"
                  />
                </div>
              </div>
            </UPageCard>

            <!-- Right: Permissions Matrix -->
            <UPageCard title="Permissions" variant="subtle">
              <template #header>
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center gap-2">
                    <UInput
                      placeholder="Filters..."
                      size="sm"
                      class="w-40"
                    />
                  </div>
                  <UDropdownMenu :items="[[{ label: 'Columns', icon: 'i-lucide-columns-3' }]]">
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      label="Columns"
                      trailing-icon="i-lucide-chevron-down"
                    />
                  </UDropdownMenu>
                </div>
              </template>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-(--ui-border)">
                  <thead>
                    <tr class="bg-(--ui-bg-elevated)">
                      <th class="px-4 py-3 text-left text-xs font-medium text-(--ui-text-muted) uppercase tracking-wider w-48">
                        Resource
                      </th>
                      <th
                        v-for="action in ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Export']"
                        :key="action"
                        class="px-3 py-3 text-center text-xs font-medium text-(--ui-text-muted) uppercase tracking-wider w-20"
                      >
                        {{ action }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-(--ui-border)">
                    <tr
                      v-for="perm in permissions"
                      :key="perm.resource"
                      class="hover:bg-(--ui-bg-elevated)/50 transition-colors"
                    >
                      <td class="px-4 py-3 whitespace-nowrap">
                        <div class="flex items-center gap-3">
                          <div class="size-8 rounded-lg bg-(--ui-bg-elevated) flex items-center justify-center">
                            <UIcon :name="perm.icon" class="size-4 text-(--ui-text-muted)" />
                          </div>
                          <span class="text-sm font-medium">{{ perm.resource }}</span>
                        </div>
                      </td>
                      <td
                        v-for="action in ['create', 'read', 'update', 'delete', 'approve', 'export'] as const"
                        :key="action"
                        class="px-3 py-3 text-center"
                      >
                        <UCheckbox
                          :checked="perm[action]"
                          @click="togglePermission(perm.resource, action)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </UPageCard>
          </div>
        </div>
      </UContainer>
    </template>

    <!-- Create Role Dialog -->
    <UModal v-model:open="showCreateDialog">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">
              Create Role
            </h3>
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              square
              icon="i-lucide-x"
              @click="showCreateDialog = false"
            />
          </div>
        </template>
        <div class="space-y-4">
          <UFormField label="Role Name" required>
            <UInput
              v-model="newRoleName"
              placeholder="e.g. Editor"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Slug" required>
            <UInput
              v-model="newRoleSlug"
              placeholder="e.g. editor"
              class="w-full"
            />
            <template #description>
              Lowercase alphanumeric with dashes.
            </template>
          </UFormField>
          <UFormField label="Description">
            <UTextarea
              v-model="newRoleDesc"
              placeholder="Describe this role's purpose..."
              class="w-full"
            />
          </UFormField>
        </div>
        <template #footer>
          <div class="flex items-center justify-end gap-3">
            <UButton color="neutral" variant="ghost" @click="showCreateDialog = false">
              Cancel
            </UButton>
            <UButton color="primary" :disabled="!newRoleName || !newRoleSlug" @click="handleCreateRole">
              Create Role
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </UDashboardPanel>
</template>
