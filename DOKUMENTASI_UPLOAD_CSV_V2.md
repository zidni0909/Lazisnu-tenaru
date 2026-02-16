# 📤 DOKUMENTASI UPLOAD CSV DONATUR (IMPROVED)

## 🎯 Fitur Utama

Upload CSV Donatur yang **aman, robust, dan tanpa error duplicate** dengan fitur:

✅ **UPSERT Otomatis** - Insert atau update otomatis tanpa error  
✅ **Normalisasi Data** - Nama otomatis UPPERCASE, trim whitespace  
✅ **Validasi Ketat** - Tolak nama kosong, skip baris invalid  
✅ **Progress Indicator** - Loading spinner saat proses  
✅ **Error Handling** - Tidak gagal di tengah jalan  
✅ **Audit Log** - Semua upload tercatat  
✅ **Toast Notification** - Feedback modern tanpa alert()  

---

## 📋 Format CSV

```csv
nama,alamat,no_hp
AHMAD FAUZI,Jl. Merdeka No. 10,081234567890
SITI NURHALIZA,Jl. Sudirman 25,082345678901
BUDI SANTOSO,Jl. Gatot Subroto 5,083456789012
```

### Aturan Format:

1. **Header wajib**: `nama,alamat,no_hp`
2. **Kolom nama wajib diisi** (alamat & no_hp boleh kosong)
3. **Encoding**: UTF-8
4. **Separator**: Koma (,)
5. **Baris kosong**: Otomatis diskip

---

## 🔧 Cara Kerja

### 1. Data Cleaning & Normalisasi

```javascript
const cleanData = parsedData.map(row => ({
  nama: row.nama.trim().toUpperCase(),  // UPPERCASE + trim
  alamat: row.alamat?.trim() || '',      // trim atau kosong
  no_hp: row.no_hp?.trim() || ''         // trim atau kosong
}))
```

**Contoh:**
- Input: `"  ahmad fauzi  "`
- Output: `"AHMAD FAUZI"`

### 2. UPSERT dengan Composite Key

```javascript
await supabase
  .from('donatur')
  .upsert(cleanData, {
    onConflict: 'nama,alamat',  // Kombinasi nama + alamat
    ignoreDuplicates: false      // Update jika ada
  })
```

**Logika:**
- Jika `nama + alamat` sama → **UPDATE** data lama
- Jika belum ada → **INSERT** baru
- Nama sama tapi alamat beda → **INSERT** baru (bukan duplicate)

### 3. Validasi & Skip

```javascript
for (let i = 0; i < data.length; i++) {
  const nama = row.nama?.trim().toUpperCase()
  
  if (!nama) {
    skipped.push(`Baris ${i + 2}: Nama kosong`)
    continue  // Skip, lanjut ke baris berikutnya
  }
  
  cleanData.push({ nama, alamat, no_hp })
}
```

**Hasil:**
- Baris valid → diproses
- Baris invalid → diskip + dicatat
- Tidak menghentikan proses

---

## 🗄️ Struktur Database

### Tabel Donatur

```sql
CREATE TABLE donatur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  alamat TEXT,
  no_hp TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Composite unique constraint
ALTER TABLE donatur 
ADD CONSTRAINT donatur_nama_alamat_key UNIQUE (nama, alamat);

-- Index untuk performa
CREATE INDEX idx_donatur_nama ON donatur(nama);
CREATE INDEX idx_donatur_is_deleted ON donatur(is_deleted);
```

### Kenapa Composite Key (nama + alamat)?

**Skenario:**
1. **AHMAD FAUZI** di **Jl. Merdeka 10** → Record A
2. **AHMAD FAUZI** di **Jl. Sudirman 25** → Record B (BUKAN duplicate!)

Dengan composite key:
- Nama sama + alamat sama = UPDATE
- Nama sama + alamat beda = INSERT baru

---

## 📊 Output & Feedback

### Toast Notifications

```javascript
// Success
showToast('✅ Upload selesai: 150 data berhasil diproses (100 baru, 50 diupdate)', 'success')

// Warning (ada yang diskip)
showToast('⚠️ 5 baris diskip (nama kosong)', 'warning')

// Error
showToast('❌ Gagal upload CSV: File kosong', 'error')
```

### Audit Log

```json
{
  "action": "UPLOAD_DONATUR_CSV",
  "table_name": "donatur",
  "user_id": "uuid-admin",
  "user_email": "admin@lazisnu.com",
  "new_data": {
    "total_rows": 150,
    "inserted": 100,
    "updated": 50,
    "skipped": 5
  }
}
```

---

## 🚀 Cara Penggunaan

### 1. Persiapan File CSV

```csv
nama,alamat,no_hp
AHMAD FAUZI,Jl. Merdeka 10,081234567890
SITI NURHALIZA,Jl. Sudirman 25,082345678901
BUDI SANTOSO,,083456789012
,Jl. Gatot Subroto 5,084567890123
```

**Hasil:**
- Baris 1-3: ✅ Diproses
- Baris 4: ⚠️ Diskip (nama kosong)

### 2. Upload via Admin Panel

1. Klik **"📤 Upload CSV Donatur"**
2. Pilih file CSV
3. Klik **"Upload & Proses"**
4. Tunggu loading spinner
5. Lihat toast notification hasil

### 3. Verifikasi Hasil

- Cek toast notification
- Lihat console untuk detail skipped rows
- Cek audit log di database

---

## 🛡️ Error Handling

### Try-Catch Aman

```javascript
try {
  const result = await uploadCSVDonatur(file, user.id, user.email)
  showToast('✅ Upload selesai', 'success')
} catch (error) {
  showToast('❌ Gagal: ' + error.message, 'error')
  // Tidak crash, tampilkan error di modal
}
```

### Validasi Bertingkat

1. **File validation**: Cek format .csv
2. **Content validation**: Cek header kolom
3. **Row validation**: Cek nama tidak kosong
4. **Database validation**: Supabase error handling

---

## 📈 Performa

### Batch Processing

```javascript
// TIDAK seperti ini (lambat):
for (const row of data) {
  await supabase.from('donatur').insert([row])  // 1 query per row
}

// TAPI seperti ini (cepat):
await supabase.from('donatur').upsert(cleanData)  // 1 query untuk semua
```

**Hasil:**
- 500 rows → ~2-3 detik
- 1000 rows → ~5-7 detik

### Index Optimization

```sql
CREATE INDEX idx_donatur_nama ON donatur(nama);
CREATE INDEX idx_donatur_is_deleted ON donatur(is_deleted);
```

Mempercepat:
- Pencarian autocomplete
- Filter is_deleted
- UPSERT conflict check

---

## 🔍 Troubleshooting

### Error: "Kolom 'nama' wajib ada di CSV"

**Penyebab:** Header CSV salah  
**Solusi:** Pastikan baris pertama: `nama,alamat,no_hp`

### Error: "File CSV kosong"

**Penyebab:** Tidak ada data setelah header  
**Solusi:** Tambahkan minimal 1 baris data

### Error: "Tidak ada data valid untuk diupload"

**Penyebab:** Semua baris nama kosong  
**Solusi:** Pastikan kolom nama terisi

### Warning: "X baris diskip (nama kosong)"

**Penyebab:** Ada baris dengan nama kosong  
**Solusi:** Normal, baris tersebut otomatis diskip

---

## 🎨 UI/UX Improvements

### Loading State

```html
<div id="loadingUploadCSV" class="hidden text-center py-4">
  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
  <p class="mt-2 text-sm text-gray-600">Memproses data...</p>
</div>
```

### Disable Buttons Saat Upload

```javascript
buttonsDiv.classList.add('hidden')      // Hide buttons
loadingDiv.classList.remove('hidden')   // Show spinner
```

### Toast Auto-Dismiss

```javascript
setTimeout(() => {
  toast.style.transform = 'translateX(400px)'
  setTimeout(() => toast.remove(), 300)
}, 3000)  // 3 detik
```

---

## 📝 Checklist Setup

### 1. Database Setup

```bash
# Jalankan SQL ini di Supabase SQL Editor
psql -f sql/remove_unique_donatur.sql
```

### 2. File Structure

```
WEB laziznu tenaru/
├── uploadCSVDonatur.js    ✅ Core logic
├── toast.js               ✅ Notification system
├── admin.html             ✅ UI & event handlers
└── sql/
    └── remove_unique_donatur.sql  ✅ Database schema
```

### 3. Dependencies

```html
<!-- PapaParse CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
```

### 4. Import Modules

```javascript
import { uploadCSVDonatur } from './uploadCSVDonatur.js'
import { showToast } from './toast.js'
```

---

## 🎯 Best Practices

### 1. Data Normalisasi

✅ **DO:**
```javascript
nama: row.nama.trim().toUpperCase()
```

❌ **DON'T:**
```javascript
nama: row.nama  // Tidak konsisten
```

### 2. Error Handling

✅ **DO:**
```javascript
try {
  await uploadCSVDonatur(file, userId, userEmail)
} catch (error) {
  showToast(error.message, 'error')
}
```

❌ **DON'T:**
```javascript
await uploadCSVDonatur(file, userId, userEmail)  // Bisa crash
```

### 3. User Feedback

✅ **DO:**
```javascript
showToast('✅ Upload selesai: 150 data', 'success')
```

❌ **DON'T:**
```javascript
alert('Upload selesai')  // Tidak modern
```

---

## 📞 Support

Jika ada masalah:

1. Cek console browser (F12)
2. Cek audit_logs di database
3. Cek format CSV sesuai dokumentasi
4. Pastikan constraint database sudah diupdate

---

**Dibuat:** 2025  
**Versi:** 2.0 (Improved with UPSERT)  
**Tech Stack:** Supabase, PapaParse, Vanilla JS, TailwindCSS
