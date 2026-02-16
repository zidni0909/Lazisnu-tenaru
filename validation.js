// ===== FORM VALIDATION HELPERS =====

// Validasi donasi
export function validateDonasi(namaDonatur, jenisZakat, nominal, metode) {
  const errors = []

  if (!namaDonatur || namaDonatur.trim() === '') {
    errors.push('Nama donatur wajib diisi')
  }

  if (!jenisZakat || jenisZakat === '') {
    errors.push('Jenis zakat wajib dipilih')
  }

  if (!nominal || isNaN(nominal) || nominal <= 0) {
    errors.push('Nominal harus lebih dari 0')
  }

  if (!metode || metode === '') {
    errors.push('Metode pembayaran wajib dipilih')
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  }
}

// Validasi user
export function validateUser(nama, email, password) {
  const errors = []

  if (!nama || nama.trim() === '') {
    errors.push('Nama wajib diisi')
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Email tidak valid')
  }

  if (!password || password.length < 6) {
    errors.push('Password minimal 6 karakter')
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  }
}

// Validasi email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Prevent double submit
let isSubmitting = false

export function preventDoubleSubmit(callback) {
  return async function(...args) {
    if (isSubmitting) {
      console.warn('Form sedang diproses, harap tunggu...')
      return
    }

    isSubmitting = true
    try {
      await callback(...args)
    } finally {
      isSubmitting = false
    }
  }
}

// Sanitize input
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.trim().replace(/[<>]/g, '')
}
