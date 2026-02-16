import { supabase } from './supabaseClient.js'

// Fungsi untuk export PDF laporan pribadi juru pungut
export async function exportMyPDF(userId, userName, year, month) {
  try {
    // Format tanggal awal dan akhir bulan
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    
    // Ambil data donasi milik juru pungut ini saja
    const { data: donasi, error } = await supabase
      .from('donasi')
      .select('*')
      .eq('juru_pungut_id', userId)
      .eq('is_deleted', false)
      .gte('tanggal', startDate.toISOString())
      .lte('tanggal', endDate.toISOString())
      .order('tanggal', { ascending: true })
    
    if (error) throw error
    
    if (donasi.length === 0) {
      throw new Error('Tidak ada data donasi untuk bulan ini')
    }
    
    // Hitung statistik
    const total = donasi.reduce((sum, d) => sum + d.nominal, 0)
    const jumlahTransaksi = donasi.length
    
    // Nama bulan
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const monthName = monthNames[month - 1]
    
    // Initialize jsPDF
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    
    let yPos = 20
    
    // Header
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('LAPORAN DONASI PRIBADI', 105, yPos, { align: 'center' })
    yPos += 10
    
    doc.setFontSize(12)
    doc.text('LAZISNU RANTING TENARU', 105, yPos, { align: 'center' })
    yPos += 15
    
    // Info Juru Pungut
    doc.setFont(undefined, 'normal')
    doc.setFontSize(11)
    doc.text(`Nama Juru Pungut  : ${userName}`, 14, yPos)
    yPos += 7
    doc.text(`Periode           : ${monthName} ${year}`, 14, yPos)
    yPos += 7
    doc.text(`Total Donasi      : ${formatRupiah(total)}`, 14, yPos)
    yPos += 7
    doc.text(`Jumlah Transaksi  : ${jumlahTransaksi}`, 14, yPos)
    yPos += 12
    
    // Tabel Header
    doc.setFont(undefined, 'bold')
    doc.text('DETAIL TRANSAKSI', 14, yPos)
    yPos += 7
    
    // Tabel
    doc.setFontSize(9)
    const headers = ['No', 'Tanggal', 'Donatur', 'Jenis', 'Nominal', 'Metode']
    const colWidths = [10, 30, 50, 30, 35, 30]
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
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      
      xPos = 14
      const rowData = [
        (index + 1).toString(),
        formatTanggalPDF(item.tanggal),
        truncate(item.nama_donatur, 18),
        item.jenis_zakat.toUpperCase(),
        formatRupiahShort(item.nominal),
        item.metode.toUpperCase()
      ]
      
      rowData.forEach((data, i) => {
        doc.text(data, xPos, yPos)
        xPos += colWidths[i]
      })
      yPos += 6
    })
    
    // Disclaimer
    yPos += 10
    if (yPos > 260) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(8)
    doc.setFont(undefined, 'italic')
    doc.text('Laporan ini hanya mencakup donasi yang diinput oleh juru pungut terkait.', 14, yPos)
    yPos += 5
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, yPos)
    
    // Save PDF
    doc.save(`Laporan_Pribadi_${monthName}_${year}.pdf`)
    
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
