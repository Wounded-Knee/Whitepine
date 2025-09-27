import { Db } from 'mongodb';

/**
 * Migration Template
 * 
 * Copy this file and rename it with a timestamp:
 * YYYYMMDDHHMMSS-description.ts
 * 
 * Example: 20241201120000-create-user-indexes.ts
 */

export const up = async (db: Db): Promise<void> => {
  // Your migration logic here
  
  // Example: Create indexes
  // const collection = db.collection('collectionName');
  // await collection.createIndex({ field: 1 }, { name: 'field_idx' });
  
  // Example: Create TTL index (24 hours)
  // await collection.createIndex(
  //   { createdAt: 1 },
  //   { 
  //     name: 'collection_ttl_idx',
  //     expireAfterSeconds: 86400 // 24 hours
  //   }
  // );
  
  // Example: Data migration
  // await collection.updateMany(
  //   { condition: 'value' },
  //   { $set: { newField: 'newValue' } }
  // );
  
  console.log('✅ Migration completed');
};

export const down = async (db: Db): Promise<void> => {
  // Your rollback logic here
  
  // Example: Drop indexes
  // const collection = db.collection('collectionName');
  // await collection.dropIndex('field_idx');
  
  // Example: Rollback data changes
  // await collection.updateMany(
  //   { newField: { $exists: true } },
  //   { $unset: { newField: '' } }
  // );
  
  console.log('✅ Migration rolled back');
};
