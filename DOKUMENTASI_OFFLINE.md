# DOKUMENTASI MODE SEMI-OFFLINE - LAZISNU

## 📋 RINGKASAN FITUR

Mode Semi-Offline memungkinkan juru pungut tetap bisa input donasi walaupun internet mati. Data disimpan sementara di localStorage dan otomatis tersinkron saat koneksi kembali.

---

## 🎯 CARA KERJA

### 1. Deteksi Koneksi
- Menggunakan `navigator.onLine` untuk cek status koneksi
- Event listener `online` dan `offline` untuk deteksi perubahan real-time
- Indikator visual di navbar menampilkan status koneksi

### 2. Mode Offline
**Saat internet mati:**
- ❌ Tidak kirim data ke Supabase
- 💾 Simpan data donasi ke localStorage (key: `offline_donasi`)
- ⚠️ Tampilkan notifikasi bahwa data disimpan offline
- 🔒 Data tidak hilang walaupun refresh browser
- 🖨️ Printer tidak tersedia (butuh koneksi untuk audit log)

### 3. Mode Online
**Saat internet kembali:**
- ✅ Otomatis deteksi koneksi restored
- 🔄 Tampilkan konfirmasi untuk sinkronisasi
- 📤 Insert seluruh data offline ke Supabase
- 📝 Insert audit_logs untuk setiap donasi
- 🗑️ Hapus data dari localStorage setelah sukses
- ⚠️ Jika ada yang gagal, simpan kembali untuk retry

---

## 🎨 INDIKATOR VISUAL

### Badge Status Koneksi (di Navbar)

**🟢 ONLINE**
- Warna: Hijau
- Kondisi: Koneksi internet aktif, tidak ada data offline
- Class: `bg-green-100 text-green-800`

**🔴 OFFLINE**
- Warna: Merah
- Kondisi: Koneksi internet terputus
- Class: `bg-red-100 text-red-800`

**🟡 X data belum tersinkron**
- Warna: Kuning
- Kondisi: Koneksi aktif tapi ada data offline yang belum tersinkron
- Class: `bg-yellow-100 text-yellow-800`
- Contoh: "🟡 3 data belum tersinkron"

---

## 📁 STRUKTUR FILE

### File Baru: `offline.js`

**Fungsi Utama:**

1. **isOnline()**
   - Return: boolean
   - Cek status koneksi dengan `navigator.onLine`

2. **saveOfflineDonation(dataDonasi)**
   - Parameter: Object data donasi
   - Return: `{ success: true, count: number }`
   - Simpan donasi ke localStorage dengan ID unik

3. **getOfflineDonations()**
   - Return: Array data donasi offline
   - Ambil semua data dari localStorage

4. **syncOfflineData(userId, userEmail)**
   - Parameter: userId, userEmail untuk audit log
   - Return: `{ success: boolean, synced: number, message: string }`
   - Sinkronkan semua data offline ke Supabase
   - Insert audit log dengan action `INSERT_OFFLINE_SYNC`

5. **getOfflineCount()**
   - Return: number
   - Hitung jumlah data offline

6. **updateConnectionStatus(isOnline, offlineCount)**
   - Parameter: status koneksi, jumlah data offline
   - Update badge status di navbar

---

## 🔧 INTEGRASI KE DASHBOARD

### 1. Import Module
```javascript
import { 
  isOnline, 
  saveOfflineDonation, 
  syncOfflineData, 
  getOfflineCount, 
  updateConnectionStatus 
} from './offline.js'
```

### 2. Inisialisasi Mode Offline
```javascript
function initOfflineMode() {
  // Update status pertama kali
  updateConnectionStatus(isOnline(), getOfflineCount())
  
  // Event listener online
  window.addEventListener('online', async () => {
    updateConnectionStatus(true, getOfflineCount())
    // Auto sync jika ada data offline
    if (getOfflineCount() > 0) {
      const confirmSync = confirm(`Ada ${getOfflineCount()} donasi offline. Sinkronkan sekarang?`)
      if (confirmSync) await handleSync()
    }
  })
  
  // Event listener offline
  window.addEventListener('offline', () => {
    updateConnectionStatus(false, getOfflineCount())
    alert('Koneksi internet terputus. Donasi akan disimpan offline.')
  })
  
  // Cek data offline saat load
  if (getOfflineCount() > 0 && isOnline()) {
    const autoSync = confirm(`Ada ${getOfflineCount()} donasi offline. Sinkronkan sekarang?`)
    if (autoSync) handleSync()
  }
}
```

### 3. Modifikasi Handler Form Submit
```javascript
// CEK KONEKSI sebelum simpan
if (!isOnline()) {
  // Mode OFFLINE: Simpan ke localStorage
  const result = saveOfflineDonation(dataDonasi)
  alert(`⚠️ OFFLINE: Donasi disimpan sementara (${result.count} data offline)`)
  updateConnectionStatus(false, result.count)
} else {
  // Mode ONLINE: Simpan ke Supabase
  await simpanDonasi(dataDonasi, user.id, user.email)
  alert('✓ Donasi berhasil disimpan!')
}
```

---

## 🛡️ KEAMANAN & VALIDASI

### ✅ Mencegah Double Insert
- Setiap data offline diberi `offline_id` unik: `Date.now() + Math.random()`
- Data yang sudah tersinkron dihapus dari localStorage
- Jika ada yang gagal, hanya yang gagal disimpan kembali

### ✅ Tidak Memblokir Printer
- Printer hanya tersedia saat ONLINE
- Saat offline, tombol print tetap bisa diklik tapi tidak akan print
- Alert jelas: "Printer tidak tersedia saat offline"

### ✅ Data Persistence
- Data disimpan di localStorage (tidak hilang saat refresh)
- Format JSON untuk mudah di-parse
- Timestamp `saved_at` untuk tracking

### ✅ Audit Log
- Setiap sinkronisasi tercatat dengan action `INSERT_OFFLINE_SYNC`
- Mencatat user_id dan user_email yang melakukan sync
- old_data: null, new_data: data donasi yang diinsert

---

## 📊 FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT DONASI                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Cek Koneksi?  │
              └───────┬───────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
   [OFFLINE]                   [ONLINE]
        │                           │
        ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│ Simpan ke        │      │ Simpan ke        │
│ localStorage     │      │ Supabase         │
└────────┬─────────┘      └────────┬─────────┘
         │                         │
         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│ Alert: Data      │      │ Alert: Sukses    │
│ disimpan offline │      │ Insert audit log │
└────────┬─────────┘      └────────┬─────────┘
         │                         │
         │                         ▼
         │                  ┌──────────────┐
         │                  │ Reset Form   │
         │                  └──────────────┘
         │
         ▼
┌──────────────────────────┐
│ Tunggu koneksi kembali   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Event: online detected   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Confirm: Sync sekarang?  │
└────────┬─────────────────┘
         │
         ▼ [YES]
┌──────────────────────────┐
│ syncOfflineData()        │
│ - Loop setiap data       │
│ - Insert ke Supabase     │
│ - Insert audit log       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Hapus dari localStorage  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Alert: X data tersinkron │
└──────────────────────────┘
```

---

## 🧪 CARA TESTING

### Test 1: Mode Offline
1. Buka dashboard juru pungut
2. Matikan WiFi/internet
3. Badge berubah jadi 🔴 OFFLINE
4. Input donasi → Alert "Data disimpan offline"
5. Badge berubah jadi 🟡 1 data belum tersinkron
6. Refresh browser → Data masih ada di badge

### Test 2: Sinkronisasi
1. Lanjut dari Test 1
2. Nyalakan WiFi/internet
3. Badge otomatis update
4. Muncul confirm "Ada X donasi offline. Sinkronkan sekarang?"
5. Klik OK → Data tersinkron ke Supabase
6. Badge kembali jadi 🟢 ONLINE
7. Cek tabel donasi → Data muncul

### Test 3: Multiple Offline Data
1. Matikan internet
2. Input 3 donasi berbeda
3. Badge: 🟡 3 data belum tersinkron
4. Nyalakan internet
5. Sync → Semua 3 data masuk ke Supabase
6. Cek audit_logs → Ada 3 record dengan action INSERT_OFFLINE_SYNC

### Test 4: Printer Saat Offline
1. Matikan internet
2. Aktifkan printer
3. Input donasi → Klik "Simpan & Print"
4. Alert: "Printer tidak tersedia saat offline"
5. Data tetap tersimpan offline

---

## 🐛 TROUBLESHOOTING

### Badge Tidak Update
**Solusi**: Refresh browser, pastikan `updateConnectionStatus()` dipanggil di `initOfflineMode()`

### Data Offline Hilang
**Solusi**: Cek localStorage di browser DevTools → Application → Local Storage → Cari key `offline_donasi`

### Sinkronisasi Gagal
**Solusi**: 
- Cek koneksi Supabase
- Cek console browser untuk error message
- Data yang gagal akan disimpan kembali untuk retry

### Double Insert
**Solusi**: Tidak mungkin terjadi karena setiap data punya `offline_id` unik dan dihapus setelah sukses

---

## 📝 CHANGELOG

### Version 2.1 - Mode Semi-Offline (2024)
- ✅ Deteksi koneksi dengan navigator.onLine
- ✅ Simpan donasi offline ke localStorage
- ✅ Auto sync saat koneksi kembali
- ✅ Indikator visual (badge hijau/merah/kuning)
- ✅ Audit log untuk sinkronisasi offline
- ✅ Mencegah double insert
- ✅ Printer disabled saat offline

---

## 💡 TIPS & BEST PRACTICES

1. **Selalu Sync Secepatnya**
   - Jangan biarkan data offline terlalu lama
   - Sync segera saat koneksi kembali

2. **Backup Manual**
   - Admin bisa export CSV untuk backup tambahan
   - Data offline hanya di browser, bisa hilang jika clear cache

3. **Monitoring**
   - Admin bisa cek audit_logs untuk track sinkronisasi
   - Filter action: `INSERT_OFFLINE_SYNC`

4. **Edukasi User**
   - Jelaskan ke juru pungut tentang mode offline
   - Pastikan mereka paham badge status koneksi

---

**Mode Semi-Offline - Tetap Produktif Walaupun Internet Mati** 🚀
