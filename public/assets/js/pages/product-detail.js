window.renderProductDetail = function(path) {
  const slug = path.split('/')[2];
  const app = document.getElementById('app');
  app.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> Memuat...</div>`;

  fetch(`/api/public/product-detail?slug=${slug}`)
    .then(res => res.json())
    .then(product => {
      app.innerHTML = `
        <div class="row">
          <div class="col-md-6">
            <img src="${product.image || 'https://via.placeholder.com/500'}" class="img-fluid rounded shadow" alt="${product.name}">
          </div>
          <div class="col-md-6">
            <h2>${product.name}</h2>
            <p class="text-muted">Kategori: ${product.categories?.name || 'Umum'}</p>
            <h3 class="text-primary">${formatRupiah(product.price)}</h3>
            <p>Stok: ${product.stock}</p>
            <p>${product.description || 'Tidak ada deskripsi.'}</p>
            <div class="form-floating mb-3">
              <input type="number" class="form-control" id="quantity" value="1" min="1" max="${product.stock}" placeholder="Jumlah">
              <label for="quantity">Jumlah</label>
            </div>
            <button class="btn btn-primary btn-lg" id="addToCartBtn" ${product.stock === 0 ? 'disabled' : ''}><i class="fas fa-cart-plus me-2"></i>Tambah ke Keranjang</button>
          </div>
        </div>
      `;

      document.getElementById('addToCartBtn').addEventListener('click', () => {
        const qty = parseInt(document.getElementById('quantity').value);
        if (qty > product.stock) {
          showToast('Gagal', 'Jumlah melebihi stok', 'error');
          return;
        }
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          slug: product.slug,
          stock: product.stock
        }, qty);
      });
    })
    .catch(err => {
      app.innerHTML = '<div class="alert alert-danger">Produk tidak ditemukan</div>';
      showToast('Error', 'Produk tidak ditemukan', 'error');
    });
};