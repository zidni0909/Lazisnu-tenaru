import { supabase } from './supabaseClient.js'

// Fungsi untuk mendapatkan ringkasan per juru pungut
export async function getRingkasanPerJuruPungut() {
  try {
    const { data, error } = await supabase
      .from('donasi')
      .select('nominal, juru_pungut_id')
      .eq('is_deleted', false)
    
    if (error) throw error
    
    // Ambil data users
    const userIds = [...new Set(data.map(d => d.juru_pungut_id))]
    const { data: users } = await supabase
      .from('users')
      .select('id, nama')
      .in('id', userIds)
    
    const userMap = {}
    users?.forEach(u => userMap[u.id] = u)
    
    // Grouping manual di client
    const grouped = {}
    data.forEach(item => {
      const jpId = item.juru_pungut_id
      const jpNama = userMap[jpId]?.nama
      
      if (jpId) {
        if (!grouped[jpId]) {
          grouped[jpId] = {
            id: jpId,
            nama: jpNama,
            total: 0,
            jumlah: 0
          }
        }
        grouped[jpId].total += item.nominal
        grouped[jpId].jumlah += 1
      }
    })
    
    // Convert object to array dan sort by total
    return Object.values(grouped).sort((a, b) => b.total - a.total)
  } catch (error) {
    throw error
  }
}

// Fungsi untuk mendapatkan statistik donasi
export async function getStatistik() {
  try {
    // Tanggal hari ini
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Tanggal awal bulan ini
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // Total hari ini
    const { data: hariIni } = await supabase
      .from('donasi')
      .select('nominal')
      .eq('is_deleted', false)
      .gte('tanggal', today.toISOString())
    
    // Total bulan ini
    const { data: bulanIni } = await supabase
      .from('donasi')
      .select('nominal')
      .eq('is_deleted', false)
      .gte('tanggal', startOfMonth.toISOString())
    
    // Total keseluruhan
    const { data: keseluruhan } = await supabase
      .from('donasi')
      .select('nominal')
      .eq('is_deleted', false)
    
    return {
      hariIni: hariIni?.reduce((sum, item) => sum + item.nominal, 0) || 0,
      bulanIni: bulanIni?.reduce((sum, item) => sum + item.nominal, 0) || 0,
      keseluruhan: keseluruhan?.reduce((sum, item) => sum + item.nominal, 0) || 0
    }
  } catch (error) {
    throw error
  }
}

// Fungsi untuk mendapatkan semua donasi dengan filter
export async function getAllDonasi(tanggalMulai = '', tanggalAkhir = '', juruPungutId = '') {
  try {
    let query = supabase
      .from('donasi')
      .select('*')
      .eq('is_deleted', false)
      .order('tanggal', { ascending: false })
    
    // Filter tanggal mulai
    if (tanggalMulai) {
      query = query.gte('tanggal', tanggalMulai)
    }
    
    // Filter tanggal akhir
    if (tanggalAkhir) {
      const endDate = new Date(tanggalAkhir)
      endDate.setHours(23, 59, 59, 999)
      query = query.lte('tanggal', endDate.toISOString())
    }
    
    // Filter juru pungut
    if (juruPungutId) {
      query = query.eq('juru_pungut_id', juruPungutId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Ambil nama juru pungut secara terpisah
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(d => d.juru_pungut_id))]
      const { data: users } = await supabase
        .from('users')
        .select('id, nama')
        .in('id', userIds)
      
      const userMap = {}
      users?.forEach(u => userMap[u.id] = u)
      
      data.forEach(d => {
        d.users = userMap[d.juru_pungut_id]
      })
    }
    
    return data
  } catch (error) {
    throw error
  }
}

// Fungsi untuk mendapatkan daftar juru pungut
export async function getJuruPungutList() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nama')
      .eq('role', 'juru_pungut')
      .order('nama')
    
    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

// Fungsi untuk format rupiah
export function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka)
}

// Fungsi untuk format tanggal
export function formatTanggal(tanggal) {
  return new Date(tanggal).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
