import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { requireAuth } from '~~/server/utils/session'
import { z } from 'zod'

const CONFIG_DIR = join(process.cwd(), '.data')
const CONFIG_PATH = join(CONFIG_DIR, 'auth-config.json')

const bodySchema = z.object({
  providers: z.object({
    password: z.boolean(),
    oauth2: z.boolean(),
    saml: z.boolean()
  }),
  session: z.object({
    absoluteTimeout: z.number().min(1),
    idleTimeout: z.number().min(1),
    refreshTokenTTL: z.number().min(1)
  }),
  security: z.object({
    concurrentSessions: z.boolean(),
    mfaEnabled: z.boolean()
  })
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await readValidatedBody(event, bodySchema.parse)

  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }

  writeFileSync(CONFIG_PATH, JSON.stringify(body, null, 2), 'utf-8')

  // Log the config change as an event
  const eventsPath = join(CONFIG_DIR, 'auth-events.json')
  const events = []
  try {
    if (existsSync(eventsPath)) {
      const existing = JSON.parse(readFileSync(eventsPath, 'utf-8'))
      if (Array.isArray(existing)) events.push(...existing)
    }
  } catch { /* ignore */ }

  events.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    eventType: 'config.updated',
    actor: body.providers.password ? 'System' : 'Admin',
    status: 'completed'
  })

  // Keep only latest 50
  writeFileSync(eventsPath, JSON.stringify(events.slice(0, 50), null, 2), 'utf-8')

  return { success: true }
})
