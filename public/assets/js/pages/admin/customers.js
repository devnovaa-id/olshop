window.renderAdminCustomers = function() {
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
          <a href="#/admin/categories" class="list-group-item list-group-item-action"><i class="fas fa-tags me-2"></i>Kategori</a>
          <a href="#/admin/orders" class="list-group-item list-group-item-action"><i class="fas fa-shopping-cart me-2"></i>Pesanan</a>
          <a href="#/admin/customers" class="list-group-item list-group-item-action active"><i class="fas fa-users me-2"></i>Pelanggan</a>
          ${JSON.parse(localStorage.getItem('user')).role === 'master' ? '<a href="#/admin/users" class="list-group-item list-group-item-action"><i class="fas fa-user-cog me-2"></i>Admin</a>' : ''}
          <a href="#/admin/settings" class="list-group-item list-group-item-action"><i class="fas fa-cog me-2"></i>Pengaturan</a>
        </div>
      </div>
      <div class="col-md-9 admin-content">
        <h2 class="mb-4">Daftar Pelanggan</h2>
        <div id="customersTable"></div>
        <nav aria-label="Page navigation" class="mt-4">
          <ul class="pagination justify-content-center" id="pagination"></ul>
        </nav>
      </div>
    </div>
  `;

  let currentPage = 1;
  let totalPages = 1;

  function loadCustomers() {
    fetch(`/api/admin/customers-list?page=${currentPage}&limit=10`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('customersTable');
        container.innerHTML = `
          <table class="table table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Alamat</th>
                <th>Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.map(c => `
                <tr>
                  <td>${c.id}</td>
                  <td>${c.name}</td>
                  <td>${c.email || '-'}</td>
                  <td>${c.phone || '-'}</td>
                  <td>${c.address || '-'}</td>
                  <td>${new Date(c.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        totalPages = Math.ceil(data.total / data.limit);
        renderPagination();
      })
      .catch(err => showToast('Error', 'Gagal memuat pelanggan', 'error'));
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
        loadCustomers();
      });
    });
  }

  loadCustomers();
};