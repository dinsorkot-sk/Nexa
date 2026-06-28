import { z } from 'zod'

/**
 * Dynamic Zod schema builder from entity field metadata.
 * Converts Nexa field definitions to Zod schemas for runtime validation.
 */

interface FieldMeta {
  name: string
  slug: string
  fieldType: string
  isRequired?: boolean | null
  isUnique?: boolean | null
  defaultValue?: string | null
  options?: string | null // JSON string for select/relation config
  validationRules?: string | null // JSON string with min/max/pattern
}

function parseJson<T = Record<string, unknown>>(val: string | null | undefined): T | null {
  if (!val) return null
  try { return JSON.parse(val) as T } catch { return null }
}

/**
 * Build a Zod object schema from field metadata.
 */
export function buildEntitySchema(fields: FieldMeta[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    const config = parseJson<Record<string, unknown>>(field.options)
    const rules = parseJson<Record<string, unknown>>(field.validationRules)
    let schema = fieldTypeToZod(field.fieldType, config, rules)

    // Required / optional
    if (field.isRequired) {
      schema = schema as z.ZodTypeAny
    } else {
      schema = schema.optional().nullable() as z.ZodTypeAny
    }

    // Default value
    if (field.defaultValue != null) {
      try {
        schema = (schema as any).default(coerceDefault(field.fieldType, field.defaultValue))
      } catch { /* ignore bad default */ }
    }

    shape[field.slug] = schema
  }

  // Always allow id, created_at, updated_at, created_by, updated_by, deleted_at
  shape.id = z.number().int().positive().optional()
  shape.created_at = z.string().optional()
  shape.updated_at = z.string().optional()
  shape.created_by = z.number().int().optional().nullable()
  shape.updated_by = z.number().int().optional().nullable()
  shape.deleted_at = z.string().optional().nullable()

  return z.object(shape)
}

function fieldTypeToZod(
  fieldType: string,
  config: Record<string, unknown> | null,
  rules: Record<string, unknown> | null
): z.ZodTypeAny {
  let schema: z.ZodTypeAny

  switch (fieldType) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'url':
      schema = z.string()
      if (fieldType === 'email') schema = z.string().email()
      if (fieldType === 'url') schema = z.string().url()
      // Validation rules: minLength, maxLength, pattern
      if (rules?.minLength) schema = (schema as any).min(Number(rules.minLength))
      if (rules?.maxLength) schema = (schema as any).max(Number(rules.maxLength))
      if (rules?.pattern) schema = (schema as any).regex(new RegExp(rules.pattern as string))
      break

    case 'number':
      schema = z.coerce.number()
      if (rules?.min !== undefined) schema = (schema as any).min(Number(rules.min))
      if (rules?.max !== undefined) schema = (schema as any).max(Number(rules.max))
      break

    case 'boolean':
      schema = z.coerce.boolean()
      break

    case 'date':
      schema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected date format YYYY-MM-DD')
      break

    case 'select':
      if (config?.options && Array.isArray(config.options)) {
        const values = config.options.map((o: any) => o.value ?? o)
        schema = z.enum(values as [string, ...string[]])
      } else {
        schema = z.string()
      }
      break

    case 'json':
      schema = z.union([z.string(), z.record(z.string(), z.unknown()), z.array(z.unknown())])
      break

    default:
      schema = z.string()
  }

  return schema
}

function coerceDefault(fieldType: string, value: string): unknown {
  switch (fieldType) {
    case 'number': return Number(value)
    case 'boolean': return value === 'true' || value === '1'
    default: return value
  }
}

/**
 * Pick fields that match entity metadata, reject unknown fields.
 */
export function filterKnownFields(
  data: Record<string, unknown>,
  fields: FieldMeta[]
): Record<string, unknown> {
  const knownSlugs = new Set(fields.map(f => f.slug))
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    if (knownSlugs.has(k)) {
      result[k] = v
    }
  }
  return result
}

/**
 * Coerce string values to proper types based on field metadata.
 * HTML forms always send strings — this converts them.
 */
export function coerceFieldTypes(
  data: Record<string, unknown>,
  fields: FieldMeta[]
): Record<string, unknown> {
  const fieldMap = new Map(fields.map(f => [f.slug, f]))
  const result: Record<string, unknown> = { ...data }

  for (const [key, value] of Object.entries(result)) {
    const field = fieldMap.get(key)
    if (!field || value === undefined || value === null || value === '') continue

    const str = String(value)
    switch (field.fieldType) {
      case 'number':
        result[key] = Number(str)
        break
      case 'boolean':
        result[key] = str === 'true' || str === '1' || str === 'yes'
        break
      case 'json':
        try { result[key] = JSON.parse(str) } catch { result[key] = str }
        break
    }
  }

  return result
}
