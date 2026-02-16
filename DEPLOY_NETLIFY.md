# 🚀 CARA DEPLOY KE NETLIFY (GRATIS)

## Langkah 1: Persiapan File

1. Pastikan semua file ada di folder `WEB laziznu tenaru`
2. Buat file `.gitignore` (opsional)

## Langkah 2: Upload ke GitHub

### A. Buat Repository Baru
1. Buka https://github.com
2. Klik "New repository"
3. Nama: `lazisnu-tenaru`
4. Public atau Private (terserah)
5. Klik "Create repository"

### B. Upload Files
```bash
# Di folder WEB laziznu tenaru, jalankan:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/lazisnu-tenaru.git
git push -u origin main
```

## Langkah 3: Deploy ke Netlify

1. Buka https://netlify.com
2. Klik "Sign up" (gunakan akun GitHub)
3. Klik "Add new site" > "Import an existing project"
4. Pilih "GitHub"
5. Pilih repository `lazisnu-tenaru`
6. Build settings:
   - Build command: (kosongkan)
   - Publish directory: `/`
7. Klik "Deploy site"

## Langkah 4: Selesai!

Netlify akan memberikan URL gratis:
- Format: `https://random-name-123.netlify.app`
- Bisa custom domain nanti

## 🔧 Konfigurasi Tambahan

### File `netlify.toml` (opsional)
Buat file ini di root folder untuk konfigurasi:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

### Custom Domain (Gratis)
1. Di Netlify dashboard > Domain settings
2. Klik "Add custom domain"
3. Ikuti instruksi DNS

---

## ⚡ Alternatif: Deploy Tanpa GitHub (Drag & Drop)

1. Buka https://app.netlify.com/drop
2. Drag folder `WEB laziznu tenaru` ke browser
3. Selesai! Langsung online

---

## 📱 PWA akan Otomatis Bekerja

Karena Netlify support HTTPS, PWA Anda akan:
- ✅ Bisa di-install
- ✅ Offline mode aktif
- ✅ Service worker jalan

---

## 🔐 Keamanan Supabase

Pastikan di `supabaseClient.js`:
- Gunakan **anon key** (bukan service_role key)
- RLS sudah di-disable (sudah dilakukan)

---

## 💡 Tips

1. **Auto Deploy**: Setiap push ke GitHub, Netlify auto deploy
2. **Preview Deploy**: Setiap branch baru dapat URL preview
3. **Rollback**: Bisa rollback ke versi sebelumnya
4. **Analytics**: Gratis basic analytics

---

## 🆘 Troubleshooting

### Error: "Page not found"
- Pastikan `index.html` ada di root folder
- Buat file `netlify.toml` dengan redirect rules

### PWA tidak install
- Pastikan HTTPS aktif (otomatis di Netlify)
- Cek `manifest.json` path sudah benar

### Supabase error
- Cek API key di `supabaseClient.js`
- Pastikan RLS disabled

---

**Estimasi Waktu**: 10-15 menit
**Biaya**: GRATIS selamanya
**Limit**: Unlimited bandwidth (fair use)
