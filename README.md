# studywith.aisyabella — Generator Soal Les Private Matematika

Aplikasi web generator soal Matematika untuk guru les private, dibangun dengan React, TypeScript, dan Vite.

## Deskripsi Aplikasi

**studywith.aisyabella** adalah platform yang memudahkan guru les private dalam membuat paket soal Matematika sesuai Kurikulum Merdeka Indonesia. Aplikasi menyediakan generator soal berbasis AI (Gemini) dengan fallback offline dan editor soal lengkap.

### Fitur Utama

1. **Konfigurasi Identitas** — Input nama sekolah, guru, kelas, jenjang, dan informasi asesmen
2. **Capaian Pembelajaran (CP)** — Pilih elemen CP sesuai fase kurikulum (A-F), topik materi, dan tujuan pembelajaran
3. **Komposisi Soal** — Tentukan jumlah soal per bentuk (PG, PGK, BS, Menjodohkan, Isian, Uraian) dan proporsi kesulitan
4. **Generator Soal Otomatis** — Gunakan Gemini AI atau fallback offline dengan bank soal lokal
5. **Editor Soal Lengkap** — Tambah, edit, hapus, dan renomor soal secara manual
6. **Ekspor Dokumen** — Export ke Word (.doc) atau PDF dengan pilihan komponen (kisi-kisi, naskah, kunci, pembahasan)
7. **Penyimpanan Lokal** — Save/load project sebagai file JSON

### Teknologi

- **Frontend:** React 19.3.1, TypeScript, Vite 8.3.6
- **Styling:** Tailwind CSS 3.4.19, lucide-react (icons)
- **AI Integration:** Gemini API (client-side)
- **Bundling:** Vite (optimized static build)
- **Package Manager:** npm

## Instalasi

### Prasyarat
- Node.js v18+ 
- npm v9+

### Setup Lokal

```bash
# Clone repository
git clone https://github.com/[username]/aisyabella-web.git
cd aisyabella-web

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Aplikasi akan terbuka di `http://localhost:5173`

## Menjalankan Aplikasi

### Development Mode
```bash
npm run dev
```
Server Vite dengan hot module reload di `http://localhost:5173`

### Production Build
```bash
npm run build
```
Menghasilkan production bundle di folder `dist/`

### Preview Production Build
```bash
npm run preview
```
Preview build production sebelum deploy

## Konfigurasi Gemini API

Aplikasi dapat menggunakan Gemini API untuk generate soal otomatis.

### Tanpa API Key (Offline Mode)
- Generator fallback menggunakan bank soal lokal
- Tidak memerlukan konfigurasi API
- Cocok untuk testing lokal

### Dengan API Key (Gemini Mode)
1. Dapatkan API key dari [Google AI Studio](https://aistudio.google.com/apikey)
2. Buka aplikasi, klik icon ⚙️ (Settings) di modal "Pengaturan Mesin Generator AI"
3. Input API key di field "Gemini API Key"
4. Pilih model (gemini-3-flash-preview recommended)
5. Klik "Simpan & Tutup"

**Catatan Keamanan:**
- API key tidak disimpan di localStorage
- API key tidak termasuk dalam JSON export
- API key hanya digunakan untuk request ke Gemini API
- Gunakan environment variable untuk deployment production

## Struktur Proyek

```
aisyabella-web/
├── src/
│   ├── App.tsx           (Komponen utama aplikasi, 2506 baris)
│   ├── types.ts          (TypeScript interfaces)
│   ├── main.tsx          (Entry point React)
│   ├── App.css           (Styling aplikasi)
│   └── index.css         (Tailwind imports)
├── public/               (Static assets)
├── dist/                 (Production build, excluded from git)
├── package.json          (Dependencies & scripts)
├── vite.config.ts        (Vite configuration)
├── tsconfig.json         (TypeScript root config)
├── tailwind.config.js    (Tailwind CSS config)
└── eslint.config.js      (ESLint rules)
```

## Fitur Aplikasi

### Tab 1: Identitas & Satuan Pendidikan
- Input nama sekolah, alamat, guru
- Pilih jenjang (SD, SMP, SMA), kelas, fase kurikulum
- Pilih mata pelajaran
- Tentukan jenis asesmen (Formatif, Sumatif, ASTS, ASAS)
- Alokasi waktu dan tanggal ujian

### Tab 2: Capaian Pembelajaran & Materi
- Pilih elemen CP sesuai fase & jenjang
- Input topik materi pembelajaran
- Tentukan tujuan pembelajaran (TP)
- Pilih dimensi profil lulusan

### Tab 3: Komposisi Bentuk Soal
- Tentukan jumlah soal per bentuk (PG, PGK, BS, Menjodohkan, Isian, Uraian)
- Pilih jumlah opsi PG (4 atau 5)
- Set proporsi kesulitan (Mudah/Sedang/Sulit)
- Aktifkan stimulus literasi/numerasi
- Tambahkan instruksi khusus

### Tab 4: Bank & Editor Soal
- Lihat daftar soal yang dihasilkan
- Edit soal (pertanyaan, opsi, kunci, pembahasan)
- Hapus soal (penomoran otomatis update)
- Tambah soal manual

### Tab 5: Pratinjau & Ekspor
- Toggle komponen dokumen (kisi-kisi, naskah, kunci, pembahasan)
- Export ke Word (.doc) — buka di Microsoft Word, Google Docs, LibreOffice
- Export ke PDF via print dialog browser
- Kisi-kisi soal dengan tabel detail
- Naskah soal siswa dengan format siap cetak
- Kunci jawaban & pembahasan rubrik

## Penyimpanan Data

### Autosave
- Data tersimpan di state React (memory)
- Refresh browser akan menghilangkan data

### Manual Save
- Klik "Simpan Proyek" untuk export JSON
- File JSON berisi seluruh konfigurasi & soal
- Aman dibagikan (tidak ada API key)

### Manual Load
- Klik "Muat Proyek" untuk import JSON
- Validasi struktur data otomatis
- Restore semua konfigurasi & soal

## Persyaratan Browser

- Chrome/Chromium v90+
- Firefox v88+
- Safari v14+
- Edge v90+

Modern browser dengan support ES6+, Fetch API, dan File API

## Deployment

Aplikasi dapat di-deploy ke:

### Static Hosting
- **Vercel** — Automatic deployment dari GitHub
- **Netlify** — Automatic deployment dari GitHub
- **GitHub Pages** — Static hosting gratis
- **Firebase Hosting** — Google's static hosting
- **AWS S3 + CloudFront** — Scalable CDN

### Cara Deploy

1. Build aplikasi:
```bash
npm run build
```

2. Upload folder `dist/` ke hosting platform

3. Configure root route ke `index.html` (untuk SPA routing)

Contoh untuk Vercel/Netlify: Automatic konfigurasi SPA sudah built-in

## Dokumentasi Kurikulum

Aplikasi menggunakan kurikulum berdasarkan:
- **Permendikdasmen No. 13 Tahun 2025** (Struktur kurikulum)
- **Keputusan Kepala BSKAP No. 046/H/KR/2025** (Capaian Pembelajaran)

CP tersedia untuk:
- **SD/MI:** Fase A, B, C (Kelas I-VI)
- **SMP/MTs:** Fase D (Kelas VII-IX)
- **SMA/MA:** Fase E (Kelas X), Fase F (Kelas XI-XII)
- **Mapel:** Matematika, Matematika Tingkat Lanjut (SMA XI-XII)

## Troubleshooting

### Generator tidak menghasilkan soal
- Pastikan Komposisi Soal sudah dikonfigurasi (minimal 1 soal)
- Jika menggunakan Gemini API, cek API key valid
- Fallback offline selalu tersedia tanpa API key

### Soal tidak tersimpan setelah refresh
- Data hanya tersimpan di memory selama sesi
- Gunakan "Simpan Proyek" untuk export JSON sebelum refresh

### Export Word tidak bisa dibuka
- Cek format file (.doc)
- Buka dengan Microsoft Word, Google Docs, atau LibreOffice
- Browser harus support Blob download

### PDF print tidak berfungsi
- Browser harus support print dialog
- Cek permission print di browser settings
- Gunakan "Ctrl+P" atau "Cmd+P" jika modal tidak muncul

## Lisensi

Proprietary - studywith.aisyabella

## Kontribusi & Support

Untuk pertanyaan atau saran, hubungi tim pengembang.

---

**Version:** 1.0.0  
**Last Updated:** 2026-11-21  
**Maintained By:** Kiro AI Development
