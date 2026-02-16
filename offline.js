import { supabase } from './supabaseClient.js'

const OFFLINE_KEY = 'offline_donasi'

// ===== DETEKSI KONEKSI =====
export function isOnline() {
  return navigator.onLine
}

// ===== SIMPAN DONASI OFFLINE =====
export function saveOfflineDonation(dataDonasi) {
  try {
    // Ambil data offline yang sudah ada
    const existingData = getOfflineDonations()
    
    // Tambahkan timestamp dan ID unik untuk tracking
    const offlineItem = {
      ...dataDonasi,
      offline_id: Date.now() + Math.random(), // ID unik untuk mencegah duplikasi
      saved_at: new Date().toISOString()
    }
    
    // Tambahkan ke array
    existingData.push(offlineItem)
    
    // Simpan ke localStorage
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(existingData))
    
    return { success: true, count: existingData.length }
  } catch (error) {
    console.error('Error saving offline:', error)
    throw error
  }
}

// ===== AMBIL DATA OFFLINE =====
export function getOfflineDonations() {
  try {
    const data = localStorage.getItem(OFFLINE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error getting offline data:', error)
    return []
  }
}

// ===== SINKRONISASI DATA OFFLINE KE SUPABASE =====
export async function syncOfflineData(userId, userEmail) {
  try {
    const offlineData = getOfflineDonations()
    
    if (offlineData.length === 0) {
      return { success: true, synced: 0, message: 'Tidak ada data offline' }
    }
    
    let successCount = 0
    let failedItems = []
    
    // Loop setiap data offline
    for (const item of offlineData) {
      try {
        // Hapus field offline_id dan saved_at sebelum insert
        const { offline_id, saved_at, ...donasiData } = item
        
        // Insert ke tabel donasi
        const { data: insertedDonasi, error: donasiError } = await supabase
          .from('donasi')
          .insert([{
            nama_donatur: donasiData.nama_donatur,
            jenis_zakat: donasiData.jenis_zakat,
            nominal: donasiData.nominal,
            metode_pembayaran: donasiData.metode,
            juru_pungut_id: donasiData.juru_pungut_id,
            tanggal_donasi: donasiData.tanggal_donasi || new Date().toISOString(),
            is_locked: false
          }])
          .select()
          .single()
        
        if (donasiError) throw donasiError
        
        // Insert audit log
        await supabase.from('audit_logs').insert([{
          user_id: userId,
          user_email: userEmail,
          action: 'INSERT_OFFLINE_SYNC',
          table_name: 'donasi',
          record_id: insertedDonasi.id,
          old_data: null,
          new_data: insertedDonasi
        }])
        
        successCount++
      } catch (error) {
        console.error('Error syncing item:', error)
        failedItems.push(item)
      }
    }
    
    // Jika semua berhasil, hapus dari localStorage
    if (failedItems.length === 0) {
      localStorage.removeItem(OFFLINE_KEY)
      return { 
        success: true, 
        synced: successCount, 
        message: `${successCount} donasi berhasil disinkronkan` 
      }
    } else {
      // Simpan kembali yang gagal
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(failedItems))
      return { 
        success: false, 
        synced: successCount, 
        failed: failedItems.length,
        message: `${successCount} berhasil, ${failedItems.length} gagal` 
      }
    }
  } catch (error) {
    console.error('Error sync offline data:', error)
    throw error
  }
}

// ===== HITUNG JUMLAH DATA OFFLINE =====
export function getOfflineCount() {
  return getOfflineDonations().length
}

// ===== UPDATE STATUS KONEKSI UI =====
export function updateConnectionStatus(isOnline, offlineCount = 0) {
  const statusBadge = document.getElementById('connectionStatus')
  
  if (!statusBadge) return
  
  if (!isOnline) {
    // OFFLINE
    statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800'
    statusBadge.textContent = '🔴 OFFLINE'
  } else if (offlineCount > 0) {
    // ONLINE tapi ada data belum tersinkron
    statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800'
    statusBadge.textContent = `🟡 ${offlineCount} data belum tersinkron`
  } else {
    // ONLINE dan semua tersinkron
    statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800'
    statusBadge.textContent = '🟢 ONLINE'
  }
}
