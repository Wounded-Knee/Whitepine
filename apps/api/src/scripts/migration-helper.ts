#!/usr/bin/env tsx

/**
 * Migration Helper Script
 * 
 * Usage:
 * pnpm exec tsx src/scripts/migration-helper.ts <command> [args]
 * 
 * Commands:
 * - create <description> - Create a new migration file
 * - list - List all migrations
 * - status - Check migration status
 */

import { execSync } from 'child_process';
import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = 'src/migrations';
const TEMPLATE_FILE = 'src/migrations/template.ts';

function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
}

function createMigration(description: string): void {
  const timestamp = generateTimestamp();
  const filename = `${timestamp}-${description.replace(/\s+/g, '-').toLowerCase()}.ts`;
  const filepath = join(MIGRATIONS_DIR, filename);
  
  // Read template
  const template = `import { Db } from 'mongodb';

/**
 * ${description}
 * Created: ${new Date().toISOString()}
 */

export const up = async (db: Db): Promise<void> => {
  // Your migration logic here
  console.log('✅ Migration completed');
};

export const down = async (db: Db): Promise<void> => {
  // Your rollback logic here
  console.log('✅ Migration rolled back');
};
`;
  
  writeFileSync(filepath, template);
  console.log(`✅ Created migration: ${filename}`);
  console.log(`📝 Edit the file: ${filepath}`);
}

function listMigrations(): void {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.ts') && file !== 'template.ts' && file !== 'utils.ts')
    .sort();
  
  console.log('📋 Available migrations:');
  files.forEach(file => {
    const timestamp = file.substring(0, 14);
    const description = file.substring(15, file.length - 3);
    const date = new Date(
      parseInt(timestamp.substring(0, 4)),
      parseInt(timestamp.substring(4, 6)) - 1,
      parseInt(timestamp.substring(6, 8)),
      parseInt(timestamp.substring(8, 10)),
      parseInt(timestamp.substring(10, 12)),
      parseInt(timestamp.substring(12, 14))
    );
    
    console.log(`  ${file} - ${description} (${date.toISOString()})`);
  });
}

function showStatus(): void {
  try {
    console.log('📊 Migration Status:');
    execSync('pnpm run migrate:status', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to get migration status. Make sure MongoDB is running and configured.');
  }
}

// Main execution
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'create':
    if (!args[0]) {
      console.error('❌ Please provide a description for the migration');
      console.log('Usage: pnpm exec tsx src/scripts/migration-helper.ts create "description"');
      process.exit(1);
    }
    createMigration(args[0]);
    break;
    
  case 'list':
    listMigrations();
    break;
    
  case 'status':
    showStatus();
    break;
    
  default:
    console.log('🔧 Migration Helper');
    console.log('');
    console.log('Usage: pnpm exec tsx src/scripts/migration-helper.ts <command> [args]');
    console.log('');
    console.log('Commands:');
    console.log('  create <description>  Create a new migration file');
    console.log('  list                  List all migrations');
    console.log('  status                Check migration status');
    console.log('');
    console.log('Examples:');
    console.log('  pnpm exec tsx src/scripts/migration-helper.ts create "add user preferences"');
    console.log('  pnpm exec tsx src/scripts/migration-helper.ts list');
    console.log('  pnpm exec tsx src/scripts/migration-helper.ts status');
    break;
}
