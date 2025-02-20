// Định nghĩa các cấu hình
const CONFIG = {
  targetDomain: 'comment.bibica.net',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

// Export hàm handler cho Pages
export async function onRequest(context) {
  const request = context.request;

  // Xử lý OPTIONS request trước
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': CONFIG.allowedMethods.join(', '),
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Kiểm tra method có được phép
  if (!CONFIG.allowedMethods.includes(request.method)) {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  return handleRequest(request);
}

async function handleRequest(request) {
  try {
    // Validate request
    if (!request || !request.url) {
      throw new Error('Invalid request');
    }

    // Tạo URL mới từ request
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.hostname = CONFIG.targetDomain;

    // Clone và modify headers
    const newHeaders = new Headers();
    for (const [key, value] of request.headers.entries()) {
      // Skip một số headers có thể gây vấn đề
      if (!['cf-connecting-ip', 'cf-ipcountry', 'cf-ray', 'cf-visitor', 'host'].includes(key.toLowerCase())) {
        newHeaders.set(key, value);
      }
    }

    // Set các headers cần thiết
    newHeaders.set('Host', CONFIG.targetDomain);
    newHeaders.set('Origin', `https://${CONFIG.targetDomain}`);
    newHeaders.set('Referer', `https://${CONFIG.targetDomain}`);

    // Chuẩn bị request body
    let requestBody = null;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        requestBody = await request.clone().arrayBuffer();
      } catch (e) {
        console.error('Error cloning request body:', e);
      }
    }

    // Forward request đến server đích
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: newHeaders,
      body: requestBody,
      redirect: 'manual'
    });

    // Xử lý response headers
    const responseHeaders = new Headers();
    for (const [key, value] of response.headers.entries()) {
      responseHeaders.set(key, value);
    }

    // Thêm security và CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', CONFIG.allowedMethods.join(', '));
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('X-Frame-Options', 'DENY');
    responseHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

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
