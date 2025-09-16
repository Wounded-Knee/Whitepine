'use client';

import React, { useState } from 'react';
import { GetRelativesTest } from '@/components/NodeView/GetRelativesTest';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube } from 'lucide-react';

export default function TestGetRelativesPage() {
  const [nodeId, setNodeId] = useState('');
  const [testNodeId, setTestNodeId] = useState('');

  const handleStartTest = () => {
    if (nodeId.trim()) {
      setTestNodeId(nodeId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="w-6 h-6" />
                <span>getRelatives() Function Test Suite</span>
              </CardTitle>
              <CardDescription>
                Comprehensive testing of the getRelatives function with various selectors and filters.
                This test suite validates the functionality of retrieving and filtering node relationships.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="node-id">Enter Node ID to Test</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="node-id"
                      type="text"
                      placeholder="e.g., 507f1f77bcf86cd799439011"
                      value={nodeId}
                      onChange={(e) => setNodeId(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleStartTest} disabled={!nodeId.trim()}>
                      Start Test
                    </Button>
                  </div>
                </div>
                
                <Alert>
                  <AlertDescription>
                    <strong>Note:</strong> Enter a valid node ID from your database. 
                    The test will fetch the node and all its relatives, then run various 
                    getRelatives() selector tests to validate the function's behavior.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testNodeId && (
            <GetRelativesTest nodeId={testNodeId} />
          )}

          {/* Instructions */}
          {!testNodeId && (
            <Card>
              <CardHeader>
                <CardTitle>Test Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">What This Test Does:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>Fetches a node and all its relatives from the Redux store</li>
                      <li>Tests various getRelatives() selector combinations</li>
                      <li>Validates filtering by kind, relationship type, synaptic properties</li>
                      <li>Tests custom filter functions</li>
                      <li>Provides detailed results and debugging information</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Test Categories:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li><strong>Basic Selectors:</strong> kind, relationshipType, attribute</li>
                      <li><strong>Synaptic Selectors:</strong> role, direction (in/out/undirected)</li>
                      <li><strong>Custom Filters:</strong> JavaScript functions for complex filtering</li>
                      <li><strong>Edge Cases:</strong> Non-existent values, empty results</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Expected Results:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>✅ Green checkmarks for successful tests</li>
                      <li>⚠️ Yellow warnings for edge cases</li>
                      <li>❌ Red X marks for errors or failures</li>
                      <li>Detailed result counts and sample data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
