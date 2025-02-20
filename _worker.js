export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    url.hostname = 'comment.bibica.net';
    
    const response = await fetch(url.toString(), {
      method: context.request.method,
      headers: {
        'Host': 'comment.bibica.net'
      }
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
