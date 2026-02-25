window.renderAdminSettings = function() {
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
          <a href="#/admin/customers" class="list-group-item list-group-item-action"><i class="fas fa-users me-2"></i>Pelanggan</a>
          ${JSON.parse(localStorage.getItem('user')).role === 'master' ? '<a href="#/admin/users" class="list-group-item list-group-item-action"><i class="fas fa-user-cog me-2"></i>Admin</a>' : ''}
          <a href="#/admin/settings" class="list-group-item list-group-item-action active"><i class="fas fa-cog me-2"></i>Pengaturan</a>
        </div>
      </div>
      <div class="col-md-9 admin-content">
        <h2 class="mb-4">Pengaturan Toko</h2>
        <form id="settingsForm" class="card p-4">
          <div class="mb-3">
            <label class="form-label">Nama Toko</label>
            <input type="text" class="form-control" id="store_name" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Alamat Toko</label>
            <textarea class="form-control" id="store_address" rows="2"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Nomor Telepon</label>
            <input type="text" class="form-control" id="store_phone">
          </div>
          <div class="mb-3">
            <label class="form-label">Rekening Bank (untuk transfer)</label>
            <input type="text" class="form-control" id="bank_account" placeholder="Contoh: BCA 123456789 a.n. Toko">
          </div>
          <div class="mb-3">
            <label class="form-label">Ongkos Kirim (flat)</label>
            <input type="number" class="form-control" id="shipping_cost" min="0" value="0">
          </div>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </form>
      </div>
    </div>
  `;

  fetch('/.netlify/functions/admin/settings', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
    .then(res => res.json())
    .then(settings => {
      document.getElementById('store_name').value = settings.store_name || '';
      document.getElementById('store_address').value = settings.store_address || '';
      document.getElementById('store_phone').value = settings.store_phone || '';
      document.getElementById('bank_account').value = settings.bank_account || '';
      document.getElementById('shipping_cost').value = settings.shipping_cost || 0;
    })
    .catch(err => console.log(err));

  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const settings = {
      store_name: document.getElementById('store_name').value,
      store_address: document.getElementById('store_address').value,
      store_phone: document.getElementById('store_phone').value,
      bank_account: document.getElementById('bank_account').value,
      shipping_cost: document.getElementById('shipping_cost').value,
    };

    try {
      const res = await fetch('/.netlify/functions/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Pengaturan disimpan');
      } else {
        alert('Gagal menyimpan');
      }
    } catch (err) {
      alert('Kesalahan: ' + err.message);
    }
  });
};