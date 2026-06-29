import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  roles: z.array(z.number()).optional()
})

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)
  const memberId = getRouterParam(event, 'id')

  if (!memberId) {
    throw createError({ statusCode: 400, statusMessage: 'Member ID is required' })
  }

  const body = await readValidatedBody(event, bodySchema.parse)
  const parsedId = parseInt(memberId, 10)

  // Only allow updating own profile or if admin
  // For now, allow any authenticated user to update
  if (body.name !== undefined) {
    await db
      .update(schema.users)
      .set({ name: body.name, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, parsedId))
  }

  if (body.isActive !== undefined) {
    await db
      .update(schema.users)
      .set({ isActive: body.isActive, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, parsedId))
  }

  if (body.roles !== undefined) {
    // Remove existing roles
    await db
      .delete(schema.userRoles)
      .where(eq(schema.userRoles.userId, parsedId))

    // Insert new roles
    if (body.roles.length > 0) {
      await db
        .insert(schema.userRoles)
        .values(body.roles.map(roleId => ({
          userId: parsedId,
          roleId,
          assignedBy: userId
        })))
    }
  }

  return { success: true }
})
