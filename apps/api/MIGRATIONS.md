# Database Migrations Setup

This document describes the migrate-mongo setup for TypeScript-authored, CJS-built migrations in the API application.

## Overview

- **Migration Authoring**: TypeScript files in `src/migrations/`
- **Migration Execution**: CommonJS files in `migrations/` (built by tsup)
- **Migration Tool**: migrate-mongo
- **Build Tool**: tsup with separate configuration

## File Structure

```
apps/api/
├── src/migrations/           # TypeScript migration sources
│   ├── README.md            # Migration conventions and guidelines
│   ├── template.ts          # Migration template
│   ├── utils.ts             # Migration utilities
│   └── *.ts                 # Timestamped migration files
├── migrations/              # Built CJS migrations (generated)
│   └── *.cjs               # Compiled migration files
├── config/
│   └── migrate-mongo-config.js  # migrate-mongo configuration
├── tsup.migrations.config.ts    # tsup config for migrations
└── src/scripts/
    └── migration-helper.ts      # Migration management script
```

## Migration Conventions

### File Naming
- **Format**: `YYYYMMDDHHMMSS-description.ts`
- **Example**: `20241201120000-create-user-indexes.ts`

### Best Practices
1. **Separate index creation from data operations**
2. **Use TTL indexes (24h) for ephemeral data** (sessions, tokens)
3. **Keep migrations atomic and focused**
4. **Always include both `up` and `down` methods**
5. **Test migrations on development data first**

### TTL Index Guidelines
- **Sessions**: 24 hours TTL
- **Tokens**: 24 hours TTL
- **Temporary data**: 24 hours TTL
- **Audit logs**: 90 days TTL (configurable)

## Available Scripts

### Migration Management
```bash
# Build migrations to CJS format
pnpm run build:migrations

# Create new migration
pnpm run migrate:create "description"

# List all migrations
pnpm run migrate:list

# Show migration helper usage
pnpm run migrate:helper
```

### Migration Execution
```bash
# Run migrations (development)
pnpm run migrate:dev

# Run migrations (production)
pnpm run migrate:prod

# Check migration status
pnpm run migrate:status

# Rollback last migration
pnpm run migrate:down
```

## Example Migrations

### Index Creation
```typescript
import { Db } from 'mongodb';

export const up = async (db: Db): Promise<void> => {
  const collection = db.collection('users');
  
  // Create compound index
  await collection.createIndex(
    { email: 1, status: 1 },
    { name: 'email_status_idx', unique: true }
  );
  
  // Create TTL index (24 hours)
  await collection.createIndex(
    { createdAt: 1 },
    { 
      name: 'users_ttl_idx',
      expireAfterSeconds: 86400
    }
  );
};
```

### Data Migration
```typescript
import { Db } from 'mongodb';

export const up = async (db: Db): Promise<void> => {
  const collection = db.collection('users');
  
  // Add default values
  await collection.updateMany(
    { status: { $exists: false } },
    { $set: { status: 'active' } }
  );
};
```

## Configuration

### migrate-mongo Config (`config/migrate-mongo-config.js`)
- **Database**: Uses `MONGODB_URI` environment variable
- **Migrations Directory**: `migrations/`
- **Changelog Collection**: `changelog`
- **Module System**: CommonJS

### tsup Config (`tsup.migrations.config.ts`)
- **Entry**: `src/migrations/*.ts`
- **Output Format**: CommonJS
- **Output Directory**: `migrations/`
- **Target**: Node.js 18
- **External Dependencies**: `mongodb`

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)

## Migration Utilities

The `utils.ts` file provides helper functions for common migration operations:

- `createTTLIndex()`: Create TTL indexes with standard durations
- `createStandardIndex()`: Create standard indexes with options
- `dropIndex()`: Drop indexes by name
- `indexExists()`: Check if an index exists
- `getIndexes()`: Get all indexes for a collection
- `TTL_DURATIONS`: Common TTL duration constants

## Workflow

1. **Create Migration**: `pnpm run migrate:create "description"`
2. **Edit Migration**: Modify the generated TypeScript file
3. **Build Migrations**: `pnpm run build:migrations`
4. **Test Migration**: `pnpm run migrate:dev`
5. **Deploy**: `pnpm run migrate:prod`

## Notes

- Migrations are authored in TypeScript but compiled to CommonJS for migrate-mongo compatibility
- The build process preserves TypeScript path aliases
- Template and utility files are excluded from migration execution
- All migrations include proper error handling and logging
