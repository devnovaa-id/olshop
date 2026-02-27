window.renderAdminUsers = function() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!localStorage.getItem('token') || user.role !== 'master') {
    window.location.hash = '#/admin';
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
          <a href="#/admin/customers" class="list-group-item list-group-item-action"><i class="fas fa-users me-2"></i>Pelanggan</a>
          <a href="#/admin/users" class="list-group-item list-group-item-action active"><i class="fas fa-user-cog me-2"></i>Admin</a>
          <a href="#/admin/settings" class="list-group-item list-group-item-action"><i class="fas fa-cog me-2"></i>Pengaturan</a>
        </div>
      </div>
      <div class="col-md-9 admin-content">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2>Manajemen Admin</h2>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#userModal" id="addUserBtn"><i class="fas fa-plus me-2"></i>Tambah Admin</button>
        </div>
        <div id="usersTable"></div>
      </div>
    </div>

    <div class="modal fade" id="userModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Admin</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="userForm">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" id="userName" placeholder="Nama" required>
                <label for="userName">Nama</label>
              </div>
              <div class="form-floating mb-3">
                <input type="email" class="form-control" id="userEmail" placeholder="Email" required>
                <label for="userEmail">Email</label>
              </div>
              <div class="form-floating mb-3">
                <input type="password" class="form-control" id="userPassword" placeholder="Password" required>
                <label for="userPassword">Password</label>
              </div>
              <div class="form-floating mb-3">
                <select class="form-control" id="userRole">
                  <option value="admin">Admin</option>
                  <option value="master">Master</option>
                </select>
                <label for="userRole">Role</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" id="saveUserBtn">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  `;

  function loadUsers() {
    fetch('/api/admin/users-list', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(users => {
        const container = document.getElementById('usersTable');
        container.innerHTML = `
          <table class="table table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>${u.id}</td>
                  <td>${u.name}</td>
                  <td>${u.email}</td>
                  <td>${u.role}</td>
                  <td>
                    <button class="btn btn-sm btn-danger delete-user" data-id="${u.id}" ${u.id === user.id ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        attachEvents();
      })
      .catch(err => showToast('Error', 'Gagal memuat user', 'error'));
  }

  function attachEvents() {
    document.querySelectorAll('.delete-user').forEach(btn => {
      btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
  }

  loadUsers();

  document.getElementById('saveUserBtn').addEventListener('click', async () => {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;

    try {
      const res = await fetch('/api/admin/users-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, email, password, role })
      });
      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
        loadUsers();
        showToast('Sukses', 'User ditambahkan', 'success');
      } else {
        showToast('Gagal', 'Gagal menambah user', 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  });

  async function deleteUser(id) {
    if (!confirm('Yakin ingin menghapus admin ini?')) return;
    try {
      const res = await fetch(`/api/admin/users-delete?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        loadUsers();
        showToast('Sukses', 'User dihapus', 'success');
      } else {
        showToast('Gagal', 'Gagal menghapus', 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  }
};