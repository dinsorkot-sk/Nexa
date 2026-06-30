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
  super_admin: 'i-lucide-shield',
  organization_admin: 'i-lucide-building',
  org_admin: 'i-lucide-building',
  manager: 'i-lucide-user',
  member: 'i-lucide-user',
  employee: 'i-lucide-id-card',
  guest: 'i-lucide-user'
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
      <div class="p-6 flex flex-col gap-6 h-full">
        <!-- Page Header -->
        <div>
          <div class="flex items-center gap-1.5 text-sm text-(--ui-text-muted) mb-1">
            <UIcon name="i-lucide-lock" class="size-3.5" />
            <span>Authorization</span>
          </div>
          <h1 class="text-3xl font-bold text-(--ui-text-highlighted)">
            Role-Based Access Control
          </h1>
          <p class="mt-1 text-sm text-(--ui-text-muted)">
            Manage organizational roles and map granular permissions to resources.
          </p>
        </div>

        <div class="grid grid-cols-[280px_1fr] gap-6">
          <!-- Left: System Roles -->
          <div class="bg-(--ui-bg) rounded-xl border border-(--ui-border) overflow-hidden h-fit">
            <div class="flex items-center justify-between px-4 py-3 border-b border-(--ui-border)">
              <span class="text-sm font-semibold">System Roles</span>
              <UButton
                color="primary"
                variant="ghost"
                size="xs"
                square
                icon="i-lucide-plus"
                @click="showCreateDialog = true"
              />
            </div>
            <div class="py-1">
              <div
                v-for="role in roles"
                :key="role.id"
                class="flex items-center justify-between px-3 py-2.5 mx-1.5 rounded-lg cursor-pointer transition-colors"
                :class="selectedRoleId === role.id
                  ? 'bg-green-500 text-white'
                  : 'hover:bg-(--ui-bg-elevated)'"
                @click="selectRole(role.id)"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="size-8 rounded-lg flex items-center justify-center shrink-0"
                    :class="selectedRoleId === role.id ? 'bg-white/20' : 'bg-(--ui-bg-elevated)'"
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
                    <p v-if="role.isSystem" class="text-xs" :class="selectedRoleId === role.id ? 'text-white/70' : 'text-(--ui-text-muted)'">
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
                  :class="selectedRoleId === role.id ? 'text-white hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'"
                  @click.stop="handleDeleteRole(role)"
                />
              </div>
            </div>
          </div>

          <!-- Right: Permissions Matrix -->
          <div class="bg-(--ui-bg) rounded-xl border border-(--ui-border) overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-(--ui-border)">
              <UInput
                placeholder="Filters..."
                size="sm"
                class="w-44"
              />
            </div>

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
                      class="px-3 py-3"
                    >
                      <div class="flex justify-center">
                        <UCheckbox
                          :checked="perm[action]"
                          @click="togglePermission(perm.resource, action)"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Create Role Dialog -->
  <UModal v-model:open="showCreateDialog" title="Create Role">
    <template #body>
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
    </template>
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
  </UModal>
</template>
