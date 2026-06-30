/**
 * Global auth middleware — protects all routes except /login.
 * Redirects to /login when session is expired or missing.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Allow unauthenticated access only to the login page
  if (to.path === '/login') return

  // Use the shared auth composable (singleton via createSharedComposable)
  const { isAuthenticated, fetchUser } = useAuth()

  // If not yet loaded, fetch from API (sets shared state)
  if (!isAuthenticated.value) {
    await fetchUser()
  }

  // Still not authenticated → redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
