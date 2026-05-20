// State Management
let allBooks = [];
let filteredBooks = [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const filterKurikulum = document.getElementById('filterKurikulum');
const filterJenjang = document.getElementById('filterJenjang');
const filterKelas = document.getElementById('filterKelas');
const filterType = document.getElementById('filterType');

const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const resultsHeader = document.getElementById('resultsHeader');
const resultsCount = document.getElementById('resultsCount');
const resultsGrid = document.getElementById('resultsGrid');
const downloadAllBtn = document.getElementById('downloadAllBtn');

// API Endpoints
const API_PENGGERAK = 'https://api.buku.cloudapp.web.id/api/catalogue/getPenggerakTextBooks?limit=5000';
const API_K13 = 'https://api.buku.cloudapp.web.id/api/catalogue/getTextBooks?limit=5000';

// Initialize Application
async function initApp() {
    try {
        // Fetch from local static data.json (avoids Chrome Private Network Access block)
        const response = await fetch('./data.json');
        if (!response.ok) throw new Error(`Gagal memuat data.json: HTTP ${response.status}`);
        
        const data = await response.json();
        allBooks = data.books || [];
        
        if (allBooks.length === 0) {
            throw new Error('Data buku kosong di data.json');
        }

        // Show last updated info
        if (data.generated_at) {
            const date = new Date(data.generated_at);
            const subtitleEl = document.querySelector('.logo-container p');
            if (subtitleEl) {
                subtitleEl.textContent = `${subtitleEl.textContent} · Diperbarui: ${date.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}`;
            }
        }

        // Hide loading
        loadingState.classList.add('hidden');
        
        // Initial render
        filterAndRender();

        // Setup Event Listeners
        searchInput.addEventListener('input', debounce(filterAndRender, 300));
        filterKurikulum.addEventListener('change', filterAndRender);
        filterJenjang.addEventListener('change', filterAndRender);
        filterKelas.addEventListener('change', filterAndRender);
        filterType.addEventListener('change', filterAndRender);
        downloadAllBtn.addEventListener('click', downloadAllPdfs);
        
    } catch (error) {
        console.error("Gagal mengambil data buku:", error);
        loadingState.querySelector('h2').textContent = "Terjadi Kesalahan";
        loadingState.querySelector('p').textContent = error.message;
        loadingState.querySelector('.spinner').style.display = 'none';
    }
}

// Filter Logic
function filterAndRender() {
    const query = searchInput.value.toLowerCase().trim();
    const kurikulum = filterKurikulum.value;
    const jenjang = filterJenjang.value;
    const kelas = filterKelas.value;
    const type = filterType.value;

    filteredBooks = allBooks.filter(book => {
        // Search text matching (title)
        if (query && !book.title.toLowerCase().includes(query)) return false;
        
        // Kurikulum Match
        if (kurikulum === '2023' && book.curriculum !== '2023') return false;
        if (kurikulum === '2013' && book.curriculum !== '2013') return false;
        
        // Jenjang Match (SD, SMP, SMA)
        if (jenjang !== 'Semua' && book.level && !book.level.includes(jenjang)) return false;
        
        // Kelas Match
        if (kelas !== 'Semua' && String(book.class) !== kelas) return false;
        
        // Tipe Match (Siswa/Guru)
        if (type !== 'Semua' && book.book_type !== type) return false;
        
        // Pastikan ada attachment PDF
        if (!book.attachment) return false;

        return true;
    });

    renderResults();
}

// Render UI
function renderResults() {
    // Clear grid
    resultsGrid.innerHTML = '';
    
    if (filteredBooks.length === 0) {
        resultsGrid.classList.add('hidden');
        resultsHeader.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    resultsHeader.classList.remove('hidden');
    resultsGrid.classList.remove('hidden');
    
    resultsCount.textContent = `Menampilkan ${filteredBooks.length} buku`;
    
    // Update Download All Button
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
    downloadAllBtn.innerHTML = `${iconSvg} Download Semua (${filteredBooks.length})`;

    // Limit render to max 100 to keep DOM fast (lazy approach)
    const renderLimit = Math.min(filteredBooks.length, 100);
    
    for (let i = 0; i < renderLimit; i++) {
        const book = filteredBooks[i];
        const card = document.createElement('div');
        card.className = 'book-card';
        card.style.animationDelay = `${(i % 10) * 0.05}s`; // Stagger animation
        
        // Determine badges
        let kurikulumBadge = book.curriculum === '2023' || book.source === 'Merdeka' 
            ? '<span class="badge kurikulum-2023">Merdeka</span>' 
            : '<span class="badge kurikulum-2013">K-13</span>';
            
        let tipeBadge = book.book_type === 'buku_guru'
            ? '<span class="badge tipe-guru">Buku Guru</span>'
            : '<span class="badge tipe-siswa">Buku Siswa</span>';
            
        let kelasText = book.class ? `Kelas ${book.class}` : 'Umum';
        let levelText = book.level ? book.level : '';
        
        card.innerHTML = `
            <div class="book-badges">
                ${kurikulumBadge}
                ${tipeBadge}
            </div>
            <h4 class="book-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h4>
            <div class="book-meta">
                <p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    ${levelText} ${kelasText}
                </p>
                <p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    ${getFileName(book.attachment)}
                </p>
            </div>
            <a href="${book.attachment}" class="download-btn" onclick="handleSingleDownload(event, '${book.attachment}', '${getFileName(book.attachment)}')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF
            </a>
        `;
        
        resultsGrid.appendChild(card);
    }
}

// Utilities
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function getFileName(url) {
    if (!url) return '';
    try {
        const parts = url.split('/');
        return decodeURIComponent(parts[parts.length - 1]);
    } catch(e) {
        return 'book.pdf';
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Download All Logic
async function downloadAllPdfs() {
    if (filteredBooks.length === 0) return;
    
    // Check support for File System Access API
    let dirHandle = null;
    if ('showDirectoryPicker' in window) {
        const confirmMsg = `Anda akan mendownload ${filteredBooks.length} file PDF.\n\nKarena peramban Anda mendukung fitur canggih, Anda dapat memilih FOLDER KHUSUS untuk menyimpan semua file ini.\n\nKlik OK untuk memilih folder, atau Batal untuk batal.`;
        if (!confirm(confirmMsg)) return;
        
        try {
            dirHandle = await window.showDirectoryPicker({
                mode: 'readwrite'
            });
        } catch (e) {
            console.log("User membatalkan pemilihan folder atau izin ditolak.");
            return; // Abort if user cancels folder picker
        }
    } else {
        const confirmMsg = `Anda akan mendownload ${filteredBooks.length} file PDF secara berurutan.\nPastikan browser Anda mengizinkan "Multiple Downloads".\n\nLanjutkan?`;
        if (!confirm(confirmMsg)) return;
    }
    
    // Disable button to prevent spam click
    const originalText = downloadAllBtn.innerHTML;
    downloadAllBtn.innerHTML = "Memulai Unduhan...";
    downloadAllBtn.disabled = true;
    downloadAllBtn.style.opacity = '0.7';
    
    for (let i = 0; i < filteredBooks.length; i++) {
        const book = filteredBooks[i];
        if (!book.attachment) continue;
        
        // Update button text to show progress
        downloadAllBtn.innerHTML = `Mengunduh ${i+1}/${filteredBooks.length}...`;
        
        try {
            // Fetch as blob
            const response = await fetch(book.attachment);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const filename = getFileName(book.attachment);
            
            // IF File System Access API is supported and directory is chosen
            if (dirHandle) {
                const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
            } else {
                // Fallback for older browsers / Firefox / Safari
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            }
        } catch(e) {
            console.error("Gagal mendownload", book.attachment, e);
        }
        
        // Wait 1.5 seconds between each download to prevent browser blocking
        await new Promise(r => setTimeout(r, 1500));
    }
    
    // Restore button
    downloadAllBtn.innerHTML = originalText;
    downloadAllBtn.disabled = false;
    downloadAllBtn.style.opacity = '1';
    alert("Proses unduhan selesai!");
}

// Single Download Logic (Force Download + Save Picker)
async function handleSingleDownload(event, url, filename) {
    event.preventDefault();
    const btn = event.currentTarget;
    const originalHtml = btn.innerHTML;

    // showSaveFilePicker MUST be called directly inside the click handler (user gesture)
    // before any async operation, otherwise browser will block it
    let fileHandle = null;
    if ('showSaveFilePicker' in window) {
        try {
            fileHandle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{ description: 'PDF Document', accept: { 'application/pdf': ['.pdf'] } }]
            });
        } catch (pickerErr) {
            // User cancelled the dialog — do nothing
            return;
        }
    }

    // Now show loading indicator
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line></svg> Mengunduh...`;
    btn.style.pointerEvents = 'none';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();

        if (fileHandle) {
            // Write blob to the file chosen via Save As dialog
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
        } else {
            // Fallback for Firefox / Safari / mobile browsers
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        }
    } catch (e) {
        console.error("Download failed, falling back to new tab:", e);
        window.open(url, '_blank');
    }

    btn.innerHTML = originalHtml;
    btn.style.pointerEvents = 'auto';
}

// Boot up
document.addEventListener('DOMContentLoaded', initApp);
