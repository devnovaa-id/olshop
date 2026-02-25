window.renderAdminOrders = function() {
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
          <a href="#/admin/orders" class="list-group-item list-group-item-action active"><i class="fas fa-shopping-cart me-2"></i>Pesanan</a>
          <a href="#/admin/customers" class="list-group-item list-group-item-action"><i class="fas fa-users me-2"></i>Pelanggan</a>
          ${JSON.parse(localStorage.getItem('user')).role === 'master' ? '<a href="#/admin/users" class="list-group-item list-group-item-action"><i class="fas fa-user-cog me-2"></i>Admin</a>' : ''}
          <a href="#/admin/settings" class="list-group-item list-group-item-action"><i class="fas fa-cog me-2"></i>Pengaturan</a>
        </div>
      </div>
      <div class="col-md-9 admin-content">
        <h2 class="mb-4">Manajemen Pesanan</h2>
        <div class="row mb-3">
          <div class="col-md-3">
            <select class="form-select" id="statusFilter">
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" id="paymentFilter">
              <option value="">Semua Metode</option>
              <option value="transfer">Transfer</option>
              <option value="cod">COD</option>
            </select>
          </div>
          <div class="col-md-3">
            <button class="btn btn-primary" id="applyFilter"><i class="fas fa-filter me-2"></i>Terapkan</button>
          </div>
        </div>
        <div id="ordersTable"></div>
        <nav aria-label="Page navigation" class="mt-4">
          <ul class="pagination justify-content-center" id="pagination"></ul>
        </nav>
      </div>
    </div>

    <!-- Modal Detail -->
    <div class="modal fade" id="orderModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detail Pesanan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="orderDetailBody">
            Memuat...
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  `;

  let currentPage = 1;
  let totalPages = 1;
  let statusFilter = '';
  let paymentFilter = '';

  function loadOrders() {
    let url = `/.netlify/functions/admin/orders-list?page=${currentPage}&limit=10`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (paymentFilter) url += `&payment_method=${paymentFilter}`;
    fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('ordersTable');
        container.innerHTML = `
          <table class="table table-striped">
            <thead>
              <tr>
                <th>No. Pesanan</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Total</th>
                <th>Status</th>
                <th>Metode</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.map(order => `
                <tr>
                  <td>${order.order_number}</td>
                  <td>${new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                  <td>${order.customers?.name || 'Guest'}</td>
                  <td>${formatRupiah(order.total_amount)}</td>
                  <td><span class="badge ${order.status === 'pending' ? 'bg-warning' : order.status === 'processing' ? 'bg-info' : order.status === 'shipped' ? 'bg-primary' : order.status === 'delivered' ? 'bg-success' : 'bg-danger'}">${order.status}</span></td>
                  <td>${order.payment_method}</td>
                  <td>
                    <button class="btn btn-sm btn-info view-order" data-id="${order.id}"><i class="fas fa-eye"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        totalPages = Math.ceil(data.total / data.limit);
        renderPagination();
        attachEvents();
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
        loadOrders();
      });
    });
  }

  function attachEvents() {
    document.querySelectorAll('.view-order').forEach(btn => {
      btn.addEventListener('click', () => viewOrder(btn.dataset.id));
    });
  }

  document.getElementById('applyFilter').addEventListener('click', () => {
    statusFilter = document.getElementById('statusFilter').value;
    paymentFilter = document.getElementById('paymentFilter').value;
    currentPage = 1;
    loadOrders();
  });

  loadOrders();

  async function viewOrder(id) {
    const modalBody = document.getElementById('orderDetailBody');
    modalBody.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Memuat...</div>';
    try {
      const res = await fetch(`/.netlify/functions/admin/orders-detail?id=${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const order = await res.json();
      modalBody.innerHTML = `
        <p><strong>No. Pesanan:</strong> ${order.order_number}</p>
        <p><strong>Tanggal:</strong> ${new Date(order.created_at).toLocaleString('id-ID')}</p>
        <p><strong>Pelanggan:</strong> ${order.customers?.name || 'Guest'} (${order.customers?.email || '-'})</p>
        <p><strong>Alamat:</strong> ${order.shipping_address}</p>
        <p><strong>Metode Pembayaran:</strong> ${order.payment_method}</p>
        ${order.payment_proof ? `<p><strong>Bukti Transfer:</strong> <a href="${order.payment_proof}" target="_blank">Lihat</a></p>` : ''}
        <p><strong>Status:</strong> ${order.status}</p>
        ${order.tracking_number ? `<p><strong>No. Resi:</strong> ${order.tracking_number}</p>` : ''}
        <h6>Item Pesanan:</h6>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Qty</th>
              <th>Harga</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_items.map(item => `
              <tr>
                <td>${item.products.name}</td>
                <td>${item.quantity}</td>
                <td>${formatRupiah(item.price)}</td>
                <td>${formatRupiah(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p><strong>Total:</strong> ${formatRupiah(order.total_amount)}</p>
        <hr>
        <h6>Update Status</h6>
        <select class="form-select" id="updateStatus">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
        <div class="mb-3 mt-2">
          <label>Nomor Resi (jika dikirim)</label>
          <input type="text" class="form-control" id="trackingNumber" value="${order.tracking_number || ''}">
        </div>
        <button class="btn btn-primary" id="updateStatusBtn">Update</button>
      `;

      document.getElementById('updateStatusBtn').addEventListener('click', async () => {
        const newStatus = document.getElementById('updateStatus').value;
        const tracking = document.getElementById('trackingNumber').value;
        try {
          const res = await fetch('/.netlify/functions/admin/orders-update-status', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ id: order.id, status: newStatus, tracking_number: tracking })
          });
          if (res.ok) {
            alert('Status diperbarui');
            bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
            loadOrders();
          } else {
            alert('Gagal');
          }
        } catch (err) {
          alert('Kesalahan: ' + err.message);
        }
      });

      new bootstrap.Modal(document.getElementById('orderModal')).show();
    } catch (err) {
      modalBody.innerHTML = 'Gagal memuat detail.';
    }
  }
};