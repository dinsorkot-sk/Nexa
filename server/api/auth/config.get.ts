import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { requireAuth } from '~~/server/utils/session'

const CONFIG_DIR = join(process.cwd(), '.data')
const CONFIG_PATH = join(CONFIG_DIR, 'auth-config.json')

const DEFAULT_CONFIG = {
  providers: { password: true, oauth2: false, saml: false },
  session: { absoluteTimeout: 1440, idleTimeout: 30, refreshTokenTTL: 7 },
  security: { concurrentSessions: true, mfaEnabled: false }
}

function loadConfig() {
  try {
    if (existsSync(CONFIG_PATH)) {
      const data = readFileSync(CONFIG_PATH, 'utf-8')
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG }
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  return loadConfig()
})
