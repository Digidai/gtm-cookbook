const hasFileExtension = (pathname) => {
  const lastSegment = pathname.split('/').pop() ?? ''
  return /\.[a-z0-9]+$/i.test(lastSegment)
}

export const onRequest = async (context) => {
  const { request } = context

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return context.next()
  }

  let response = await context.next()
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
    candidates.add(pathname.endsWith('/') ? `${pathname}index.html` : `${pathname}/index.html`)
  }

  for (const candidate of candidates) {
    url.pathname = candidate
    response = await context.next(new Request(url, request))
    if (response.status !== 404) return response
  }

  url.pathname = '/404.html'
  const notFound = await context.next(new Request(url, request))
  if (notFound.status !== 404) {
    return new Response(notFound.body, {
      status: 404,
      headers: notFound.headers
    })
  }

  return response
}
