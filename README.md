# 🚀 Toko Online UMKM - Modern SPA + Netlify Functions + Supabase

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Netlify](https://img.shields.io/badge/Netlify-Functions-orange)

Aplikasi toko online modern untuk UMKM dengan arsitektur **Single Page Application (SPA)** menggunakan Vanilla JavaScript, backend **Netlify Functions**, database **Supabase (PostgreSQL)**, dan penyimpanan file **Supabase Storage**. Dilengkapi dengan dashboard admin yang interaktif, grafik menggunakan Chart.js, serta desain responsif dengan Bootstrap 5.

## ✨ Fitur Utama

### Publik
- Beranda dengan slider dan produk unggulan
- Katalog produk dengan filter kategori dan pencarian
- Detail produk, tambah ke keranjang
- Keranjang belanja (localStorage)
- Checkout dengan pilihan transfer bank (upload bukti) atau COD
- Lacak pesanan berdasarkan nomor pesanan
- Registrasi pelanggan (opsional)

### Admin
- Dashboard dengan statistik dan grafik (Chart.js)
- Manajemen produk (CRUD + upload gambar)
- Manajemen kategori
- Manajemen pesanan (filter, update status, input resi)
- Manajemen pelanggan
- Manajemen admin (khusus Master)
- Pengaturan toko (nama, alamat, rekening, ongkir)

## 🛠️ Teknologi

- **Frontend**: Vanilla JS, Bootstrap 5, Font Awesome, Chart.js
- **Backend**: Netlify Functions (Node.js)
- **Database**: Supabase (PostgreSQL) + Row Level Security
- **Storage**: Supabase Storage
- **Email**: SendGrid (opsional)
- **Autentikasi**: JWT

## 📋 Prasyarat

- Node.js v18+
- Akun [Netlify](https://netlify.com)
- Akun [Supabase](https://supabase.com)
- Akun [SendGrid](https://sendgrid.com) (opsional untuk email)

## 🚀 Cara Instalasi

### 1. Clone atau Download Proyek

```bash
git clone <repository-url>
cd project
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Setup Supabase

- Buat proyek baru di Supabase.
- Jalankan semua SQL dari file `database.sql` (lihat bagian **Database** di bawah) di SQL Editor.
- Buat dua bucket storage: `product-images` dan `payment-proofs` (public).
- Atur policy bucket agar anon key bisa upload (contoh di bawah).
- **Buat user master awal** dengan menjalankan SQL berikut:

```sql
INSERT INTO users (name, email, password, role) 
VALUES ('Master', 'master@tokomu.com', '$2a$10$...', 'master');
```

  Ganti `$2a$10$...` dengan hash bcrypt dari password yang diinginkan. Cara generate hash:

  Buat file sementara `hash.js`:
  ```javascript
  const bcrypt = require('bcryptjs');
  const password = 'password123'; // ganti dengan password Anda
  const hash = bcrypt.hashSync(password, 10);
  console.log(hash);
  ```
  Jalankan dengan: `node hash.js`, lalu copy hash yang dihasilkan.

### 4. Konfigurasi Environment

Salin file `.env.example` menjadi `.env` dan isi dengan credentials Anda:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_super_secret_key_change_this
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@tokomu.com
```

> **Catatan**: Jangan commit `.env` ke git. Untuk production, set environment variables di dashboard Netlify.

### 5. Jalankan di Lokal

```bash
npm run dev
```

Buka browser ke `http://localhost:8888`.

### 6. Deploy ke Netlify

- Commit kode ke repository Git (GitHub, GitLab, dll).
- Hubungkan repository ke Netlify.
- Set environment variables di Netlify (sama seperti di `.env`).
- Deploy!

## 📁 Struktur Proyek

Penjelasan struktur folder ada di dokumentasi kode.

## 🗄️ Database Schema

```sql
-- 1. users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('master', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('transfer', 'cod')),
    payment_proof VARCHAR(255),
    shipping_address TEXT NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tracking_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. order_items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- 7. settings
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT
);

-- Fungsi untuk mengurangi stok
CREATE OR REPLACE FUNCTION decrement_stock(product_id INT, quantity INT)
RETURNS void AS $$
BEGIN
  UPDATE products SET stock = stock - quantity WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;
```

### Policy Storage (contoh untuk bucket `product-images`)

```sql
-- Izinkan anon membaca
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
-- Izinkan anon upload
CREATE POLICY "Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'anon');
```

## 🔐 Keamanan

- JWT digunakan untuk autentikasi admin.
- Service key Supabase hanya digunakan di backend (Netlify Functions).
- Validasi input di backend.
- Upload file dibatasi tipe dan ukuran (belum diimplementasikan, bisa ditambahkan).

## 📧 Email

Notifikasi email dikirim via SendGrid. Pastikan API key valid. Jika tidak ingin menggunakan email, hapus bagian `sendEmail` di fungsi checkout dan update status.

## 🎨 Desain Modern

- Menggunakan Bootstrap 5 dengan kustomisasi warna gradien.
- Card produk dengan efek hover.
- Dashboard dengan kartu statistik berwarna dan grafik interaktif.
- Responsif di semua perangkat.

## 📄 Lisensi

Proyek ini dibuat untuk keperluan komersial. Dilarang mendistribusikan tanpa izin.

---

**Dikembangkan dengan ❤️ untuk UMKM Indonesia - 2026**
