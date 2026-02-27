console.log('Toko UMKM App - Modern 2026');

// Ripple effect untuk semua tombol
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = e.clientX - rect.left - size/2 + 'px';
  ripple.style.top = e.clientY - rect.top - size/2 + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});