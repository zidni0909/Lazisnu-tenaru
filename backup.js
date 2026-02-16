import { supabase } from './supabaseClient.js'

// Fungsi untuk export donasi ke CSV
export async function exportDonasiToCSV() {
  try {
    // Query semua donasi dengan sorting berdasarkan tanggal
    const { data: donasi, error: donasiError } = await supabase
      .from('donasi')
      .select('*')
      .eq('is_deleted', false)
      .order('tanggal', { ascending: false });

    if (donasiError) throw donasiError;

    // Ambil semua user ID yang unik
    const userIds = [...new Set(donasi.map(d => d.juru_pungut_id))];

    // Query users berdasarkan ID
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, nama')
      .in('id', userIds);

    if (usersError) throw usersError;

    // Buat map user untuk lookup cepat
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user.nama;
    });

    // Header CSV
    const headers = ['Tanggal', 'Donatur', 'Jenis', 'Nominal', 'Metode', 'Juru Pungut'];
    
    // Buat rows CSV
    const rows = donasi.map(d => {
      const tanggal = new Date(d.tanggal).toLocaleDateString('id-ID');
      const juruPungut = userMap[d.juru_pungut_id] || 'Unknown';
      
      return [
        tanggal,
        d.nama_donatur,
        d.jenis_zakat,
        d.nominal,
        d.metode,
        juruPungut
      ];
    });

    // Gabungkan header dan rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Buat Blob dan download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `backup_donasi_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, count: donasi.length };
  } catch (error) {
    console.error('Error export CSV:', error);
    throw error;
  }
}
