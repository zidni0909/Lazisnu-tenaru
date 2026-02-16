# 💰 LAZISNU Tenaru - Sistem Manajemen Donasi

Aplikasi Progressive Web App (PWA) untuk manajemen donasi LAZISNU dengan fitur offline-first, anti-manipulasi, dan thermal printer support.

## ✨ Fitur Utama

### 🔐 Keamanan & Anti-Manipulasi
- Login dengan bcrypt password hashing
- Role-based access (Admin & Juru Pungut)
- Auto logout 30 menit dengan activity tracking
- Edit window 5 menit untuk donasi
- Lock donasi harian untuk mencegah perubahan
- Audit log lengkap untuk semua aksi
- Soft delete untuk data donasi

### 📱 Progressive Web App (PWA)
- Install ke home screen (Android/iOS/Desktop)
- Offline mode dengan localStorage sync
- Service worker untuk caching
- Badge indicator status koneksi
- Auto sync saat koneksi kembali

### 💾 Mode Offline
- Simpan donasi saat offline
- Auto sync ke server saat online
- Badge counter untuk data pending
- Konfirmasi sebelum sync

### 📊 Dashboard & Laporan
- Statistik real-time (hari ini, bulan ini, total)
- Grafik 7 hari terakhir (line chart)
- Grafik per jenis zakat (pie chart)
- Grafik per juru pungut (bar chart)
- Export PDF laporan bulanan
- Backup data ke CSV

### 👥 Manajemen Donatur
- Autocomplete search (case-insensitive)
- Upload CSV bulk import
- UPSERT otomatis (insert/update)
- Soft delete donatur

### 🖨️ Thermal Printer
- Web Bluetooth API integration
- Support 58mm & 80mm paper
- Print receipt otomatis
- Simpan & print dalam 1 klik

### 💵 Format Rupiah Otomatis
- Auto format saat input
- Validasi nominal
- Parse ke integer untuk database

## 🛠️ Tech Stack

- **Frontend**: HTML5, TailwindCSS, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL)
- **PWA**: Service Worker, Web App Manifest
- **Charts**: Chart.js
- **PDF**: jsPDF
- **CSV**: PapaParse
- **Security**: bcryptjs
- **Printer**: Web Bluetooth API

## 📦 Struktur File

```
WEB laziznu tenaru/
├── sql/                      # Database setup scripts
│   ├── SETUP_LENGKAP.sql    # Setup lengkap (RLS, index, sample)
│   ├── add_is_deleted.sql   # Soft delete untuk donasi
│   ├── alter_donasi_add_donatur_id.sql
│   └── create_donatur.sql   # Struktur tabel donatur
├── index.html               # Landing page / Login
├── dashboard.html           # Dashboard Juru Pungut
├── admin.html               # Dashboard Admin
├── manifest.json            # PWA manifest
├── service-worker.js        # Service worker untuk offline
├── netlify.toml             # Netlify config
├── auth.js                  # Authentication & auto logout
├── donasi.js                # CRUD donasi
├── donatur.js               # CRUD donatur + autocomplete
├── users.js                 # CRUD juru pungut
├── admin.js                 # Admin functions
├── audit.js                 # Audit log & lock donasi
├── backup.js                # Export CSV
├── charts.js                # Chart.js integration
├── export.js                # Export PDF admin
├── exportJP.js              # Export PDF juru pungut
├── formatRupiah.js          # Format & parse rupiah
├── offline.js               # Offline mode logic
├── printer.js               # Thermal printer integration
├── toast.js                 # Toast notifications
├── uploadCSVDonatur.js      # CSV upload dengan UPSERT
├── validation.js            # Input validation
└── supabaseClient.js        # Supabase connection

Dokumentasi:
├── README.md                # File ini
├── DEPLOY_NETLIFY.md        # Panduan deploy
├── DOKUMENTASI_GRAFIK.md    # Dokumentasi Chart.js
├── DOKUMENTASI_KEAMANAN.md  # Security features
├── DOKUMENTASI_OFFLINE.md   # Offline mode
├── DOKUMENTASI_PWA.md       # PWA setup
└── DOKUMENTASI_UPLOAD_CSV_V2.md  # CSV upload
```

## 🚀 Quick Start

### 1. Setup Database

Jalankan SQL di Supabase SQL Editor:

```bash
# Jalankan file ini
sql/SETUP_LENGKAP.sql
```

### 2. Konfigurasi Supabase

Edit `supabaseClient.js`:

```javascript
const supabaseUrl = 'https://YOUR-PROJECT.supabase.co'
const supabaseKey = 'YOUR-ANON-KEY'
```

### 3. Jalankan Lokal

```bash
# Gunakan Live Server atau Python HTTP Server
python -m http.server 8000
```

Buka: http://localhost:8000

### 4. Login Default

**Admin:**
- Email: admin@lazisnu.com
- Password: admin123

**Juru Pungut:**
- Buat dari dashboard admin

## 🌐 Deploy ke Netlify (Gratis)

### Opsi 1: Drag & Drop
1. Buka https://app.netlify.com/drop
2. Drag folder project
3. Selesai!

### Opsi 2: Via GitHub
Lihat panduan lengkap di `DEPLOY_NETLIFY.md`

## 📊 Database Schema

### Tabel: users
```sql
- id (uuid, primary key)
- nama (text)
- email (text, unique)
- password (text, bcrypt hash)
- role (text: 'admin' | 'juru_pungut')
- is_active (boolean)
- created_at (timestamp)
```

### Tabel: donasi
```sql
- id (uuid, primary key)
- nama_donatur (text)
- jenis_zakat (text: 'maal' | 'profesi' | 'fitrah' | 's3')
- nominal (bigint)
- metode (text: 'cash' | 'qris')
- tanggal (timestamp)
- juru_pungut_id (uuid, foreign key)
- donatur_id (uuid, foreign key, nullable)
- is_locked (boolean)
- is_deleted (boolean)
- updated_at (timestamp)
- created_at (timestamp)
```

### Tabel: donatur
```sql
- id (uuid, primary key)
- nama (text)
- alamat (text)
- no_hp (text)
- is_deleted (boolean)
- created_at (timestamp)
```

### Tabel: audit_logs
```sql
- id (uuid, primary key)
- table_name (text)
- record_id (uuid)
- action (text)
- old_data (jsonb)
- new_data (jsonb)
- user_id (uuid)
- user_email (text)
- created_at (timestamp)
```

## 🔒 Security Features

1. **Password Hashing**: bcrypt dengan salt 10
2. **Auto Logout**: 30 menit inactivity
3. **Role-Based Access**: Admin vs Juru Pungut
4. **Edit Window**: 5 menit untuk edit donasi
5. **Lock Mechanism**: Lock donasi harian
6. **Audit Trail**: Semua aksi tercatat
7. **Soft Delete**: Data tidak benar-benar dihapus
8. **RLS Disabled**: Untuk development (enable untuk production)

## 📱 PWA Features

- ✅ Installable (Add to Home Screen)
- ✅ Offline capable
- ✅ Background sync
- ✅ Push notifications ready
- ✅ App-like experience
- ✅ Fast loading with caching

## 🎨 UI/UX

- **Design**: TailwindCSS utility-first
- **Responsive**: Mobile-first approach
- **Toast Notifications**: Modern feedback
- **Loading States**: Spinner & skeleton
- **Error Handling**: User-friendly messages
- **Accessibility**: Semantic HTML

## 📈 Performance

- **Lazy Loading**: Charts loaded on demand
- **Debounce**: 300ms untuk autocomplete
- **Batch Processing**: CSV upload
- **Index Optimization**: Database indexes
- **CDN**: TailwindCSS, Chart.js, jsPDF via CDN

## 🐛 Troubleshooting

### Autocomplete tidak muncul
- Cek console browser (F12)
- Pastikan RLS disabled: `ALTER TABLE donatur DISABLE ROW LEVEL SECURITY;`
- Cek ada data: `SELECT * FROM donatur WHERE is_deleted = false;`

### Grafik tidak muncul
- Cek kolom database: `tanggal` bukan `tanggal_donasi`
- Cek Chart.js loaded: `typeof Chart !== 'undefined'`

### Upload CSV error
- Pastikan format: `nama,alamat,no_hp`
- Cek console untuk error detail

### PWA tidak install
- Pastikan HTTPS aktif (otomatis di Netlify)
- Cek manifest.json path benar
- Cek service-worker.js registered

## 📞 Support

Untuk pertanyaan atau issue:
1. Cek dokumentasi di folder `DOKUMENTASI_*.md`
2. Cek console browser untuk error
3. Cek audit_logs di database

## 📄 License

Proprietary - LAZISNU Tenaru

## 👨‍💻 Developer

Developed with ❤️ for LAZISNU Tenaru

---

**Version**: 2.0  
**Last Updated**: 2025  
**Status**: Production Ready ✅
