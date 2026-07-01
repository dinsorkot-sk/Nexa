import { requireAuth } from '~~/server/utils/session'
import { getAuthConfig } from '~~/server/utils/auth-config'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  return getAuthConfig()
})
