// ESC/POS Commands
const ESC = '\x1B'
const GS = '\x1D'

const CMD = {
  INIT: ESC + '@',
  ALIGN_LEFT: ESC + 'a' + '\x00',
  ALIGN_CENTER: ESC + 'a' + '\x01',
  BOLD_ON: ESC + 'E' + '\x01',
  BOLD_OFF: ESC + 'E' + '\x00',
  LINE_FEED: '\n',
  CUT_PAPER: GS + 'V' + '\x41' + '\x00'
}

// State printer
let printerDevice = null
let printerCharacteristic = null
let isPrinterConnected = false

// Fungsi untuk connect printer via Bluetooth
export async function connectPrinter() {
  try {
    // Request Bluetooth device
    printerDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
    })

    // Connect ke GATT server
    const server = await printerDevice.gatt.connect()
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
    printerCharacteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')

    isPrinterConnected = true
    return { success: true, message: 'Printer berhasil terhubung' }
  } catch (error) {
    isPrinterConnected = false
    throw new Error('Gagal connect printer: ' + error.message)
  }
}

// Fungsi untuk disconnect printer
export function disconnectPrinter() {
  if (printerDevice && printerDevice.gatt.connected) {
    printerDevice.gatt.disconnect()
  }
  isPrinterConnected = false
  printerDevice = null
  printerCharacteristic = null
}

// Fungsi untuk cek status koneksi
export function isPrinterReady() {
  return isPrinterConnected && printerCharacteristic !== null
}

// Fungsi untuk print struk
export async function printReceipt(data, paperSize = '58mm') {
  if (!isPrinterReady()) {
    throw new Error('Printer belum terhubung')
  }

  try {
    const maxWidth = paperSize === '58mm' ? 32 : 48
    let receipt = ''

    // Initialize printer
    receipt += CMD.INIT

    // Header
    receipt += CMD.ALIGN_CENTER + CMD.BOLD_ON
    receipt += 'LAZISNU RANTING TENARU' + CMD.LINE_FEED
    receipt += CMD.BOLD_OFF
    receipt += '='.repeat(maxWidth) + CMD.LINE_FEED

    // Body
    receipt += CMD.ALIGN_LEFT
    receipt += padLine('Nama', data.nama_donatur, maxWidth) + CMD.LINE_FEED
    receipt += padLine('Jenis', data.jenis_zakat.toUpperCase(), maxWidth) + CMD.LINE_FEED
    receipt += padLine('Nominal', formatRupiah(data.nominal), maxWidth) + CMD.LINE_FEED
    receipt += padLine('Metode', data.metode.toUpperCase(), maxWidth) + CMD.LINE_FEED
    receipt += padLine('Tanggal', formatTanggal(data.tanggal), maxWidth) + CMD.LINE_FEED
    receipt += padLine('JP', data.juru_pungut_nama, maxWidth) + CMD.LINE_FEED

    // Footer
    receipt += '='.repeat(maxWidth) + CMD.LINE_FEED
    receipt += CMD.ALIGN_CENTER
    receipt += 'Terima kasih atas' + CMD.LINE_FEED
    receipt += 'donasi Anda' + CMD.LINE_FEED
    receipt += '='.repeat(maxWidth) + CMD.LINE_FEED
    receipt += CMD.LINE_FEED + CMD.LINE_FEED + CMD.LINE_FEED

    // Cut paper
    receipt += CMD.CUT_PAPER

    // Send to printer
    const encoder = new TextEncoder()
    const data_bytes = encoder.encode(receipt)
    await printerCharacteristic.writeValue(data_bytes)

    return { success: true, message: 'Struk berhasil dicetak' }
  } catch (error) {
    throw new Error('Gagal print: ' + error.message)
  }
}

// Helper: Format baris dengan padding
function padLine(label, value, maxWidth) {
  const separator = ' : '
  const availableWidth = maxWidth - separator.length
  
  // Potong value jika terlalu panjang
  const maxValueWidth = availableWidth - label.length
  let displayValue = value.toString()
  if (displayValue.length > maxValueWidth) {
    displayValue = displayValue.substring(0, maxValueWidth - 3) + '...'
  }
  
  return label + separator + displayValue
}

// Helper: Format rupiah
function formatRupiah(angka) {
  return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Helper: Format tanggal
function formatTanggal(tanggal) {
  const date = new Date(tanggal)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}
