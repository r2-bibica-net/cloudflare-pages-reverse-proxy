// Định nghĩa các cấu hình
const CONFIG = {
  targetDomain: 'comment.bibica.net'
};

// Export hàm handler cho Pages
export function onRequest(context) {
  return handleRequest(context.request);
}

async function handleRequest(request) {
  // Tạo URL mới từ request
  const url = new URL(request.url);
  url.hostname = CONFIG.targetDomain;

  // Tạo headers mới
  let newHeaders = new Headers(request.headers);
  newHeaders.set('Host', CONFIG.targetDomain);
  newHeaders.set('Origin', `https://${CONFIG.targetDomain}`);
  newHeaders.set('Referer', `https://${CONFIG.targetDomain}`);

  try {
    // Forward request đến server đích
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: 'manual'
    });

    // Thêm security và CORS headers
    let responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('X-Frame-Options', 'DENY');

    // Trả về response
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
