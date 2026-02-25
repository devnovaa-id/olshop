window.renderCheckout = function() {
  const cart = getCart();
  if (cart.length === 0) {
    window.location.hash = '#/cart';
    return;
  }

  const app = document.getElementById('app');
  let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  let shippingCost = 0;

  fetch('/.netlify/functions/admin/settings')
    .then(res => res.json())
    .then(settings => {
      shippingCost = parseInt(settings.shipping_cost) || 0;
      renderForm(shippingCost);
    })
    .catch(() => renderForm(0));

  function renderForm(shippingCost) {
    const total = subtotal + shippingCost;

    app.innerHTML = `
      <h2>Checkout</h2>
      <div class="row">
        <div class="col-md-8">
          <form id="checkoutForm" class="card p-4 shadow">
            <h4>Data Pengiriman</h4>
            <div class="mb-3">
              <label class="form-label">Nama Lengkap</label>
              <input type="text" class="form-control" id="name" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" id="email">
              <small class="text-muted">Opsional, untuk notifikasi</small>
            </div>
            <div class="mb-3">
              <label class="form-label">Nomor Telepon</label>
              <input type="text" class="form-control" id="phone" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Alamat Pengiriman</label>
              <textarea class="form-control" id="address" rows="3" required></textarea>
            </div>

            <h4>Metode Pembayaran</h4>
            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="radio" name="paymentMethod" id="paymentTransfer" value="transfer" checked>
                <label class="form-check-label" for="paymentTransfer">
                  Transfer Bank
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="paymentMethod" id="paymentCOD" value="cod">
                <label class="form-check-label" for="paymentCOD">
                  Cash on Delivery (COD)
                </label>
              </div>
            </div>

            <div id="transferSection" class="mb-3">
              <label class="form-label">Upload Bukti Transfer</label>
              <input type="file" class="form-control" id="paymentProof" accept="image/*">
              <small class="text-muted">Format: JPG, PNG. Maks 2MB</small>
            </div>

            <button type="submit" class="btn btn-success btn-lg">Buat Pesanan</button>
          </form>
        </div>
        <div class="col-md-4">
          <div class="card shadow">
            <div class="card-body">
              <h5>Ringkasan Pesanan</h5>
              <ul class="list-group list-group-flush">
                ${cart.map(item => `
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${item.name} x ${item.quantity}
                    <span>${formatRupiah(item.price * item.quantity)}</span>
                  </li>
                `).join('')}
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Subtotal
                  <span>${formatRupiah(subtotal)}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Ongkos Kirim
                  <span>${formatRupiah(shippingCost)}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center fw-bold">
                  Total
                  <span class="text-primary">${formatRupiah(total)}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    const transferRadio = document.getElementById('paymentTransfer');
    const codRadio = document.getElementById('paymentCOD');
    const transferSection = document.getElementById('transferSection');

    function toggleTransferSection() {
      transferSection.style.display = transferRadio.checked ? 'block' : 'none';
    }
    transferRadio.addEventListener('change', toggleTransferSection);
    codRadio.addEventListener('change', toggleTransferSection);
    toggleTransferSection();

    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const address = document.getElementById('address').value;
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
      let paymentProof = null;

      if (paymentMethod === 'transfer') {
        const fileInput = document.getElementById('paymentProof');
        if (!fileInput.files[0]) {
          alert('Harap upload bukti transfer');
          return;
        }
        try {
          const { uploadImage } = await import('../utils/supabase.js');
          paymentProof = await uploadImage(fileInput.files[0], 'payment-proofs', 'proofs');
        } catch (err) {
          alert('Gagal upload bukti: ' + err.message);
          return;
        }
      }

      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const payload = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        paymentMethod,
        paymentProof,
        items,
        shippingCost
      };

      try {
        const res = await fetch('/.netlify/functions/public/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.removeItem('cart');
          window.location.hash = `#/track?order=${data.orderNumber}`;
        } else {
          alert('Gagal: ' + data.message);
        }
      } catch (err) {
        alert('Terjadi kesalahan: ' + err.message);
      }
    });
  }
};