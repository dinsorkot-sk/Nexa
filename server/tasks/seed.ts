import { db, schema } from '@nuxthub/db'
import { hashPassword } from '~~/server/utils/auth'

export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Seed database with initial metadata entities, fields, relations, roles, and admin user'
  },
  async run() {
    console.log('🌱 Seeding Nexa database...')

    // ── Seed roles first ──────────────────────────────────────────────
    await db.delete(schema.userRoles).run()
    await db.delete(schema.invites).run()
    await db.delete(schema.sessions).run()
    await db.delete(schema.users).run()
    await db.delete(schema.roles).run()

    // ── Clean existing metadata ───────────────────────────────────────
    await db.delete(schema.relations).run()
    await db.delete(schema.fields).run()
    await db.delete(schema.entities).run()
    await db.delete(schema.modules).run()

    const [adminRole] = await db.insert(schema.roles).values({
      name: 'Admin',
      slug: 'admin',
      description: 'Full access to all features',
      isSystem: true
    }).returning().all()

    const [memberRole] = await db.insert(schema.roles).values({
      name: 'Member',
      slug: 'member',
      description: 'Standard user with basic access',
      isSystem: true
    }).returning().all()

    console.log(`  ✓ Roles: ${adminRole!.name}, ${memberRole!.name}`)

    // ── Seed admin user ──────────────────────────────────────────────
    const passwordHash = hashPassword('admin123')
    const [adminUser] = await db.insert(schema.users).values({
      name: 'Admin',
      email: 'admin@nexa.dev',
      passwordHash,
      isActive: true
    }).returning().all()

    // Assign admin role
    await db.insert(schema.userRoles).values({
      userId: adminUser!.id,
      roleId: adminRole!.id
    })

    console.log(`  ✓ Admin user: ${adminUser!.email} (password: admin123)`)

    // ── Seed member users ─────────────────────────────────────────────
    const memberUsers = [
      { name: 'Alice Johnson', email: 'alice@nexa.dev' },
      { name: 'Bob Smith', email: 'bob@nexa.dev' },
      { name: 'Carol Davis', email: 'carol@nexa.dev' }
    ]

    for (const u of memberUsers) {
      const [user] = await db.insert(schema.users).values({
        name: u.name,
        email: u.email,
        passwordHash: hashPassword('member123'),
        isActive: true,
        invitedBy: adminUser!.id
      }).returning().all()

      await db.insert(schema.userRoles).values({
        userId: user!.id,
        roleId: memberRole!.id,
        assignedBy: adminUser!.id
      })
    }

    console.log(`  ✓ Member users: ${memberUsers.map(u => u.email).join(', ')} (password: member123)`)

    // ── Reset metadata (existing seed logic) ─────────────────────────

    // ── Modules ────────────────────────────────────────────────────
    const [cmsModule] = await db.insert(schema.modules).values({
      name: 'Content Management',
      slug: 'cms',
      description: 'Manage pages, blocks, and structured content',
      icon: 'i-lucide-file-text',
      color: '#6366F1',
      category: 'Content',
      version: '2.1.0',
      isActive: true
    }).returning().all()
    const [blogModule] = await db.insert(schema.modules).values({
      name: 'Blog',
      slug: 'blog',
      description: 'Blog posts, categories, and tags with SEO support',
      icon: 'i-lucide-newspaper',
      color: '#F59E0B',
      category: 'Content',
      version: '1.5.0',
      isActive: true
    }).returning().all()
    const [ecommerceModule] = await db.insert(schema.modules).values({
      name: 'E-Commerce',
      slug: 'ecommerce',
      description: 'Products, orders, and customer management',
      icon: 'i-lucide-shopping-cart',
      color: '#10B981',
      category: 'Commerce',
      version: '3.2.0',
      isActive: true
    }).returning().all()
    const [crmModule] = await db.insert(schema.modules).values({
      name: 'CRM',
      slug: 'crm',
      description: 'Customer Relationship Management module for managing customers, leads, opportunities, contacts and activities.',
      icon: 'i-lucide-users',
      color: '#10B981',
      category: 'Business',
      version: '1.0.0',
      isActive: true
    }).returning().all()

    console.log(`  ✓ Modules: ${cmsModule!.name}, ${blogModule!.name}, ${ecommerceModule!.name}, ${crmModule!.name}`)

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

    // ── E-Commerce entities
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

    const [customersEntity] = await db.insert(schema.entities).values({
      moduleId: ecommerceModule!.id,
      name: 'Customers',
      slug: 'customers',
      tableName: 'ecom_customers',
      icon: 'i-lucide-users',
      description: 'Customer records',
      isActive: true
    }).returning().all()

    // ── CRM entities
    const [leadsEntity] = await db.insert(schema.entities).values({
      moduleId: crmModule!.id,
      name: 'Leads',
      slug: 'leads',
      tableName: 'crm_leads',
      icon: 'i-lucide-target',
      description: 'Sales leads and prospects',
      isActive: true
    }).returning().all()

    const [opportunitiesEntity] = await db.insert(schema.entities).values({
      moduleId: crmModule!.id,
      name: 'Opportunities',
      slug: 'opportunities',
      tableName: 'crm_opportunities',
      icon: 'i-lucide-trending-up',
      description: 'Sales opportunities and deals',
      isActive: true
    }).returning().all()

    const [contactsEntity] = await db.insert(schema.entities).values({
      moduleId: crmModule!.id,
      name: 'Contacts',
      slug: 'contacts',
      tableName: 'crm_contacts',
      icon: 'i-lucide-phone',
      description: 'Contact persons',
      isActive: true
    }).returning().all()

    const [activitiesEntity] = await db.insert(schema.entities).values({
      moduleId: crmModule!.id,
      name: 'Activities',
      slug: 'activities',
      tableName: 'crm_activities',
      icon: 'i-lucide-calendar-check',
      description: 'Calls, meetings, and tasks',
      isActive: true
    }).returning().all()

    console.log(`  ✓ Entities: ${pagesEntity!.name}, ${blocksEntity!.name}, ${postsEntity!.name}, ${categoriesEntity!.name}, ${tagsEntity!.name}, ${productsEntity!.name}, ${ordersEntity!.name}, ${customersEntity!.name}, ${leadsEntity!.name}, ${opportunitiesEntity!.name}, ${contactsEntity!.name}, ${activitiesEntity!.name}`)

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
      { entityId: postsEntity!.id, name: 'Featured Image', slug: 'featured_image', fieldType: 'text', sortOrder: 6 },
      { entityId: postsEntity!.id, name: 'Category ID', slug: 'category_id', fieldType: 'number', sortOrder: 7 }
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

    // Customers fields
    await db.insert(schema.fields).values([
      { entityId: customersEntity!.id, name: 'Name', slug: 'name', fieldType: 'text', isRequired: true, sortOrder: 0 },
      { entityId: customersEntity!.id, name: 'Email', slug: 'email', fieldType: 'text', isRequired: true, isUnique: true, sortOrder: 1 },
      { entityId: customersEntity!.id, name: 'Phone', slug: 'phone', fieldType: 'text', sortOrder: 2 },
      { entityId: customersEntity!.id, name: 'City', slug: 'city', fieldType: 'text', sortOrder: 3 },
      { entityId: customersEntity!.id, name: 'Country', slug: 'country', fieldType: 'text', defaultValue: 'US', sortOrder: 4 },
      { entityId: customersEntity!.id, name: 'Status', slug: 'status', fieldType: 'text', defaultValue: 'active', sortOrder: 5 }
    ]).returning().all()

    // CRM: Leads fields
    await db.insert(schema.fields).values([
      { entityId: leadsEntity!.id, name: 'First Name', slug: 'first_name', fieldType: 'text', isRequired: true, sortOrder: 0 },
      { entityId: leadsEntity!.id, name: 'Last Name', slug: 'last_name', fieldType: 'text', isRequired: true, sortOrder: 1 },
      { entityId: leadsEntity!.id, name: 'Email', slug: 'email', fieldType: 'text', sortOrder: 2 },
      { entityId: leadsEntity!.id, name: 'Phone', slug: 'phone', fieldType: 'text', sortOrder: 3 },
      { entityId: leadsEntity!.id, name: 'Company', slug: 'company', fieldType: 'text', sortOrder: 4 },
      { entityId: leadsEntity!.id, name: 'Status', slug: 'status', fieldType: 'text', defaultValue: 'new', sortOrder: 5 },
      { entityId: leadsEntity!.id, name: 'Source', slug: 'source', fieldType: 'text', sortOrder: 6 }
    ]).returning().all()

    // CRM: Opportunities fields
    await db.insert(schema.fields).values([
      { entityId: opportunitiesEntity!.id, name: 'Name', slug: 'name', fieldType: 'text', isRequired: true, sortOrder: 0 },
      { entityId: opportunitiesEntity!.id, name: 'Amount', slug: 'amount', fieldType: 'number', isRequired: true, sortOrder: 1 },
      { entityId: opportunitiesEntity!.id, name: 'Stage', slug: 'stage', fieldType: 'text', defaultValue: 'prospecting', sortOrder: 2 },
      { entityId: opportunitiesEntity!.id, name: 'Close Date', slug: 'close_date', fieldType: 'date', sortOrder: 3 },
      { entityId: opportunitiesEntity!.id, name: 'Probability', slug: 'probability', fieldType: 'number', sortOrder: 4 },
      { entityId: opportunitiesEntity!.id, name: 'Notes', slug: 'notes', fieldType: 'text', sortOrder: 5 }
    ]).returning().all()

    // CRM: Contacts fields
    await db.insert(schema.fields).values([
      { entityId: contactsEntity!.id, name: 'First Name', slug: 'first_name', fieldType: 'text', isRequired: true, sortOrder: 0 },
      { entityId: contactsEntity!.id, name: 'Last Name', slug: 'last_name', fieldType: 'text', isRequired: true, sortOrder: 1 },
      { entityId: contactsEntity!.id, name: 'Email', slug: 'email', fieldType: 'text', sortOrder: 2 },
      { entityId: contactsEntity!.id, name: 'Phone', slug: 'phone', fieldType: 'text', sortOrder: 3 },
      { entityId: contactsEntity!.id, name: 'Role', slug: 'role', fieldType: 'text', sortOrder: 4 }
    ]).returning().all()

    // CRM: Activities fields
    await db.insert(schema.fields).values([
      { entityId: activitiesEntity!.id, name: 'Subject', slug: 'subject', fieldType: 'text', isRequired: true, sortOrder: 0 },
      { entityId: activitiesEntity!.id, name: 'Type', slug: 'type', fieldType: 'text', isRequired: true, sortOrder: 1 },
      { entityId: activitiesEntity!.id, name: 'Status', slug: 'status', fieldType: 'text', defaultValue: 'pending', sortOrder: 2 },
      { entityId: activitiesEntity!.id, name: 'Due Date', slug: 'due_date', fieldType: 'date', sortOrder: 3 },
      { entityId: activitiesEntity!.id, name: 'Notes', slug: 'notes', fieldType: 'text', sortOrder: 4 }
    ]).returning().all()

    console.log('  ✓ Fields created for all entities')

    // ── Relations ────────────────────────────────────────────────────
    await db.insert(schema.relations).values([
      {
        entityId: categoriesEntity!.id,
        relatedEntityId: postsEntity!.id,
        name: 'Posts',
        slug: 'posts',
        relationType: '1:N',
        foreignKey: 'category_id',
        isRequired: false
      },
      {
        entityId: postsEntity!.id,
        relatedEntityId: tagsEntity!.id,
        name: 'Tags',
        slug: 'tags',
        relationType: 'N:N',
        pivotTable: 'blog_post_tags',
        isRequired: false
      },
      {
        entityId: ordersEntity!.id,
        relatedEntityId: productsEntity!.id,
        name: 'Products',
        slug: 'products',
        relationType: 'N:N',
        pivotTable: 'ecom_order_items',
        isRequired: false
      },
      // ── CRM Relations
      {
        entityId: leadsEntity!.id,
        relatedEntityId: opportunitiesEntity!.id,
        name: 'Opportunities',
        slug: 'opportunities',
        relationType: '1:N',
        foreignKey: 'lead_id',
        isRequired: false
      },
      {
        entityId: opportunitiesEntity!.id,
        relatedEntityId: contactsEntity!.id,
        name: 'Contacts',
        slug: 'contacts',
        relationType: 'N:N',
        pivotTable: 'crm_opportunity_contacts',
        isRequired: false
      },
      {
        entityId: contactsEntity!.id,
        relatedEntityId: activitiesEntity!.id,
        name: 'Activities',
        slug: 'activities',
        relationType: '1:N',
        foreignKey: 'contact_id',
        isRequired: false
      },
      {
        entityId: leadsEntity!.id,
        relatedEntityId: contactsEntity!.id,
        name: 'Contacts',
        slug: 'contacts',
        relationType: '1:N',
        foreignKey: 'lead_id',
        isRequired: false
      }
    ]).returning().all()

    console.log('  ✓ Relations created')

    return { result: 'Database seeded successfully' }
  }
})
