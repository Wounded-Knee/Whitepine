import { NextRequest, NextResponse } from 'next/server'

/**
 * CORS utility functions for API routes
 */

/**
 * Get allowed origins based on environment configuration
 */
export function getAllowedOrigins(): string[] {
  const webPort = process.env.DEV_WEB_PORT || '3000'
  const apiPort = process.env.DEV_API_PORT || '5000'
  const hmrPort = process.env.DEV_HMR_PORT || webPort
  
  const origins = [
    // Development origins with configured ports
    `http://localhost:${webPort}`,
    `http://127.0.0.1:${webPort}`,
    `http://0.0.0.0:${webPort}`,
    
    // API port origins (if different from web port)
    ...(apiPort !== webPort ? [
      `http://localhost:${apiPort}`,
      `http://127.0.0.1:${apiPort}`,
      `http://0.0.0.0:${apiPort}`,
    ] : []),
    
    // HMR port origins (if different from web port)
    ...(hmrPort !== webPort ? [
      `http://localhost:${hmrPort}`,
      `http://127.0.0.1:${hmrPort}`,
      `http://0.0.0.0:${hmrPort}`,
    ] : []),
    
    // Production origins (if configured)
    ...(process.env.NODE_ENV === 'production' ? [
      process.env.NEXTAUTH_URL || 'https://whitepine.jpkramer.com',
      'https://whitepinedev.jpkramer.com',
    ] : []),
    
    // Additional custom origins from environment
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
  ]

  return origins
}

/**
 * Check if an origin is allowed
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  const allowedOrigins = getAllowedOrigins()
  return allowedOrigins.includes(origin)
}

/**
 * Get CORS headers for a request
 */
export function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = getAllowedOrigins()
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin! : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(request)
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    })
  }
  return null
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const corsHeaders = getCorsHeaders(request)
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

/**
 * Higher-order function to wrap API route handlers with CORS
 */
export function withCors<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Handle preflight requests
    const preflightResponse = handleCorsPreflight(request)
    if (preflightResponse) {
      return preflightResponse
    }

    // Execute the original handler
    const response = await handler(request, ...args)
    
    // Add CORS headers to the response
    return addCorsHeaders(response, request)
  }
}
