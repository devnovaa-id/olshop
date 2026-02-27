const routes = {
  '/': 'home',
  '/products': 'products',
  '/product/:id': 'productDetail',
  '/cart': 'cart',
  '/checkout': 'checkout',
  '/track': 'trackOrder',
  '/login': 'login',
  '/admin': 'adminDashboard',
  '/admin/products': 'adminProducts',
  '/admin/categories': 'adminCategories',
  '/admin/orders': 'adminOrders',
  '/admin/customers': 'adminCustomers',
  '/admin/users': 'adminUsers',
  '/admin/settings': 'adminSettings',
};

function render(path) {
  const app = document.getElementById('app');
  let pageName = routes[path];
  if (!pageName) {
    for (const route in routes) {
      if (route.includes(':id')) {
        const baseRoute = route.split('/:')[0];
        if (path.startsWith(baseRoute)) {
          pageName = routes[route];
          break;
        }
      }
    }
  }
  pageName = pageName || 'notFound';
  const funcName = `render${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`;
  if (typeof window[funcName] === 'function') {
    window[funcName](path);
  } else {
    app.innerHTML = '<h1>404 Halaman tidak ditemukan</h1>';
  }
}

window.addEventListener('hashchange', () => {
  const fullHash = window.location.hash.slice(1) || '/';
  const path = fullHash.split('?')[0];
  render(path);
  updateCartCount();
  updateBottomNav(path);
});

window.addEventListener('load', () => {
  const fullHash = window.location.hash.slice(1) || '/';
  const path = fullHash.split('?')[0];
  render(path);
  updateNavbar();
  updateCartCount();
  updateBottomNav(path);
});

function updateNavbar() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navLogin = document.getElementById('navLogin');
  const navUser = document.getElementById('navUser');
  if (token && user) {
    navLogin.classList.add('d-none');
    navUser.classList.remove('d-none');
  } else {
    navLogin.classList.remove('d-none');
    navUser.classList.add('d-none');
  }
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartCount = document.getElementById('cartCount');
  if (cartCount) cartCount.textContent = count;
  const mobileBadge = document.getElementById('mobileCartCount');
  if (mobileBadge) {
    mobileBadge.textContent = count;
    mobileBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateNavbar();
  window.location.hash = '#/';
});