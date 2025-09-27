import { Db } from 'mongodb';

/**
 * Create TTL index for sessions collection
 * Sessions expire after 24 hours for security
 */
export const up = async (db: Db): Promise<void> => {
  const sessionsCollection = db.collection('sessions');
  
  // Create TTL index on createdAt field - sessions expire after 24 hours
  await sessionsCollection.createIndex(
    { createdAt: 1 },
    { 
      name: 'sessions_ttl_idx',
      expireAfterSeconds: 86400 // 24 hours in seconds
    }
  );
  
  // Create index for session lookup by sessionId
  await sessionsCollection.createIndex(
    { sessionId: 1 },
    { 
      name: 'session_id_idx',
      unique: true
    }
  );
  
  // Create index for user session queries
  await sessionsCollection.createIndex(
    { userId: 1, createdAt: -1 },
    { name: 'user_sessions_idx' }
  );
  
  console.log('✅ Created session TTL and lookup indexes');
};

export const down = async (db: Db): Promise<void> => {
  const sessionsCollection = db.collection('sessions');
  
  await sessionsCollection.dropIndex('sessions_ttl_idx');
  await sessionsCollection.dropIndex('session_id_idx');
  await sessionsCollection.dropIndex('user_sessions_idx');
  
  console.log('✅ Dropped session indexes');
};
