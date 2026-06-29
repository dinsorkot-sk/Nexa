import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const allRoles = await db
    .select()
    .from(schema.roles)
    .orderBy(schema.roles.name)
    .all()

  return allRoles
})
