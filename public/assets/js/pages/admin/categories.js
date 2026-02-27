window.renderAdminCategories = function() {
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
          <a href="#/admin/products" class="list-group-item list-group-item-action"><i class="fas fa-box me-2"></i>Produk</a>
          <a href="#/admin/categories" class="list-group-item list-group-item-action active"><i class="fas fa-tags me-2"></i>Kategori</a>
          <a href="#/admin/orders" class="list-group-item list-group-item-action"><i class="fas fa-shopping-cart me-2"></i>Pesanan</a>
          <a href="#/admin/customers" class="list-group-item list-group-item-action"><i class="fas fa-users me-2"></i>Pelanggan</a>
          ${JSON.parse(localStorage.getItem('user')).role === 'master' ? '<a href="#/admin/users" class="list-group-item list-group-item-action"><i class="fas fa-user-cog me-2"></i>Admin</a>' : ''}
          <a href="#/admin/settings" class="list-group-item list-group-item-action"><i class="fas fa-cog me-2"></i>Pengaturan</a>
        </div>
      </div>
      <div class="col-md-9 admin-content">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2>Manajemen Kategori</h2>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#categoryModal" id="addCategoryBtn"><i class="fas fa-plus me-2"></i>Tambah Kategori</button>
        </div>
        <div id="categoriesTable"></div>
      </div>
    </div>

    <div class="modal fade" id="categoryModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="categoryModalTitle">Tambah Kategori</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="categoryForm">
              <input type="hidden" id="categoryId">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="catName" placeholder="Nama Kategori" required>
                <label for="catName">Nama Kategori</label>
              </div>
              <div class="form-floating mb-3">
                <textarea class="form-control" id="catDescription" placeholder="Deskripsi" style="height: 100px"></textarea>
                <label for="catDescription">Deskripsi</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" id="saveCategoryBtn">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  `;

  function loadCategories() {
    fetch('/api/admin/categories-list', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(categories => {
        const container = document.getElementById('categoriesTable');
        container.innerHTML = `
          <table class="table table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Deskripsi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map(cat => `
                <tr>
                  <td>${cat.id}</td>
                  <td>${cat.name}</td>
                  <td>${cat.description || '-'}</td>
                  <td>
                    <button class="btn btn-sm btn-warning edit-cat" data-id="${cat.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-cat" data-id="${cat.id}"><i class="fas fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        attachEvents();
      })
      .catch(err => showToast('Error', 'Gagal memuat kategori', 'error'));
  }

  function attachEvents() {
    document.querySelectorAll('.edit-cat').forEach(btn => {
      btn.addEventListener('click', () => editCategory(btn.dataset.id));
    });
    document.querySelectorAll('.delete-cat').forEach(btn => {
      btn.addEventListener('click', () => deleteCategory(btn.dataset.id));
    });
  }

  loadCategories();

  document.getElementById('addCategoryBtn').addEventListener('click', () => {
    document.getElementById('categoryModalTitle').textContent = 'Tambah Kategori';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
  });

  document.getElementById('saveCategoryBtn').addEventListener('click', async () => {
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('catName').value;
    const description = document.getElementById('catDescription').value;

    let url, method;
    if (id) {
      url = '/api/admin/categories-update';
      method = 'PUT';
    } else {
      url = '/api/admin/categories-create';
      method = 'POST';
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id, name, description })
      });
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
        loadCategories();
        showToast('Sukses', 'Kategori disimpan', 'success');
      } else {
        showToast('Gagal', 'Gagal menyimpan', 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  });

  async function editCategory(id) {
    const res = await fetch('/api/admin/categories-list', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const categories = await res.json();
    const cat = categories.find(c => c.id == id);
    if (cat) {
      document.getElementById('categoryModalTitle').textContent = 'Edit Kategori';
      document.getElementById('categoryId').value = cat.id;
      document.getElementById('catName').value = cat.name;
      document.getElementById('catDescription').value = cat.description || '';
      new bootstrap.Modal(document.getElementById('categoryModal')).show();
    }
  }

  async function deleteCategory(id) {
    if (!confirm('Yakin?')) return;
    try {
      const res = await fetch(`/api/admin/categories-delete?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        loadCategories();
        showToast('Sukses', 'Kategori dihapus', 'success');
      } else {
        showToast('Gagal', 'Gagal menghapus', 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  }
};