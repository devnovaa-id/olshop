const handlers = {
  // Admin
  'GET /admin/categories-list': require('../handlers/admin/categories-list'),
  'POST /admin/categories-create': require('../handlers/admin/categories-create'),
  'PUT /admin/categories-update': require('../handlers/admin/categories-update'),
  'DELETE /admin/categories-delete': require('../handlers/admin/categories-delete'),
  'GET /admin/customers-list': require('../handlers/admin/customers-list'),
  'GET /admin/dashboard-stats': require('../handlers/admin/dashboard-stats'),
  'GET /admin/orders-detail': require('../handlers/admin/orders-detail'),
  'GET /admin/orders-list': require('../handlers/admin/orders-list'),
  'PUT /admin/orders-update-status': require('../handlers/admin/orders-update-status'),
  'POST /admin/products-create': require('../handlers/admin/products-create'),
  'DELETE /admin/products-delete': require('../handlers/admin/products-delete'),
  'GET /admin/products-list': require('../handlers/admin/products-list'),
  'PUT /admin/products-update': require('../handlers/admin/products-update'),
  'GET /admin/settings': require('../handlers/admin/settings'),
  'POST /admin/settings': require('../handlers/admin/settings'),
  'POST /admin/users-create': require('../handlers/admin/users-create'),
  'DELETE /admin/users-delete': require('../handlers/admin/users-delete'),
  'GET /admin/users-list': require('../handlers/admin/users-list'),

  // Public
  'POST /public/checkout': require('../handlers/public/checkout'),
  'GET /public/product-detail': require('../handlers/public/product-detail'),
  'GET /public/products-list': require('../handlers/public/products-list'),
  'GET /public/track-order': require('../handlers/public/track-order'),

  // Auth
  'POST /auth-login': require('../handlers/auth-login'),
  'POST /auth-register': require('../handlers/auth-register'),
};

module.exports = async (req, res) => {
  const method = req.method;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api/, '');
  const key = `${method} ${path}`;
  const handler = handlers[key];

  if (!handler) {
    return res.status(404).json({ message: 'Not found' });
  }

  const event = {
    method,
    path,
    headers: req.headers,
    queryStringParameters: Object.fromEntries(url.searchParams),
    body: req.body,
  };

  try {
    const result = await handler(event);
    res.status(result.statusCode).json(result.body);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};