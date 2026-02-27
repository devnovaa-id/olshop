// Toast notification
window.showToast = (title, message, type = 'info', duration = 3000) => {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// Skeleton loading untuk produk
window.renderSkeletonProducts = (count = 4) => {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="col">
        <div class="skeleton skeleton-card"></div>
      </div>
    `;
  }
  return html;
};

// Update active bottom nav
window.updateBottomNav = (path) => {
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  navItems.forEach(item => {
    const route = item.dataset.route;
    if (path === route || (route === '/' && path === '')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Sembunyikan/munculkan login di bottom nav jika sudah login
  const token = localStorage.getItem('token');
  const mobileLogin = document.getElementById('mobileLogin');
  if (token && mobileLogin) {
    mobileLogin.style.display = 'none';
  } else if (mobileLogin) {
    mobileLogin.style.display = 'flex';
  }
};