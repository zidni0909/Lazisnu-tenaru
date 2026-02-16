# ☁️ CARA DEPLOY KE CLOUDFLARE PAGES (GRATIS)

## 🎯 Keunggulan Cloudflare Pages

- ✅ **Gratis unlimited** bandwidth & build
- ✅ **CDN global** super cepat (200+ lokasi)
- ✅ **HTTPS otomatis** dengan SSL gratis
- ✅ **DDoS protection** built-in
- ✅ **Analytics gratis** (Web Analytics)
- ✅ **Custom domain** gratis
- ✅ **Git integration** (GitHub/GitLab)

---

## 🚀 Metode 1: Direct Upload (PALING MUDAH)

### Langkah 1: Persiapan
1. Pastikan semua file ada di folder `WEB laziznu tenaru`
2. File `_headers` dan `_redirects` sudah ada

### Langkah 2: Upload ke Cloudflare

1. **Buka** https://dash.cloudflare.com
2. **Sign up** (gratis, gunakan email)
3. **Klik** "Workers & Pages" di sidebar kiri
4. **Klik** "Create application"
5. **Pilih** tab "Pages"
6. **Klik** "Upload assets"
7. **Beri nama** project: `lazisnu-tenaru`
8. **Drag & drop** folder `WEB laziznu tenaru` atau klik "Select from computer"
9. **Klik** "Deploy site"

### Langkah 3: Selesai!

Cloudflare akan memberikan URL:
- Format: `https://lazisnu-tenaru.pages.dev`
- Langsung HTTPS, langsung global CDN!

**Estimasi waktu: 5 menit** ⚡

---

## 🔗 Metode 2: Via GitHub (Auto Deploy)

### Langkah 1: Upload ke GitHub

```bash
# Di folder WEB laziznu tenaru, jalankan:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/lazisnu-tenaru.git
git push -u origin main
```

### Langkah 2: Connect ke Cloudflare Pages

1. **Buka** https://dash.cloudflare.com
2. **Klik** "Workers & Pages"
3. **Klik** "Create application" > "Pages"
4. **Klik** "Connect to Git"
5. **Pilih** GitHub
6. **Authorize** Cloudflare Pages
7. **Pilih** repository `lazisnu-tenaru`
8. **Build settings:**
   - Framework preset: `None`
   - Build command: (kosongkan)
   - Build output directory: `/`
9. **Klik** "Save and Deploy"

### Langkah 3: Auto Deploy Aktif!

Setiap kali push ke GitHub:
- ✅ Auto build & deploy
- ✅ Preview URL untuk setiap commit
- ✅ Rollback mudah

---

## 🌐 Custom Domain (Gratis)

### Jika Domain di Cloudflare:
1. Dashboard > Workers & Pages
2. Pilih project `lazisnu-tenaru`
3. Tab "Custom domains"
4. Klik "Set up a custom domain"
5. Masukkan domain (contoh: `lazisnu.com`)
6. Klik "Activate domain"
7. **Selesai!** DNS otomatis dikonfigurasi

### Jika Domain di Luar Cloudflare:
1. Ikuti langkah 1-5 di atas
2. Cloudflare akan berikan CNAME record
3. Tambahkan CNAME di DNS provider Anda:
   ```
   Type: CNAME
   Name: @ atau www
   Value: lazisnu-tenaru.pages.dev
   ```
4. Tunggu propagasi DNS (5-30 menit)

---

## 📁 Struktur File Penting

```
WEB laziznu tenaru/
├── _headers          # Security headers (Cloudflare)
├── _redirects        # SPA routing (Cloudflare)
├── netlify.toml      # Netlify config (diabaikan Cloudflare)
├── index.html        # Entry point
├── manifest.json     # PWA manifest
├── service-worker.js # Service worker
└── ... (file lainnya)
```

### File `_headers` (sudah dibuat)
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
```

### File `_redirects` (sudah dibuat)
```
/* /index.html 200
```

---

## 📊 Cloudflare Web Analytics (Gratis)

### Aktifkan Analytics:
1. Dashboard > Workers & Pages
2. Pilih project
3. Tab "Analytics"
4. Klik "Enable Web Analytics"
5. Copy script tag
6. Paste di `<head>` semua HTML file (opsional)

**Fitur:**
- Page views
- Unique visitors
- Top pages
- Referrers
- Countries
- Devices

---

## 🔧 Environment Variables (Jika Perlu)

Jika ingin simpan Supabase key di environment variable:

1. Dashboard > Workers & Pages
2. Pilih project
3. Tab "Settings" > "Environment variables"
4. Klik "Add variable"
5. Name: `SUPABASE_URL`
6. Value: `https://xxx.supabase.co`
7. Klik "Save"

**Catatan:** Untuk static site, environment variable tidak bisa diakses di client-side JavaScript. Tetap gunakan `supabaseClient.js` dengan anon key.

---

## 🚀 Performance Optimization

Cloudflare Pages otomatis:
- ✅ Minify HTML/CSS/JS
- ✅ Brotli compression
- ✅ HTTP/2 & HTTP/3
- ✅ Edge caching
- ✅ Smart routing

**Tidak perlu konfigurasi tambahan!**

---

## 📱 PWA Support

PWA akan otomatis bekerja karena:
- ✅ HTTPS aktif (required untuk PWA)
- ✅ Service worker bisa register
- ✅ Manifest.json served dengan MIME type benar
- ✅ Install prompt akan muncul

**Test PWA:**
1. Buka site di Chrome mobile
2. Klik menu (3 titik)
3. Pilih "Install app" atau "Add to Home screen"

---

## 🔍 Monitoring & Logs

### Real-time Logs:
1. Dashboard > Workers & Pages
2. Pilih project
3. Tab "Deployments"
4. Klik deployment terakhir
5. Lihat build logs

### Analytics:
- Tab "Analytics" untuk traffic stats
- Tab "Functions" untuk serverless logs (jika pakai)

---

## 🆘 Troubleshooting

### Error: "Build failed"
- Pastikan tidak ada file yang corrupt
- Cek build logs untuk detail error
- Pastikan total size < 25 MB

### Error: "Page not found" (404)
- Pastikan `index.html` ada di root
- Pastikan `_redirects` file ada dengan content: `/* /index.html 200`

### PWA tidak install
- Cek HTTPS aktif (otomatis di Cloudflare)
- Cek `manifest.json` path benar
- Cek console browser untuk error

### Autocomplete tidak jalan
- Cek Supabase RLS disabled
- Cek console browser (F12)
- Test query langsung di Supabase

### Grafik tidak muncul
- Cek Chart.js CDN loaded
- Cek console untuk error
- Cek kolom database (`tanggal` bukan `tanggal_donasi`)

---

## 💰 Pricing (Gratis!)

**Cloudflare Pages Free Plan:**
- ✅ Unlimited sites
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds/month
- ✅ 1 concurrent build
- ✅ 20,000 files per site

**Lebih dari cukup untuk LAZISNU!**

---

## 🔄 Update Site

### Via Direct Upload:
1. Dashboard > Workers & Pages
2. Pilih project
3. Klik "Create deployment"
4. Upload folder baru
5. Deploy!

### Via GitHub:
1. Edit file lokal
2. `git add .`
3. `git commit -m "Update"`
4. `git push`
5. **Auto deploy!**

---

## 🎯 Best Practices

1. **Gunakan Git** untuk version control
2. **Test lokal** sebelum deploy
3. **Backup database** regular (Supabase auto backup)
4. **Monitor analytics** untuk traffic
5. **Update dependencies** (CDN links)

---

## 📞 Support

**Cloudflare Docs:**
- https://developers.cloudflare.com/pages

**Community:**
- https://community.cloudflare.com

**Status:**
- https://www.cloudflarestatus.com

---

## ✅ Checklist Deploy

- [ ] File `_headers` ada
- [ ] File `_redirects` ada
- [ ] `index.html` di root folder
- [ ] `manifest.json` path benar
- [ ] `supabaseClient.js` configured
- [ ] Database setup (SETUP_LENGKAP.sql)
- [ ] Test lokal berhasil
- [ ] Upload ke Cloudflare Pages
- [ ] Test PWA install
- [ ] Test offline mode
- [ ] Test autocomplete
- [ ] Test grafik
- [ ] Custom domain (opsional)

---

## 🎉 Selesai!

Site Anda sekarang:
- ✅ Online 24/7
- ✅ HTTPS secure
- ✅ Global CDN
- ✅ DDoS protected
- ✅ PWA installable
- ✅ Offline capable

**URL:** `https://lazisnu-tenaru.pages.dev`

---

**Estimasi Total Waktu:** 10-15 menit  
**Biaya:** GRATIS selamanya  
**Performance:** ⚡ Lightning fast dengan Cloudflare CDN

**Selamat! Aplikasi LAZISNU Anda sudah online! 🚀**
