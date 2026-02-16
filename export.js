import { supabase } from './supabaseClient.js'

// Fungsi untuk mendapatkan data donasi berdasarkan bulan
export async function getDonasiByMonth(year, month) {
  try {
    // Format tanggal awal dan akhir bulan
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    
    const { data, error } = await supabase
      .from('donasi')
      .select('*')
      .eq('is_deleted', false)
      .gte('tanggal', startDate.toISOString())
      .lte('tanggal', endDate.toISOString())
      .order('tanggal', { ascending: true })
    
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

// Fungsi untuk generate PDF laporan
export async function generatePDFReport(year, month) {
  try {
    // Ambil data donasi
    const donasi = await getDonasiByMonth(year, month)
    
    if (donasi.length === 0) {
      throw new Error('Tidak ada data donasi untuk bulan ini')
    }
    
    // Hitung statistik
    const totalPemasukan = donasi.reduce((sum, item) => sum + item.nominal, 0)
    const jumlahTransaksi = donasi.length
    const juruPungutUnik = new Set(donasi.map(item => item.juru_pungut_id)).size
    
    // Nama bulan
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const monthName = monthNames[month - 1]
    
    // Initialize jsPDF
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    
    let yPos = 20
    
    // Header
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.text('LAPORAN DONASI BULANAN', 105, yPos, { align: 'center' })
    yPos += 10
    
    doc.setFontSize(14)
    doc.text('LAZISNU RANTING TENARU', 105, yPos, { align: 'center' })
    yPos += 10
    
    doc.setFontSize(12)
    doc.setFont(undefined, 'normal')
    doc.text(`Periode: ${monthName} ${year}`, 105, yPos, { align: 'center' })
    yPos += 15
    
    // Ringkasan Statistik
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text('RINGKASAN', 14, yPos)
    yPos += 7
    
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text(`Total Pemasukan       : ${formatRupiah(totalPemasukan)}`, 14, yPos)
    yPos += 6
    doc.text(`Jumlah Transaksi      : ${jumlahTransaksi}`, 14, yPos)
    yPos += 6
    doc.text(`Jumlah Juru Pungut    : ${juruPungutUnik}`, 14, yPos)
    yPos += 12
    
    // Tabel Header
    doc.setFont(undefined, 'bold')
    doc.text('DETAIL TRANSAKSI', 14, yPos)
    yPos += 7
    
    // Tabel
    doc.setFontSize(9)
    const headers = ['No', 'Tanggal', 'Donatur', 'Jenis', 'Nominal', 'Metode', 'JP']
    const colWidths = [10, 30, 40, 25, 35, 25, 30]
    let xPos = 14
    
    // Header tabel
    doc.setFillColor(200, 200, 200)
    doc.rect(14, yPos - 5, 182, 7, 'F')
    headers.forEach((header, i) => {
      doc.text(header, xPos, yPos)
      xPos += colWidths[i]
    })
    yPos += 7
    
    // Data tabel
    doc.setFont(undefined, 'normal')
    donasi.forEach((item, index) => {
      // Cek jika halaman penuh
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      
      xPos = 14
      const rowData = [
        (index + 1).toString(),
        formatTanggalPDF(item.tanggal),
        truncate(item.nama_donatur, 15),
        item.jenis_zakat.toUpperCase(),
        formatRupiahShort(item.nominal),
        item.metode.toUpperCase(),
        truncate(item.users?.nama || '-', 12)
      ]
      
      rowData.forEach((data, i) => {
        doc.text(data, xPos, yPos)
        xPos += colWidths[i]
      })
      yPos += 6
    })
    
    // Footer
    yPos += 10
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(8)
    doc.setFont(undefined, 'italic')
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, yPos)
    
    // Save PDF
    doc.save(`Laporan_Donasi_${monthName}_${year}.pdf`)
    
    return { success: true, message: 'PDF berhasil didownload' }
  } catch (error) {
    throw error
  }
}

// Helper: Format rupiah
function formatRupiah(angka) {
  return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Helper: Format rupiah short
function formatRupiahShort(angka) {
  if (angka >= 1000000) {
    return 'Rp ' + (angka / 1000000).toFixed(1) + 'jt'
  }
  return 'Rp ' + (angka / 1000).toFixed(0) + 'rb'
}

// Helper: Format tanggal untuk PDF
function formatTanggalPDF(tanggal) {
  const date = new Date(tanggal)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

// Helper: Truncate text
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 2) + '..'
}
