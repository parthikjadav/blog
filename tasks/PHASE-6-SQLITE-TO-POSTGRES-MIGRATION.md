# Phase 6: SQLite to PostgreSQL Migration Plan

**Project**: Fast Tech - Next.js 15 Blog  
**Current State**: SQLite with Prisma ORM  
**Target State**: PostgreSQL with Prisma ORM  
**Estimated Duration**: 4-6 hours  
**Priority**: Medium  
**Risk Level**: Medium

---

## Executive Summary

This phase involves migrating the blog database from SQLite to PostgreSQL while maintaining all existing functionality, data integrity, and test coverage. PostgreSQL offers better scalability, concurrent access, and production-ready features compared to SQLite.

---

## Prerequisites Checklist

- [x] All tests passing (157/157) ✅
- [x] Current database schema documented
- [x] Backup strategy in place
- [ ] PostgreSQL installed locally or cloud instance ready
- [ ] Environment variables configured
- [ ] Migration strategy approved

---

## Phase 6 Tasks Breakdown

### 6.1 Environment Setup (30 minutes)

**Example `.env`**:

```env
# PostgreSQL Connection
DATABASE_URL="postgresql://neondb_owner:npg_WshETbUl9LS0@ep-empty-tree-ads91rdp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

---

### 6.2 Prisma Schema Updates (45 minutes)

**6.2.1 Update Prisma Schema**

- [ ] Change `provider` from `sqlite` to `postgresql`
- [ ] Update field types for PostgreSQL compatibility
- [ ] Review and update indexes
- [ ] Update `@default` functions

**File**: `prisma/schema.prisma`

**Changes Required**:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id           String    @id @default(uuid())  // Changed from cuid()
  slug         String    @unique
  title        String
  description  String
  content      String    @db.Text  // Explicit text type
  coverImage   String?
  published    Boolean   @default(false)
  featured     Boolean   @default(false)
  scheduledFor DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Relations
  category     Category  @relation(fields: [categoryId], references: [id])
  categoryId   String
  tags         PostTag[]

  @@index([published, scheduledFor])
  @@index([categoryId])
  @@index([slug])
}

model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  posts       Post[]

  @@index([slug])
}

model Tag {
  id        String    @id @default(uuid())
  name      String    @unique
  slug      String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  posts     PostTag[]

  @@index([slug])
}

model PostTag {
  id     String @id @default(uuid())
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  String

  @@unique([postId, tagId])
  @@index([postId])
  @@index([tagId])
}
```

**Key Changes**:

1. `@default(cuid())` → `@default(uuid())` (PostgreSQL native UUID)
2. Add `@db.Text` for long text fields
3. Keep all indexes for performance
4. Maintain cascade delete relationships

**6.2.2 Validate Schema**

- [ ] Run `npx prisma validate`
- [ ] Check for any warnings or errors
- [ ] Review generated SQL

---

### 6.3 Data Migration (1 hour)

**6.3.1 Export Existing Data**

- [ ] Create data export script
- [ ] Export all posts, categories, tags, and relations
- [ ] Verify data integrity

**Create**: `scripts/export-sqlite-data.ts`

```typescript
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function exportData() {
  console.log("📦 Exporting SQLite data...");

  const categories = await prisma.category.findMany({
    include: { posts: true },
  });

  const tags = await prisma.tag.findMany({
    include: { posts: true },
  });

  const posts = await prisma.post.findMany({
    include: {
      category: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  const data = {
    categories,
    tags,
    posts,
    exportedAt: new Date().toISOString(),
  };

  const exportPath = path.join(process.cwd(), "data-export.json");
  fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));

  console.log(`✅ Data exported to ${exportPath}`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${tags.length} tags`);
  console.log(`   - ${posts.length} posts`);
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**6.3.2 Create Migration**

- [ ] Run `npx prisma migrate dev --name init_postgres`
- [ ] Review generated migration SQL
- [ ] Verify migration success

**6.3.3 Import Data to PostgreSQL**

- [ ] Create data import script
- [ ] Import categories first
- [ ] Import tags second
- [ ] Import posts with relations
- [ ] Verify data integrity

**Create**: `scripts/import-postgres-data.ts`

```typescript
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function importData() {
  console.log("📥 Importing data to PostgreSQL...");

  const exportPath = path.join(process.cwd(), "data-export.json");
  const data = JSON.parse(fs.readFileSync(exportPath, "utf-8"));

  // Import categories
  for (const category of data.categories) {
    await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      },
    });
  }
  console.log(`✅ Imported ${data.categories.length} categories`);

  // Import tags
  for (const tag of data.tags) {
    await prisma.tag.create({
      data: {
        name: tag.name,
        slug: tag.slug,
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt),
      },
    });
  }
  console.log(`✅ Imported ${data.tags.length} tags`);

  // Import posts
  for (const post of data.posts) {
    await prisma.post.create({
      data: {
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        coverImage: post.coverImage,
        published: post.published,
        featured: post.featured,
        scheduledFor: post.scheduledFor ? new Date(post.scheduledFor) : null,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
        category: {
          connect: { slug: post.category.slug },
        },
        tags: {
          create: post.tags.map((pt: any) => ({
            tag: { connect: { slug: pt.tag.slug } },
          })),
        },
      },
    });
  }
  console.log(`✅ Imported ${data.posts.length} posts`);

  console.log("🎉 Data import complete!");
}

importData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

### 6.4 Update Application Code (30 minutes)

**6.4.1 Update Prisma Client**

- [ ] Run `npx prisma generate`
- [ ] Verify client generation
- [ ] Update imports if needed

**6.4.2 Update Database Utilities**

- [ ] Review `lib/db.ts` (if exists)
- [ ] Update connection pooling settings
- [ ] Add PostgreSQL-specific optimizations

**6.4.3 Update Seed Script**

- [ ] Update `prisma/seed.ts` for PostgreSQL
- [ ] Test seed script: `npx prisma db seed`
- [ ] Verify seeded data

---

### 6.5 Testing & Validation (1.5 hours)

**6.5.1 Update Test Configuration**

- [ ] Update test database connection
- [ ] Configure test database reset
- [ ] Update `vitest.config.ts` if needed

**File**: `tests/setup.ts`

```typescript
import { beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

beforeAll(async () => {
  // Ensure test database is ready
  await prisma.$connect();
});

beforeEach(async () => {
  // Clean database between tests
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

**6.5.2 Run All Tests**

- [ ] Run unit tests: `npm run test:run`
- [ ] Run integration tests
- [ ] Verify all 157 tests pass
- [ ] Check for PostgreSQL-specific issues

**6.5.3 Manual Testing**

- [ ] Test all CRUD operations
- [ ] Test search functionality
- [ ] Test related posts
- [ ] Test scheduled posts
- [ ] Test pagination
- [ ] Verify performance

**6.5.4 Performance Testing**

- [ ] Benchmark query performance
- [ ] Compare with SQLite performance
- [ ] Optimize slow queries if needed
- [ ] Add indexes if necessary

---

### 6.6 Deployment Preparation (45 minutes)

**6.6.1 Production Database Setup**
Choose one option:

**Option A: Supabase (Recommended - Free Tier)**

- [ ] Create Supabase account
- [ ] Create new project
- [ ] Get connection string
- [ ] Update production `.env`

**Option B: Railway**

- [ ] Create Railway account
- [ ] Provision PostgreSQL
- [ ] Get connection string
- [ ] Update production `.env`

**Option C: Neon**

- [ ] Create Neon account
- [ ] Create database
- [ ] Get connection string
- [ ] Update production `.env`

**Option D: Vercel Postgres**

- [ ] Enable Vercel Postgres
- [ ] Create database
- [ ] Get connection string
- [ ] Update production `.env`

**6.6.2 Update Deployment Configuration**

- [ ] Update `package.json` scripts
- [ ] Add migration scripts
- [ ] Update build process
- [ ] Configure environment variables

**Update `package.json`**:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

**6.6.3 Create Migration Guide**

- [ ] Document migration steps
- [ ] Create rollback plan
- [ ] Document troubleshooting steps

---

### 6.7 Documentation Updates (30 minutes)

**6.7.1 Update README.md**

- [ ] Update database setup instructions
- [ ] Add PostgreSQL installation guide
- [ ] Update environment variables section
- [ ] Add migration guide

**6.7.2 Update Development Guide**

- [ ] Update local setup instructions
- [ ] Add PostgreSQL troubleshooting
- [ ] Document common issues

**6.7.3 Create Migration Documentation**

- [ ] Document migration process
- [ ] Add rollback instructions
- [ ] Include data backup procedures

---

## Migration Checklist

### Pre-Migration

- [ ] Backup current SQLite database
- [ ] Export all data to JSON
- [ ] Document current schema
- [ ] All tests passing (157/157)
- [ ] PostgreSQL installed and running

### Migration

- [ ] Update Prisma schema
- [ ] Create PostgreSQL database
- [ ] Run migrations
- [ ] Import data
- [ ] Verify data integrity
- [ ] Update application code
- [ ] Generate Prisma client

### Post-Migration

- [ ] All tests passing
- [ ] Manual testing complete
- [ ] Performance validated
- [ ] Documentation updated
- [ ] Deployment configuration ready
- [ ] Rollback plan documented

---

## Risk Assessment & Mitigation

### High Risk Items

**1. Data Loss During Migration**

- **Risk**: Data could be lost or corrupted during export/import
- **Mitigation**:
  - Create multiple backups
  - Validate data after each step
  - Keep SQLite database until migration verified
  - Test migration on copy first

**2. Schema Incompatibilities**

- **Risk**: SQLite and PostgreSQL have different data types
- **Mitigation**:
  - Review all field types
  - Test with sample data first
  - Use PostgreSQL-compatible types
  - Validate schema before migration

**3. Test Failures**

- **Risk**: Tests may fail due to database differences
- **Mitigation**:
  - Update test setup for PostgreSQL
  - Run tests incrementally
  - Fix issues immediately
  - Maintain test coverage

### Medium Risk Items

**4. Performance Degradation**

- **Risk**: Queries might be slower on PostgreSQL
- **Mitigation**:
  - Add appropriate indexes
  - Use connection pooling
  - Optimize queries
  - Benchmark performance

**5. Deployment Issues**

- **Risk**: Production deployment might fail
- **Mitigation**:
  - Test deployment locally
  - Use staging environment
  - Have rollback plan ready
  - Monitor after deployment

---

## Rollback Plan

If migration fails or issues arise:

1. **Immediate Rollback**

   ```bash
   # Restore schema.prisma
   git checkout prisma/schema.prisma

   # Restore .env
   git checkout .env

   # Regenerate Prisma client
   npx prisma generate

   # Restart application
   npm run dev
   ```

2. **Data Recovery**

   - SQLite database backup at: `prisma/dev.db.backup`
   - JSON export at: `data-export.json`
   - Restore from backup if needed

3. **Verification**
   - Run all tests
   - Verify application functionality
   - Check data integrity

---

## Success Criteria

- [ ] All 157 tests passing with PostgreSQL
- [ ] All data migrated successfully
- [ ] No data loss or corruption
- [ ] Application performance maintained or improved
- [ ] Documentation updated
- [ ] Deployment configuration ready
- [ ] Team trained on PostgreSQL operations

---

## Timeline Estimate

| Task                  | Duration      | Dependencies |
| --------------------- | ------------- | ------------ |
| 6.1 Environment Setup | 30 min        | None         |
| 6.2 Schema Updates    | 45 min        | 6.1          |
| 6.3 Data Migration    | 1 hour        | 6.2          |
| 6.4 Code Updates      | 30 min        | 6.3          |
| 6.5 Testing           | 1.5 hours     | 6.4          |
| 6.6 Deployment Prep   | 45 min        | 6.5          |
| 6.7 Documentation     | 30 min        | 6.6          |
| **Total**             | **5.5 hours** |              |

**Buffer**: +30 minutes for unexpected issues  
**Total with Buffer**: **6 hours**

---

## Post-Migration Tasks

### Week 1

- [ ] Monitor application performance
- [ ] Check for any errors or issues
- [ ] Gather user feedback
- [ ] Optimize queries if needed

### Week 2

- [ ] Review database performance metrics
- [ ] Optimize indexes if needed
- [ ] Update documentation based on learnings
- [ ] Remove SQLite dependencies

### Month 1

- [ ] Evaluate PostgreSQL benefits
- [ ] Consider advanced PostgreSQL features
- [ ] Plan for scaling if needed
- [ ] Archive SQLite backups

---

## Resources

### Documentation

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### Tools

- **pgAdmin**: PostgreSQL administration tool
- **Prisma Studio**: Database GUI
- **DBeaver**: Universal database tool

### Support

- Prisma Discord: https://pris.ly/discord
- PostgreSQL Community: https://www.postgresql.org/community/

---

## Notes

- Keep SQLite database backup for at least 1 month after migration
- Monitor PostgreSQL logs for first week
- Consider setting up automated backups
- Document any PostgreSQL-specific optimizations
- Update team on new database operations

---

**Created**: October 19, 2025  
**Status**: Ready for Implementation  
**Priority**: Medium  
**Estimated Completion**: 1 day
