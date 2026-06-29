import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { requireAuth } from '~~/server/utils/session'

const EVENTS_PATH = join(process.cwd(), '.data', 'auth-events.json')

const MOCK_EVENTS = [
  { id: 1, timestamp: 'Mar 10, 19:45', eventType: 'ethan.harris@example.com', actor: 'Romaguera-Crona', status: 'Paid' },
  { id: 2, timestamp: 'Mar 10, 15:55', eventType: 'emma.davis@example.com', actor: 'Deckow-Crist', status: 'Paid' },
  { id: 3, timestamp: 'Mar 11, 15:30', eventType: 'william.brown@example.com', actor: 'Romaguera-Jacobson', status: 'Refunded' },
  { id: 4, timestamp: 'Mar 11, 10:10', eventType: 'mia.white@example.com', actor: 'Robel-Corkery', status: 'Failed' },
  { id: 5, timestamp: 'Mar 11, 15:30', eventType: 'james.anderson@example.com', actor: 'Keebler LLC', status: 'Paid' }
]

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  try {
    if (existsSync(EVENTS_PATH)) {
      const data = readFileSync(EVENTS_PATH, 'utf-8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch { /* ignore */ }

  return MOCK_EVENTS
})
