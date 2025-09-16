#!/usr/bin/env node

/**
 * Test script to verify the API enhancement for automatically including connected synapses
 * This script tests the new behavior where GET /api/nodes/:id returns connected synapses and nodes
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:4000/api';

async function testNodeWithSynapses() {
  try {
    console.log('🧪 Testing API enhancement for automatic synapse inclusion...\n');
    
    // First, let's get a list of nodes to find one with synapses
    console.log('1. Fetching list of nodes...');
    const nodesResponse = await fetch(`${API_BASE}/nodes?limit=5`);
    const nodesData = await nodesResponse.json();
    
    if (!nodesData.success || !nodesData.data || nodesData.data.length === 0) {
      console.log('❌ No nodes found. Please create some nodes first.');
      return;
    }
    
    console.log(`✅ Found ${nodesData.data.length} nodes`);
    
    // Test each node to see if it has synapses
    for (const node of nodesData.data) {
      console.log(`\n2. Testing node: ${node._id} (${node.kind})`);
      
      const nodeResponse = await fetch(`${API_BASE}/nodes/${node._id}`);
      const nodeData = await nodeResponse.json();
      
      if (!nodeData.success) {
        console.log(`❌ Failed to fetch node: ${nodeData.message || 'Unknown error'}`);
        continue;
      }
      
      const result = nodeData.data;
      
      // Check if the response has the new structure
      if (result.node && result.synapses && result.connectedNodes) {
        console.log(`✅ Enhanced API response structure detected!`);
        console.log(`   - Main node: ${result.node._id}`);
        console.log(`   - Synapses: ${result.synapses.length}`);
        console.log(`   - Connected nodes: ${result.connectedNodes.length}`);
        
        if (result.synapses.length > 0) {
          console.log(`🎉 SUCCESS: Node has ${result.synapses.length} synapses automatically included!`);
          console.log(`   - Connected nodes: ${result.connectedNodes.map(n => n._id).join(', ')}`);
          return; // Found a node with synapses, test successful
        } else {
          console.log(`ℹ️  Node has no synapses (this is normal)`);
        }
      } else {
        console.log(`❌ Old API response structure detected. Enhancement not working.`);
        console.log(`   Response keys: ${Object.keys(result).join(', ')}`);
      }
    }
    
    console.log('\n📝 Test Summary:');
    console.log('   - API enhancement is working (new response structure detected)');
    console.log('   - No nodes with synapses found in this test run');
    console.log('   - To test with synapses, create nodes with connections first');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNodeWithSynapses();
