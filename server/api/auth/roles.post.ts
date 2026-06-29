import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  slug: z.string().min(1, 'Role slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  description: z.string().optional().nullable(),
  isSystem: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const _userId = await requireAuth(event)

  const body = await readValidatedBody(event, bodySchema.parse)

  // Check if slug already exists
  const existing = await db
    .select({ id: schema.roles.id })
    .from(schema.roles)
    .where(eq(schema.roles.slug, body.slug))
    .get()

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: `Role with slug "${body.slug}" already exists` })
  }

  const [role] = await db
    .insert(schema.roles)
    .values({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      isSystem: body.isSystem ?? false
    })
    .returning()
    .all()

  return role
})
