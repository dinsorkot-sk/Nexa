import { requireAuth } from '~~/server/utils/session'
import { getAppConfig } from '~~/server/utils/app-config'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  return getAppConfig()
})
