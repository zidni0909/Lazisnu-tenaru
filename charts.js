import { supabase } from './supabaseClient.js'

// ===== FETCH DATA UNTUK GRAFIK 7 HARI TERAKHIR =====
export async function getDonasi7Hari() {
  try {
    // Hitung tanggal 7 hari yang lalu
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 6) // 6 hari lalu + hari ini = 7 hari
    sevenDaysAgo.setHours(0, 0, 0, 0)

    // Query donasi 7 hari terakhir
    const { data, error } = await supabase
      .from('donasi')
      .select('tanggal, nominal')
      .eq('is_deleted', false)
      .gte('tanggal', sevenDaysAgo.toISOString())
      .order('tanggal', { ascending: true })

    if (error) throw error

    // Group by tanggal
    const groupedData = {}
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo)
      date.setDate(sevenDaysAgo.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      groupedData[dateStr] = 0
    }

    data.forEach(item => {
      const dateStr = item.tanggal.split('T')[0]
      if (groupedData[dateStr] !== undefined) {
        groupedData[dateStr] += item.nominal
      }
    })

    // Convert ke array untuk Chart.js
    const labels = Object.keys(groupedData).map(date => {
      const d = new Date(date)
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    })
    const values = Object.values(groupedData)

    return { labels, values }
  } catch (error) {
    console.error('Error fetch 7 hari:', error)
    throw error
  }
}

// ===== FETCH DATA UNTUK GRAFIK PER JENIS ZAKAT =====
export async function getDonasiPerJenis() {
  try {
    const { data, error } = await supabase
      .from('donasi')
      .select('jenis_zakat, nominal')
      .eq('is_deleted', false)

    if (error) throw error

    // Group by jenis_zakat
    const grouped = {}
    data.forEach(item => {
      if (!grouped[item.jenis_zakat]) {
        grouped[item.jenis_zakat] = 0
      }
      grouped[item.jenis_zakat] += item.nominal
    })

    const labels = Object.keys(grouped).map(jenis => jenis.toUpperCase())
    const values = Object.values(grouped)

    return { labels, values }
  } catch (error) {
    console.error('Error fetch per jenis:', error)
    throw error
  }
}

// ===== FETCH DATA UNTUK GRAFIK PER JURU PUNGUT =====
export async function getDonasiPerJuruPungut() {
  try {
    // Query donasi dengan group by juru_pungut_id
    const { data: donasi, error: donasiError } = await supabase
      .from('donasi')
      .select('juru_pungut_id, nominal')
      .eq('is_deleted', false)

    if (donasiError) throw donasiError

    // Group by juru_pungut_id
    const grouped = {}
    donasi.forEach(item => {
      if (!grouped[item.juru_pungut_id]) {
        grouped[item.juru_pungut_id] = 0
      }
      grouped[item.juru_pungut_id] += item.nominal
    })

    // Ambil nama juru pungut
    const userIds = Object.keys(grouped)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, nama')
      .in('id', userIds)

    if (usersError) throw usersError

    // Map user ID ke nama
    const userMap = {}
    users.forEach(user => {
      userMap[user.id] = user.nama
    })

    // Convert ke array untuk Chart.js
    const labels = userIds.map(id => userMap[id] || 'Unknown')
    const values = userIds.map(id => grouped[id])

    return { labels, values }
  } catch (error) {
    console.error('Error fetch per juru pungut:', error)
    throw error
  }
}

// ===== RENDER LINE CHART (7 HARI TERAKHIR) =====
export function renderLineChart(canvasId, labels, values) {
  const ctx = document.getElementById(canvasId).getContext('2d')
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Donasi (Rp)',
        data: values,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Rp ' + context.parsed.y.toLocaleString('id-ID')
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'Rp ' + (value / 1000) + 'k'
            }
          }
        }
      }
    }
  })
}

// ===== RENDER PIE CHART (PER JENIS ZAKAT) =====
export function renderPieChart(canvasId, labels, values) {
  const ctx = document.getElementById(canvasId).getContext('2d')
  
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 146, 60)',
          'rgb(168, 85, 247)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed || 0
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return label + ': Rp ' + value.toLocaleString('id-ID') + ' (' + percentage + '%)'
            }
          }
        }
      }
    }
  })
}

// ===== RENDER BAR CHART (PER JURU PUNGUT) =====
export function renderBarChart(canvasId, labels, values) {
  const ctx = document.getElementById(canvasId).getContext('2d')
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Donasi (Rp)',
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Rp ' + context.parsed.y.toLocaleString('id-ID')
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'Rp ' + (value / 1000) + 'k'
            }
          }
        }
      }
    }
  })
}
