# Database Migrations

This directory contains TypeScript-authored database migrations that are compiled to CommonJS for migrate-mongo execution.

## Migration Conventions

### File Naming
- Use timestamped filenames: `YYYYMMDDHHMMSS-description.ts`
- Example: `20241201120000-create-user-indexes.ts`

### Migration Structure
- **Separate index creation from heavy data backfills**
- **Use TTL indexes (24h) for ephemeral data** (sessions, tokens, etc.)
- Keep migrations focused and atomic
- Always include both `up` and `down` methods

### TTL Index Guidelines
- Sessions: 24 hours TTL
- Tokens: 24 hours TTL  
- Temporary data: 24 hours TTL
- Use `expireAfterSeconds: 86400` (24 hours in seconds)

### Index Creation Best Practices
- Create indexes in separate migrations from data operations
- Use compound indexes for common query patterns
- Consider partial indexes for conditional queries
- Always test index performance impact

## Building Migrations

```bash
# Build migrations to CJS format
pnpm run build:migrations

# Create new migration
pnpm run migrate:create -- <description>

# Run migrations (dev)
pnpm run migrate:dev

# Run migrations (prod)
pnpm run migrate:prod

# Check migration status
pnpm run migrate:status

# Rollback last migration
pnpm run migrate:down
```

## Migration Template

```typescript
import { Db } from 'mongodb';

export const up = async (db: Db): Promise<void> => {
  // Migration logic here
};

export const down = async (db: Db): Promise<void> => {
  // Rollback logic here
};
```

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)
