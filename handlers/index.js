const categoriesList = require('./admin/categories-list');
const categoriesCreate = require('./admin/categories-create');
const categoriesUpdate = require('./admin/categories-update');
const categoriesDelete = require('./admin/categories-delete');
const customersList = require('./admin/customers-list');
const dashboardStats = require('./admin/dashboard-stats');
const ordersDetail = require('./admin/orders-detail');
const ordersList = require('./admin/orders-list');
const ordersUpdateStatus = require('./admin/orders-update-status');
const productsCreate = require('./admin/products-create');
const productsDelete = require('./admin/products-delete');
const productsList = require('./admin/products-list');
const productsUpdate = require('./admin/products-update');
const settings = require('./admin/settings');
const usersCreate = require('./admin/users-create');
const usersDelete = require('./admin/users-delete');
const usersList = require('./admin/users-list');
const publicCheckout = require('./public/checkout');
const publicProductDetail = require('./public/product-detail');
const publicProductsList = require('./public/products-list');
const publicTrackOrder = require('./public/track-order');
const authLogin = require('./auth-login');
const authRegister = require('./auth-register');

module.exports = {
  // Admin
  'GET /admin/categories-list': categoriesList,
  'POST /admin/categories-create': categoriesCreate,
  'PUT /admin/categories-update': categoriesUpdate,
  'DELETE /admin/categories-delete': categoriesDelete,
  'GET /admin/customers-list': customersList,
  'GET /admin/dashboard-stats': dashboardStats,
  'GET /admin/orders-detail': ordersDetail,
  'GET /admin/orders-list': ordersList,
  'PUT /admin/orders-update-status': ordersUpdateStatus,
  'POST /admin/products-create': productsCreate,
  'DELETE /admin/products-delete': productsDelete,
  'GET /admin/products-list': productsList,
  'PUT /admin/products-update': productsUpdate,
  'GET /admin/settings': settings,
  'POST /admin/settings': settings,
  'POST /admin/users-create': usersCreate,
  'DELETE /admin/users-delete': usersDelete,
  'GET /admin/users-list': usersList,

  // Public
  'POST /public/checkout': publicCheckout,
  'GET /public/product-detail': publicProductDetail,
  'GET /public/products-list': publicProductsList,
  'GET /public/track-order': publicTrackOrder,

  // Auth
  'POST /auth-login': authLogin,
  'POST /auth-register': authRegister,
};