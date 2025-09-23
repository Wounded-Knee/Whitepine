import { NextRequest, NextResponse } from 'next/server'

/**
 * Dynamic CORS configuration that works with any port configuration
 */
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  // Get configured ports from environment variables
  const webPort = process.env.DEV_WEB_PORT || '3000'
  const apiPort = process.env.DEV_API_PORT || '5000'
  const hmrPort = process.env.DEV_HMR_PORT || webPort
  
  // Define allowed origins based on environment
  const allowedOrigins = [
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

  // Check if origin is allowed
  const isAllowedOrigin = origin && allowedOrigins.includes(origin)
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
}

export function middleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(request)
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  // For all other requests, add CORS headers
  const response = NextResponse.next()
  const corsHeaders = getCorsHeaders(request)
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match NextAuth routes
    '/api/auth/:path*',
  ],
}
