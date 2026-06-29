import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const roleId = getRouterParam(event, 'id')

  if (!roleId) {
    throw createError({ statusCode: 400, statusMessage: 'Role ID is required' })
  }

  const parsedId = parseInt(roleId, 10)

  // Check role exists
  const existing = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.id, parsedId))
    .get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Role not found' })
  }

  // Don't allow deleting system roles
  if (existing.isSystem) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot delete system roles' })
  }

  // Remove user-role associations first
  await db
    .delete(schema.userRoles)
    .where(eq(schema.userRoles.roleId, parsedId))

  // Delete the role
  await db
    .delete(schema.roles)
    .where(eq(schema.roles.id, parsedId))

  return { success: true }
})
