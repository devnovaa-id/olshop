window.renderHome = function() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="p-5 mb-4 bg-light rounded-3">
      <div class="container-fluid py-5">
        <h1 class="display-4 fw-bold">Selamat Datang di Toko UMKM <span class="text-primary">2026</span></h1>
        <p class="col-md-8 fs-4">Temukan berbagai produk unggulan dari UMKM lokal dengan kualitas terbaik dan desain modern.</p>
        <a href="#/products" class="btn btn-primary btn-lg">Lihat Produk <i class="fas fa-arrow-right ms-2"></i></a>
      </div>
    </div>

    <h2 class="mb-4">Produk Unggulan</h2>
    <div id="featuredProducts" class="row row-cols-1 row-cols-md-4 g-4">
      ${renderSkeletonProducts(4)}
    </div>
  `;

  fetch('/api/public/products-list?limit=4')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('featuredProducts');
      if (data.data.length === 0) {
        container.innerHTML = '<div class="col-12 text-center">Belum ada produk</div>';
        return;
      }
      container.innerHTML = data.data.map(product => `
        <div class="col">
          <div class="card product-card">
            <img src="${product.image || 'https://via.placeholder.com/300'}" class="card-img-top product-img" alt="${product.name}">
            <div class="card-body">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">${formatRupiah(product.price)}</p>
              <a href="#/product/${product.slug}" class="btn btn-outline-primary btn-sm">Detail</a>
            </div>
          </div>
        </div>
      `).join('');
    })
    .catch(err => {
      document.getElementById('featuredProducts').innerHTML = '<div class="col-12 text-center text-danger">Gagal memuat produk</div>';
      showToast('Error', 'Gagal memuat produk', 'error');
    });
};