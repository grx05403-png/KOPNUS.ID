(function() {
    "use strict";

    // ==========================================
    // 🔒 DATA HARCODE - TIDAK BISA DIUBAH
    // ==========================================
    
    // Untuk mengubah, edit bagian ini:
    const DATA = {
        // NAMA - ubah sesuai keinginan
        nama: 'RAMAN DZULFITRA',
        
        // GELAR / JULUKAN
        gelar: '"EL CABUL"',
        
        // KEJAHATAN
        kejahatan: 'PENJAHAT KELAMIN',
        
        // HADIAH (dengan format)
        hadiah: '$1.000.000',
        
        // LOKASI TERAKHIR
        lokasi: 'MANDATI TONGGA',
        
        // CIRI-CIRI
        ciri: '📌 Berkacamata hitam',
        
        // FOTO - gunakan URL gambar atau base64
        // Jika dikosongkan, akan menggunakan ikon default
        foto: 'IMG-20260907-WA0014.jpg'
        // foto: '' // kosongkan untuk menggunakan ikon default
    };

    // ==========================================
    // JANGAN UBAH KODE DI BAWAH INI
    // ==========================================

    // DOM Elements
    const fotoContainer = document.getElementById('fotoWanted');
    const namaElement = document.getElementById('namaWanted');
    const gelarElement = document.getElementById('gelarWanted');
    const kejahatanElement = document.getElementById('kejahatanWanted');
    const hadiahElement = document.getElementById('hadiahWanted');
    const lokasiElement = document.getElementById('lokasiWanted');
    const ciriElement = document.getElementById('ciriWanted');
    const downloadBtn = document.getElementById('downloadBtn');
    const stikerElement = document.getElementById('stikerWanted');

    // Render stiker dengan data hardcode
    function renderStiker() {
        // Set nama
        namaElement.textContent = DATA.nama || 'UNKNOWN';
        
        // Set gelar
        gelarElement.textContent = DATA.gelar || '';
        
        // Set kejahatan
        kejahatanElement.textContent = DATA.kejahatan || 'TIDAK DIKETAHUI';
        
        // Set hadiah
        hadiahElement.textContent = DATA.hadiah || '$0';
        
        // Set lokasi
        lokasiElement.textContent = DATA.lokasi || 'TIDAK DIKETAHUI';
        
        // Set ciri
        ciriElement.textContent = DATA.ciri || 'Tidak ada ciri khusus';
        
        // Set foto
        if (DATA.foto && DATA.foto.trim() !== '') {
            // Jika foto adalah URL atau base64
            fotoContainer.innerHTML = `<img src="${DATA.foto}" alt="${DATA.nama}">`;
        } else {
            // Gunakan ikon default
            fotoContainer.innerHTML = '👤';
            fotoContainer.style.fontSize = '5.5rem';
        }
    }

    // Download stiker sebagai PNG
    function downloadStiker() {
        // Load html2canvas dari CDN
        loadHtml2Canvas()
            .then(() => {
                return html2canvas(stikerElement, {
                    scale: 2.5,
                    backgroundColor: null,
                    allowTaint: true,
                    useCORS: true,
                    logging: false,
                    borderRadius: '20px',
                    shadow: true
                });
            })
            .then(canvas => {
                const link = document.createElement('a');
                link.download = 'WANTED-POSTER.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            })
            .catch(() => {
                alert('⚠️ Gagal download. Silakan screenshot manual.\n\nTekan: PrtScrn atau screenshot biasa.');
            });
    }

    // Load html2canvas dari CDN
    function loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Event listener untuk tombol download
    downloadBtn.addEventListener('click', downloadStiker);

    // Render stiker saat halaman dimuat
    renderStiker();

    // Log untuk verifikasi
    console.log('🤠 WANTED POSTER - Data sudah di-hardcode');
    console.log('📋 Data:', DATA);
    console.log('🔒 Tidak dapat diubah oleh orang lain');

    // ==========================================
    // TAMBAHAN: Proteksi dari perubahan
    // ==========================================
    
    // Cegah klik kanan (opsional)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Cegah inspect element dengan shortcut (opsional)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) {
            e.preventDefault();
        }
        if (e.key === 'F12') {
            e.preventDefault();
        }
    });

})();
const DATA = {
    nama: 'NAMA BARU',           // Ubah ini
    gelar: '"Gelar Baru"',       // Ubah ini
    kejahatan: 'KEJAHATAN BARU', // Ubah ini
    hadiah: '$100.000',          // Ubah ini
    lokasi: 'LOKASI BARU',       // Ubah ini
    ciri: 'CIRI BARU',           // Ubah ini
    foto: 'https://url-foto-baru.jpg' // Ubah ini
};
