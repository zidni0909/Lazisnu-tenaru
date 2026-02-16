import { supabase } from './supabaseClient.js'

// Fungsi login dengan bcrypt
export async function login(email, password) {
  try {
    // Query user berdasarkan email saja
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    console.log('Data:', data, 'Error:', error);

    if (error || !data) {
      throw new Error('Email atau password salah');
    }

    // Bandingkan password dengan hash menggunakan bcrypt sync
    const isPasswordValid = window.bcrypt.compareSync(password, data.password);
    
    if (!isPasswordValid) {
      throw new Error('Email atau password salah');
    }
    
    // Cek apakah user aktif
    if (data.is_active === false) {
      throw new Error('Akun Anda telah dinonaktifkan. Hubungi admin.');
    }

    // Simpan data user ke localStorage
    localStorage.setItem('user', JSON.stringify(data));

    // Redirect berdasarkan role
    if (data.role === 'admin') {
      window.location.href = 'admin.html';
    } else if (data.role === 'juru_pungut') {
      window.location.href = 'dashboard.html';
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Fungsi logout
export function logout() {
  // Stop auto logout timer
  stopAutoLogout();
  // Hapus data user dari localStorage
  localStorage.removeItem('user');
  // Redirect ke halaman login
  window.location.href = 'index.html';
}

// Fungsi middleware untuk cek login
export function checkLogin(requiredRole = null) {
  const userStr = localStorage.getItem('user');
  
  // Jika tidak ada data user, redirect ke login
  if (!userStr) {
    window.location.href = 'index.html';
    return null;
  }

  const user = JSON.parse(userStr);

  // Jika ada role yang diperlukan, cek apakah user memiliki role tersebut
  if (requiredRole && user.role !== requiredRole) {
    window.location.href = 'index.html';
    return null;
  }

  return user;
}

// Fungsi untuk mendapatkan user yang sedang login
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// ===== AUTO LOGOUT SYSTEM =====
let logoutTimer = null;
const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 menit dalam milidetik

// Fungsi untuk reset timer auto logout
function resetLogoutTimer() {
  // Hapus timer yang ada
  if (logoutTimer) {
    clearTimeout(logoutTimer);
  }
  
  // Set timer baru
  logoutTimer = setTimeout(() => {
    alert('Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit.');
    logout();
  }, TIMEOUT_DURATION);
}

// Fungsi untuk inisialisasi auto logout
export function initAutoLogout() {
  // Cek apakah user sudah login
  const user = getCurrentUser();
  if (!user) return;
  
  // Set timer pertama kali
  resetLogoutTimer();
  
  // Reset timer saat ada aktivitas
  document.addEventListener('mousemove', resetLogoutTimer);
  document.addEventListener('keypress', resetLogoutTimer);
  document.addEventListener('click', resetLogoutTimer);
  document.addEventListener('scroll', resetLogoutTimer);
}

// Fungsi untuk stop auto logout (saat logout manual)
export function stopAutoLogout() {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
  }
  document.removeEventListener('mousemove', resetLogoutTimer);
  document.removeEventListener('keypress', resetLogoutTimer);
  document.removeEventListener('click', resetLogoutTimer);
  document.removeEventListener('scroll', resetLogoutTimer);
}
