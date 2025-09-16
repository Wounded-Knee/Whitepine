'use client';

import React, { useState, useEffect } from 'react';
import { BaseNodeView } from './BaseNode';
import { useNodeRequest } from '@web/hooks/useNodeRequest';
import { Button } from '@web/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { Badge } from '@web/components/ui/badge';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@web/components/ui/tabs';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface GetRelativesTestProps {
  nodeId: string;
}

interface TestResult {
  name: string;
  selector: any;
  result: any[];
  expected?: string;
  passed?: boolean;
  error?: string;
}

/**
 * Comprehensive test component for the getRelatives() function
 */
export const GetRelativesTest: React.FC<GetRelativesTestProps> = ({ nodeId }) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [customSelector, setCustomSelector] = useState('{"kind": "user"}');
  const [customResult, setCustomResult] = useState<any[]>([]);
  const [customError, setCustomError] = useState<string | null>(null);

  const { node, relatives, getRelatives, isLoading, error } = useNodeRequest(nodeId);

  // Run comprehensive tests when relatives data changes
  useEffect(() => {
    if (!getRelatives || !relatives) return;

    const runTests = () => {
      const results: TestResult[] = [];

      try {
        // Test 1: Get all relatives
        results.push({
          name: 'Get All Relatives',
          selector: {},
          result: getRelatives({}),
          expected: `Should return all ${relatives.length} relatives`
        });

        // Test 2: Filter by kind
        results.push({
          name: 'Filter by Kind (user)',
          selector: { kind: 'user' },
          result: getRelatives({ kind: 'user' }),
          expected: 'Should return only user nodes'
        });

        // Test 3: Filter by kind with wildcard
        results.push({
          name: 'Filter by Kind (wildcard)',
          selector: { kind: '*' },
          result: getRelatives({ kind: '*' }),
          expected: `Should return all ${relatives.length} relatives`
        });

        // Test 4: Filter by relationship type
        results.push({
          name: 'Filter by Relationship Type (synaptic)',
          selector: { relationshipType: 'synaptic' },
          result: getRelatives({ relationshipType: 'synaptic' }),
          expected: 'Should return only synaptic connections'
        });

        // Test 5: Filter by attribute
        results.push({
          name: 'Filter by Attribute (createdBy)',
          selector: { attribute: 'createdBy' },
          result: getRelatives({ attribute: 'createdBy' }),
          expected: 'Should return nodes referenced by createdBy'
        });

        // Test 6: Synaptic filtering by role
        results.push({
          name: 'Synaptic Filter by Role (author)',
          selector: { synaptic: { role: 'author' } },
          result: getRelatives({ synaptic: { role: 'author' } }),
          expected: 'Should return synapses with author role'
        });

        // Test 7: Synaptic filtering by direction
        results.push({
          name: 'Synaptic Filter by Direction (out)',
          selector: { synaptic: { dir: 'out' } },
          result: getRelatives({ synaptic: { dir: 'out' } }),
          expected: 'Should return outgoing synapses'
        });

        // Test 8: Synaptic filtering by direction (in)
        results.push({
          name: 'Synaptic Filter by Direction (in)',
          selector: { synaptic: { dir: 'in' } },
          result: getRelatives({ synaptic: { dir: 'in' } }),
          expected: 'Should return incoming synapses'
        });

        // Test 9: Synaptic filtering by direction (undirected)
        results.push({
          name: 'Synaptic Filter by Direction (undirected)',
          selector: { synaptic: { dir: 'undirected' } },
          result: getRelatives({ synaptic: { dir: 'undirected' } }),
          expected: 'Should return undirected synapses'
        });

        // Test 10: Custom filter function
        results.push({
          name: 'Custom Filter (active users)',
          selector: { filter: (r: any) => r.kind === 'user' && r.isActive },
          result: getRelatives({ filter: (r: any) => r.kind === 'user' && r.isActive }),
          expected: 'Should return only active user nodes'
        });

        // Test 11: Complex selector (synaptic + kind)
        results.push({
          name: 'Complex Selector (synaptic + kind)',
          selector: { synaptic: { role: '*' }, kind: 'user' },
          result: getRelatives({ synaptic: { role: '*' }, kind: 'user' }),
          expected: 'Should return user nodes connected via synapses'
        });

        // Test 12: Non-existent kind
        results.push({
          name: 'Non-existent Kind',
          selector: { kind: 'nonexistent' },
          result: getRelatives({ kind: 'nonexistent' }),
          expected: 'Should return empty array'
        });

        // Test 13: Non-existent role
        results.push({
          name: 'Non-existent Role',
          selector: { synaptic: { role: 'nonexistent' } },
          result: getRelatives({ synaptic: { role: 'nonexistent' } }),
          expected: 'Should return empty array'
        });

        setTestResults(results);
      } catch (error) {
        console.error('Error running getRelatives tests:', error);
        setTestResults([{
          name: 'Test Suite Error',
          selector: {},
          result: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        }]);
      }
    };

    runTests();
  }, [getRelatives, relatives]);

  // Handle custom selector test
  const testCustomSelector = () => {
    try {
      setCustomError(null);
      const selector = JSON.parse(customSelector);
      const result = getRelatives(selector);
      setCustomResult(result);
    } catch (error) {
      setCustomError(error instanceof Error ? error.message : 'Invalid JSON');
      setCustomResult([]);
    }
  };

  const getTestIcon = (result: TestResult) => {
    if (result.error) return <XCircle className="w-4 h-4 text-red-500" />;
    if (result.result.length === 0 && result.name.includes('Non-existent')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (result.result.length > 0) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>getRelatives() Function Test</CardTitle>
          <CardDescription>Loading node and relatives data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">getRelatives() Function Test</CardTitle>
          <CardDescription>Error loading node data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!node) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>getRelatives() Function Test</CardTitle>
          <CardDescription>Node not found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>getRelatives() Function Test</span>
          </CardTitle>
          <CardDescription>
            Testing the getRelatives function with node: {node._id} ({node.kind})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Node ID:</strong> {node._id}
            </div>
            <div>
              <strong>Node Kind:</strong> {node.kind}
            </div>
            <div>
              <strong>Total Relatives:</strong> {relatives?.length || 0}
            </div>
            <div>
              <strong>Created By:</strong> {node.createdBy?.toString() || 'None'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="custom">Custom Test</TabsTrigger>
          <TabsTrigger value="data">Raw Data</TabsTrigger>
        </TabsList>

        {/* Test Results Tab */}
        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Test Results</CardTitle>
              <CardDescription>
                {testResults.length} tests run automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getTestIcon(result)}
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <Badge variant={result.result.length > 0 ? "default" : "secondary"}>
                        {result.result.length} results
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Selector:</strong> <code className="bg-gray-100 px-1 rounded">
                        {JSON.stringify(result.selector)}
                      </code>
                    </div>
                    
                    {result.expected && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Expected:</strong> {result.expected}
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="text-sm text-red-600 mb-2">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    
                    {result.result.length > 0 && (
                      <div className="text-sm">
                        <strong>Results:</strong>
                        <div className="mt-1 space-y-1">
                          {result.result.slice(0, 3).map((item, i) => (
                            <div key={i} className="bg-gray-50 p-2 rounded text-xs">
                              <div><strong>ID:</strong> {item._id}</div>
                              <div><strong>Kind:</strong> {item.kind}</div>
                              {item.role && <div><strong>Role:</strong> {item.role}</div>}
                              {item._relationshipType && <div><strong>Type:</strong> {item._relationshipType}</div>}
                            </div>
                          ))}
                          {result.result.length > 3 && (
                            <div className="text-gray-500 text-xs">
                              ... and {result.result.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Test Tab */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Selector Test</CardTitle>
              <CardDescription>
                Test your own selector against the getRelatives function
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-selector">Selector (JSON)</Label>
                <Input
                  id="custom-selector"
                  value={customSelector}
                  onChange={(e) => setCustomSelector(e.target.value)}
                  placeholder='{"kind": "user"}'
                />
              </div>
              
              <Button onClick={testCustomSelector}>
                Test Selector
              </Button>
              
              {customError && (
                <div className="text-red-600 text-sm">
                  <strong>Error:</strong> {customError}
                </div>
              )}
              
              {customResult.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Results ({customResult.length})</h4>
                  <div className="space-y-2">
                    {customResult.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                        <div><strong>ID:</strong> {item._id}</div>
                        <div><strong>Kind:</strong> {item.kind}</div>
                        {item.name && <div><strong>Name:</strong> {item.name}</div>}
                        {item.role && <div><strong>Role:</strong> {item.role}</div>}
                        {item._relationshipType && <div><strong>Type:</strong> {item._relationshipType}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Raw Data Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Raw Relatives Data</CardTitle>
              <CardDescription>
                All relatives data for debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(relatives, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GetRelativesTest;
