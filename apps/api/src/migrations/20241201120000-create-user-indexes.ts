import { Db } from 'mongodb';

/**
 * Create indexes for users collection
 * Separated from data operations for better performance
 */
export const up = async (db: Db): Promise<void> => {
  const usersCollection = db.collection('users');
  
  // Create compound index for email + status queries
  await usersCollection.createIndex(
    { email: 1, status: 1 },
    { 
      name: 'email_status_idx',
      unique: true,
      partialFilterExpression: { email: { $exists: true } }
    }
  );
  
  // Create index for Google OAuth ID lookups
  await usersCollection.createIndex(
    { 'auth.googleId': 1 },
    { 
      name: 'google_id_idx',
      sparse: true // Only index documents that have googleId
    }
  );
  
  // Create index for user creation date (for analytics)
  await usersCollection.createIndex(
    { createdAt: 1 },
    { name: 'created_at_idx' }
  );
  
  console.log('✅ Created user indexes');
};

export const down = async (db: Db): Promise<void> => {
  const usersCollection = db.collection('users');
  
  await usersCollection.dropIndex('email_status_idx');
  await usersCollection.dropIndex('google_id_idx');
  await usersCollection.dropIndex('created_at_idx');
  
  console.log('✅ Dropped user indexes');
};
