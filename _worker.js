export default {
  async fetch(request, env, ctx) {
    return handleRequest(request)
  }
}

async function handleRequest(request) {
  const targetDomain = 'comment.bibica.net'

  // Tạo URL mới từ request
  const url = new URL(request.url)
  url.hostname = targetDomain

  // Tạo headers mới
  let newHeaders = new Headers(request.headers)
  newHeaders.set('Origin', `https://${targetDomain}`)
  newHeaders.set('Referer', `https://${targetDomain}`)

  try {
    // Forward request đến server đích
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.clone().arrayBuffer() : undefined,
      redirect: 'manual'
    })

    // Tạo headers mới cho response
    let responseHeaders = new Headers(response.headers)
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', '*')
    responseHeaders.set('X-Content-Type-Options', 'nosniff')
    responseHeaders.set('X-Frame-Options', 'DENY')

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    })

  } catch (error) {
    console.error('Proxy Error:', error)
    return new Response('Internal Server Error', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
