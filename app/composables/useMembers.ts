import type { Member } from '~/types'

export interface Role {
  id: number
  name: string
  slug: string
  description: string | null
  isSystem: number | null
}

export function useMembers() {
  const members = useState<Member[]>('members-list', () => [])
  const roles = useState<Role[]>('members-roles', () => [])
  const loading = useState('members-loading', () => false)
  const selectedMember = useState<Member | null>('members-selected', () => null)
  const showInviteModal = useState('members-invite-modal', () => false)
  const showSlideover = useState('members-slideover', () => false)

  /**
   * Fetch all members from the API.
   */
  async function loadMembers() {
    loading.value = true
    try {
      members.value = await $fetch<Member[]>('/api/auth/members')
    } catch {
      members.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch available roles.
   */
  async function loadRoles() {
    try {
      roles.value = await $fetch<Role[]>('/api/auth/roles')
    } catch {
      roles.value = []
    }
  }

  /**
   * Select a member and open the slide-over.
   */
  function selectMember(member: Member) {
    selectedMember.value = member
    showSlideover.value = true
  }

  /**
   * Close the slide-over.
   */
  function closeSlideover() {
    showSlideover.value = false
    selectedMember.value = null
  }

  /**
   * Invite a new member by email.
   */
  async function inviteMember(email: string, roleSlug?: string) {
    await $fetch('/api/auth/invite', {
      method: 'POST',
      body: { email, roleSlug }
    })
    showInviteModal.value = false
  }

  /**
   * Update a member's roles.
   */
  async function updateMemberRoles(memberId: number, roleIds: number[]) {
    await $fetch(`/api/auth/members/${memberId}`, {
      method: 'PATCH',
      body: { roles: roleIds }
    })
    // Refresh members list
    await loadMembers()
    // Update selected member
    const updated = members.value.find((m: Member) => m.id === memberId)
    if (updated) {
      selectedMember.value = updated
    }
  }

  /**
   * Toggle a member's active status.
   */
  async function toggleMemberStatus(memberId: number, isActive: boolean) {
    await $fetch(`/api/auth/members/${memberId}`, {
      method: 'PATCH',
      body: { isActive }
    })
    await loadMembers()
  }

  // Load data on init
  onMounted(() => {
    loadMembers()
    loadRoles()
  })

  return {
    members,
    roles,
    loading,
    selectedMember,
    showInviteModal,
    showSlideover,
    loadMembers,
    loadRoles,
    selectMember,
    closeSlideover,
    inviteMember,
    updateMemberRoles,
    toggleMemberStatus
  }
}
