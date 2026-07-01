export interface Module {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  category: string | null
  version: string | null
  navConfig: string | null
  permConfig: string | null
  entityConfig: string | null
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

export interface ModuleRow extends Module {
  name: string
  category: string | null
  color: string | null
  version: string | null
  isActive: boolean
  entityCount?: number
  formCount?: number
  createdAt: string | null
  updatedAt: string | null
}

export interface ModuleDetail extends ModuleRow {
  entities: Entity[]
}

export interface ModuleStats {
  total: number
  active: number
  inactive: number
}

export interface CreateModulePayload {
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  category?: string
  version?: string
  isActive?: boolean
  navConfig?: string
  permConfig?: string
  entityIds?: number[]
}
