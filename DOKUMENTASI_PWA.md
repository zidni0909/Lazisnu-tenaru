# 📱 DOKUMENTASI PWA - LAZISNU

## 🎯 OVERVIEW

Sistem LAZISNU telah dikonversi menjadi Progressive Web App (PWA) yang dapat di-install di Android sebagai aplikasi native.

---

## ✅ FITUR PWA

### 1. **Installable**
- Bisa di-install di Android/iOS
- Muncul di home screen
- Fullscreen (standalone mode)
- Splash screen otomatis

### 2. **Offline Support**
- Service Worker caching
- Cache static files (HTML, JS, CSS)
- Cache CDN libraries
- Network first untuk Supabase API
- Cache first untuk static assets

### 3. **App-Like Experience**
- Fullscreen tanpa browser UI
- Custom theme color (#15803d - hijau LAZISNU)
- App icon 192x192 & 512x512
- Smooth navigation

### 4. **Compatibility**
- ✅ Mode semi-offline tetap berfungsi
- ✅ Printer Bluetooth Web API tetap berfungsi
- ✅ Semua fitur existing tetap berfungsi

---

## 📁 FILE PWA

### 1. **manifest.json**
```json
{
  "name": "LAZISNU - Sistem Administrasi Donasi",
  "short_name": "LAZISNU",
  "start_url": "/index.html",
  "display": "standalone",
  "theme_color": "#15803d",
  "background_color": "#ffffff"
}
```

**Lokasi**: Root folder
**Fungsi**: Konfigurasi PWA (nama, icon, theme, display mode)

### 2. **service-worker.js**
**Lokasi**: Root folder
**Fungsi**: 
- Caching static files
- Offline support
- Cache versioning
- Network/Cache strategy

**Cache Strategy**:
- **Static files**: Cache first (HTML, JS, CSS)
- **Supabase API**: Network first (fallback ke cache)
- **CDN**: Cache first

### 3. **icons/** (Folder Baru)
**Struktur**:
```
icons/
├── icon-192x192.png
└── icon-512x512.png
```

**Requirement**:
- 192x192px untuk Android
- 512x512px untuk splash screen
- Format PNG
- Background hijau LAZISNU (#15803d)

---

## 🚀 CARA INSTALL PWA

### Di Android (Chrome)

1. **Buka website** di Chrome Android
2. **Tunggu 3 detik** → Muncul banner "Install Aplikasi LAZISNU"
3. **Klik "Install"**
4. **Atau** klik menu (⋮) → "Add to Home screen"
5. **Aplikasi muncul** di home screen
6. **Buka aplikasi** → Fullscreen tanpa browser UI

### Di iOS (Safari)

1. **Buka website** di Safari iOS
2. **Klik Share button** (kotak dengan panah)
3. **Scroll** → "Add to Home Screen"
4. **Klik "Add"**
5. **Aplikasi muncul** di home screen

### Di Desktop (Chrome/Edge)

1. **Buka website** di Chrome/Edge
2. **Klik icon install** di address bar (⊕)
3. **Klik "Install"**
4. **Aplikasi muncul** sebagai desktop app

---

## 🔧 TESTING PWA

### 1. **Lighthouse Audit**
```bash
# Buka Chrome DevTools (F12)
# Tab: Lighthouse
# Category: Progressive Web App
# Click: Generate report
```

**Target Score**: 90+

### 2. **Service Worker**
```bash
# Buka Chrome DevTools (F12)
# Tab: Application → Service Workers
# Check: Status "activated and running"
```

### 3. **Manifest**
```bash
# Buka Chrome DevTools (F12)
# Tab: Application → Manifest
# Check: All fields populated correctly
```

### 4. **Offline Test**
```bash
# Buka Chrome DevTools (F12)
# Tab: Network
# Throttling: Offline
# Refresh page → Should load from cache
```

---

## 📊 CACHE STRATEGY

### Static Cache (Cache First)
```
✅ index.html
✅ admin.html
✅ dashboard.html
✅ *.js files
✅ CDN libraries
```

### API Cache (Network First)
```
✅ Supabase API calls
✅ Fallback to cache if offline
```

### Cache Versioning
```javascript
const CACHE_VERSION = 'lazisnu-v1.0.0'
```

**Update cache**: Ubah version number di service-worker.js

---

## 🎨 CUSTOMIZATION

### Theme Color
```html
<meta name="theme-color" content="#15803d">
```
**Warna**: Hijau LAZISNU (#15803d)

### App Name
```json
"name": "LAZISNU - Sistem Administrasi Donasi",
"short_name": "LAZISNU"
```

### Display Mode
```json
"display": "standalone"
```
**Options**: standalone, fullscreen, minimal-ui, browser

---

## 🐛 TROUBLESHOOTING

### PWA Tidak Muncul Install Prompt

**Solusi**:
1. Pastikan HTTPS (localhost OK untuk testing)
2. Pastikan manifest.json valid
3. Pastikan service worker registered
4. Clear cache & hard reload (Ctrl+Shift+R)

### Service Worker Tidak Update

**Solusi**:
1. Ubah CACHE_VERSION di service-worker.js
2. Unregister service worker di DevTools
3. Hard reload (Ctrl+Shift+R)

### Icon Tidak Muncul

**Solusi**:
1. Pastikan file icon ada di `/icons/`
2. Pastikan format PNG
3. Pastikan size 192x192 & 512x512
4. Clear cache

### Offline Mode Tidak Berfungsi

**Solusi**:
1. Cek service worker status di DevTools
2. Cek cache storage di DevTools → Application → Cache Storage
3. Pastikan file ter-cache dengan benar

---

## 📱 ICON GENERATOR

### Online Tools
1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
2. **Favicon Generator**: https://realfavicongenerator.net/
3. **App Icon Generator**: https://appicon.co/

### Manual Creation
```bash
# Requirement:
- Logo LAZISNU
- Background: #15803d (hijau)
- Format: PNG
- Size: 192x192 & 512x512
- Padding: 10% dari size
```

---

## 🚀 DEPLOYMENT

### 1. **Hosting Requirements**
- ✅ HTTPS (wajib untuk PWA)
- ✅ Support service worker
- ✅ Correct MIME types

### 2. **Recommended Hosting**
- **Vercel**: https://vercel.com (Free, auto HTTPS)
- **Netlify**: https://netlify.com (Free, auto HTTPS)
- **GitHub Pages**: https://pages.github.com (Free, HTTPS)
- **Firebase Hosting**: https://firebase.google.com/products/hosting

### 3. **Deploy Steps**
```bash
# 1. Upload semua file ke hosting
# 2. Pastikan HTTPS aktif
# 3. Test PWA di Lighthouse
# 4. Test install di Android
# 5. Monitor service worker logs
```

---

## 📊 PWA CHECKLIST

### Pre-Launch
- [ ] manifest.json valid
- [ ] service-worker.js registered
- [ ] Icons 192x192 & 512x512 ready
- [ ] HTTPS enabled
- [ ] Lighthouse score 90+
- [ ] Tested di Android
- [ ] Tested di iOS
- [ ] Offline mode working

### Post-Launch
- [ ] Monitor install rate
- [ ] Monitor service worker errors
- [ ] Update cache version regularly
- [ ] Test after each update

---

## 🎯 BENEFITS PWA

### For Users
✅ Install seperti app native
✅ Akses cepat dari home screen
✅ Fullscreen experience
✅ Offline support
✅ Ukuran lebih kecil dari native app

### For Organization
✅ Tidak perlu Google Play Store
✅ Update instant (no app store approval)
✅ Cross-platform (Android, iOS, Desktop)
✅ Maintenance lebih mudah
✅ Cost-effective

---

## 📞 SUPPORT

### Issues
- Service worker not working → Check console logs
- Install prompt not showing → Check manifest & HTTPS
- Icons not loading → Check file paths

### Resources
- **MDN PWA Guide**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Google PWA**: https://web.dev/progressive-web-apps/
- **PWA Builder**: https://www.pwabuilder.com/

---

**Version**: 1.0.0
**Last Updated**: 2024
**Status**: ✅ PWA Ready

**Dibuat dengan ❤️ untuk LAZISNU**
