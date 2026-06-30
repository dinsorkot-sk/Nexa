import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Valid field ID is required' })

  const field = await db.select().from(schema.fields).where(eq(schema.fields.id, id)).get()
  await db.delete(schema.fields).where(eq(schema.fields.id, id)).run()
  return { success: true, field }
})
