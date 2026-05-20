# D-BUKUSEKOLAH 📚

**D-BUKUSEKOLAH** adalah aplikasi web modern untuk mengunduh buku digital dari Sistem Informasi Perbukuan Indonesia (SIBI) milik Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemdikbud) tanpa hambatan.

## ✨ Fitur Utama

- 🔍 **Pencarian Instan** — Filter ribuan buku berdasarkan Kurikulum, Jenjang, Kelas, dan Tipe Buku secara real-time
- 📥 **Download PDF Langsung** — Unduh buku satu per satu dengan dialog "Save As" sehingga Anda bisa memilih folder tujuan
- 📦 **Download Semua Sekaligus** — Pilih satu folder, semua PDF yang tersaring terunduh otomatis ke dalamnya
- 🌙 **Desain Premium Dark Mode** — Antarmuka glassmorphism modern yang responsif di semua perangkat (PC, tablet, HP)
- ⚡ **Super Cepat** — Data di-cache di memori browser, pencarian terjadi dalam kurang dari 0.1 detik

## 🛠️ Teknologi

- **HTML5, Vanilla CSS, Vanilla JavaScript** — Tanpa framework, tanpa dependensi
- **SIBI Public REST API** — Data buku langsung dari server Kemdikbud
- **File System Access API** — Fitur "Save As" dan "Pilih Folder" tingkat desktop (Chrome/Edge)

## 🚀 Cara Menggunakan

### Buka Langsung (Tanpa Install)
Kunjungi: **https://masisparmo.github.io/dbukusekolah**

### Jalankan Lokal
1. Clone repo ini
2. Jalankan server lokal sederhana:
   ```bash
   python -m http.server 8080
   ```
3. Buka browser ke `http://localhost:8080`

## 📂 Struktur File

```
├── index.html   # Struktur dan layout aplikasi
├── style.css    # Desain visual dan animasi (Glassmorphism)
└── app.js       # Logika pencarian, filter, dan download API
```

## 📌 Catatan

- Fitur **"Save As"** dan **"Pilih Folder"** memerlukan browser berbasis Chromium (Google Chrome / Microsoft Edge)
- Di Firefox, Safari, atau browser mobile, unduhan tetap berjalan normal ke folder Downloads

---

> Data bersumber dari [SIBI Kemdikbud](https://buku.kemdikbud.go.id)
