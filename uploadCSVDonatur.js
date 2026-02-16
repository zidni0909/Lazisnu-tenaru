import { supabase } from './supabaseClient.js'

// Upload CSV Donatur dengan UPSERT otomatis
export async function uploadCSVDonatur(csvFile, userId, userEmail) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data
          
          if (data.length === 0) {
            reject(new Error('File CSV kosong'))
            return
          }

          const firstRow = data[0]
          if (!firstRow.hasOwnProperty('nama')) {
            reject(new Error('Kolom "nama" wajib ada di CSV'))
            return
          }

          // Bersihkan dan normalisasi data (TANPA uppercase)
          const cleanData = []
          const skipped = []

          for (let i = 0; i < data.length; i++) {
            const row = data[i]
            const nama = row.nama?.trim()  // Tidak uppercase, biarkan original
            
            if (!nama) {
              skipped.push(`Baris ${i + 2}: Nama kosong`)
              continue
            }

            cleanData.push({
              nama,
              alamat: row.alamat?.trim() || '',
              no_hp: row.no_hp?.trim() || ''
            })
          }

          if (cleanData.length === 0) {
            reject(new Error('Tidak ada data valid untuk diupload'))
            return
          }

          // Process dengan check duplicate manual menggunakan ilike
          let inserted = 0
          let updated = 0

          for (const row of cleanData) {
            // Cek apakah sudah ada menggunakan ilike (case-insensitive + partial match)
            const { data: existing } = await supabase
              .from('donatur')
              .select('id')
              .ilike('nama', row.nama)
              .ilike('alamat', row.alamat)
              .eq('is_deleted', false)
              .maybeSingle()

            if (existing) {
              // Update
              await supabase
                .from('donatur')
                .update({ no_hp: row.no_hp })
                .eq('id', existing.id)
              updated++
            } else {
              // Insert
              await supabase
                .from('donatur')
                .insert([row])
              inserted++
            }
          }

          // Audit log
          await supabase.from('audit_logs').insert([{
            user_id: userId,
            user_email: userEmail,
            action: 'UPLOAD_DONATUR_CSV',
            table_name: 'donatur',
            record_id: null,
            old_data: null,
            new_data: {
              total_rows: data.length,
              inserted: inserted,
              updated: updated >= 0 ? updated : 0,
              skipped: skipped.length
            }
          }])

          resolve({
            success: true,
            total: cleanData.length,
            inserted,
            updated: updated >= 0 ? updated : 0,
            skipped,
            errors: []
          })
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(new Error('Gagal membaca file CSV: ' + error.message))
      }
    })
  })
}
