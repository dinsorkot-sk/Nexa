import { eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'
import { buildEntitySchema, filterKnownFields, coerceFieldTypes } from '../../utils/validate'
import type { InferSelectModel } from 'drizzle-orm'
import type { H3Event } from 'h3'

type EntityRow = InferSelectModel<typeof schema.entities>
type FieldRow = InferSelectModel<typeof schema.fields>

export async function getEntityBySlug(event: H3Event): Promise<EntityRow> {
  const slug = getRouterParam(event, 'entity')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Entity slug required' })
  const entity = await db.select().from(schema.entities).where(eq(schema.entities.slug, slug)).get()
  if (!entity) throw createError({ statusCode: 404, statusMessage: `Entity "${slug}" not found` })
  return entity as EntityRow
}

export async function getFieldsForEntity(entityId: number): Promise<FieldRow[]> {
  return await db.select().from(schema.fields).where(eq(schema.fields.entityId, entityId)).all() as FieldRow[]
}

export async function validateBody(body: Record<string, unknown>, fields: FieldRow[]) {
  const entitySchema = buildEntitySchema(fields)
  const coerced = coerceFieldTypes(body, fields)
  const known = filterKnownFields(coerced, fields)
  const parsed = entitySchema.partial().safeParse(known)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: parsed.error.flatten().fieldErrors
    })
  }
  return parsed.data as Record<string, unknown>
}
