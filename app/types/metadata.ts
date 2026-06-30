export interface Module {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
  entityCount?: number
  formCount?: number
}

export interface Entity {
  id: number
  moduleId: number | null
  name: string
  slug: string
  tableName: string
  icon: string | null
  description: string | null
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface Field {
  id: number
  entityId: number
  name: string
  slug: string
  fieldType: string
  isRequired: boolean
  isUnique: boolean
  defaultValue: string | null
  options: string | null
  validationRules: string | null
  sortOrder: number
  isActive: boolean
}

export interface EntityWithFields extends Entity {
  fields: Field[]
  relations: Relation[]
}

export interface Relation {
  id: number
  entityId: number
  relatedEntityId: number
  name: string
  slug: string
  relationType: '1:1' | '1:N' | 'N:N' | 'self'
  pivotTable: string | null
  foreignKey: string | null
  isRequired: boolean
  onDelete: string | null
  createdAt: string | null
  entityName?: string
  relatedEntityName?: string
}
