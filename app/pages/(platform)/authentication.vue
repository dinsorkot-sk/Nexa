<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard()
const {
  config, events, saving, hasChanges,
  saveConfig, loadConfig, loadEvents, loading, markChanged
} = useAuthConfig()

// Helper for template — Vue templates don't narrow nullable types from v-if
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function e(row: { original: unknown }): any {
  return row.original
}

const search = ref('')

// Debounced search with manual trigger
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadEvents(val || undefined)
  }, 300)
})

async function handleSave() {
  const ok = await saveConfig()
  if (ok) {
    // toast / feedback
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'success': return 'success' as const
    case 'warning': return 'warning' as const
    case 'failed': return 'error' as const
    default: return 'neutral' as const
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'success': return 'i-lucide-circle-check'
    case 'failed': return 'i-lucide-circle-x'
    case 'warning': return 'i-lucide-circle-alert'
    default: return 'i-lucide-circle'
  }
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'LOGIN': return 'i-lucide-log-in'
    case 'LOGIN_FAILED': return 'i-lucide-log-in'
    case 'LOGOUT': return 'i-lucide-log-out'
    case 'REGISTER': return 'i-lucide-user-plus'
    case 'forgot-password': return 'i-lucide-key-round'
    case 'reset-password': return 'i-lucide-key-round'
    case 'settings.general.updated': return 'i-lucide-sliders-horizontal'
    case 'settings.notifications.updated': return 'i-lucide-bell'
    default: return 'i-lucide-shield'
  }
}

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: false
  })
}

function formatEventLabel(eventType: string) {
  return eventType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

const columns = [
  { accessorKey: 'timestamp', header: 'Time' },
  { accessorKey: 'user', header: 'User' },
  { accessorKey: 'eventType', header: 'Event' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'detail', header: 'Detail' }
]

onMounted(() => loadEvents())

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
                <UButton icon="i-lucide-log-in" color="neutral" variant="ghost" />
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
                <UButton icon="i-lucide-clock" color="neutral" variant="ghost" />
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
                <UButton icon="i-lucide-shield" color="neutral" variant="ghost" />
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

        <!-- Activity Log Table -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between w-full">
              <UInput
                v-model="search"
                placeholder="Search events..."
                size="sm"
                class="w-56"
              >
                <template #leading>
                  <UIcon name="i-lucide-search" class="size-4 shrink-0 text-(--ui-text-muted)" />
                </template>
              </UInput>
              <div class="flex items-center gap-2">
                <span class="text-xs text-(--ui-text-muted)">
                  {{ events.length }} events
                </span>
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-refresh-cw"
                  @click="loadEvents(search || undefined)"
                />
              </div>
            </div>
          </template>

          <UTable
            :loading="loading"
            :rows="events"
            :columns="columns"
            :ui="{ td: 'py-3' }"
          >
            <!-- Time column -->
            <template #timestamp-data="{ row }">
              <div class="flex items-center gap-2">
                <UIcon
                  :name="getEventIcon(e(row).eventType)"
                  class="size-4 shrink-0 text-(--ui-text-muted)"
                />
                <span class="text-sm whitespace-nowrap text-(--ui-text-highlighted)">
                  {{ formatTimestamp(e(row).timestamp) }}
                </span>
              </div>
            </template>

            <!-- User column -->
            <template #user-data="{ row }">
              <div class="flex items-center gap-2.5 min-w-0">
                <UAvatar
                  v-if="e(row).userName"
                  :src="e(row).userAvatarUrl || undefined"
                  :text="e(row).userName.charAt(0).toUpperCase()"
                  size="sm"
                  class="shrink-0"
                />
                <UAvatar
                  v-else
                  icon="i-lucide-shield-question"
                  size="sm"
                  class="shrink-0"
                />
                <div class="flex flex-col min-w-0">
                  <span class="text-sm font-medium truncate text-(--ui-text-highlighted)">
                    {{ e(row).userName || e(row).actor || 'System' }}
                  </span>
                  <span v-if="e(row).userEmail" class="text-xs truncate text-(--ui-text-muted)">
                    {{ e(row).userEmail }}
                  </span>
                </div>
              </div>
            </template>

            <!-- Event type column -->
            <template #eventType-data="{ row }">
              <span class="text-sm font-medium capitalize">
                {{ formatEventLabel(e(row).eventType) }}
              </span>
            </template>

            <!-- Status column -->
            <template #status-data="{ row }">
              <UBadge
                :color="getStatusColor(e(row).status)"
                variant="subtle"
                size="sm"
              >
                <template #leading>
                  <UIcon :name="getStatusIcon(e(row).status)" class="size-3.5" />
                </template>
                {{ e(row).status.charAt(0).toUpperCase() + e(row).status.slice(1) }}
              </UBadge>
            </template>

            <!-- Detail column -->
            <template #detail-data="{ row }">
              <template v-if="e(row).metadata">
                <div v-if="e(row).eventType === 'LOGIN_FAILED' && e(row).metadata.reason" class="text-xs text-(--ui-text-muted)">
                  <span v-if="e(row).metadata.reason === 'invalid_password'">Wrong password</span>
                  <span v-else-if="e(row).metadata.reason === 'user_not_found'">Unknown email</span>
                  <span v-else-if="e(row).metadata.reason === 'account_disabled'">Account disabled</span>
                  <span v-else>{{ e(row).metadata.reason }}</span>
                </div>
                <div v-else-if="e(row).eventType === 'REGISTER' && e(row).metadata" class="text-xs text-(--ui-text-muted)">
                  Invite accepted
                </div>
                <div v-else-if="e(row).eventType === 'settings.general.updated'" class="text-xs text-(--ui-text-muted)">
                  Config changed
                </div>
                <UIcon v-else name="i-lucide-minus" class="size-3.5 text-(--ui-text-muted)" />
              </template>
              <UIcon v-else name="i-lucide-minus" class="size-3.5 text-(--ui-text-muted)" />
            </template>
          </UTable>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
