# DOKUMENTASI STABILISASI & HARDENING SISTEM LAZISNU

## 📋 RINGKASAN FITUR KEAMANAN

Sistem administrasi LAZISNU telah ditingkatkan dengan fitur-fitur keamanan dan stabilitas berikut:

---

## 🔐 1. PROTEKSI HALAMAN BERBASIS ROLE

### Implementasi
File: `auth.js` - Fungsi `checkLogin(requiredRole)`

### Cara Kerja
- **admin.html**: Hanya bisa diakses oleh user dengan role "admin"
- **dashboard.html**: Hanya bisa diakses oleh user dengan role "juru_pungut"
- Jika role tidak sesuai → otomatis redirect ke `index.html`
- Jika belum login → otomatis redirect ke `index.html`

### Kode Implementasi
```javascript
// Di admin.html
const user = checkLogin('admin'); // Hanya admin yang bisa akses

// Di dashboard.html
const user = checkLogin('juru_pungut'); // Hanya juru_pungut yang bisa akses
```

### Keamanan
✅ Tidak bisa bypass dengan mengetik URL langsung
✅ Validasi dilakukan di client-side sebelum render halaman
✅ Data user disimpan di localStorage dengan validasi role

---

## ⏱️ 2. AUTO LOGOUT (30 MENIT IDLE)

### Implementasi
File: `auth.js` - Fungsi `initAutoLogout()`, `resetLogoutTimer()`, `stopAutoLogout()`

### Cara Kerja
- Timer dimulai saat user login dan halaman dimuat
- Timer direset otomatis saat ada aktivitas:
  - Mouse movement (mousemove)
  - Keyboard input (keypress)
  - Click
  - Scroll
- Jika tidak ada aktivitas selama 30 menit → alert + logout otomatis
- Timer dibersihkan saat logout manual

### Kode Implementasi
```javascript
// Di admin.html dan dashboard.html
if (user) {
  initAutoLogout(); // Aktifkan auto logout
  // ... kode lainnya
}
```

### Konfigurasi
```javascript
const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 menit (dalam milidetik)
```

Untuk mengubah durasi, edit nilai `TIMEOUT_DURATION` di `auth.js`.

### Keamanan
✅ Mencegah akses tidak sah jika user meninggalkan komputer
✅ Timer otomatis reset saat ada aktivitas
✅ Alert diberikan sebelum logout
✅ Session dibersihkan dari localStorage

---

## 💾 3. BACKUP CSV DONASI

### Implementasi
File: `backup.js` - Fungsi `exportDonasiToCSV()`

### Cara Kerja
- Tombol "💾 Backup Data CSV" di Utility Panel (admin.html)
- Export seluruh data donasi ke file CSV
- Query data dari tabel `donasi` dan `users`
- Merge data client-side (menghindari relationship error)
- Download otomatis dengan nama file: `backup_donasi_YYYY-MM-DD.csv`

### Format CSV
```
Tanggal,Donatur,Jenis,Nominal,Metode,Juru Pungut
2024-01-15,Ahmad,maal,500000,cash,Budi
2024-01-15,Siti,fitrah,50000,qris,Andi
...
```

### Kolom CSV
1. **Tanggal**: Tanggal donasi (format: DD/MM/YYYY)
2. **Donatur**: Nama donatur
3. **Jenis**: Jenis zakat (maal/profesi/fitrah/s3)
4. **Nominal**: Jumlah donasi (angka)
5. **Metode**: Metode pembayaran (cash/qris)
6. **Juru Pungut**: Nama juru pungut yang input

### Kode Implementasi
```javascript
// Di admin.html
document.getElementById('btnBackupCSV').addEventListener('click', async () => {
  const result = await exportDonasiToCSV();
  alert(`Backup CSV berhasil! Total ${result.count} data diexport.`);
});
```

### Keamanan
✅ Hanya admin yang bisa akses
✅ Data diambil langsung dari database
✅ Tidak ada manipulasi data saat export
✅ File CSV bisa dibuka di Excel/Google Sheets

---

## ✅ 4. VALIDASI TAMBAHAN

### A. Admin Tidak Bisa Nonaktifkan Diri Sendiri

**Implementasi**: File `admin.html` - Event listener tombol nonaktifkan

```javascript
// Cek apakah admin mencoba nonaktifkan dirinya sendiri
if (userId === user.id) {
  alert('Tidak bisa menonaktifkan akun sendiri');
  return;
}
```

**Keamanan**:
✅ Mencegah admin mengunci diri sendiri
✅ Validasi dilakukan sebelum request ke database
✅ Alert jelas untuk user

---

### B. Juru Pungut Tidak Bisa Akses Admin Panel

**Implementasi**: File `auth.js` - Fungsi `checkLogin('admin')`

```javascript
// Di admin.html
const user = checkLogin('admin');
// Jika role bukan admin → redirect ke index.html
```

**Keamanan**:
✅ Validasi role sebelum render halaman
✅ Tidak bisa bypass dengan URL langsung
✅ Redirect otomatis ke login

---

### C. Validasi Nonaktifkan User dengan Donasi Belum Terkunci

**Implementasi**: File `users.js` - Fungsi `nonaktifkanUser()`

```javascript
// Cek apakah ada donasi hari ini yang belum dikunci
const { data: donasiHariIni } = await supabase
  .from('donasi')
  .select('id')
  .eq('juru_pungut_id', userId)
  .gte('tanggal', today.toISOString())
  .eq('is_locked', false);

if (donasiHariIni && donasiHariIni.length > 0) {
  throw new Error(`User ini memiliki ${donasiHariIni.length} donasi hari ini yang belum dikunci.`);
}
```

**Keamanan**:
✅ Mencegah kehilangan data donasi yang belum dikunci
✅ Admin harus lock donasi dulu sebelum nonaktifkan user
✅ Error message jelas dengan jumlah donasi

---

## 📁 STRUKTUR FILE FINAL

```
WEB laziznu tenaru/
├── index.html              # Login page
├── admin.html              # Admin dashboard (role: admin)
├── dashboard.html          # Juru pungut dashboard (role: juru_pungut)
├── supabaseClient.js       # Supabase connection
├── auth.js                 # ✨ Login, logout, proteksi role, auto logout
├── users.js                # User management (CRUD, validasi)
├── donasi.js               # Donasi management
├── audit.js                # Audit log & lock donasi
├── admin.js                # Admin functions (statistik, ringkasan)
├── export.js               # Export PDF admin
├── exportJP.js             # Export PDF juru pungut
├── backup.js               # ✨ Backup CSV donasi
├── printer.js              # Bluetooth thermal printer
├── setup_anti_manipulasi.sql  # Database setup
└── add_is_active.sql       # Add is_active column
```

**✨ = File baru/dimodifikasi untuk stabilisasi**

---

## 🔧 CARA PENGGUNAAN

### 1. Proteksi Halaman
**Otomatis aktif** - Tidak perlu konfigurasi tambahan.
- Coba akses `admin.html` dengan akun juru_pungut → redirect ke login
- Coba akses `dashboard.html` dengan akun admin → redirect ke login

### 2. Auto Logout
**Otomatis aktif** - Timer dimulai saat login.
- Biarkan halaman idle selama 30 menit → akan logout otomatis
- Gerakkan mouse/ketik → timer reset otomatis

### 3. Backup CSV
1. Login sebagai admin
2. Scroll ke "Utility Panel"
3. Klik tombol "💾 Backup Data CSV"
4. File CSV akan otomatis terdownload

### 4. Validasi Nonaktifkan User
1. Login sebagai admin
2. Pergi ke "Manajemen Juru Pungut"
3. Coba nonaktifkan user yang punya donasi hari ini belum dikunci
4. Sistem akan menolak dengan pesan error
5. Lock donasi dulu dengan tombol "🔒 Lock Donasi Hari Ini"
6. Baru bisa nonaktifkan user

---

## 🛡️ KEAMANAN & BEST PRACTICES

### ✅ Yang Sudah Diimplementasikan
1. **Role-based Access Control (RBAC)**: Admin & juru_pungut terpisah
2. **Session Timeout**: Auto logout 30 menit
3. **Password Hashing**: bcrypt dengan salt 10
4. **Audit Logging**: Semua aksi tercatat
5. **Anti-Manipulation**: Lock donasi, batas edit 5 menit
6. **Data Backup**: Export CSV untuk disaster recovery
7. **Input Validation**: Validasi di client & server
8. **Active Status Check**: User nonaktif tidak bisa login

### 🔒 Rekomendasi Tambahan (Opsional)
1. **HTTPS**: Deploy dengan SSL/TLS certificate
2. **Rate Limiting**: Batasi login attempt (3x gagal = block 15 menit)
3. **2FA**: Two-factor authentication untuk admin
4. **Database Backup**: Automated backup Supabase setiap hari
5. **Monitoring**: Log viewer untuk track suspicious activity

---

## 🐛 TROUBLESHOOTING

### Auto Logout Tidak Bekerja
**Solusi**: Pastikan `initAutoLogout()` dipanggil setelah `checkLogin()` di admin.html dan dashboard.html.

### Backup CSV Kosong
**Solusi**: Cek koneksi Supabase dan pastikan ada data di tabel `donasi`.

### Tidak Bisa Nonaktifkan User
**Solusi**: Lock donasi hari ini dulu dengan tombol "🔒 Lock Donasi Hari Ini".

### Redirect Loop ke Login
**Solusi**: Hapus localStorage dengan `localStorage.clear()` di browser console, lalu login ulang.

---

## 📞 SUPPORT

Jika ada pertanyaan atau issue:
1. Cek file `auth.js` untuk proteksi & auto logout
2. Cek file `backup.js` untuk export CSV
3. Cek file `users.js` untuk validasi user management
4. Cek browser console untuk error message

---

## 📝 CHANGELOG

### Version 2.0 - Stabilisasi & Hardening (2024)
- ✅ Proteksi halaman berbasis role
- ✅ Auto logout 30 menit idle
- ✅ Backup CSV donasi
- ✅ Validasi admin tidak bisa nonaktifkan diri sendiri
- ✅ Validasi juru pungut tidak bisa akses admin panel
- ✅ Validasi nonaktifkan user dengan donasi belum terkunci

### Version 1.0 - Initial Release
- Login multi-role
- Audit log
- Anti manipulasi donasi
- Printer thermal Bluetooth
- Export PDF
- Manajemen user

---

**Sistem LAZISNU - Aman, Stabil, dan Terpercaya** 🔐
