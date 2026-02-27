window.renderAdminProducts = function() {
  if (!localStorage.getItem('token')) {
    window.location.hash = '#/login';
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="row">
      <div class="col-md-3">
        <div class="list-group admin-sidebar">
          <a href="#/admin" class="list-group-item list-group-item-action"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</a>
          <a href="#/admin/products" class="list-group-item list-group-item-action active"><i class="fas fa-box me-2"></i>Produk</a>
          <a href="#/admin/categories" class="list-group-item list-group-item-action"><i class="fas fa-tags me-2"></i>Kategori</a>
          <a href="#/admin/orders" class="list-group-item list-group-item-action"><i class="fas fa-shopping-cart me-2"></i>Pesanan</a>
          <a href="#/admin/customers" class="list-group-item list-group-item-action"><i class="fas fa-users me-2"></i>Pelanggan</a>
          ${JSON.parse(localStorage.getItem('user')).role === 'master' ? '<a href="#/admin/users" class="list-group-item list-group-item-action"><i class="fas fa-user-cog me-2"></i>Admin</a>' : ''}
          <a href="#/admin/settings" class="list-group-item list-group-item-action"><i class="fas fa-cog me-2"></i>Pengaturan</a>
        </div>
      </div>
      <div class="col-md-9 admin-content">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2>Manajemen Produk</h2>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#productModal" id="addProductBtn"><i class="fas fa-plus me-2"></i>Tambah Produk</button>
        </div>
        <div id="productsTable"></div>
        <nav aria-label="Page navigation" class="mt-4">
          <ul class="pagination justify-content-center" id="pagination"></ul>
        </nav>
      </div>
    </div>

    <div class="modal fade" id="productModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalTitle">Tambah Produk</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="productForm">
              <input type="hidden" id="productId">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="name" placeholder="Nama Produk" required>
                <label for="name">Nama Produk</label>
              </div>
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="slug" placeholder="Slug" required>
                <label for="slug">Slug (URL friendly)</label>
              </div>
              <div class="form-floating mb-3">
                <select class="form-control" id="category_id" required>
                  <option value="">Pilih Kategori</option>
                </select>
                <label for="category_id">Kategori</label>
              </div>
              <div class="form-floating mb-3">
                <textarea class="form-control" id="description" placeholder="Deskripsi" style="height: 100px"></textarea>
                <label for="description">Deskripsi</label>
              </div>
              <div class="row">
                <div class="col-md-6 form-floating mb-3">
                  <input type="number" class="form-control" id="price" placeholder="Harga" min="0" required>
                  <label for="price">Harga</label>
                </div>
                <div class="col-md-6 form-floating mb-3">
                  <input type="number" class="form-control" id="stock" placeholder="Stok" min="0" required>
                  <label for="stock">Stok</label>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Gambar</label>
                <input type="file" class="form-control" id="image" accept="image/*">
                <small class="text-muted">Biarkan kosong jika tidak ingin mengubah (saat edit)</small>
              </div>
              <div id="currentImage" class="mb-2"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" id="saveProductBtn">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  `;

  let currentPage = 1;
  let totalPages = 1;

  function loadProducts() {
    fetch(`/api/admin/products-list?page=${currentPage}&limit=10`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('productsTable');
        container.innerHTML = `
          <table class="table table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Gambar</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.map(product => `
                <tr>
                  <td>${product.id}</td>
                  <td><img src="${product.image || 'https://via.placeholder.com/50'}" width="50" height="50" class="rounded"></td>
                  <td>${product.name}</td>
                  <td>${product.categories?.name || '-'}</td>
                  <td>${formatRupiah(product.price)}</td>
                  <td>${product.stock}</td>
                  <td class="table-actions">
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        totalPages = Math.ceil(data.total / data.limit);
        renderPagination();
        attachEvents();
      })
      .catch(err => showToast('Error', 'Gagal memuat produk', 'error'));
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

  function attachEvents() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
  }

  function loadCategories() {
    fetch('/api/admin/categories-list', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(categories => {
        const select = document.getElementById('category_id');
        select.innerHTML = '<option value="">Pilih Kategori</option>';
        categories.forEach(cat => {
          select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
      });
  }

  loadCategories();
  loadProducts();

  document.getElementById('addProductBtn').addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Tambah Produk';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('currentImage').innerHTML = '';
  });

  document.getElementById('saveProductBtn').addEventListener('click', async () => {
    const id = document.getElementById('productId').value;
    const name = document.getElementById('name').value;
    const slug = document.getElementById('slug').value;
    const category_id = document.getElementById('category_id').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;
    const imageFile = document.getElementById('image').files[0];

    let imageUrl = '';
    if (imageFile) {
      try {
        const { uploadImage } = await import('/assets/js/utils/supabase.js');
        imageUrl = await uploadImage(imageFile, 'product-images', 'products');
      } catch (err) {
        showToast('Gagal', 'Upload gambar gagal: ' + err.message, 'error');
        return;
      }
    }

    const productData = { name, slug, description, price, stock, category_id };
    if (imageUrl) productData.image = imageUrl;

    let url, method;
    if (id) {
      url = '/api/admin/products-update';
      method = 'PUT';
      productData.id = id;
    } else {
      url = '/api/admin/products-create';
      method = 'POST';
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        loadProducts();
        showToast('Sukses', 'Produk disimpan', 'success');
      } else {
        const err = await res.json();
        showToast('Gagal', err.message, 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  });

  async function editProduct(id) {
    const res = await fetch(`/api/admin/products-list?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    const product = data.data.find(p => p.id == id);
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Edit Produk';
    document.getElementById('productId').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('slug').value = product.slug;
    document.getElementById('category_id').value = product.category_id || '';
    document.getElementById('description').value = product.description || '';
    document.getElementById('price').value = product.price;
    document.getElementById('stock').value = product.stock;
    document.getElementById('currentImage').innerHTML = product.image ? `<img src="${product.image}" width="100" class="mb-2">` : '';

    new bootstrap.Modal(document.getElementById('productModal')).show();
  }

  async function deleteProduct(id) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      const res = await fetch(`/api/admin/products-delete?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        loadProducts();
        showToast('Sukses', 'Produk dihapus', 'success');
      } else {
        showToast('Gagal', 'Gagal menghapus', 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  }
};