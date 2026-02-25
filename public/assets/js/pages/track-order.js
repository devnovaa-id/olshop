window.renderTrackOrder = function() {
  const params = new URLSearchParams(window.location.hash.split('?')[1]);
  const orderNumber = params.get('order') || '';

  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Lacak Pesanan</h2>
    <div class="row justify-content-center">
      <div class="col-md-6">
        <form id="trackForm" class="card p-4 shadow">
          <div class="mb-3">
            <label class="form-label">Masukkan Nomor Pesanan</label>
            <input type="text" class="form-control" id="orderNumber" value="${orderNumber}" required>
          </div>
          <button type="submit" class="btn btn-primary">Lacak</button>
        </form>
        <div id="trackResult" class="mt-4"></div>
      </div>
    </div>
  `;

  document.getElementById('trackForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const number = document.getElementById('orderNumber').value;
    window.location.hash = `#/track?order=${number}`;
    loadOrder(number);
  });

  if (orderNumber) {
    loadOrder(orderNumber);
  }

  function loadOrder(number) {
    const resultDiv = document.getElementById('trackResult');
    resultDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Mencari...</div>';
    fetch(`/.netlify/functions/public/track-order?orderNumber=${encodeURIComponent(number)}`)
      .then(res => {
        if (!res.ok) throw new Error('Pesanan tidak ditemukan');
        return res.json();
      })
      .then(order => {
        let statusBadge = '';
        switch (order.status) {
          case 'pending': statusBadge = '<span class="badge bg-warning">Pending</span>'; break;
          case 'processing': statusBadge = '<span class="badge bg-info">Diproses</span>'; break;
          case 'shipped': statusBadge = '<span class="badge bg-primary">Dikirim</span>'; break;
          case 'delivered': statusBadge = '<span class="badge bg-success">Selesai</span>'; break;
          case 'cancelled': statusBadge = '<span class="badge bg-danger">Dibatalkan</span>'; break;
        }
        resultDiv.innerHTML = `
          <div class="card shadow">
            <div class="card-body">
              <h5>Detail Pesanan ${order.order_number}</h5>
              <p>Status: ${statusBadge}</p>
              <p>Tanggal: ${new Date(order.created_at).toLocaleString('id-ID')}</p>
              <p>Metode Pembayaran: ${order.payment_method === 'transfer' ? 'Transfer Bank' : 'COD'}</p>
              ${order.tracking_number ? `<p>Nomor Resi: ${order.tracking_number}</p>` : ''}
              <h6>Item:</h6>
              <ul>
                ${order.order_items.map(item => `
                  <li>${item.products.name} x ${item.quantity} = ${formatRupiah(item.price * item.quantity)}</li>
                `).join('')}
              </ul>
              <p>Total: ${formatRupiah(order.total_amount)}</p>
            </div>
          </div>
        `;
      })
      .catch(err => {
        resultDiv.innerHTML = '<div class="alert alert-danger">Pesanan tidak ditemukan</div>';
      });
  }
};