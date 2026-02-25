window.renderCart = function() {
  const app = document.getElementById('app');
  const cart = getCart();

  if (cart.length === 0) {
    app.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>Keranjang belanja kosong. <a href="#/products">Belanja sekarang</a></div>';
    return;
  }

  let total = 0;
  cart.forEach(item => { total += item.price * item.quantity; });

  app.innerHTML = `
    <h2>Keranjang Belanja</h2>
    <div class="row">
      <div class="col-md-8">
        <div id="cartItems"></div>
      </div>
      <div class="col-md-4">
        <div class="card shadow">
          <div class="card-body">
            <h5 class="card-title">Ringkasan Belanja</h5>
            <p class="card-text">Total: <span class="fw-bold fs-4 text-primary" id="cartTotal">${formatRupiah(total)}</span></p>
            <a href="#/checkout" class="btn btn-success w-100 mb-2">Checkout</a>
            <button class="btn btn-outline-danger w-100" id="clearCartBtn">Kosongkan Keranjang</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const cartItemsDiv = document.getElementById('cartItems');
  cartItemsDiv.innerHTML = cart.map(item => `
    <div class="cart-item row align-items-center">
      <div class="col-2">
        <img src="${item.image || 'https://via.placeholder.com/100'}" class="img-fluid rounded" alt="${item.name}">
      </div>
      <div class="col-4">
        <h6>${item.name}</h6>
      </div>
      <div class="col-2">
        ${formatRupiah(item.price)}
      </div>
      <div class="col-2">
        <input type="number" class="form-control quantity-input" data-id="${item.id}" value="${item.quantity}" min="1" max="${item.stock}">
      </div>
      <div class="col-2">
        <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function() {
      const id = this.dataset.id;
      const newQty = parseInt(this.value);
      if (newQty < 1) {
        removeFromCart(id);
      } else {
        updateCartQuantity(id, newQty);
      }
      renderCart();
    });
  });

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.dataset.id;
      removeFromCart(id);
      renderCart();
    });
  });

  document.getElementById('clearCartBtn').addEventListener('click', () => {
    localStorage.removeItem('cart');
    renderCart();
  });
};