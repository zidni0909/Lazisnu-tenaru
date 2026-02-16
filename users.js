import { supabase } from './supabaseClient.js'

// Fungsi untuk menambah juru pungut baru dengan password hash
export async function tambahJuruPungut(nama, email, password, adminId, adminEmail) {
  try {
    // Cek email sudah ada atau belum
    const { data: existing } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle()
    
    if (existing) {
      throw new Error('Email sudah terdaftar')
    }
    
    // Hash password menggunakan bcrypt sync
    const hashedPassword = window.bcrypt.hashSync(password, 10)
    
    // INSERT USER dengan password yang sudah di-hash
    const { data, error } = await supabase
      .from('users')
      .insert([{
        nama: nama,
        email: email,
        password: hashedPassword,
        role: 'juru_pungut',
        is_active: true
      }])
      .select()
      .single()
    
    if (error) throw error
    
    // INSERT AUDIT LOG
    await supabase.from('audit_logs').insert([{
      user_id: adminId,
      user_email: adminEmail,
      action: 'CREATE_USER',
      table_name: 'users',
      record_id: data.id,
      old_data: null,
      new_data: data
    }])
    
    return data
  } catch (error) {
    throw error
  }
}

// Fungsi untuk mendapatkan semua juru pungut
export async function getAllJuruPungut() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nama, email, is_active, created_at')
      .eq('role', 'juru_pungut')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

// Fungsi untuk hapus juru pungut
export async function hapusJuruPungut(userId, adminId, adminEmail) {
  try {
    // Hapus user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
    
    if (error) throw error
    
    // INSERT AUDIT LOG
    await supabase.from('audit_logs').insert([{
      user_id: adminId,
      user_email: adminEmail,
      action: 'DELETE_USER',
      table_name: 'users',
      record_id: userId,
      old_data: { id: userId },
      new_data: null
    }])
    
    return { success: true }
  } catch (error) {
    throw error
  }
}

// Fungsi untuk edit juru pungut
export async function editJuruPungut(userId, nama, email, adminId, adminEmail) {
  try {
    // Ambil data lama
    const { data: oldData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    // Update user
    const { data, error } = await supabase
      .from('users')
      .update({ nama, email })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    // INSERT AUDIT LOG
    await supabase.from('audit_logs').insert([{
      user_id: adminId,
      user_email: adminEmail,
      action: 'UPDATE_USER',
      table_name: 'users',
      record_id: userId,
      old_data: oldData,
      new_data: data
    }])
    
    return data
  } catch (error) {
    throw error
  }
}

// Fungsi untuk ganti password
export async function gantiPassword(userId, newPassword, adminId, adminEmail) {
  try {
    // Hash password baru menggunakan bcrypt sync
    const hashedPassword = window.bcrypt.hashSync(newPassword, 10)
    
    // Update password
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId)
    
    if (error) throw error
    
    // INSERT AUDIT LOG
    await supabase.from('audit_logs').insert([{
      user_id: adminId,
      user_email: adminEmail,
      action: 'CHANGE_PASSWORD',
      table_name: 'users',
      record_id: userId,
      old_data: null,
      new_data: { password_changed: true }
    }])
    
    return { success: true }
  } catch (error) {
    throw error
  }
}

// Fungsi untuk nonaktifkan user dengan validasi
export async function nonaktifkanUser(userId, adminId, adminEmail) {
  try {
    // Cek apakah ada donasi hari ini yang belum dikunci
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: donasiHariIni } = await supabase
      .from('donasi')
      .select('id')
      .eq('juru_pungut_id', userId)
      .gte('tanggal', today.toISOString())
      .eq('is_locked', false)
    
    if (donasiHariIni && donasiHariIni.length > 0) {
      throw new Error(`User ini memiliki ${donasiHariIni.length} donasi hari ini yang belum dikunci. Lock donasi terlebih dahulu.`)
    }
    
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)
    
    if (error) throw error
    
    // INSERT AUDIT LOG
    await supabase.from('audit_logs').insert([{
      user_id: adminId,
      user_email: adminEmail,
      action: 'DEACTIVATE_USER',
      table_name: 'users',
      record_id: userId,
      old_data: { is_active: true },
      new_data: { is_active: false }
    }])
    
    return { success: true }
  } catch (error) {
    throw error
  }
}

// Fungsi untuk aktifkan user
export async function aktifkanUser(userId, adminId, adminEmail) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', userId)
    
    if (error) throw error
    
    // INSERT AUDIT LOG
    await supabase.from('audit_logs').insert([{
      user_id: adminId,
      user_email: adminEmail,
      action: 'ACTIVATE_USER',
      table_name: 'users',
      record_id: userId,
      old_data: { is_active: false },
      new_data: { is_active: true }
    }])
    
    return { success: true }
  } catch (error) {
    throw error
  }
}

// Fungsi untuk format tanggal
export function formatTanggalUser(tanggal) {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
