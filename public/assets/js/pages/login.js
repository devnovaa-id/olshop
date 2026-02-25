window.renderLogin = function() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body p-5">
            <h2 class="card-title text-center mb-4"><i class="fas fa-lock me-2"></i>Login Admin</h2>
            <form id="loginForm">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" required>
              </div>
              <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
            <div id="loginMessage" class="mt-3"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msgDiv = document.getElementById('loginMessage');

    try {
      const res = await fetch('/.netlify/functions/auth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        msgDiv.innerHTML = `<div class="alert alert-success">Login berhasil! Mengalihkan...</div>`;
        updateNavbar();
        setTimeout(() => {
          window.location.hash = '#/admin';
        }, 1000);
      } else {
        msgDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
      }
    } catch (err) {
      msgDiv.innerHTML = `<div class="alert alert-danger">Terjadi kesalahan: ${err.message}</div>`;
    }
  });
};