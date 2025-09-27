import { Db } from 'mongodb';

/**
 * Create indexes for audit log collection
 * Optimized for common audit query patterns
 */
export const up = async (db: Db): Promise<void> => {
  const auditLogsCollection = db.collection('auditLogs');
  
  // Create compound index for user activity queries
  await auditLogsCollection.createIndex(
    { userId: 1, timestamp: -1 },
    { name: 'user_activity_idx' }
  );
  
  // Create index for action type filtering
  await auditLogsCollection.createIndex(
    { action: 1, timestamp: -1 },
    { name: 'action_type_idx' }
  );
  
  // Create index for IP address tracking
  await auditLogsCollection.createIndex(
    { ipAddress: 1, timestamp: -1 },
    { name: 'ip_address_idx' }
  );
  
  // Create index for resource-based queries
  await auditLogsCollection.createIndex(
    { resourceType: 1, resourceId: 1, timestamp: -1 },
    { name: 'resource_activity_idx' }
  );
  
  // Create TTL index for audit log retention (90 days)
  await auditLogsCollection.createIndex(
    { timestamp: 1 },
    { 
      name: 'audit_logs_ttl_idx',
      expireAfterSeconds: 7776000 // 90 days in seconds
    }
  );
  
  console.log('✅ Created audit log indexes');
};

export const down = async (db: Db): Promise<void> => {
  const auditLogsCollection = db.collection('auditLogs');
  
  await auditLogsCollection.dropIndex('user_activity_idx');
  await auditLogsCollection.dropIndex('action_type_idx');
  await auditLogsCollection.dropIndex('ip_address_idx');
  await auditLogsCollection.dropIndex('resource_activity_idx');
  await auditLogsCollection.dropIndex('audit_logs_ttl_idx');
  
  console.log('✅ Dropped audit log indexes');
};
