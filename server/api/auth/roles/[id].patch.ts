import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  isSystem: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const roleId = getRouterParam(event, 'id')

  if (!roleId) {
    throw createError({ statusCode: 400, statusMessage: 'Role ID is required' })
  }

  const body = await readValidatedBody(event, bodySchema.parse)
  const parsedId = parseInt(roleId, 10)

  // Don't allow modifying system roles' non-editable props
  const existing = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.id, parsedId))
    .get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Role not found' })
  }

  const updateData: Record<string, unknown> = {}
  if (body.name !== undefined) updateData.name = body.name
  if (body.description !== undefined) updateData.description = body.description

  if (Object.keys(updateData).length > 0) {
    await db
      .update(schema.roles)
      .set(updateData)
      .where(eq(schema.roles.id, parsedId))
  }

  return { success: true }
})
