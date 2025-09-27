import { Db } from 'mongodb';

/**
 * Create TTL index for tokens collection
 * Tokens expire after 24 hours for security
 */
export const up = async (db: Db): Promise<void> => {
  const tokensCollection = db.collection('tokens');
  
  // Create TTL index on createdAt field - tokens expire after 24 hours
  await tokensCollection.createIndex(
    { createdAt: 1 },
    { 
      name: 'tokens_ttl_idx',
      expireAfterSeconds: 86400 // 24 hours in seconds
    }
  );
  
  // Create index for token lookup by token value
  await tokensCollection.createIndex(
    { token: 1 },
    { 
      name: 'token_value_idx',
      unique: true
    }
  );
  
  // Create compound index for user token queries
  await tokensCollection.createIndex(
    { userId: 1, type: 1, createdAt: -1 },
    { name: 'user_token_type_idx' }
  );
  
  // Create index for token type filtering
  await tokensCollection.createIndex(
    { type: 1, createdAt: -1 },
    { name: 'token_type_idx' }
  );
  
  console.log('✅ Created token TTL and lookup indexes');
};

export const down = async (db: Db): Promise<void> => {
  const tokensCollection = db.collection('tokens');
  
  await tokensCollection.dropIndex('tokens_ttl_idx');
  await tokensCollection.dropIndex('token_value_idx');
  await tokensCollection.dropIndex('user_token_type_idx');
  await tokensCollection.dropIndex('token_type_idx');
  
  console.log('✅ Dropped token indexes');
};
