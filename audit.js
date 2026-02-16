import { supabase } from './supabaseClient.js'

// Fungsi untuk lock semua donasi hari ini
export async function lockDonasiHariIni(userId, userEmail) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Ambil donasi yang akan di-lock
    const { data: donasiList } = await supabase
      .from('donasi')
      .select('*')
      .gte('tanggal', today.toISOString())
      .lt('tanggal', tomorrow.toISOString())
      .eq('is_locked', false)
      .eq('is_deleted', false)
    
    if (!donasiList || donasiList.length === 0) {
      return { success: true, count: 0, message: 'Tidak ada donasi yang perlu di-lock' }
    }
    
    // LOCK DONASI
    const { error } = await supabase
      .from('donasi')
      .update({ is_locked: true })
      .gte('tanggal', today.toISOString())
      .lt('tanggal', tomorrow.toISOString())
      .eq('is_locked', false)
      .eq('is_deleted', false)
    
    if (error) throw error
    
    // INSERT AUDIT LOG untuk setiap donasi
    const auditLogs = donasiList.map(donasi => ({
      user_id: userId,
      user_email: userEmail,
      action: 'LOCK',
      table_name: 'donasi',
      record_id: donasi.id,
      old_data: { is_locked: false },
      new_data: { is_locked: true }
    }))
    
    await supabase.from('audit_logs').insert(auditLogs)
    
    return { success: true, count: donasiList.length, message: `Berhasil lock ${donasiList.length} donasi` }
  } catch (error) {
    throw error
  }
}

// Fungsi untuk mendapatkan audit logs
// Fungsi untuk mendapatkan audit logs
export async function getAuditLogs(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}
