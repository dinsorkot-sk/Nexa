import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Valid module ID is required' })

  const mod = await db.select().from(schema.modules).where(eq(schema.modules.id, id)).get()
  if (!mod) throw createError({ statusCode: 404, statusMessage: 'Module not found' })
  await db.delete(schema.modules).where(eq(schema.modules.id, id)).run()
  return { success: true }
})
