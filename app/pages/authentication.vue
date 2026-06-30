<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard()
const {
  config, events, saving, hasChanges,
  saveConfig, markChanged, loadConfig
} = useAuthConfig()

async function handleSave() {
  const ok = await saveConfig()
  if (ok) {
    // toast / feedback
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Paid': return 'success' as const
    case 'Refunded': return 'neutral' as const
    case 'Failed': return 'error' as const
    case 'completed': return 'success' as const
    case 'warning': return 'warning' as const
    case 'failed': return 'error' as const
    default: return 'neutral' as const
  }
}

const sessionOptions = [
  'Allow multiple sessions',
  'Single session only'
]

function getConcurrentLabel(val: boolean) {
  return val ? 'Allow multiple sessions' : 'Single session only'
}
</script>

<template>
  <UDashboardPanel id="authentication">
    <template #header>
      <UDashboardNavbar title="Authentication">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="outline"
              :disabled="!hasChanges"
              @click="loadConfig"
            >
              Discard Changes
            </UButton>
            <UButton
              color="primary"
              :loading="saving"
              :disabled="!hasChanges"
              @click="handleSave"
            >
              Save Configuration
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
          <h1 class="text-3xl font-bold text-(--ui-text-highlighted)">
            Authentication Configuration
          </h1>
          <p class="mt-1 text-sm text-(--ui-text-muted)">
            Manage platform login methods, session lifecycles, and security constraints.
          </p>
        </div>

        <!-- 3 Side-by-Side Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Card 1: Providers -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UButton icon="i-lucide-log-in" color="neutral" variant="ghost"/>
                <span class="text-lg font-semibold">Providers</span>
              </div>
            </template>
            <div class="space-y-1">
              <UFormField
                label="Password Authentication"
                description="Standard email and password login flow."
                orientation="horizontal"
                class="flex items-center justify-between gap-4 py-2"
              >
                <USwitch
                  v-model="config.providers.password"
                  @update:model-value="markChanged"
                />
              </UFormField>
              <USeparator />
              <UFormField
                label="Social Providers (OAuth2)"
                description="Allow login via Google, GitHub, or Microsoft."
                orientation="horizontal"
                class="flex items-center justify-between gap-4 py-2"
              >
                <USwitch
                  v-model="config.providers.oauth2"
                  @update:model-value="markChanged"
                />
              </UFormField>
              <USeparator />
              <UFormField
                label="Enterprise SSO (SAML)"
                description="Delegated authentication for corporate identity providers."
                orientation="horizontal"
                class="flex items-center justify-between gap-4 py-2"
              >
                <USwitch
                  v-model="config.providers.saml"
                  @update:model-value="markChanged"
                />
              </UFormField>
            </div>
          </UCard>

          <!-- Card 2: Session Lifecycle -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UButton icon="i-lucide-clock" color="neutral" variant="ghost"/>
                <span class="text-sm font-semibold">Session Lifecycle</span>
              </div>
            </template>
            <div class="space-y-5">
              <UFormField
                label="Absolute Session Timeout (Minutes)"
                help="Maximum duration before forcing re-authentication."
              >
                <div class="flex items-center gap-2">
                  <UInput
                    v-model.number="config.session.absoluteTimeout"
                    type="number"
                    min="1"
                    class="flex-1"
                    @update:model-value="markChanged"
                  />
                  <span class="text-sm text-(--ui-text-muted) shrink-0 w-8">mins</span>
                </div>
              </UFormField>
              <UFormField
                label="Idle Timeout (Minutes)"
                help="Log out user after inactivity period."
              >
                <div class="flex items-center gap-2">
                  <UInput
                    v-model.number="config.session.idleTimeout"
                    type="number"
                    min="1"
                    class="flex-1"
                    @update:model-value="markChanged"
                  />
                  <span class="text-sm text-(--ui-text-muted) shrink-0 w-8">mins</span>
                </div>
              </UFormField>
              <UFormField label="Refresh Token TTL (Days)">
                <div class="flex items-center gap-2">
                  <UInput
                    v-model.number="config.session.refreshTokenTTL"
                    type="number"
                    min="1"
                    class="flex-1"
                    @update:model-value="markChanged"
                  />
                  <span class="text-sm text-(--ui-text-muted) shrink-0 w-8">mins</span>
                </div>
              </UFormField>
            </div>
          </UCard>

          <!-- Card 3: Advanced Security -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UButton icon="i-lucide-shield" color="neutral" variant="ghost"/>
                <span class="text-sm font-semibold">Advanced Security</span>
              </div>
            </template>
            <div class="space-y-6">
              <div>
                <p class="text-sm font-medium mb-1">
                  Concurrent Sessions
                </p>
                <USelect
                  :model-value="getConcurrentLabel(config.security.concurrentSessions)"
                  :items="sessionOptions.map(v => ({ label: v, value: v }))"
                  class="w-full"
                  @update:model-value="(v: string) => { config.security.concurrentSessions = v === 'Allow multiple sessions'; markChanged() }"
                />
                <p class="text-xs text-(--ui-text-muted) mt-1">
                  Determines if a user can be logged in from multiple browsers simultaneously.
                </p>
              </div>
              <USeparator />
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <p class="text-sm font-medium">
                    Multi-Factor Auth
                  </p>
                  <UBadge color="info" variant="subtle" size="xs">
                    Future
                  </UBadge>
                </div>
                <p class="text-xs text-(--ui-text-muted) mb-3">
                  Require users to provide two or more verification factors to gain access to resources.
                </p>
                <UButton
                  color="primary"
                  variant="outline"
                  size="sm"
                  disabled
                >
                  <UIcon name="i-lucide-lock" class="size-4" />
                  Enable MFA Globally
                </UButton>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Data Table: Activity Log -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between w-full">
              <UInput
                placeholder="Filters..."
                size="sm"
                class="w-44"
              />
              <UDropdownMenu :items="[[{ label: 'Columns', icon: 'i-lucide-columns-3' }]]">
                <UButton
                  color="neutral"
                  variant="outline"
                  size="sm"
                  trailing-icon="i-lucide-chevron-down"
                >
                  Columns
                </UButton>
              </UDropdownMenu>
            </div>
          </template>

          <UTable
            :rows="events"
            :columns="[
              { accessorKey: 'timestamp', header: 'Timestamp' },
              { accessorKey: 'eventType', header: 'Event Type' },
              { accessorKey: 'actor', header: 'Engine' },
              { accessorKey: 'status', header: 'Status' }
            ]"
          >
            <template #timestamp-data="{ row }">
              <div class="flex items-center gap-3">
                <UCheckbox />
                <span class="text-sm text-(--ui-text-highlighted)">{{ row.original.timestamp }}</span>
              </div>
            </template>
            <template #eventType-data="{ row }">
              <span class="text-sm">{{ row.original.eventType }}</span>
            </template>
            <template #actor-data="{ row }">
              <span class="text-sm text-(--ui-text-muted)">{{ row.original.actor }}</span>
            </template>
            <template #status-data="{ row }">
              <UBadge
                :color="getStatusColor(row.original.status)"
                variant="subtle"
                size="sm"
              >
                {{ row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1) }}
              </UBadge>
            </template>
          </UTable>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
