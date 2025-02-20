export async function onRequest(context) {
  const { request } = context;

  // Cấu hình
  const targetDomain = 'comment.bibica.net';

  // Tạo URL mới từ request
  const url = new URL(request.url);
  url.hostname = targetDomain;

  // Tạo headers mới
  let newHeaders = new Headers(request.headers);
  newHeaders.set('Host', targetDomain);
  newHeaders.set('Origin', `https://${targetDomain}`);
  newHeaders.set('Referer', `https://${targetDomain}`);

  try {
    // Forward request đến server đích
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: 'manual',
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
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
