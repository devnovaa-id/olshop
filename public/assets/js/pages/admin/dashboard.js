window.renderAdminDashboard = function() {
  if (!localStorage.getItem('token')) {
    window.location.hash = '#/login';
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="row">
      <div class="col-md-3">
        <div class="list-group admin-sidebar">
          <a href="#/admin" class="list-group-item list-group-item-action active"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</a>
          <a href="#/admin/products" class="list-group-item list-group-item-action"><i class="fas fa-box me-2"></i>Produk</a>
          <a href="#/admin/categories" class="list-group-item list-group-item-action"><i class="fas fa-tags me-2"></i>Kategori</a>
          <a href="#/admin/orders" class="list-group-item list-group-item-action"><i class="fas fa-shopping-cart me-2"></i>Pesanan</a>
          <a href="#/admin/customers" class="list-group-item list-group-item-action"><i class="fas fa-users me-2"></i>Pelanggan</a>
          ${JSON.parse(localStorage.getItem('user')).role === 'master' ? '<a href="#/admin/users" class="list-group-item list-group-item-action"><i class="fas fa-user-cog me-2"></i>Admin</a>' : ''}
          <a href="#/admin/settings" class="list-group-item list-group-item-action"><i class="fas fa-cog me-2"></i>Pengaturan</a>
        </div>
      </div>
      <div class="col-md-9 admin-content">
        <h2 class="mb-4">Dashboard</h2>
        <div id="stats" class="row">
          <div class="col-md-4 mb-3">
            <div class="card-stats">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="stats-title">Total Pesanan</p>
                  <p class="stats-number" id="totalOrders">0</p>
                </div>
                <i class="fas fa-shopping-bag fa-3x opacity-50"></i>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card-stats" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="stats-title">Pendapatan</p>
                  <p class="stats-number" id="totalRevenue">Rp 0</p>
                </div>
                <i class="fas fa-money-bill-wave fa-3x opacity-50"></i>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card-stats" style="background: linear-gradient(135deg, #5f2c82 0%, #49a09d 100%);">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="stats-title">Produk Terjual</p>
                  <p class="stats-number" id="totalSold">0</p>
                </div>
                <i class="fas fa-chart-line fa-3x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-md-6">
            <div class="card shadow">
              <div class="card-header bg-transparent">
                <h5>Status Pesanan</h5>
              </div>
              <div class="card-body">
                <canvas id="statusChart" width="400" height="300"></canvas>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card shadow">
              <div class="card-header bg-transparent">
                <h5>Pesanan 7 Hari Terakhir</h5>
              </div>
              <div class="card-body">
                <canvas id="dailyChart" width="400" height="300"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  fetch('/api/admin/dashboard-stats', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
    .then(res => res.json())
    .then(stats => {
      document.getElementById('totalOrders').textContent = stats.totalOrders;
      document.getElementById('totalRevenue').textContent = formatRupiah(stats.totalRevenue);
      document.getElementById('totalSold').textContent = stats.totalSold;

      const ctxStatus = document.getElementById('statusChart').getContext('2d');
      new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
          datasets: [{
            data: [
              stats.statusCounts.pending,
              stats.statusCounts.processing,
              stats.statusCounts.shipped,
              stats.statusCounts.delivered,
              stats.statusCounts.cancelled
            ],
            backgroundColor: ['#ffc107', '#17a2b8', '#007bff', '#28a745', '#dc3545'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });

      const ctxDaily = document.getElementById('dailyChart').getContext('2d');
      const dates = Object.keys(stats.dailyData).sort();
      const counts = dates.map(date => stats.dailyData[date].count);
      new Chart(ctxDaily, {
        type: 'line',
        data: {
          labels: dates.map(d => new Date(d).toLocaleDateString('id-ID', { weekday: 'short' })),
          datasets: [{
            label: 'Jumlah Pesanan',
            data: counts,
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      showToast('Error', 'Gagal memuat statistik', 'error');
    });
};