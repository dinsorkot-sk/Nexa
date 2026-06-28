import { db, schema } from '@nuxthub/db'

export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Seed database with initial metadata entities, fields, and relations'
  },
  async run() {
    console.log('🌱 Seeding Nexa database...')

    // ── Modules ────────────────────────────────────────────────────
    const [cmsModule] = await db.insert(schema.modules).values({
      name: 'Content Management',
      slug: 'cms',
      description: 'Manage pages, blocks, and structured content',
      icon: 'i-lucide-file-text',
      isActive: true
    }).returning().all()
    const [blogModule] = await db.insert(schema.modules).values({
      name: 'Blog',
      slug: 'blog',
      description: 'Blog posts, categories, and tags',
      icon: 'i-lucide-newspaper',
      isActive: true
    }).returning().all()
    const [ecommerceModule] = await db.insert(schema.modules).values({
      name: 'E-Commerce',
      slug: 'ecommerce',
      description: 'Products, orders, and customer management',
      icon: 'i-lucide-shopping-cart',
      isActive: true
    }).returning().all()

    console.log(`  ✓ Modules: ${cmsModule!.name}, ${blogModule!.name}, ${ecommerceModule!.name}`)

    // ── Entities ────────────────────────────────────────────────────
    const [pagesEntity] = await db.insert(schema.entities).values({
      moduleId: cmsModule!.id,
      name: 'Pages',
      slug: 'pages',
      tableName: 'cms_pages',
      icon: 'i-lucide-file',
      description: 'Static and dynamic pages',
      isActive: true
    }).returning().all()

    const [blocksEntity] = await db.insert(schema.entities).values({
      moduleId: cmsModule!.id,
      name: 'Blocks',
      slug: 'blocks',
      tableName: 'cms_blocks',
      icon: 'i-lucide-layout',
      description: 'Reusable content blocks',
      isActive: true
    }).returning().all()

    const [postsEntity] = await db.insert(schema.entities).values({
      moduleId: blogModule!.id,
      name: 'Posts',
      slug: 'posts',
      tableName: 'blog_posts',
      icon: 'i-lucide-pencil',
      description: 'Blog articles and posts',
      isActive: true
    }).returning().all()

    const [categoriesEntity] = await db.insert(schema.entities).values({
      moduleId: blogModule!.id,
      name: 'Categories',
      slug: 'categories',
      tableName: 'blog_categories',
      icon: 'i-lucide-folder',
      description: 'Post categories',
      isActive: true
    }).returning().all()

    const [tagsEntity] = await db.insert(schema.entities).values({
      moduleId: blogModule!.id,
      name: 'Tags',
      slug: 'tags',
      tableName: 'blog_tags',
      icon: 'i-lucide-tag',
      description: 'Post tags',
      isActive: true
    }).returning().all()

    const [productsEntity] = await db.insert(schema.entities).values({
      moduleId: ecommerceModule!.id,
      name: 'Products',
      slug: 'products',
      tableName: 'ecom_products',
      icon: 'i-lucide-package',
      description: 'Product catalog',
      isActive: true
    }).returning().all()

    const [ordersEntity] = await db.insert(schema.entities).values({
      moduleId: ecommerceModule!.id,
      name: 'Orders',
      slug: 'orders',
      tableName: 'ecom_orders',
      icon: 'i-lucide-receipt',
      description: 'Customer orders',
      isActive: true
    }).returning().all()

    console.log(`  ✓ Entities: ${pagesEntity!.name}, ${blocksEntity!.name}, ${postsEntity!.name}, ${categoriesEntity!.name}, ${tagsEntity!.name}, ${productsEntity!.name}, ${ordersEntity!.name}`)

    // ── Fields ──────────────────────────────────────────────────────
    // Pages fields
    await db.insert(schema.fields).values([
      { entityId: pagesEntity!.id, name: 'Title', slug: 'title', fieldType: 'text', isRequired: true, sortOrder: 0 },
      { entityId: pagesEntity!.id, name: 'Slug', slug: 'slug', fieldType: 'text', isRequired: true, isUnique: true, sortOrder: 1 },
      { entityId: pagesEntity!.id, name: 'Content', slug: 'content', fieldType: 'text', isRequired: true, sortOrder: 2 },
      { entityId: pagesEntity!.id, name: 'Status', slug: 'status', fieldType: 'text', isRequired: true, defaultValue: 'draft', sortOrder: 3 },
      { entityId: pagesEntity!.id, name: 'Published At', slug: 'published_at', fieldType: 'date', sortOrder: 4 }
    ]).returning().all()

    // Blocks fields
    await db.insert(schema.fields).values([
      { entityId: blocksEntity!.id, name: 'Name', slug: 'name', fieldType: 'text', isRequired: true, sortOrder: 0 },
      { entityId: blocksEntity!.id, name: 'Key', slug: 'key', fieldType: 'text', isRequired: true, isUnique: true, sortOrder: 1 },
      { entityId: blocksEntity!.id, name: 'Content', slug: 'content', fieldType: 'text', sortOrder: 2 },
      { entityId: blocksEntity!.id, name: 'Type', slug: 'type', fieldType: 'text', isRequired: true, sortOrder: 3 }
    ]).returning().all()

    // Posts fields
    await db.insert(schema.fields).values([
      { entityId: postsEntity!.id, name: 'Title', slug: 'title', fieldType: 'text', isRequired: true, sortOrder: 0 },
      { entityId: postsEntity!.id, name: 'Slug', slug: 'slug', fieldType: 'text', isRequired: true, isUnique: true, sortOrder: 1 },
      { entityId: postsEntity!.id, name: 'Excerpt', slug: 'excerpt', fieldType: 'text', sortOrder: 2 },
      { entityId: postsEntity!.id, name: 'Content', slug: 'content', fieldType: 'text', isRequired: true, sortOrder: 3 },
      { entityId: postsEntity!.id, name: 'Status', slug: 'status', fieldType: 'text', isRequired: true, defaultValue: 'draft', sortOrder: 4 },
      { entityId: postsEntity!.id, name: 'Published At', slug: 'published_at', fieldType: 'date', sortOrder: 5 },
      { entityId: postsEntity!.id, name: 'Featured Image', slug: 'featured_image', fieldType: 'text', sortOrder: 6 }
    ]).returning().all()

    // Categories fields
    await db.insert(schema.fields).values([
      { entityId: categoriesEntity!.id, name: 'Name', slug: 'name', fieldType: 'text', isRequired: true, sortOrder: 0 },
      { entityId: categoriesEntity!.id, name: 'Slug', slug: 'slug', fieldType: 'text', isRequired: true, isUnique: true, sortOrder: 1 },
      { entityId: categoriesEntity!.id, name: 'Description', slug: 'description', fieldType: 'text', sortOrder: 2 }
    ]).returning().all()

    // Tags fields
    await db.insert(schema.fields).values([
      { entityId: tagsEntity!.id, name: 'Name', slug: 'name', fieldType: 'text', isRequired: true, sortOrder: 0 },
      { entityId: tagsEntity!.id, name: 'Slug', slug: 'slug', fieldType: 'text', isRequired: true, isUnique: true, sortOrder: 1 }
    ]).returning().all()

    // Products fields
    await db.insert(schema.fields).values([
      { entityId: productsEntity!.id, name: 'Name', slug: 'name', fieldType: 'text', isRequired: true, sortOrder: 0 },
      { entityId: productsEntity!.id, name: 'Slug', slug: 'slug', fieldType: 'text', isRequired: true, isUnique: true, sortOrder: 1 },
      { entityId: productsEntity!.id, name: 'Description', slug: 'description', fieldType: 'text', sortOrder: 2 },
      { entityId: productsEntity!.id, name: 'Price', slug: 'price', fieldType: 'number', isRequired: true, sortOrder: 3 },
      { entityId: productsEntity!.id, name: 'Currency', slug: 'currency', fieldType: 'text', defaultValue: 'USD', sortOrder: 4 },
      { entityId: productsEntity!.id, name: 'Status', slug: 'status', fieldType: 'text', defaultValue: 'active', sortOrder: 5 },
      { entityId: productsEntity!.id, name: 'Image', slug: 'image', fieldType: 'text', sortOrder: 6 },
      { entityId: productsEntity!.id, name: 'Stock', slug: 'stock', fieldType: 'number', defaultValue: '0', sortOrder: 7 }
    ]).returning().all()

    // Orders fields
    await db.insert(schema.fields).values([
      { entityId: ordersEntity!.id, name: 'Order Number', slug: 'order_number', fieldType: 'text', isRequired: true, isUnique: true, sortOrder: 0 },
      { entityId: ordersEntity!.id, name: 'Customer Name', slug: 'customer_name', fieldType: 'text', isRequired: true, sortOrder: 1 },
      { entityId: ordersEntity!.id, name: 'Customer Email', slug: 'customer_email', fieldType: 'text', isRequired: true, sortOrder: 2 },
      { entityId: ordersEntity!.id, name: 'Total', slug: 'total', fieldType: 'number', isRequired: true, sortOrder: 3 },
      { entityId: ordersEntity!.id, name: 'Status', slug: 'status', fieldType: 'text', isRequired: true, defaultValue: 'pending', sortOrder: 4 },
      { entityId: ordersEntity!.id, name: 'Notes', slug: 'notes', fieldType: 'text', sortOrder: 5 }
    ]).returning().all()

    console.log('  ✓ Fields created for all entities')

    // ── Relations ────────────────────────────────────────────────────
    await db.insert(schema.relations).values([
      {
        entityId: postsEntity!.id,
        relatedEntityId: categoriesEntity!.id,
        name: 'Category',
        slug: 'category',
        relationType: 'manyToOne',
        foreignKey: 'category_id',
        isRequired: false
      },
      {
        entityId: postsEntity!.id,
        relatedEntityId: tagsEntity!.id,
        name: 'Tags',
        slug: 'tags',
        relationType: 'manyToMany',
        pivotTable: 'blog_post_tags',
        foreignKey: 'post_id',
        isRequired: false
      },
      {
        entityId: productsEntity!.id,
        relatedEntityId: ordersEntity!.id,
        name: 'Order Items',
        slug: 'order_items',
        relationType: 'manyToMany',
        pivotTable: 'ecom_order_items',
        foreignKey: 'product_id',
        isRequired: false
      },
      {
        entityId: categoriesEntity!.id,
        relatedEntityId: postsEntity!.id,
        name: 'Posts',
        slug: 'posts',
        relationType: 'oneToMany',
        foreignKey: 'category_id',
        isRequired: false
      }
    ]).returning().all()

    console.log('  ✓ Relations created')

    return { result: 'Database seeded successfully' }
  }
})
