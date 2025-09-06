import axios from 'axios';

// Types for OpenAI API
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

// Default configuration - Optimized for FREE tier limitations
const DEFAULT_CONFIG = {
  model: 'gpt-3.5-turbo-0125', // Cheapest model as of 2024
  temperature: 0.7,
  max_tokens: 500, // Reduced for FREE tier (lower token usage)
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

// FREE tier rate limits (as of 2024)
const FREE_TIER_LIMITS = {
  requestsPerMinute: 3,
  requestsPerDay: 200,
  tokensPerMinute: 15000,
  tokensPerDay: 40000,
  maxTokensPerRequest: 4096, // gpt-3.5-turbo-0125 limit
};

/**
 * Execute a query using OpenAI API
 * @param query - The user's query/message
 * @param systemPrompt - Optional system prompt to set context
 * @param config - Optional configuration overrides
 * @returns Promise with the full API response
 */
export async function executeOpenAIQuery(
  query: string,
  systemPrompt?: string,
  config: Partial<OpenAIRequest> = {}
): Promise<OpenAIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  // Check FREE tier rate limits before making request
  const rateLimitCheck = checkRateLimits();
  if (!rateLimitCheck.allowed) {
    if (rateLimitCheck.waitTime) {
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(rateLimitCheck.waitTime / 1000)} seconds before trying again.`);
    } else {
      throw new Error(rateLimitCheck.message || 'Rate limit exceeded.');
    }
  }

  const messages: OpenAIMessage[] = [];
  
  // Add system prompt if provided
  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt
    });
  }
  
  // Add user query
  messages.push({
    role: 'user',
      content: query
  });

  const requestBody: OpenAIRequest = {
    ...DEFAULT_CONFIG,
    ...config,
    messages,
  };

  try {
    const response = await axios.post<OpenAIResponse>(
      'https://api.openai.com/v1/chat/completions',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    // Update rate limit counters on successful request
    updateRequestCounts();
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        const openAIError = error.response.data as OpenAIError;
        throw new Error(`OpenAI API Error: ${openAIError.error.message}`);
      }
      throw new Error(`Network Error: ${error.message}`);
    }
    throw new Error(`Unexpected Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get just the response content from OpenAI (simplified version)
 * @param query - The user's query/message
 * @param systemPrompt - Optional system prompt to set context
 * @param config - Optional configuration overrides
 * @returns Promise with just the response text
 */
export async function getOpenAIResponse(
  query: string,
  systemPrompt?: string,
  config: Partial<OpenAIRequest> = {}
): Promise<string> {
  const response = await executeOpenAIQuery(query, systemPrompt, config);
  return response.choices[0]?.message?.content || 'No response received';
}

/**
 * Execute a query with streaming support (for real-time responses)
 * @param query - The user's query/message
 * @param systemPrompt - Optional system prompt to set context
 * @param config - Optional configuration overrides
 * @param onChunk - Callback function for each chunk received
 * @returns Promise that resolves when streaming is complete
 */
export async function executeOpenAIQueryStream(
  query: string,
  systemPrompt?: string,
  config: Partial<OpenAIRequest> = {},
  onChunk?: (chunk: string) => void
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const messages: OpenAIMessage[] = [];
  
  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt
    });
  }
  
  messages.push({
    role: 'user',
    content: query
  });

  const requestBody: OpenAIRequest = {
    ...DEFAULT_CONFIG,
    ...config,
    messages,
    stream: true,
  };

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
        timeout: 60000, // 60 second timeout for streaming
      }
    );

    const stream = response.data;
    
    stream.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            
            if (content && onChunk) {
              onChunk(content);
            }
          } catch (e) {
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        const openAIError = error.response.data as OpenAIError;
        throw new Error(`OpenAI API Error: ${openAIError.error.message}`);
      }
      throw new Error(`Network Error: ${error.message}`);
    }
    throw new Error(`Unexpected Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Utility function to format tokens for display
 * @param tokens - Number of tokens
 * @returns Formatted string
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }
  return tokens.toString();
}

// Rate limiting utilities for FREE tier compliance
let requestCount = 0;
let lastRequestTime = 0;
let dailyRequestCount = 0;
let lastDailyReset = new Date().getDate();

function resetDailyCount() {
  const today = new Date().getDate();
  if (today !== lastDailyReset) {
    dailyRequestCount = 0;
    lastDailyReset = today;
  }
}

function checkRateLimits(): { allowed: boolean; waitTime?: number; message?: string } {
  resetDailyCount();
  
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  // Check per-minute limit (3 requests per minute)
  if (requestCount >= FREE_TIER_LIMITS.requestsPerMinute) {
    const waitTime = 60000 - timeSinceLastRequest; // Wait until minute resets
    if (waitTime > 0) {
      return { 
        allowed: false, 
        waitTime, 
        message: `Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.` 
      };
    }
    requestCount = 0; // Reset counter
  }
  
  // Check daily limit (200 requests per day)
  if (dailyRequestCount >= FREE_TIER_LIMITS.requestsPerDay) {
    return { 
      allowed: false, 
      message: 'Daily limit exceeded. Try again tomorrow.' 
    };
  }
  
  return { allowed: true };
}

function updateRequestCounts() {
  requestCount++;
  dailyRequestCount++;
  lastRequestTime = Date.now();
}

/**
 * Get current rate limit status for FREE tier
 * @returns Object with current usage and limits
 */
export function getRateLimitStatus() {
  resetDailyCount();
  
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const minutesUntilReset = Math.max(0, 60 - Math.floor(timeSinceLastRequest / 60000));
  
  return {
    currentMinute: {
      requests: requestCount,
      limit: FREE_TIER_LIMITS.requestsPerMinute,
      remaining: Math.max(0, FREE_TIER_LIMITS.requestsPerMinute - requestCount),
      resetInMinutes: minutesUntilReset
    },
    currentDay: {
      requests: dailyRequestCount,
      limit: FREE_TIER_LIMITS.requestsPerDay,
      remaining: Math.max(0, FREE_TIER_LIMITS.requestsPerDay - dailyRequestCount)
    },
    limits: FREE_TIER_LIMITS
  };
}

/**
 * Calculate estimated cost for a request (approximate)
 * @param promptTokens - Number of prompt tokens
 * @param completionTokens - Number of completion tokens
 * @param model - Model name for pricing
 * @returns Estimated cost in USD
 */
export function estimateCost(
  promptTokens: number,
  completionTokens: number,
  model: string = 'gpt-3.5-turbo-0125'
): number {
  // Current pricing as of 2024 (per 1K tokens)
  const pricing: Record<string, { input: number; output: number }> = {
    // Cheapest models first
    'gpt-3.5-turbo-0125': { input: 0.0005, output: 0.0015 }, // $0.50/$1.50 per 1M tokens
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },        // $1.50/$2.00 per 1M tokens
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },         // $0.15/$0.60 per 1M tokens
    'gpt-4o': { input: 0.005, output: 0.015 },                 // $5.00/$15.00 per 1M tokens
    'gpt-4-turbo': { input: 0.01, output: 0.03 },              // $10.00/$30.00 per 1M tokens
    'gpt-4': { input: 0.03, output: 0.06 },                    // $30.00/$60.00 per 1M tokens
  };

  const rates = pricing[model] || pricing['gpt-3.5-turbo-0125']; // Default to cheapest
  
  const inputCost = (promptTokens / 1000) * rates.input;
  const outputCost = (completionTokens / 1000) * rates.output;
  
  return inputCost + outputCost;
}
