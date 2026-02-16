// formatRupiah.js - Auto format input nominal menjadi format Rupiah

/**
 * Format angka menjadi format Rupiah dengan pemisah ribuan
 * @param {string} angka - Input dari user
 * @returns {string} - Format "Rp 1.000.000"
 */
function formatRupiah(angka) {
  // Hilangkan semua karakter non-digit
  const numberString = angka.replace(/[^,\d]/g, '').toString();
  
  // Split untuk pemisah ribuan
  const split = numberString.split(',');
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  // Tambahkan titik sebagai pemisah ribuan
  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  // Tambahkan prefix "Rp "
  rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  return rupiah ? 'Rp ' + rupiah : '';
}

/**
 * Ambil nilai angka murni dari format Rupiah
 * @param {string} rupiah - Format "Rp 1.000.000"
 * @returns {number} - Angka murni 1000000
 */
function parseRupiah(rupiah) {
  // Hilangkan "Rp ", spasi, dan titik pemisah ribuan
  const angka = rupiah.replace(/Rp\s?|\.|\s/g, '');
  return parseInt(angka) || 0;
}

/**
 * Validasi nominal donasi
 * @param {string} rupiah - Format "Rp 1.000.000"
 * @returns {object} - {valid: boolean, message: string, value: number}
 */
function validateNominal(rupiah) {
  const nilai = parseRupiah(rupiah);
  
  if (!rupiah || rupiah === 'Rp ' || rupiah === '') {
    return {
      valid: false,
      message: 'Nominal tidak boleh kosong',
      value: 0
    };
  }
  
  if (nilai === 0 || isNaN(nilai)) {
    return {
      valid: false,
      message: 'Nominal harus lebih dari 0',
      value: 0
    };
  }
  
  return {
    valid: true,
    message: '',
    value: nilai
  };
}

/**
 * Inisialisasi auto format pada input nominal
 * @param {string} inputId - ID dari input element
 */
function initFormatRupiah(inputId) {
  const input = document.getElementById(inputId);
  
  if (!input) {
    console.error(`Input dengan ID "${inputId}" tidak ditemukan`);
    return;
  }

  // Event saat user mengetik
  input.addEventListener('keyup', function(e) {
    // Format otomatis
    input.value = formatRupiah(input.value);
  });

  // Prevent paste non-numeric
  input.addEventListener('paste', function(e) {
    setTimeout(() => {
      input.value = formatRupiah(input.value);
    }, 10);
  });

  // Prevent input huruf (hanya angka yang diizinkan)
  input.addEventListener('keypress', function(e) {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    
    // Hanya izinkan angka 0-9
    if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  });
}
