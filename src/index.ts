interface Env {
  ASSETS: Fetcher
}

function hasFileExtension(pathname: string): boolean {
  const lastSegment = pathname.split('/').pop() ?? ''
  return /\.[a-z0-9]+$/i.test(lastSegment)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Validate environment
    if (!env.ASSETS) {
      return new Response('Internal Server Error: Assets fetcher not configured', {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    try {
      let response = await env.ASSETS.fetch(request)
      if (response.status !== 404) return response

      const url = new URL(request.url)
      const pathname = url.pathname
      const candidates = new Set<string>()

      if (pathname.endsWith('/')) {
        candidates.add(`${pathname}index.html`)
      }

      if (!hasFileExtension(pathname) && pathname !== '/') {
        if (!pathname.endsWith('/')) {
          candidates.add(`${pathname}.html`)
        }
        candidates.add(
          pathname.endsWith('/') ? `${pathname}index.html` : `${pathname}/index.html`
        )
      }

      for (const candidate of candidates) {
        try {
          url.pathname = candidate
          response = await env.ASSETS.fetch(new Request(url, request))
          if (response.status !== 404) return response
        } catch (error) {
          // Continue trying other candidates
          console.warn(`Failed to fetch ${candidate}:`, error)
          continue
        }
      }

      // Try 404 page
      try {
        url.pathname = '/404.html'
        const notFoundPage = await env.ASSETS.fetch(new Request(url, request))
        if (notFoundPage.status !== 404) {
          return new Response(notFoundPage.body, {
            status: 404,
            headers: notFoundPage.headers
          })
        }
      } catch (error) {
        console.warn('Failed to fetch 404 page:', error)
      }

      return response
    } catch (error) {
      console.error('Unhandled error in fetch handler:', error)
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }
  }
}
