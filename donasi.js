import { supabase } from './supabaseClient.js'

// Fungsi untuk menyimpan donasi baru
export async function simpanDonasi(dataDonasi, userId, userEmail) {
  try {
    // INSERT DONASI
    const { data, error } = await supabase
      .from('donasi')
      .insert([{
        nama_donatur: dataDonasi.nama_donatur,
        jenis_zakat: dataDonasi.jenis_zakat,
        nominal: Number(dataDonasi.nominal),
        metode: dataDonasi.metode,
        juru_pungut_id: dataDonasi.juru_pungut_id,
        donatur_id: dataDonasi.donatur_id || null
      }])
      .select()
      .single()

    if (error) throw error
    
    // INSERT AUDIT LOG
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      user_email: userEmail,
      action: 'INSERT',
      table_name: 'donasi',
      record_id: data.id,
      old_data: null,
      new_data: data
    }])
    
    return data
  } catch (error) {
    throw error
  }
}

// Fungsi untuk update donasi dengan validasi
export async function updateDonasi(donasiId, updateData, userId, userEmail) {
  try {
    // Ambil data lama
    const { data: oldDonasi, error: fetchError } = await supabase
      .from('donasi')
      .select('*')
      .eq('id', donasiId)
      .single()
    
    if (fetchError) throw fetchError
    
    // Cek is_locked
    if (oldDonasi.is_locked) {
      throw new Error('Data sudah dikunci admin')
    }
    
    // Cek waktu (5 menit)
    const createdTime = new Date(oldDonasi.created_at)
    const now = new Date()
    const diffMinutes = (now - createdTime) / 60000
    
    if (diffMinutes > 5) {
      throw new Error('Data tidak bisa diubah karena sudah lebih dari 5 menit')
    }
    
    // UPDATE DONASI
    const { data: updated, error: updateError } = await supabase
      .from('donasi')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', donasiId)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    // INSERT AUDIT LOG
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      user_email: userEmail,
      action: 'UPDATE',
      table_name: 'donasi',
      record_id: donasiId,
      old_data: oldDonasi,
      new_data: updated
    }])
    
    return updated
  } catch (error) {
    throw error
  }
}

// Fungsi untuk mengambil daftar donasi berdasarkan juru pungut
export async function getDonasi(juruPungutId) {
  try {
    const { data, error } = await supabase
      .from('donasi')
      .select('*')
      .eq('juru_pungut_id', juruPungutId)
      .eq('is_deleted', false)
      .order('tanggal', { ascending: false })

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

// Fungsi untuk soft delete donasi (admin only)
export async function softDeleteDonasi(donasiId, userId, userEmail) {
  try {
    // Ambil data lama
    const { data: oldData, error: fetchError } = await supabase
      .from('donasi')
      .select('*')
      .eq('id', donasiId)
      .single()

    if (fetchError) throw fetchError

    // Cek is_locked
    if (oldData.is_locked) {
      throw new Error('Data sudah terkunci, tidak bisa dihapus')
    }

    // Cek is_deleted
    if (oldData.is_deleted) {
      throw new Error('Data sudah dihapus sebelumnya')
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('donasi')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', donasiId)

    if (deleteError) throw deleteError

    // Insert audit log
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      user_email: userEmail,
      action: 'DELETE_DONASI_SOFT',
      table_name: 'donasi',
      record_id: donasiId,
      old_data: oldData,
      new_data: null
    }])

    return { success: true, message: 'Donasi berhasil dihapus' }
  } catch (error) {
    throw error
  }
}
