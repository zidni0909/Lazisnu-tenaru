# DOKUMENTASI DASHBOARD GRAFIK STATISTIK - LAZISNU

## 📋 RINGKASAN FITUR

Dashboard Grafik Statistik menampilkan visualisasi data donasi secara profesional menggunakan Chart.js untuk memudahkan analisis dan pelaporan internal.

---

## 📊 JENIS GRAFIK

### 1. Line Chart - Donasi 7 Hari Terakhir
**Tujuan**: Melihat tren donasi harian dalam seminggu terakhir

**Data yang Ditampilkan**:
- Total nominal donasi per hari
- 7 hari terakhir (6 hari lalu + hari ini)
- Urut dari tanggal terlama ke terbaru

**Query Supabase**:
```javascript
const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(today.getDate() - 6)

const { data } = await supabase
  .from('donasi')
  .select('tanggal_donasi, nominal')
  .gte('tanggal_donasi', sevenDaysAgo.toISOString())
  .order('tanggal_donasi', { ascending: true })
```

**Fitur**:
- Warna hijau (brand LAZISNU)
- Area fill untuk visualisasi lebih jelas
- Tooltip menampilkan format rupiah
- Y-axis dalam format "Rp Xk" (ribuan)
- Responsive & smooth curve

---

### 2. Pie Chart - Per Jenis Zakat
**Tujuan**: Melihat proporsi donasi berdasarkan jenis zakat

**Data yang Ditampilkan**:
- Total nominal per jenis_zakat
- Persentase dari total keseluruhan
- Jenis: Maal, Profesi, Fitrah, S3

**Query Supabase**:
```javascript
const { data } = await supabase
  .from('donasi')
  .select('jenis_zakat, nominal')
```

**Fitur**:
- 4 warna berbeda untuk setiap jenis
- Legend di bawah grafik
- Tooltip menampilkan: Nama, Rupiah, Persentase
- Responsive

**Warna**:
- Maal: Biru (`rgb(59, 130, 246)`)
- Profesi: Hijau (`rgb(34, 197, 94)`)
- Fitrah: Orange (`rgb(251, 146, 60)`)
- S3: Ungu (`rgb(168, 85, 247)`)

---

### 3. Bar Chart - Per Juru Pungut
**Tujuan**: Membandingkan performa juru pungut

**Data yang Ditampilkan**:
- Total nominal donasi per juru pungut
- Nama juru pungut (join ke tabel users)

**Query Supabase**:
```javascript
// Query donasi
const { data: donasi } = await supabase
  .from('donasi')
  .select('juru_pungut_id, nominal')

// Query users untuk nama
const { data: users } = await supabase
  .from('users')
  .select('id, nama')
  .in('id', userIds)
```

**Fitur**:
- Warna biru konsisten
- Tooltip menampilkan format rupiah
- Y-axis dalam format "Rp Xk" (ribuan)
- Responsive
- Horizontal bars untuk nama panjang

---

## 📁 STRUKTUR FILE

### File Baru: `charts.js`

**Fungsi Fetch Data**:
1. `getDonasi7Hari()` - Fetch & group data 7 hari terakhir
2. `getDonasiPerJenis()` - Fetch & group per jenis_zakat
3. `getDonasiPerJuruPungut()` - Fetch donasi + join users

**Fungsi Render Chart**:
1. `renderLineChart(canvasId, labels, values)` - Render line chart
2. `renderPieChart(canvasId, labels, values)` - Render pie chart
3. `renderBarChart(canvasId, labels, values)` - Render bar chart

---

## 🎨 LAYOUT & DESIGN

### Responsive Grid
```
┌─────────────────────────────────────────────────┐
│  📊 Dashboard Grafik Statistik                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Line Chart - 7 Hari Terakhir]                │
│  (Full Width, Height: 300px)                   │
│                                                 │
├──────────────────────────┬──────────────────────┤
│                          │                      │
│  [Pie Chart]             │  [Bar Chart]        │
│  Per Jenis Zakat         │  Per Juru Pungut    │
│  (50% Width)             │  (50% Width)        │
│                          │                      │
└──────────────────────────┴──────────────────────┘
```

### States
1. **Loading**: Spinner animasi + teks "Memuat grafik..."
2. **Error**: Icon ❌ + teks "Gagal memuat grafik"
3. **Success**: Tampilkan semua grafik

---

## 🔧 CARA KERJA

### 1. Inisialisasi
```javascript
// Di admin.html, setelah login
if (user) {
  loadCharts(); // Load semua grafik
}
```

### 2. Fetch Data Paralel
```javascript
const [data7Hari, dataJenis, dataJuruPungut] = await Promise.all([
  getDonasi7Hari(),
  getDonasiPerJenis(),
  getDonasiPerJuruPungut()
])
```

**Keuntungan Promise.all**:
- Fetch 3 query sekaligus (paralel)
- Lebih cepat daripada sequential
- Error handling terpusat

### 3. Render Chart
```javascript
renderLineChart('chart7Hari', data7Hari.labels, data7Hari.values)
renderPieChart('chartJenisZakat', dataJenis.labels, dataJenis.values)
renderBarChart('chartJuruPungut', dataJuruPungut.labels, dataJuruPungut.values)
```

---

## 🚀 OPTIMASI QUERY

### ✅ Efisien
1. **Select Minimal**: Hanya ambil kolom yang dibutuhkan
   ```javascript
   .select('tanggal_donasi, nominal') // Bukan .select('*')
   ```

2. **Filter di Database**: Gunakan `.gte()` untuk 7 hari terakhir
   ```javascript
   .gte('tanggal_donasi', sevenDaysAgo.toISOString())
   ```

3. **Separate Query**: Hindari relationship error
   ```javascript
   // Query donasi dulu
   const { data: donasi } = await supabase.from('donasi').select('...')
   
   // Query users terpisah
   const { data: users } = await supabase.from('users').select('...')
   
   // Join di client-side
   ```

4. **Group di Client**: Grouping dilakukan di JavaScript, bukan database
   ```javascript
   const grouped = {}
   data.forEach(item => {
     if (!grouped[item.jenis_zakat]) grouped[item.jenis_zakat] = 0
     grouped[item.jenis_zakat] += item.nominal
   })
   ```

---

## 🎯 FORMAT DATA

### Input untuk Chart.js
```javascript
{
  labels: ['15 Jan', '16 Jan', '17 Jan', ...],  // Array string
  values: [500000, 750000, 1200000, ...]        // Array number
}
```

### Contoh Data 7 Hari
```javascript
{
  labels: ['15 Jan', '16 Jan', '17 Jan', '18 Jan', '19 Jan', '20 Jan', '21 Jan'],
  values: [500000, 750000, 1200000, 0, 300000, 900000, 1500000]
}
```

### Contoh Data Per Jenis
```javascript
{
  labels: ['MAAL', 'PROFESI', 'FITRAH', 'S3'],
  values: [5000000, 3000000, 2000000, 1000000]
}
```

---

## 🐛 ERROR HANDLING

### Try-Catch di Setiap Fungsi
```javascript
try {
  const { data, error } = await supabase.from('donasi').select('...')
  if (error) throw error
  return processedData
} catch (error) {
  console.error('Error fetch:', error)
  throw error
}
```

### Loading State
```javascript
loadingCharts.classList.remove('hidden')  // Tampilkan loading
errorCharts.classList.add('hidden')       // Sembunyikan error
chartsContainer.classList.add('hidden')   // Sembunyikan grafik
```

### Error State
```javascript
loadingCharts.classList.add('hidden')     // Sembunyikan loading
errorCharts.classList.remove('hidden')    // Tampilkan error
```

### Success State
```javascript
loadingCharts.classList.add('hidden')     // Sembunyikan loading
chartsContainer.classList.remove('hidden') // Tampilkan grafik
```

---

## 📱 RESPONSIVE DESIGN

### TailwindCSS Grid
```html
<!-- Full width untuk line chart -->
<div class="mb-8">
  <canvas id="chart7Hari"></canvas>
</div>

<!-- 2 kolom untuk pie & bar chart -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div><canvas id="chartJenisZakat"></canvas></div>
  <div><canvas id="chartJuruPungut"></canvas></div>
</div>
```

### Chart.js Options
```javascript
options: {
  responsive: true,              // Auto resize
  maintainAspectRatio: false,    // Gunakan height container
  // ...
}
```

---

## 🧪 CARA TESTING

### Test 1: Grafik Muncul
1. Login sebagai admin
2. Scroll ke "Dashboard Grafik Statistik"
3. Tunggu loading selesai
4. Pastikan 3 grafik muncul

### Test 2: Data Akurat
1. Cek grafik 7 hari terakhir
2. Bandingkan dengan tabel donasi
3. Pastikan total per hari sesuai

### Test 3: Responsive
1. Resize browser window
2. Pastikan grafik menyesuaikan ukuran
3. Test di mobile view (DevTools)

### Test 4: Error Handling
1. Matikan internet
2. Refresh halaman
3. Pastikan muncul error state
4. Nyalakan internet → Refresh → Grafik muncul

### Test 5: Empty Data
1. Hapus semua donasi (testing DB)
2. Refresh halaman
3. Grafik tetap muncul (dengan nilai 0)

---

## 💡 TIPS & BEST PRACTICES

### 1. Caching (Opsional)
Untuk performa lebih baik, cache data grafik:
```javascript
let cachedChartData = null
let cacheTime = null

async function loadCharts() {
  const now = Date.now()
  if (cachedChartData && (now - cacheTime < 60000)) {
    // Gunakan cache jika < 1 menit
    renderCharts(cachedChartData)
    return
  }
  
  // Fetch fresh data
  const data = await fetchChartData()
  cachedChartData = data
  cacheTime = now
  renderCharts(data)
}
```

### 2. Refresh Button
Tambahkan tombol refresh untuk update grafik manual:
```html
<button onclick="loadCharts()">🔄 Refresh Grafik</button>
```

### 3. Export Grafik
Chart.js bisa export ke image:
```javascript
const canvas = document.getElementById('chart7Hari')
const image = canvas.toDataURL('image/png')
// Download atau tampilkan image
```

### 4. Animasi
Chart.js sudah include animasi default. Untuk disable:
```javascript
options: {
  animation: false
}
```

---

## 📊 CONTOH OUTPUT

### Line Chart Tooltip
```
Donasi 7 Hari Terakhir
15 Jan: Rp 500.000
```

### Pie Chart Tooltip
```
MAAL: Rp 5.000.000 (45.5%)
```

### Bar Chart Tooltip
```
Budi Santoso: Rp 3.500.000
```

---

## 🔗 DEPENDENCIES

1. **Chart.js v4.4.0** (CDN)
   - URL: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`
   - Size: ~200KB
   - License: MIT

2. **Supabase Client** (sudah ada)
3. **TailwindCSS** (sudah ada)

---

## 📝 CHANGELOG

### Version 2.2 - Dashboard Grafik (2024)
- ✅ Line chart donasi 7 hari terakhir
- ✅ Pie chart per jenis zakat
- ✅ Bar chart per juru pungut
- ✅ Loading & error state
- ✅ Responsive design
- ✅ Format rupiah di tooltip
- ✅ Query Supabase efisien

---

**Dashboard Grafik Statistik - Visualisasi Data yang Profesional** 📊
