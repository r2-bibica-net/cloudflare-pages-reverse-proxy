export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  
  // Cấu hình
  const targetDomain = 'comment.bibica.net';
  
  // Xử lý CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  // Tạo URL và headers mới
  const url = new URL(request.url);
  url.hostname = targetDomain;
  
  const newHeaders = new Headers(request.headers);
  newHeaders.set('Host', targetDomain);
  newHeaders.set('Origin', `https://${targetDomain}`);
  newHeaders.set('Referer', `https://${targetDomain}`);

  try {
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: 'manual'
    });

    const responseHeaders = new Headers(response.headers);
    // Security headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('X-Frame-Options', 'DENY');
    responseHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
