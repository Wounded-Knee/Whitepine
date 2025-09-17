#!/usr/bin/env node

// Simple MongoDB connection script using the same config as your API
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI_DEV;
const collection = 'nodes';

if (!uri) {
  console.error('Missing MONGODB_URI_DEV in .env.local');
  process.exit(1);
}

console.log('Connecting to MongoDB...');
console.log('URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
console.log('');

const client = new MongoClient(uri);

try {
  await client.connect();
  console.log('✅ Connected to MongoDB successfully!');
  console.log('');
  console.log('Available commands:');
  console.log('- db.listCollections() - List all collections');
  console.log(`- db.collection("${collection}").find() - List all nodes`);
  console.log(`- db.collection("${collection}").deleteOne({_id: ObjectId("68ca022613c8b0337b4a3cdb")}) - Delete corrupted node`);
  console.log(`- db.collection("${collection}").countDocuments() - Count nodes`);
  console.log('');
  console.log('Type "exit" to quit');
  console.log('');

  // Start interactive mode
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'mongodb> '
  });

  // Get the database reference
  const db = client.db();
  console.log('Database:', db.databaseName);
  console.log('');

  // Make db available globally for eval
  global.db = db;

  // Pre-load command aliases
  const aliases = {
    // Collection shortcuts
    nodes: () => db.collection('nodes'),
    users: () => db.collection('users'),
    
    // Common queries
    findAll: (collectionName) => db.collection(collectionName).find().toArray(),
    countAll: (collectionName) => db.collection(collectionName).countDocuments(),
    
    // Node-specific shortcuts
    findNodes: () => db.collection('nodes').find().toArray(),
    countNodes: () => db.collection('nodes').countDocuments(),
    findNodeById: async (id) => db.collection('nodes').findOne({_id: new (await import('mongodb')).ObjectId(id)}),
    deleteNode: async (id) => db.collection('nodes').deleteOne({_id: new (await import('mongodb')).ObjectId(id)}),
    
    // Utility functions
    showCollections: () => db.listCollections().toArray(),
    showStats: () => db.stats(),
    
    // Quick helpers
    help: () => {
      console.log('Available aliases:');
      console.log('- nodes() - Get nodes collection');
      console.log('- findAll("collectionName") - Find all documents in collection');
      console.log('- countAll("collectionName") - Count documents in collection');
      console.log('- findNodes() - Find all nodes');
      console.log('- countNodes() - Count all nodes');
      console.log('- findNodeById("id") - Find specific node by ID (async)');
      console.log('- deleteNode("id") - Delete node by ID (async)');
      console.log('- showCollections() - List all collections');
      console.log('- showStats() - Show database stats');
      console.log('- help() - Show this help');
    }
  };

  // Make aliases available globally
  Object.assign(global, aliases);

  console.log('✅ Aliases loaded! Type "help()" to see available shortcuts');
  console.log('');

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    
    if (input === 'exit' || input === 'quit') {
      rl.close();
      return;
    }

    if (input === '') {
      rl.prompt();
      return;
    }

    try {
      // Create a safe eval context with db available
      const evalContext = {
        db: db,
        ObjectId: (await import('mongodb')).ObjectId
      };
      
      // Execute the command in the safe context
      const func = new Function(...Object.keys(evalContext), `return ${input}`);
      const result = await func(...Object.values(evalContext));
      
      // Handle different result types
      if (result && typeof result.toArray === 'function') {
        // Handle cursors
        const array = await result.toArray();
        console.log(JSON.stringify(array, null, 2));
      } else if (result && typeof result.forEach === 'function') {
        // Handle other iterables
        const array = [];
        await result.forEach(item => array.push(item));
        console.log(JSON.stringify(array, null, 2));
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nGoodbye!');
    client.close();
    process.exit(0);
  });

} catch (error) {
  console.error('Failed to connect to MongoDB:', error.message);
  process.exit(1);
}
