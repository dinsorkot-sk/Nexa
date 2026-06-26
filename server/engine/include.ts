export interface IncludeOption {
  relation: string
  nested: IncludeOption[]
}

export function parseInclude(include?: string): IncludeOption[] {
  if (!include) return []
  return include.split(',').map((part) => {
    const trimmed = part.trim()
    const dot = trimmed.indexOf('.')
    if (dot === -1) return { relation: trimmed, nested: [] }
    return {
      relation: trimmed.slice(0, dot),
      nested: parseInclude(trimmed.slice(dot + 1))
    }
  })
}
