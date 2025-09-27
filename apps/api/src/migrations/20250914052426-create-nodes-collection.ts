import { Db } from 'mongodb';

/**
 * create-nodes-collection
 * Created: 2025-09-14T12:24:26.423Z
 * 
 * Creates the nodes collection with proper indexes for polymorphic node support.
 * This collection will store all node types using Mongoose discriminators.
 */

export const up = async (db: Db): Promise<void> => {
  const collection = db.collection('nodes');
  
  // Create indexes for efficient querying
  const indexes = [
    // Primary discriminator index
    { key: { kind: 1 }, name: 'kind_1' },
    
    // Timestamp indexes
    { key: { createdAt: 1 }, name: 'createdAt_1' },
    { key: { updatedAt: 1 }, name: 'updatedAt_1' },
    
    // Soft delete index
    { key: { deletedAt: 1 }, name: 'deletedAt_1' },
    
    // User reference indexes
    { key: { createdBy: 1 }, name: 'createdBy_1' },
    { key: { updatedBy: 1 }, name: 'updatedBy_1' },
    { key: { ownerId: 1 }, name: 'ownerId_1' },
    
    // Compound indexes for common query patterns
    { key: { kind: 1, deletedAt: 1 }, name: 'kind_1_deletedAt_1' },
    { key: { createdBy: 1, createdAt: -1 }, name: 'createdBy_1_createdAt_-1' },
    { key: { deletedAt: 1, kind: 1, createdAt: -1 }, name: 'deletedAt_1_kind_1_createdAt_-1' },
  ];
  
  // Create all indexes
  for (const index of indexes) {
    try {
      const options: any = { name: index.name };
      if ('unique' in index) options.unique = index.unique;
      if ('sparse' in index) options.sparse = index.sparse;
      
      await collection.createIndex(index.key, options);
      console.log(`✅ Created index: ${index.name}`);
    } catch (error) {
      console.error(`❌ Failed to create index ${index.name}:`, error);
      throw error;
    }
  }
  
  console.log('✅ Nodes collection and indexes created successfully');
};

export const down = async (db: Db): Promise<void> => {
  const collection = db.collection('nodes');
  
  // Drop all indexes except the default _id index
  const indexes = [
    'kind_1',
    'createdAt_1',
    'updatedAt_1', 
    'deletedAt_1',
    'createdBy_1',
    'updatedBy_1',
    'ownerId_1',
    'kind_1_deletedAt_1',
    'createdBy_1_createdAt_-1',
    'deletedAt_1_kind_1_createdAt_-1',
  ];
  
  for (const indexName of indexes) {
    try {
      await collection.dropIndex(indexName);
      console.log(`✅ Dropped index: ${indexName}`);
    } catch (error) {
      console.log(`⚠️  Index ${indexName} may not exist:`, (error as Error).message);
    }
  }
  
  // Drop the collection
  try {
    await collection.drop();
    console.log('✅ Nodes collection dropped');
  } catch (error) {
    console.log('⚠️  Collection may not exist:', (error as Error).message);
  }
  
  console.log('✅ Migration rolled back');
};
