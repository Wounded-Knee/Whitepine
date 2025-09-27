import { Db } from 'mongodb';

/**
 * Example data migration - separate from index creation
 * This demonstrates how to handle schema changes and data backfills
 */
export const up = async (db: Db): Promise<void> => {
  const usersCollection = db.collection('users');
  
  // Example: Add default values for new fields
  const result = await usersCollection.updateMany(
    { 
      // Only update documents that don't have the new fields
      $or: [
        { status: { $exists: false } },
        { lastLoginAt: { $exists: false } },
        { preferences: { $exists: false } }
      ]
    },
    {
      $set: {
        status: 'active',
        lastLoginAt: null,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      }
    }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} user documents with default values`);
  
  // Example: Migrate existing data format
  const legacyUsers = await usersCollection.find({
    'profile.displayName': { $exists: true },
    'profile.firstName': { $exists: false }
  }).toArray();
  
  if (legacyUsers.length > 0) {
    const bulkOps = legacyUsers.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            'profile.firstName': user.profile?.displayName?.split(' ')[0] || '',
            'profile.lastName': user.profile?.displayName?.split(' ').slice(1).join(' ') || ''
          }
        }
      }
    }));
    
    await usersCollection.bulkWrite(bulkOps);
    console.log(`✅ Migrated ${legacyUsers.length} legacy user profiles`);
  }
  
  // Example: Clean up old fields (be careful with this!)
  // await usersCollection.updateMany(
  //   {},
  //   { $unset: { 'oldField': '' } }
  // );
};

export const down = async (db: Db): Promise<void> => {
  const usersCollection = db.collection('users');
  
  // Rollback: Remove the new fields we added
  await usersCollection.updateMany(
    {},
    {
      $unset: {
        status: '',
        lastLoginAt: '',
        preferences: ''
      }
    }
  );
  
  console.log('✅ Rolled back user schema changes');
  
  // Note: We don't rollback the profile name migration as it's not easily reversible
  // In production, you might want to store the original data before migration
};
