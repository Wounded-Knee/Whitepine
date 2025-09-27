import { Db, IndexSpecification } from 'mongodb';

/**
 * Migration utilities for common operations
 */

export interface TTLIndexOptions {
  /** TTL duration in seconds (default: 86400 = 24 hours) */
  expireAfterSeconds?: number;
  /** Index name */
  name?: string;
}

export interface StandardIndexOptions {
  /** Index name */
  name?: string;
  /** Whether index should be unique */
  unique?: boolean;
  /** Whether index should be sparse */
  sparse?: boolean;
  /** Partial filter expression */
  partialFilterExpression?: Record<string, any>;
}

/**
 * Create a TTL index with standard 24-hour expiration
 */
export const createTTLIndex = async (
  db: Db,
  collectionName: string,
  field: string,
  options: TTLIndexOptions = {}
): Promise<void> => {
  const collection = db.collection(collectionName);
  const indexSpec: IndexSpecification = {
    [field]: 1
  };
  
  const indexOptions = {
    name: options.name || `${collectionName}_${field}_ttl_idx`,
    expireAfterSeconds: options.expireAfterSeconds || 86400, // 24 hours
  };
  
  await collection.createIndex(indexSpec, indexOptions);
  console.log(`✅ Created TTL index on ${collectionName}.${field}`);
};

/**
 * Create a standard index with common options
 */
export const createStandardIndex = async (
  db: Db,
  collectionName: string,
  fields: Record<string, 1 | -1>,
  options: StandardIndexOptions = {}
): Promise<void> => {
  const collection = db.collection(collectionName);
  const indexSpec: IndexSpecification = fields;
  
  const indexOptions: any = {
    name: options.name || `${collectionName}_${Object.keys(fields).join('_')}_idx`,
  };
  
  if (options.unique) indexOptions.unique = true;
  if (options.sparse) indexOptions.sparse = true;
  if (options.partialFilterExpression) indexOptions.partialFilterExpression = options.partialFilterExpression;
  
  await collection.createIndex(indexSpec, indexOptions);
  console.log(`✅ Created index on ${collectionName}: ${Object.keys(fields).join(', ')}`);
};

/**
 * Drop an index by name
 */
export const dropIndex = async (
  db: Db,
  collectionName: string,
  indexName: string
): Promise<void> => {
  const collection = db.collection(collectionName);
  await collection.dropIndex(indexName);
  console.log(`✅ Dropped index ${indexName} from ${collectionName}`);
};

/**
 * Check if an index exists
 */
export const indexExists = async (
  db: Db,
  collectionName: string,
  indexName: string
): Promise<boolean> => {
  const collection = db.collection(collectionName);
  const indexes = await collection.indexes();
  return indexes.some(index => index.name === indexName);
};

/**
 * Get all indexes for a collection
 */
export const getIndexes = async (
  db: Db,
  collectionName: string
): Promise<any[]> => {
  const collection = db.collection(collectionName);
  return await collection.indexes();
};

/**
 * Common TTL durations
 */
export const TTL_DURATIONS = {
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000, // 30 days
  QUARTER: 7776000, // 90 days
  YEAR: 31536000, // 365 days
} as const;
