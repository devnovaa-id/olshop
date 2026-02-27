window.renderProducts = function() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2 class="mb-4">Semua Produk</h2>
    <div class="row">
      <div class="col-md-3">
        <div class="card mb-4">
          <div class="card-body">
            <h5><i class="fas fa-filter me-2"></i>Filter</h5>
            <div class="mb-3">
              <label class="form-label">Kategori</label>
              <select class="form-select" id="categoryFilter">
                <option value="">Semua Kategori</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Cari</label>
              <input type="text" class="form-control" id="searchInput" placeholder="Nama produk...">
            </div>
            <button class="btn btn-primary w-100" id="applyFilter">Terapkan</button>
          </div>
        </div>
      </div>
      <div class="col-md-9">
        <div id="productsContainer" class="row row-cols-1 row-cols-md-3 g-4">
          ${renderSkeletonProducts(6)}
        </div>
        <nav aria-label="Page navigation" class="mt-4">
          <ul class="pagination justify-content-center" id="pagination"></ul>
        </nav>
      </div>
    </div>
  `;

  let currentPage = 1;
  let totalPages = 1;
  let currentCategory = '';
  let currentSearch = '';

  fetch('/api/admin/categories-list', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
    .then(res => res.json())
    .then(categories => {
      const select = document.getElementById('categoryFilter');
      categories.forEach(cat => {
        select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
      });
    })
    .catch(err => console.log('Gagal ambil kategori (mungkin tidak login)'));

  function loadProducts() {
    let url = `/api/public/products-list?page=${currentPage}&limit=12`;
    if (currentCategory) url += `&category=${currentCategory}`;
    if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('productsContainer');
        if (data.data.length === 0) {
          container.innerHTML = '<div class="col-12 text-center">Tidak ada produk</div>';
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
        totalPages = Math.ceil(data.total / data.limit);
        renderPagination();
      })
      .catch(err => {
        document.getElementById('productsContainer').innerHTML = '<div class="col-12 text-center text-danger">Gagal memuat produk</div>';
        showToast('Error', 'Gagal memuat produk', 'error');
      });
  }

  function renderPagination() {
    let pagination = document.getElementById('pagination');
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    pagination.innerHTML = html;
    pagination.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = parseInt(e.target.dataset.page);
        loadProducts();
      });
    });
  }

  document.getElementById('applyFilter').addEventListener('click', () => {
    currentCategory = document.getElementById('categoryFilter').value;
    currentSearch = document.getElementById('searchInput').value;
    currentPage = 1;
    loadProducts();
  });

  loadProducts();
};