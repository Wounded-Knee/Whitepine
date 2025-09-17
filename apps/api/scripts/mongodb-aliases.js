// MongoDB Aliases for mongosh
// Usage: mongosh --file mongodb-aliases.js

// Collection shortcuts
var nodes = function() { return db.getCollection('nodes'); };
var users = function() { return db.getCollection('users'); };

// Common queries
var findAll = function(collectionName) { 
  return db.getCollection(collectionName).find().toArray(); 
};

var countAll = function(collectionName) { 
  return db.getCollection(collectionName).countDocuments(); 
};

// Node-specific shortcuts
var findNodes = function() { 
  return db.getCollection('nodes').find().toArray(); 
};

var countNodes = function() { 
  return db.getCollection('nodes').countDocuments(); 
};

var findNodeById = function(id) { 
  return db.getCollection('nodes').findOne({_id: ObjectId(id)}); 
};

var deleteNode = function(id) { 
  return db.getCollection('nodes').deleteOne({_id: ObjectId(id)}); 
};

// Utility functions
var showCollections = function() { 
  return db.listCollections().toArray(); 
};

var showStats = function() { 
  return db.stats(); 
};

// Quick helpers
var help = function() {
  print('Available aliases:');
  print('- nodes() - Get nodes collection');
  print('- findAll("collectionName") - Find all documents in collection');
  print('- countAll("collectionName") - Count documents in collection');
  print('- findNodes() - Find all nodes');
  print('- countNodes() - Count all nodes');
  print('- findNodeById("id") - Find specific node by ID');
  print('- deleteNode("id") - Delete node by ID');
  print('- showCollections() - List all collections');
  print('- showStats() - Show database stats');
  print('- help() - Show this help');
};

// Show welcome message
print('✅ MongoDB aliases loaded! Type help() to see available shortcuts');
print('');
