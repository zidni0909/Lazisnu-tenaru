import { supabase } from './supabaseClient.js'

// Search donatur dengan autocomplete
export async function searchDonatur(keyword) {
  try {
    console.log('Searching donatur with keyword:', keyword)
    
    // Query tanpa filter is_deleted dulu untuk testing
    const { data, error } = await supabase
      .from('donatur')
      .select('id, nama, alamat, no_hp')
      .ilike('nama', `%${keyword}%`)
      .order('nama')
      .limit(10)

    if (error) {
      console.error('Search error:', error)
      throw error
    }
    
    console.log('Search results:', data)
    return data
  } catch (error) {
    console.error('searchDonatur error:', error)
    throw error
  }
}

// Tambah donatur baru
export async function tambahDonatur(nama, alamat = '', no_hp = '') {
  try {
    const { data, error } = await supabase
      .from('donatur')
      .insert([{
        nama: nama.trim(),
        alamat: alamat.trim(),
        no_hp: no_hp.trim()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

// Get all donatur (admin)
export async function getAllDonatur() {
  try {
    const { data, error } = await supabase
      .from('donatur')
      .select('*')
      .eq('is_deleted', false)
      .order('nama')

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

// Edit donatur
export async function editDonatur(id, nama, alamat, no_hp) {
  try {
    const { data, error } = await supabase
      .from('donatur')
      .update({
        nama: nama.trim(),
        alamat: alamat.trim(),
        no_hp: no_hp.trim()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

// Soft delete donatur
export async function softDeleteDonatur(id) {
  try {
    const { error } = await supabase
      .from('donatur')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) throw error
    return { success: true, message: 'Donatur berhasil dihapus' }
  } catch (error) {
    throw error
  }
}
