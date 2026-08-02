import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabase/env-utils'

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const hostname = request.headers.get('host') || ''
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'
  
  // Strip port if present in hostname (e.g. localhost:3000 -> localhost)
  const hostWithoutPort = hostname.split(':')[0]
  const mainDomainWithoutPort = mainDomain.split(':')[0]

  // 1. Resolve Subdomain or local fallback query parameter
  let slug: string | null = null

  const searchParams = request.nextUrl.searchParams
  const queryOrg = searchParams.get('org')

  if (queryOrg) {
    slug = queryOrg
  } else if (hostWithoutPort === mainDomainWithoutPort || hostWithoutPort === `www.${mainDomainWithoutPort}`) {
    slug = null
  } else if (hostWithoutPort.endsWith(`.${mainDomainWithoutPort}`)) {
    slug = hostWithoutPort.replace(`.${mainDomainWithoutPort}`, '')
  }

  // 2. Fast-path blocks and redirects
  // Block WordPress detection requests
  if (request.nextUrl.pathname.startsWith('/wp-json') ||
      request.nextUrl.pathname.startsWith('/wp-')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Redirect old PNG icon requests to SVG
  const iconRedirects: Record<string, string> = {
    '/apple-touch-icon.png': '/apple-touch-icon.svg',
    '/favicon-16x16.png': '/favicon-16x16.svg',
    '/favicon-32x32.png': '/favicon-32x32.svg',
    '/android-chrome-192x192.png': '/android-chrome-192x192.svg',
    '/android-chrome-512x512.png': '/android-chrome-512x512.svg',
  }
  if (iconRedirects[request.nextUrl.pathname]) {
    const url = request.nextUrl.clone()
    url.pathname = iconRedirects[request.nextUrl.pathname]
    return NextResponse.redirect(url)
  }

  // 3. Initialize Supabase Client with Cookie Syncing
  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getSupabaseAnonKey()

  let user: User | null = null

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabaseClient = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      // Refresh auth session
      const { data } = await supabaseClient.auth.getUser()
      user = data.user
    } catch (err) {
      console.error('Supabase proxy auth refresh failed:', err)
    }
  }

  // Cookie propagation helper
  const withRefreshedCookies = <T extends NextResponse>(response: T): T => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        path: "/",
        ...cookie,
      })
    })
    return response
  }

  const pathname = request.nextUrl.pathname

  // 4. Auth pages - redirect to dashboard if already logged in
  if (user && (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password'
  )) {
    const url = request.nextUrl.clone()
    const inviteToken = searchParams.get('invite')
    if (inviteToken && (pathname === '/login' || pathname === '/signup')) {
      url.pathname = `/join/${encodeURIComponent(inviteToken)}`
      url.search = ''
    } else {
      url.pathname = '/dashboard'
      url.search = ''
    }
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // 5. Protected pages - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/inbox', '/contacts', '/pipelines', '/broadcasts', '/automations', '/settings']
  if (!user && protectedPaths.some(path => pathname.startsWith(path))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return withRefreshedCookies(NextResponse.redirect(url))
  }

  // 6. Perform Internal Rewrite to /app/[slug] if slug is present
  if (slug) {
    const url = request.nextUrl.clone()

    // Ensure we don't rewrite if pathname is already under /app/, /api/, or Next.js internals
    if (!pathname.startsWith('/app') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      url.pathname = `/app/${slug}${pathname}`
      requestHeaders.set('x-organization-slug', slug)
      
      const rewriteResponse = NextResponse.rewrite(url, {
        request: {
          headers: requestHeaders,
        },
      })
      
      return withRefreshedCookies(rewriteResponse)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
