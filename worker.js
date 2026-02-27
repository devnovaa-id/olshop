import handlers from './handlers/index.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '');
    const method = request.method;
    const key = `${method} ${path}`;
    const handler = handlers[key];

    if (!handler) {
      return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });
    }

    let body = null;
    const contentType = request.headers.get('content-type') || '';
    if (method !== 'GET' && method !== 'HEAD' && contentType.includes('application/json')) {
      body = await request.json().catch(() => null);
    }

    const headers = {};
    request.headers.forEach((value, key) => { headers[key] = value; });

    const event = {
      method,
      path,
      headers,
      queryStringParameters: Object.fromEntries(url.searchParams),
      body,
    };

    try {
      const result = await handler(event);
      return new Response(JSON.stringify(result.body), {
        status: result.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ message: err.message }), { status: 500 });
    }
  },
};