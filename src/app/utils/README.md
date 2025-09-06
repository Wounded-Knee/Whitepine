# OpenAI Utility Functions

This directory contains utility functions for interacting with the OpenAI API, built specifically for the Whitepine Full-Stack Application.

## Files

- `openaiUtils.ts` - Main utility functions for OpenAI API interactions
- `openaiExample.ts` - Comprehensive examples of how to use the utilities
- `README.md` - This documentation file

## Setup

### 1. Environment Configuration

Add your OpenAI API key to your environment variables:

```bash
# In your .env file
OPENAI_API_KEY=your-actual-openai-api-key-here
```

### 2. Dependencies

The utility uses `axios` which is already included in the project dependencies.

## Main Functions

### `executeOpenAIQuery(query, systemPrompt?, config?)`

Executes a query and returns the full OpenAI API response.

**Parameters:**
- `query` (string): The user's question or prompt
- `systemPrompt` (string, optional): Context-setting system message
- `config` (object, optional): Configuration overrides

**Returns:** Promise<OpenAIResponse> - Full API response with metadata

**Example:**
```typescript
import { executeOpenAIQuery } from './openaiUtils';

const response = await executeOpenAIQuery(
  "What is democracy?",
  "You are a political science expert."
);

console.log(response.choices[0].message.content);
console.log(`Tokens used: ${response.usage.total_tokens}`);
```

### `getOpenAIResponse(query, systemPrompt?, config?)`

Simplified function that returns just the response text.

**Returns:** Promise<string> - Just the response content

**Example:**
```typescript
import { getOpenAIResponse } from './openaiUtils';

const answer = await getOpenAIResponse(
  "Explain the electoral college",
  "You are a helpful civics teacher."
);

console.log(answer);
```

### `executeOpenAIQueryStream(query, systemPrompt?, config?, onChunk?)`

Streams the response in real-time chunks.

**Parameters:**
- `onChunk` (function): Callback for each text chunk received

**Example:**
```typescript
import { executeOpenAIQueryStream } from './openaiUtils';

let fullResponse = '';
await executeOpenAIQueryStream(
  "Tell me a story",
  "You are a storyteller",
  {},
  (chunk) => {
    fullResponse += chunk;
    process.stdout.write(chunk); // Print as it arrives
  }
);
```

## Configuration Options

All functions accept a configuration object with these options:

```typescript
{
  model: 'gpt-3.5-turbo-0125',  // Model to use (default: cheapest available)
  temperature: 0.7,              // Creativity (0-2)
  max_tokens: 1000,              // Maximum response length
  top_p: 1,                      // Nucleus sampling
  frequency_penalty: 0,          // Reduce repetition
  presence_penalty: 0            // Encourage new topics
}
```

**Cost Optimization:** The utility defaults to `gpt-3.5-turbo-0125`, which is currently the most cost-effective model at $0.50/$1.50 per 1M tokens (input/output).

## Utility Functions

### `formatTokens(tokens)`

Formats token counts for display (e.g., "1.5k" for 1500 tokens).

### `estimateCost(promptTokens, completionTokens, model)`

Estimates the cost of an API request in USD.

## Error Handling

The utilities provide comprehensive error handling:

- **Configuration Errors**: Missing API key
- **API Errors**: OpenAI service errors
- **Network Errors**: Connection issues
- **General Errors**: Unexpected issues

All errors include descriptive messages for debugging.

## Usage Examples

See `openaiExample.ts` for comprehensive examples including:

1. Basic query execution
2. Simple response extraction
3. Custom configuration
4. Streaming responses
5. Conversation context
6. Error handling
7. Batch processing
8. Cost estimation

## Best Practices

1. **Always handle errors** with try-catch blocks
2. **Use system prompts** to set context and tone
3. **Monitor token usage** to control costs
4. **Implement rate limiting** for production use
5. **Cache responses** when appropriate
6. **Validate inputs** before sending to API

## Security Considerations

- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Implement proper input validation
- Consider implementing rate limiting
- Monitor API usage for unusual patterns

## FREE Tier Compliance

The utility is optimized for OpenAI's FREE tier limitations:

- **Rate Limits**: 3 requests per minute, 200 requests per day
- **Token Limits**: 15,000 tokens per minute, 40,000 tokens per day
- **Model Limits**: Maximum 4,096 tokens per request
- **Automatic Rate Limiting**: Built-in protection against exceeding limits

### Rate Limit Monitoring

```typescript
import { getRateLimitStatus } from './openaiUtils';

const status = getRateLimitStatus();
console.log(`Requests this minute: ${status.currentMinute.requests}/${status.currentMinute.limit}`);
console.log(`Requests today: ${status.currentDay.requests}/${status.currentDay.limit}`);
```

## Cost Management

The utility includes cost estimation functions to help manage API expenses:

```typescript
import { estimateCost } from './openaiUtils';

const cost = estimateCost(100, 200, 'gpt-3.5-turbo-0125');
console.log(`Estimated cost: $${cost.toFixed(4)}`);
```

### Current Model Pricing (per 1M tokens)

| Model | Input Cost | Output Cost | Best For |
|-------|------------|-------------|----------|
| **gpt-3.5-turbo-0125** | **$0.50** | **$1.50** | **Cost-conscious applications** |
| gpt-3.5-turbo | $1.50 | $2.00 | General purpose |
| gpt-4o-mini | $0.15 | $0.60 | High-quality, low-cost |
| gpt-4o | $5.00 | $15.00 | Advanced reasoning |
| gpt-4-turbo | $10.00 | $30.00 | Complex tasks |
| gpt-4 | $30.00 | $60.00 | Maximum capability |

**Recommendation:** Use `gpt-3.5-turbo-0125` for most applications to minimize costs while maintaining good quality.

## Integration with Project

This utility follows the project's coding standards:

- TypeScript with proper interfaces
- ES6+ syntax and async/await
- Comprehensive error handling
- Environment variable configuration
- Consistent naming conventions
- Full JSDoc documentation

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY not set"**
   - Check your `.env` file
   - Ensure the variable name is correct
   - Restart your development server

2. **"Network Error"**
   - Check internet connection
   - Verify OpenAI service status
   - Check firewall/proxy settings

3. **"OpenAI API Error"**
   - Check API key validity
   - Verify account has credits
   - Check rate limits

### Getting Help

- Check OpenAI's official documentation
- Review error messages for specific details
- Use the example functions as reference
- Check the project's error logs
