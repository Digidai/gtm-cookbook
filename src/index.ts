interface Env {
  ASSETS: Fetcher
}

function hasFileExtension(pathname: string): boolean {
  const lastSegment = pathname.split('/').pop() ?? ''
  return /\.[a-z0-9]+$/i.test(lastSegment)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const url = new URL(request.url)

    let response = await env.ASSETS.fetch(request)
    if (response.status !== 404) return response

    const pathname = url.pathname
    const candidates = new Set<string>()

    if (pathname.endsWith('/')) {
      candidates.add(`${pathname}index.html`)
    }

    if (!hasFileExtension(pathname) && pathname !== '/') {
      if (!pathname.endsWith('/')) {
        candidates.add(`${pathname}.html`)
      }
      candidates.add(pathname.endsWith('/') ? `${pathname}index.html` : `${pathname}/index.html`)
    }

    for (const candidate of candidates) {
      url.pathname = candidate
      response = await env.ASSETS.fetch(new Request(url, request))
      if (response.status !== 404) return response
    }

    url.pathname = '/404.html'
    const notFoundPage = await env.ASSETS.fetch(new Request(url, request))
    if (notFoundPage.status !== 404) {
      return new Response(notFoundPage.body, { status: 404, headers: notFoundPage.headers })
    }

    return response
  }
}
