import React, { useState, useEffect, useRef } from 'react';
import {
  Edit3, Settings, FilePlus, FolderOpen, CheckCircle2, AlertCircle,
  Loader2, Sparkles, Download, FileText, Printer, Save, RefreshCw,
  ChevronLeft, ChevronRight, X, Check, BookOpen, Layers, Award,
  Plus, Trash2, HelpCircle, Eye, Sliders
} from 'lucide-react';

/* =====================================================================
   GENERATOR SOAL LES PRIVATE MATEMATIKA (studywith.aisyabella)
   Formatif, Sumatif, ASTS, ASAS (SD/SMP/SMA)
   Pengembang: Bilqis Gaya Hasanah
   ===================================================================== */

/* ===== DATA KURIKULUM =====
   Sumber daftar mapel : Permendikdasmen No. 13 Tahun 2025 (Lampiran II, Struktur Kurikulum)
   Sumber CP           : Kep. Kepala BSKAP No. 046/H/KR/2025 */
const SRC046 = "Keputusan Kepala BSKAP No. 046/H/KR/2025";

const JENJANG = {
  SD: { nama: "SD/MI", jp: 35, kelas: ["I", "II", "III", "IV", "V", "VI"] },
  SMP: { nama: "SMP/MTs", jp: 40, kelas: ["VII", "VIII", "IX"] },
  SMA: { nama: "SMA/MA", jp: 45, kelas: ["X", "XI", "XII"] }
};

const FASE = {
  I: "A", II: "A", III: "B", IV: "B", V: "C", VI: "C",
  VII: "D", VIII: "D", IX: "D", X: "E", XI: "F", XII: "F"
};

function daftarMapel(jenjang, kelas) {
  if (jenjang === "SMA" && ["XI", "XII"].includes(kelas)) {
    return ["Matematika", "Matematika Tingkat Lanjut"];
  }
  return ["Matematika"];
}

const DIMENSI = [
  "Keimanan dan ketakwaan terhadap Tuhan YME",
  "Kewargaan",
  "Penalaran kritis",
  "Kreativitas",
  "Kolaborasi",
  "Kemandirian",
  "Kesehatan",
  "Komunikasi"
];

/* CP[mapel] = { sumber, fase:{ A:[{e:elemen, t:teks}], ... } } */
const CP = {
  "Matematika": {
    sumber: SRC046,
    fase: {
      A: [
        { e: "Fondasi Bilangan & Operasi Dasar (Fase A / Usia 6–8 Tahun)", t: "Menunjukkan pemahaman dan memiliki intuisi bilangan (number sense) pada bilangan cacah sampai 100; membaca, menulis, menentukan nilai tempat, membandingkan, mengurutkan, melakukan komposisi dan dekomposisi bilangan; operasi penjumlahan dan pengurangan sampai 20; serta mengenal pecahan setengah dan seperempat." },
        { e: "Geometri Sederhana & Pengukuran", t: "Mengenal berbagai bangun datar (segitiga, segiempat, lingkaran) dan bangun ruang (balok, kubus, kerucut, bola); menyusun dan mengurai bangun datar; membandingkan panjang, berat, dan durasi waktu menggunakan satuan tidak baku." },
        { e: "Pola & Penyajian Data Sederhana", t: "Memahami makna simbol '=' pada penjumlahan dan pengurangan sampai 20; melanjutkan pola gambar/warna; serta mengelompokkan dan menyajikan data menggunakan turus dan piktogram." }
      ],
      B: [
        { e: "Fondasi Bilangan & Operasi Dasar (Fase B / Usia 8–10 Tahun)", t: "Memahami bilangan cacah sampai 10.000; operasi penjumlahan dan pengurangan sampai 1.000; perkalian dan pembagian bilangan cacah sampai 100; kelipatan dan faktor; membandingkan dan mengurutkan pecahan, pecahan senilai, desimal, dan persen." },
        { e: "Geometri Sederhana & Pengukuran", t: "Mendeskripsikan ciri berbagai bentuk bangun datar; menyusun dan mengurai bangun datar; mengukur panjang dan berat dengan satuan baku (cm, m, g, kg); serta mengukur dan mengestimasi luas dan volume." },
        { e: "Aljabar Awal & Analisis Data", t: "Menemukan nilai yang tidak diketahui dalam kalimat matematika penjumlahan/pengurangan sampai 100; mengembangkan pola bilangan; serta menyajikan dan menginterpretasi data dalam tabel, piktogram, dan diagram batang." }
      ],
      C: [
        { e: "Fondasi Bilangan & Operasi Dasar (Fase C / Usia 10–11 Tahun)", t: "Memahami bilangan cacah sampai 1.000.000; operasi hitung sampai 100.000; menyelesaikan masalah KPK dan FPB; operasi hitung pecahan dan pecahan campuran; serta membandingkan dan mengurutkan bilangan desimal." },
        { e: "Geometri Sederhana & Pengukuran", t: "Menentukan keliling dan luas bangun datar serta gabungannya; mengukur besar sudut; mengkonstruksi dan mengurai bangun ruang (kubus, balok, dan gabungannya); serta menentukan lokasi pada peta berpetak." },
        { e: "Proporsi & Analisis Data", t: "Menemukan nilai yang belum diketahui pada operasi hitung sampai 1.000; bernalar secara proporsional menggunakan rasio satuan; serta menganalisis data dalam diagram batang dan tabel frekuensi." }
      ],
      D: [
        { e: "Bilangan & Aljabar Dasar (Fase D / SMP Kelas 7–9)", t: "Operasi bilangan bulat, rasional, irasional, berpangkat bulat, bentuk akar, dan aritmetika sosial; mengenali dan menggeneralisasi pola; menyatakan situasi dalam bentuk aljabar; menyelesaikan persamaan dan pertidaksamaan linear satu variabel serta sistem persamaan linear dua variabel (SPLDV)." },
        { e: "Relasi dan Fungsi", t: "Memahami konsep relasi dan fungsi (domain, kodomain, range), menyajikan relasi dan fungsi dalam bentuk diagram panah, tabel, himpunan pasangan berurutan, dan grafik, serta menganalisis fungsi linear." },
        { e: "Geometri & Pengukuran", t: "Menentukan luas lingkaran, luas permukaan dan volume bangun ruang (prisma, tabung, bola, limas, kerucut); hubungan antarsudut; kesebangunan dan kekongruenan; teorema Pythagoras; serta transformasi geometri." },
        { e: "Statistika & Peluang", t: "Merumuskan pertanyaan, mengumpulkan, menyajikan, dan menganalisis data (diagram batang, diagram lingkaran, mean, median, modus, jangkauan); serta menentukan peluang dan frekuensi relatif suatu kejadian." }
      ],
      E: [
        { e: "Eksponen dan Logaritma (Fase E / SMA Kelas 10)", t: "Menggeneralisasi sifat-sifat bilangan berpangkat (eksponen, termasuk pangkat pecahan) dan logaritma, serta menerapkannya dalam pemodelan pertumbuhan, peluruhan, dan masalah kontekstual." },
        { e: "Barisan dan Deret", t: "Menerapkan konsep barisan dan deret aritmetika serta barisan dan deret geometri dalam menyelesaikan masalah kontekstual, termasuk bunga tunggal dan bunga majemuk." },
        { e: "Sistem Persamaan Linear & Fungsi Kuadrat", t: "Menyelesaikan masalah yang berkaitan dengan sistem persamaan linear tiga variabel (SPLTV) dan sistem pertidaksamaan linear dua variabel; serta menganalisis dan menyelesaikan masalah persamaan dan fungsi kuadrat." },
        { e: "Perbandingan Trigonometri", t: "Menyelesaikan permasalahan segitiga siku-siku yang melibatkan perbandingan trigonometri (sinus, kosinus, tangen, kosekan, sekan, kotangen) dan aplikasinya." },
        { e: "Statistika & Peluang", t: "Merepresentasikan dan menginterpretasi data menggunakan ukuran pemusatan, jangkauan kuartil dan interkuartil, histogram, serta box plot; dan menentukan peluang kejadian saling lepas maupun tidak saling lepas." }
      ],
      F: [
        { e: "Bilangan & Pemodelan Keuangan (Fase F / SMA Kelas 11–12)", t: "Memodelkan pinjaman dan investasi dengan bunga majemuk dan anuitas, serta menyelidiki pengaruh suku bunga dan periode pembayaran secara numerik maupun grafis." },
        { e: "Aljabar, Matriks & Komposisi Fungsi", t: "Menyatakan data dalam bentuk matriks dan operasinya; menentukan fungsi invers, komposisi fungsi, dan transformasi fungsi untuk memodelkan situasi dunia nyata." },
        { e: "Geometri Lingkaran", t: "Menerapkan teorema tentang lingkaran, serta menentukan panjang busur dan luas juring lingkaran untuk menyelesaikan berbagai masalah kontekstual." },
        { e: "Statistika Bivariat & Peluang", t: "Melakukan penyelidikan statistika untuk data bivariat menggunakan diagram pencar (scatter plot) dan regresi linear; serta memahami variabel acak diskrit dan distribusi binomial." }
      ]
    }
  },
  "Matematika Tingkat Lanjut": {
    sumber: SRC046,
    fase: {
      F: [
        { e: "Aljabar Lanjut, Polinomial & Matriks (Fase F Tingkat Lanjut / Kelas 11–12)", t: "Melakukan operasi aljabar pada polinomial (suku banyak), menerapkan teorema sisa dan teorema faktor; memahami bilangan kompleks dan operasinya; serta menyelesaikan sistem persamaan linear menggunakan determinan dan invers matriks." },
        { e: "Geometri Analitik & Vektor", t: "Menyatakan vektor pada bidang dan ruang serta operasinya; menganalisis persamaan lingkaran, irisan kerucut (parabola, elips, hiperbola), dan transformasi geometri menggunakan matriks." },
        { e: "Fungsi Lanjut & Trigonometri Analitik", t: "Menganalisis grafik dan sifat fungsi trigonometri, fungsi logaritma, fungsi rasional, serta menerapkan identitas trigonometri dalam pembuktian dan penyelesaian persamaan." },
        { e: "Kalkulus (Limit, Turunan, dan Integral)", t: "Memahami konsep limit fungsi aljabar dan trigonometri; menentukan turunan fungsi serta aplikasinya (gradien garis singgung, fungsi naik/turun, nilai optimum, laju perubahan); serta memahami integral tak tentu dan integral tentu sebagai luas daerah." }
      ]
    }
  }
};

/* Helper untuk mendapatkan CP mapel */
function getCPMapel(mapel, fase) {
  const entry = CP[mapel];
  if (entry && entry.fase && entry.fase[fase]) {
    return { sumber: entry.sumber, elemen: entry.fase[fase] };
  }
  return {
    sumber: SRC046,
    elemen: CP["Matematika"].fase[fase] || CP["Matematika"].fase.C
  };
}

const JENIS_ASESMEN = [
  { id: "Formatif", label: "Asesmen Formatif (Harian / Lingkup Materi)", kode: "AF" },
  { id: "Sumatif", label: "Asesmen Sumatif Akhir Lingkup Materi", kode: "ASLM" },
  { id: "ASTS", label: "Asesmen Sumatif Tengah Semester (ASTS)", kode: "ASTS" },
  { id: "ASAS", label: "Asesmen Sumatif Akhir Semester (ASAS)", kode: "ASAS" }
];

const BENTUK_SOAL_LIST = [
  { id: "PG", label: "Pilihan Ganda (PG)", defaultJml: 10 },
  { id: "PGK", label: "Pilihan Ganda Kompleks (PGK)", defaultJml: 3 },
  { id: "BS", label: "Benar - Salah", defaultJml: 0 },
  { id: "Menjodohkan", label: "Menjodohkan", defaultJml: 0 },
  { id: "Isian", label: "Isian Singkat", defaultJml: 5 },
  { id: "Uraian", label: "Uraian / Esai", defaultJml: 2 }
];

const TAKSONOMI_BLOOM = ["C1 (Mengingat)", "C2 (Memahami)", "C3 (Menerapkan)", "C4 (Menganalisis)", "C5 (Mengevaluasi)", "C6 (Mencipta)"];

/* ===== GENERATOR SOAL MATEMATIKA LOKAL SESUAI TOPIK & FASE ===== */
function buildMathQuestionBank(materi, fase, kelas, opsiPG) {
  const m = materi.toLowerCase();
  const is5 = opsiPG === 5;

  // Bank soal tematik Matematika sesuai topik yang diketik pengguna
  const bank = [];

  if (m.includes("pecahan") || m.includes("desimal") || m.includes("persen")) {
    bank.push(
      {
        bentuk: "PG",
        elemen: "Bilangan & Operasi Pecahan",
        kognitif: "C3 (Menerapkan)",
        kesulitan: "Sedang",
        stimulus: "Ibu membeli 2 1/2 kg tepung terigu. Sebanyak 3/4 kg digunakan untuk membuat kue bolu, dan 1/2 kg diberikan kepada bibi.",
        pertanyaan: "Berapa kg sisa tepung terigu yang dimiliki Ibu sekarang?",
        opsi: is5
          ? { A: "1 1/4 kg", B: "1 1/2 kg", C: "1 3/4 kg", D: "2 1/4 kg", E: "3/4 kg" }
          : { A: "1 1/4 kg", B: "1 1/2 kg", C: "1 3/4 kg", D: "2 1/4 kg" },
        kunci: "A",
        pembahasan: "Sisa tepung = 2 1/2 - 3/4 - 1/2 = 5/2 - 3/4 - 2/4 = (10 - 3 - 2)/4 = 5/4 = 1 1/4 kg."
      },
      {
        bentuk: "PG",
        elemen: "Bilangan & Operasi Pecahan",
        kognitif: "C2 (Memahami)",
        kesulitan: "Mudah",
        stimulus: "",
        pertanyaan: "Urutan pecahan berikut dari yang terkecil hingga terbesar adalah 3/4 ; 0,65 ; 70% ; 4/5. Manakah urutan yang benar?",
        opsi: is5
          ? {
              A: "0,65 ; 70% ; 3/4 ; 4/5",
              B: "3/4 ; 0,65 ; 70% ; 4/5",
              C: "0,65 ; 3/4 ; 70% ; 4/5",
              D: "4/5 ; 3/4 ; 70% ; 0,65",
              E: "70% ; 0,65 ; 3/4 ; 4/5"
            }
          : {
              A: "0,65 ; 70% ; 3/4 ; 4/5",
              B: "3/4 ; 0,65 ; 70% ; 4/5",
              C: "0,65 ; 3/4 ; 70% ; 4/5",
              D: "4/5 ; 3/4 ; 70% ; 0,65"
            },
        kunci: "A",
        pembahasan: "Ubah ke desimal: 3/4 = 0,75; 0,65 = 0,65; 70% = 0,70; 4/5 = 0,80. Urutan dari terkecil: 0,65 ; 70% ; 3/4 ; 4/5."
      }
    );
  }

  if (m.includes("kpk") || m.includes("fpb") || m.includes("cacah") || m.includes("kelipatan")) {
    bank.push(
      {
        bentuk: "PG",
        elemen: "Fondasi Bilangan & Operasi Dasar",
        kognitif: "C3 (Menerapkan)",
        kesulitan: "Sedang",
        stimulus: "Aisyah les matematika setiap 4 hari sekali, sedangkan Bella les matematika di tempat yang sama setiap 6 hari sekali. Pada tanggal 3 Maret mereka les bersama-sama.",
        pertanyaan: "Pada tanggal berapa mereka akan les matematika bersama-sama lagi untuk kedua kalinya?",
        opsi: is5
          ? { A: "15 Maret", B: "12 Maret", C: "24 Maret", D: "27 Maret", E: "18 Maret" }
          : { A: "15 Maret", B: "12 Maret", C: "24 Maret", D: "27 Maret" },
        kunci: "A",
        pembahasan: "KPK dari 4 dan 6 adalah 12. Mereka bertemu lagi 12 hari setelah 3 Maret, yaitu 3 + 12 = 15 Maret."
      },
      {
        bentuk: "Isian",
        elemen: "Fondasi Bilangan & Operasi Dasar",
        kognitif: "C3 (Menerapkan)",
        kesulitan: "Sedang",
        stimulus: "",
        pertanyaan: "Faktor Persekutuan Terbesar (FPB) dari 36 dan 48 adalah ....",
        opsi: {},
        kunci: "12",
        pembahasan: "Faktorisasi prima 36 = 2² × 3² dan 48 = 2⁴ × 3. FPB = 2² × 3 = 12."
      }
    );
  }

  if (m.includes("aljabar") || m.includes("persamaan") || m.includes("spldv") || m.includes("fungsi")) {
    bank.push(
      {
        bentuk: "PG",
        elemen: "Aljabar & Sistem Persamaan",
        kognitif: "C3 (Menerapkan)",
        kesulitan: "Sedang",
        stimulus: "Diketahui sistem persamaan linear dua variabel: 2x + y = 13 dan x - y = 2.",
        pertanyaan: "Nilai dari 3x + 2y adalah ....",
        opsi: is5
          ? { A: "21", B: "19", C: "18", D: "23", E: "15" }
          : { A: "21", B: "19", C: "18", D: "23" },
        kunci: "A",
        pembahasan: "Eliminasi y: (2x + y) + (x - y) = 13 + 2 → 3x = 15 → x = 5. Substitusi ke x - y = 2 → y = 3. Maka 3(5) + 2(3) = 15 + 6 = 21."
      },
      {
        bentuk: "Uraian",
        elemen: "Relasi dan Fungsi",
        kognitif: "C4 (Menganalisis)",
        kesulitan: "Sulit (HOTS)",
        stimulus: "Suatu fungsi linear dirumuskan dengan f(x) = ax + b. Diketahui f(2) = 7 dan f(5) = 16.",
        pertanyaan: "Tentukan nilai a dan b, kemudian hitunglah nilai dari f(-3)!",
        opsi: {},
        kunci: "a = 3, b = 1, dan f(-3) = -8",
        pembahasan: "f(5) - f(2) = 16 - 7 → 3a = 9 → a = 3. Substitusi: 3(2) + b = 7 → b = 1. Rumus f(x) = 3x + 1, sehingga f(-3) = 3(-3) + 1 = -8."
      }
    );
  }

  if (m.includes("eksponen") || m.includes("logaritma") || m.includes("barisan") || m.includes("deret") || m.includes("trigonometri") || m.includes("kuadrat")) {
    bank.push(
      {
        bentuk: "PG",
        elemen: "Eksponen dan Logaritma",
        kognitif: "C3 (Menerapkan)",
        kesulitan: "Sedang",
        stimulus: "",
        pertanyaan: "Nilai dari ²log 16 + ³log 27 - ⁵log 25 adalah ....",
        opsi: is5
          ? { A: "5", B: "4", C: "6", D: "7", E: "3" }
          : { A: "5", B: "4", C: "6", D: "7" },
        kunci: "A",
        pembahasan: "²log 16 = 4, ³log 27 = 3, dan ⁵log 25 = 2. Jadi 4 + 3 - 2 = 5."
      },
      {
        bentuk: "PG",
        elemen: "Barisan dan Deret",
        kognitif: "C3 (Menerapkan)",
        kesulitan: "Sedang",
        stimulus: "Suatu barisan aritmetika memiliki suku ke-3 sama dengan 11 dan suku ke-7 sama dengan 23.",
        pertanyaan: "Jumlah 10 suku pertama (S₁₀) dari barisan tersebut adalah ....",
        opsi: is5
          ? { A: "185", B: "175", C: "190", D: "165", E: "200" }
          : { A: "185", B: "175", C: "190", D: "165" },
        kunci: "A",
        pembahasan: "U₇ - U₃ = 4b = 23 - 11 = 12 → b = 3. U₁ = 11 - 2(3) = 5. S₁₀ = 10/2 × (2(5) + 9(3)) = 5 × (10 + 27) = 185."
      }
    );
  }

  if (m.includes("kalkulus") || m.includes("limit") || m.includes("turunan") || m.includes("integral") || m.includes("matriks") || m.includes("polinomial")) {
    bank.push(
      {
        bentuk: "PG",
        elemen: "Kalkulus (Limit, Turunan, dan Integral)",
        kognitif: "C3 (Menerapkan)",
        kesulitan: "Sedang",
        stimulus: "Diketahui fungsi kurva f(x) = x³ - 3x² - 9x + 5.",
        pertanyaan: "Interval x agar fungsi f(x) turun adalah ....",
        opsi: is5
          ? { A: "-1 < x < 3", B: "x < -1 atau x > 3", C: "-3 < x < 1", D: "x < -3 atau x > 1", E: "0 < x < 3" }
          : { A: "-1 < x < 3", B: "x < -1 atau x > 3", C: "-3 < x < 1", D: "x < -3 atau x > 1" },
        kunci: "A",
        pembahasan: "Syarat fungsi turun: f'(x) < 0 → 3x² - 6x - 9 < 0 → x² - 2x - 3 < 0 → (x - 3)(x + 1) < 0 → -1 < x < 3."
      },
      {
        bentuk: "Isian",
        elemen: "Kalkulus (Limit, Turunan, dan Integral)",
        kognitif: "C3 (Menerapkan)",
        kesulitan: "Sedang",
        stimulus: "",
        pertanyaan: "Hasil dari ∫ (6x² - 4x + 3) dx adalah ....",
        opsi: {},
        kunci: "2x³ - 2x² + 3x + C",
        pembahasan: "∫ (6x² - 4x + 3) dx = (6/3)x³ - (4/2)x² + 3x + C = 2x³ - 2x² + 3x + C."
      }
    );
  }

  return bank;
}

function generateOfflineFallback(config, cpData) {
  const {
    mapel, jenjang, kelas, fase, jenisAsesmen, topikMateri,
    tujuanPembelajaran, proporsiKesulitan, bentukSoal, opsiPG
  } = config as any;

  const listSoal: any[] = [];
  let nomor = 1;

  const levels: {level: string, kognitif: string}[] = [];
  const totalRequested = Object.values(bentukSoal).reduce((a: number, b) => a + Number(b || 0), 0) || 10;
  const prop = proporsiKesulitan as any;
  const mudahPct = Number(prop.mudah || 0);
  const sedangPct = Number(prop.sedang || 0);
  // @ts-ignore - type assertion for math operations
  const nMudah: number = Math.round((mudahPct / 100) * totalRequested);
  // @ts-ignore - type assertion for math operations
  const nSedang: number = Math.round((sedangPct / 100) * totalRequested);
  const totalReq: number = Number(totalRequested);
  for (let i = 0; i < totalReq; i++) {
    if (i < nMudah) levels.push({ level: "Mudah", kognitif: "C2 (Memahami)" });
    else if (i < nMudah + nSedang) levels.push({ level: "Sedang", kognitif: "C3 (Menerapkan)" });
    else levels.push({ level: "Sulit (HOTS)", kognitif: "C4 (Menganalisis)" });
  }

  const getLevel = (idx) => levels[idx % levels.length] || { level: "Sedang", kognitif: "C3 (Menerapkan)" };
  const elemenList = cpData.elemen || [{ e: "Pemahaman Konsep Matematika", t: "" }];
  const materiUtama = topikMateri.trim() || `Materi Pokok ${mapel} Kelas ${kelas}`;
  const tpUtama = tujuanPembelajaran.trim() || `Siswa mampu menyelesaikan permasalahan matematis terkait ${materiUtama}.`;
  const optionLabels = opsiPG === 5 ? ["A", "B", "C", "D", "E"] : ["A", "B", "C", "D"];

  const thematicBank = buildMathQuestionBank(materiUtama, fase, kelas, opsiPG);
  const pgBank = thematicBank.filter((b) => b.bentuk === "PG");
  const isianBank = thematicBank.filter((b) => b.bentuk === "Isian");
  const uraianBank = thematicBank.filter((b) => b.bentuk === "Uraian");

  // 1. Pilihan Ganda
  const jmlPG = Number(bentukSoal.PG || 0);
  for (let i = 0; i < jmlPG; i++) {
    const el = elemenList[i % elemenList.length];
    const lv = getLevel(nomor - 1);

    if (pgBank[i]) {
      const preset = pgBank[i];
      listSoal.push({
        id: `soal-${Date.now()}-${nomor}`,
        nomor: nomor++,
        bentuk: "PG",
        elemenCP: preset.elemen || el.e,
        tujuanPembelajaran: tpUtama,
        indikatorSoal: `Disajikan permasalahan kontekstual mengenai ${materiUtama}, siswa dapat menentukan penyelesaian yang tepat.`,
        levelKognitif: preset.kognitif,
        tingkatKesulitan: preset.kesulitan,
        stimulus: preset.stimulus,
        pertanyaan: preset.pertanyaan,
        opsi: preset.opsi,
        kunciJawaban: preset.kunci,
        pembahasan: preset.pembahasan,
        skorMaksimal: 1
      });
    } else {
      const a = (i + 2) * 3;
      const b = (i + 4) * 2;
      const hasil = a * 2 + b;
      const opsiObj = {};
      const vals = [hasil, hasil + 4, hasil - 3, hasil + 8, hasil - 6];
      optionLabels.forEach((lbl, idx) => {
        opsiObj[lbl] = `${vals[idx]}`;
      });

      listSoal.push({
        id: `soal-${Date.now()}-${nomor}`,
        nomor: nomor++,
        bentuk: "PG",
        elemenCP: el.e,
        tujuanPembelajaran: tpUtama,
        indikatorSoal: `Disajikan soal aplikasi konsep ${materiUtama}, siswa dapat menghitung hasil operasi matematis dengan tepat.`,
        levelKognitif: lv.kognitif,
        tingkatKesulitan: lv.level,
        stimulus: `Dalam latihan materi ${materiUtama} (Kelas ${kelas}), diketahui dua besaran masing-masing bernilai p = ${a} dan q = ${b}.`,
        pertanyaan: `Jika aturan operasi pada masalah ${materiUtama} tersebut dirumuskan sebagai 2p + q, berapakah nilai akhirnya?`,
        opsi: opsiObj,
        kunciJawaban: "A",
        pembahasan: `Substitusikan nilai p = ${a} dan q = ${b} ke rumus 2p + q = 2(${a}) + ${b} = ${a * 2} + ${b} = ${hasil}.`,
        skorMaksimal: 1
      });
    }
  }

  // 2. Pilihan Ganda Kompleks
  const jmlPGK = Number(bentukSoal.PGK || 0);
  for (let i = 0; i < jmlPGK; i++) {
    const el = elemenList[i % elemenList.length];
    const lv = getLevel(nomor - 1);
    const n1 = (i + 2) * 6;
    const n2 = (i + 3) * 6;
    listSoal.push({
      id: `soal-${Date.now()}-${nomor}`,
      nomor: nomor++,
      bentuk: "PGK",
      elemenCP: el.e,
      tujuanPembelajaran: tpUtama,
      indikatorSoal: `Disajikan beberapa pernyataan matematis terkait ${materiUtama}, siswa dapat memilih lebih dari satu pernyataan yang bernilai benar.`,
      levelKognitif: "C4 (Menganalisis)",
      tingkatKesulitan: lv.level,
      stimulus: `Perhatikan sifat-sifat bilangan dan operasi pada kajian ${materiUtama} untuk nilai A = ${n1} dan B = ${n2}.`,
      pertanyaan: `Pilihlah DUA pernyataan matematis yang BENAR terkait kedua nilai tersebut:`,
      opsi: {
        A: `Selisih antara B dan A adalah ${n2 - n1}.`,
        B: `Jumlah A + B menghasilkan bilangan ganjil.`,
        C: `Kedua bilangan A dan B habis dibagi oleh 6.`,
        D: `Nilai A lebih besar daripada nilai B.`
      },
      kunciJawaban: "A dan C",
      pembahasan: `Selisih ${n2} - ${n1} = ${n2 - n1} (A benar), dan ${n1} serta ${n2} keduanya kelipatan 6 (C benar).`,
      skorMaksimal: 2
    });
  }

  // 3. Benar - Salah
  const jmlBS = Number(bentukSoal.BS || 0);
  for (let i = 0; i < jmlBS; i++) {
    const el = elemenList[i % elemenList.length];
    const lv = getLevel(nomor - 1);
    listSoal.push({
      id: `soal-${Date.now()}-${nomor}`,
      nomor: nomor++,
      bentuk: "BS",
      elemenCP: el.e,
      tujuanPembelajaran: tpUtama,
      indikatorSoal: `Siswa dapat menentukan nilai kebenaran pernyataan matematis pada topik ${materiUtama}.`,
      levelKognitif: lv.kognitif,
      tingkatKesulitan: lv.level,
      stimulus: "",
      pertanyaan: `Tentukan apakah pernyataan matematis berikut BENAR atau SALAH:\n"Pada konsep ${materiUtama}, urutan langkah pengerjaan operasi hitung memengaruhi ketepatan hasil akhir yang diperoleh."`,
      opsi: { B: "Benar", S: "Salah" },
      kunciJawaban: "Benar",
      pembahasan: `Pernyataan tersebut BENAR karena dalam matematika setiap operasi dan sifat pada ${materiUtama} memiliki aturan pengerjaan yang baku.`,
      skorMaksimal: 1
    });
  }

  // 4. Menjodohkan
  const jmlMJ = Number(bentukSoal.Menjodohkan || 0);
  for (let i = 0; i < jmlMJ; i++) {
    const el = elemenList[i % elemenList.length];
    listSoal.push({
      id: `soal-${Date.now()}-${nomor}`,
      nomor: nomor++,
      bentuk: "Menjodohkan",
      elemenCP: el.e,
      tujuanPembelajaran: tpUtama,
      indikatorSoal: `Siswa dapat menjodohkan bentuk operasi ${materiUtama} dengan hasil perhitungannya yang tepat.`,
      levelKognitif: "C2 (Memahami)",
      tingkatKesulitan: "Sedang",
      stimulus: `Pasangkan bentuk perhitungan di lajur kiri dengan hasil yang tepat di lajur kanan pada topik ${materiUtama}!`,
      pertanyaan: `1. Hasil dari (15 × 4) + 12  --->  [ ... ]\n2. Hasil dari (120 ÷ 3) - 15  --->  [ ... ]\n\nPilihan Jawaban:\nA. 25\nB. 72`,
      opsi: {},
      kunciJawaban: "1 - B, 2 - A",
      pembahasan: `(15 × 4) + 12 = 60 + 12 = 72 (B), sedangkan (120 ÷ 3) - 15 = 40 - 15 = 25 (A).`,
      skorMaksimal: 2
    });
  }

  // 5. Isian Singkat
  const jmlIsian = Number(bentukSoal.Isian || 0);
  for (let i = 0; i < jmlIsian; i++) {
    const el = elemenList[i % elemenList.length];
    const lv = getLevel(nomor - 1);
    if (isianBank[i]) {
      const preset = isianBank[i];
      listSoal.push({
        id: `soal-${Date.now()}-${nomor}`,
        nomor: nomor++,
        bentuk: "Isian",
        elemenCP: preset.elemen || el.e,
        tujuanPembelajaran: tpUtama,
        indikatorSoal: `Siswa dapat menentukan nilai akhir dari persoalan ${materiUtama}.`,
        levelKognitif: preset.kognitif,
        tingkatKesulitan: preset.kesulitan,
        stimulus: preset.stimulus,
        pertanyaan: preset.pertanyaan,
        opsi: {},
        kunciJawaban: preset.kunci,
        pembahasan: preset.pembahasan,
        skorMaksimal: 2
      });
    } else {
      const xVal = (i + 3) * 5;
      listSoal.push({
        id: `soal-${Date.now()}-${nomor}`,
        nomor: nomor++,
        bentuk: "Isian",
        elemenCP: el.e,
        tujuanPembelajaran: tpUtama,
        indikatorSoal: `Siswa dapat menentukan nilai variabel yang memenuhi persamaan pada ${materiUtama}.`,
        levelKognitif: "C3 (Menerapkan)",
        tingkatKesulitan: lv.level,
        stimulus: "",
        pertanyaan: `Jika 3n + 10 = ${3 * xVal + 10}, maka nilai n yang memenuhi persamaan tersebut adalah ....`,
        opsi: {},
        kunciJawaban: `${xVal}`,
        pembahasan: `3n = ${3 * xVal + 10} - 10 = ${3 * xVal} → n = ${3 * xVal} ÷ 3 = ${xVal}.`,
        skorMaksimal: 2
      });
    }
  }

  // 6. Uraian
  const jmlUraian = Number(bentukSoal.Uraian || 0);
  for (let i = 0; i < jmlUraian; i++) {
    const el = elemenList[i % elemenList.length];
    if (uraianBank[i]) {
      const preset = uraianBank[i];
      listSoal.push({
        id: `soal-${Date.now()}-${nomor}`,
        nomor: nomor++,
        bentuk: "Uraian",
        elemenCP: preset.elemen || el.e,
        tujuanPembelajaran: tpUtama,
        indikatorSoal: `Disajikan soal pemecahan masalah ${materiUtama}, siswa dapat menuliskan langkah penyelesaian secara sistematis.`,
        levelKognitif: preset.kognitif,
        tingkatKesulitan: preset.kesulitan,
        stimulus: preset.stimulus,
        pertanyaan: preset.pertanyaan,
        opsi: {},
        kunciJawaban: preset.kunci,
        pembahasan: preset.pembahasan,
        skorMaksimal: 5
      });
    } else {
      listSoal.push({
        id: `soal-${Date.now()}-${nomor}`,
        nomor: nomor++,
        bentuk: "Uraian",
        elemenCP: el.e,
        tujuanPembelajaran: tpUtama,
        indikatorSoal: `Disajikan masalah kontekstual tentang ${materiUtama}, siswa dapat memodelkan dan menghitung penyelesaiannya.`,
        levelKognitif: "C4 (Menganalisis)",
        tingkatKesulitan: "Sulit (HOTS)",
        stimulus: `Sebuah ruang belajar les private memiliki panjang 6 meter dan lebar 4 meter. Lantai ruangan tersebut akan dipasangi ubin persegi berukuran 50 cm × 50 cm.`,
        pertanyaan: `Hitunglah:\na. Luas lantai ruang belajar dalam satuan cm²!\nb. Banyaknya ubin minimal yang dibutuhkan untuk menutup seluruh lantai ruangan tersebut!`,
        opsi: {},
        kunciJawaban: `a. Luas lantai = 600 cm × 400 cm = 240.000 cm².\nb. Luas 1 ubin = 50 × 50 = 2.500 cm². Banyak ubin = 240.000 ÷ 2.500 = 96 buah ubin.`,
        pembahasan: `Pedoman Penskoran:\n- Konversi satuan m ke cm tepat (Skor 1)\n- Luas lantai = 240.000 cm² (Skor 2)\n- Pembagian luas lantai dengan luas ubin = 96 buah (Skor 2).`,
        skorMaksimal: 5
      });
    }
  }

  return listSoal;
}

/* ===== KOMPONEN UTAMA APLIKASI ===== */
export default function App() {
  // Navigasi Tab Utama
  const [activeTab, setActiveTab] = useState("identitas"); // identitas | cp | konfigurasi | hasil | cetak
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State Identitas & Kurikulum
  const [identitas, setIdentitas] = useState({
    namaSekolah: "Les Private studywith.aisyabella",
    alamatSekolah: "Bimbingan Belajar & Les Private Matematika",
    tahunAjaran: "2026/2027",
    semester: "Ganjil",
    jenjang: "SD",
    kelas: "V",
    mapel: "Matematika",
    jenisAsesmen: "Formatif",
    alokasiWaktu: "70 Menit",
    tanggalUjian: new Date().toISOString().split("T")[0],
    namaGuru: "Aisyabella, S.Pd."
  });

  const faseAktif = FASE[identitas.kelas] || "C";
  const availableMapel = daftarMapel(identitas.jenjang, identitas.kelas);
  const cpData = getCPMapel(identitas.mapel, faseAktif);

  // State CP & Materi
  const [selectedElemen, setSelectedElemen] = useState([]);
  const [topikMateri, setTopikMateri] = useState("Operasi Hitung Pecahan dan Desimal");
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState(
    "Peserta didik mampu menyelesaikan masalah kontekstual yang berkaitan dengan operasi hitung pecahan, desimal, dan persen secara tepat."
  );
  const [dimensiProfil, setDimensiProfil] = useState(["Penalaran kritis", "Kemandirian"]);

  // State Komposisi & Konfigurasi Soal
  const [bentukSoal, setBentukSoal] = useState({
    PG: 10,
    PGK: 2,
    BS: 0,
    Menjodohkan: 0,
    Isian: 3,
    Uraian: 2
  });
  const [opsiPG, setOpsiPG] = useState(4);
  const [gunakanStimulusLiterasi, setGunakanStimulusLiterasi] = useState(true);
  const [proporsiKesulitan, setProporsiKesulitan] = useState({
    mudah: 30,
    sedang: 50,
    sulit: 20
  });
  const [instruksiKhusus, setInstruksiKhusus] = useState("");

  // State Hasil & Editor Soal
  const [soalList, setSoalList] = useState([]);
  const [editingSoalId, setEditingSoalId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  // State UI, Notifikasi & Modal AI
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [modelName, setModelName] = useState("gemini-3-flash-preview");

  // State Opsi Pratinjau / Cetak
  const [printOptions, setPrintOptions] = useState({
    tampilkanKisiKisi: true,
    tampilkanNaskahSoal: true,
    tampilkanKunciJawaban: true,
    tampilkanPedomanSkor: true
  });

  const notify = (type, text) => {
    setStatusMsg({ type, text });
  };

  useEffect(() => {
    if (!availableMapel.includes(identitas.mapel)) {
      setIdentitas((prev) => ({ ...prev, mapel: availableMapel[0] || "Matematika" }));
    }
  }, [identitas.jenjang, identitas.kelas]);

  useEffect(() => {
    const firstEl = cpData.elemen?.[0]?.e;
    setSelectedElemen(firstEl ? [firstEl] : []);
  }, [identitas.mapel, faseAktif]);

  const totalSoal = Object.values(bentukSoal).reduce((sum, val) => sum + Number(val || 0), 0);
  const totalSkor = soalList.reduce((sum, s) => sum + Number(s.skorMaksimal || 1), 0);

  /* ===== EKSPOR KE MICROSOFT WORD (.DOC) LENGKAP & PADAT ===== */
  const handleExportWord = () => {
    if (soalList.length === 0) {
      notify("error", "Belum ada butir soal untuk diunduh. Silakan generate soal terlebih dahulu.");
      return;
    }

    const esc = (str) =>
      String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");

    const jenisLabel =
      JENIS_ASESMEN.find((j) => j.id === identitas.jenisAsesmen)?.label || identitas.jenisAsesmen;

    let bodyContent = "";

    // 1. KISI-KISI SOAL
    if (printOptions.tampilkanKisiKisi) {
      const rowsKisi = soalList
        .map(
          (s) => `
          <tr>
            <td style="text-align:center;">${s.nomor}</td>
            <td>${esc(s.elemenCP)}</td>
            <td>${esc(topikMateri)}</td>
            <td>${esc(s.indikatorSoal)}</td>
            <td style="text-align:center;">${esc(s.levelKognitif)}</td>
            <td style="text-align:center;">${esc(s.bentuk)}</td>
            <td style="text-align:center; font-weight:bold;">${s.nomor}</td>
          </tr>`
        )
        .join("");

      bodyContent += `
        <div class="kop-surat">
          <h2 style="margin:0; font-size:13pt; text-transform:uppercase;">KISI-KISI PENULISAN SOAL ${esc(identitas.jenisAsesmen.toUpperCase())}</h2>
          <p style="margin:2pt 0; font-weight:bold; font-size:11.5pt;">${esc(identitas.namaSekolah)}</p>
          <p style="margin:0; font-size:9.5pt;">TAHUN AJARAN ${esc(identitas.tahunAjaran)} &bull; SEMESTER ${esc(identitas.semester.toUpperCase())}</p>
        </div>
        <table class="no-border" style="margin-bottom:6pt; font-size:10pt;">
          <tr>
            <td style="width:22%; font-weight:bold;">Jenjang / Kelas / Fase</td>
            <td style="width:33%;">: ${esc(JENJANG[identitas.jenjang].nama)} / Kelas ${esc(identitas.kelas)} / Fase ${esc(faseAktif)}</td>
            <td style="width:18%; font-weight:bold;">Alokasi Waktu</td>
            <td style="width:27%;">: ${esc(identitas.alokasiWaktu)}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Mata Pelajaran</td>
            <td>: ${esc(identitas.mapel)}</td>
            <td style="font-weight:bold;">Jumlah Soal</td>
            <td>: ${soalList.length} Butir</td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Topik Materi</td>
            <td colspan="3">: ${esc(topikMateri)}</td>
          </tr>
        </table>
        <table>
          <thead>
            <tr>
              <th style="width:5%;">No</th>
              <th style="width:18%;">Elemen CP</th>
              <th style="width:20%;">Topik / Materi</th>
              <th style="width:31%;">Indikator Soal</th>
              <th style="width:12%;">Level Kognitif</th>
              <th style="width:8%;">Bentuk</th>
              <th style="width:6%;">No. Soal</th>
            </tr>
          </thead>
          <tbody>${rowsKisi}</tbody>
        </table>
      `;
    }

    // 2. NASKAH SOAL PESERTA DIDIK (PADAT: BEBERAPA SOAL DALAM 1 HALAMAN)
    if (printOptions.tampilkanNaskahSoal) {
      const soalItemsHtml = soalList
        .map((s) => {
          const stimulusHtml = s.stimulus
            ? `<div class="stimulus-box">${esc(s.stimulus)}</div>`
            : "";

          let opsiHtml = "";
          if (s.opsi && Object.keys(s.opsi).length > 0) {
            const entries = Object.entries(s.opsi);
            const isShortOptions = entries.every(([_, v]) => String(v).length <= 28);
            if (isShortOptions) {
              const pairs = [];
              for (let i = 0; i < entries.length; i += 2) {
                const [k1, v1] = entries[i];
                const pair2 = entries[i + 1];
                pairs.push(
                  `<div style="margin-left:14pt;"><b>${esc(k1)}.</b> ${esc(v1)}${
                    pair2 ? `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>${esc(pair2[0])}.</b> ${esc(pair2[1])}` : ""
                  }</div>`
                );
              }
              opsiHtml = pairs.join("");
            } else {
              opsiHtml = entries
                .map(([k, v]) => `<div style="margin-left:14pt;"><b>${esc(k)}.</b> ${esc(v)}</div>`)
                .join("");
            }
          } else if (s.bentuk === "Uraian") {
            opsiHtml = `<div style="margin-left:14pt; margin-top:2pt;"><i>Jawab:</i> ........................................................................................................</div>`;
          } else if (s.bentuk === "Isian") {
            opsiHtml = ``;
          }

          return `<div class="soal-item">${stimulusHtml}<div><b>${s.nomor}.</b> ${esc(s.pertanyaan)}</div>${opsiHtml}</div>`;
        })
        .join("");

      bodyContent += `
        <div class="${printOptions.tampilkanKisiKisi ? "page-break" : ""}">
          <div class="kop-surat">
            <h2 style="margin:0; font-size:12.5pt; text-transform:uppercase;">${esc(identitas.namaSekolah)}</h2>
            <p style="margin:1pt 0; font-size:9pt;">${esc(identitas.alamatSekolah)}</p>
            <h3 style="margin:3pt 0 1pt 0; font-size:11pt; text-transform:uppercase;">NASKAH SOAL ${esc(jenisLabel.toUpperCase())}</h3>
            <p style="margin:0; font-size:9pt; font-weight:bold;">TAHUN AJARAN ${esc(identitas.tahunAjaran)} &mdash; SEMESTER ${esc(identitas.semester.toUpperCase())}</p>
          </div>
          <table style="margin-bottom:6pt; font-size:9.5pt;">
            <tr>
              <td style="width:50%;"><strong>Mata Pelajaran:</strong> ${esc(identitas.mapel)}</td>
              <td style="width:50%;"><strong>Nama Siswa:</strong> .....................................................</td>
            </tr>
            <tr>
              <td><strong>Kelas / Fase:</strong> ${esc(identitas.kelas)} / Fase ${esc(faseAktif)}</td>
              <td><strong>Hari / Tanggal:</strong> ${esc(identitas.tanggalUjian)}</td>
            </tr>
            <tr>
              <td><strong>Topik Materi:</strong> ${esc(topikMateri)}</td>
              <td><strong>Alokasi Waktu:</strong> ${esc(identitas.alokasiWaktu)}</td>
            </tr>
          </table>
          ${soalItemsHtml}
        </div>
      `;
    }

    // 3. KUNCI JAWABAN, PEMBAHASAN & PEDOMAN PENSKORAN
    if (printOptions.tampilkanKunciJawaban || printOptions.tampilkanPedomanSkor) {
      const kunciRows = soalList
        .map(
          (s) => `
          <tr>
            <td style="text-align:center; font-weight:bold;">${s.nomor}</td>
            <td style="text-align:center;">${esc(s.bentuk)}</td>
            <td style="font-weight:bold;">${esc(s.kunciJawaban)}</td>
            <td>${esc(s.pembahasan)}</td>
            <td style="text-align:center;">${s.skorMaksimal}</td>
          </tr>`
        )
        .join("");

      bodyContent += `
        <div class="page-break">
          <div class="kop-surat">
            <h2 style="margin:0; font-size:12.5pt; text-transform:uppercase;">KUNCI JAWABAN, PEMBAHASAN, DAN PEDOMAN PENSKORAN</h2>
            <p style="margin:2pt 0; font-size:9.5pt;">${esc(identitas.mapel)} &bull; Kelas ${esc(identitas.kelas)} (Fase ${esc(faseAktif)}) &bull; ${esc(identitas.namaSekolah)}</p>
          </div>
          ${
            printOptions.tampilkanKunciJawaban
              ? `<table>
                  <thead>
                    <tr>
                      <th style="width:6%;">No</th>
                      <th style="width:12%;">Bentuk</th>
                      <th style="width:22%;">Kunci Jawaban</th>
                      <th style="width:50%;">Pembahasan / Rubrik Penilaian</th>
                      <th style="width:10%;">Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${kunciRows}
                    <tr>
                      <td colspan="4" style="text-align:right; font-weight:bold; background:#f1f5f9;">Total Skor Maksimal</td>
                      <td style="text-align:center; font-weight:bold; background:#f1f5f9;">${totalSkor}</td>
                    </tr>
                  </tbody>
                </table>`
              : ""
          }
          ${
            printOptions.tampilkanPedomanSkor
              ? `<div style="border:1px solid #000; padding:6pt 8pt; margin-bottom:12pt; background:#f8fafc; font-size:10pt;">
                  <strong>Rumus Perhitungan Nilai Akhir Siswa:</strong><br/>
                  Nilai Akhir = (Jumlah Skor Perolehan &divide; ${totalSkor}) &times; 100
                </div>`
              : ""
          }
          <table class="no-border" style="margin-top:16pt; font-size:10pt;">
            <tr>
              <td style="width:55%;"></td>
              <td style="width:45%; text-align:center;">
                <p style="margin:0;">${esc(identitas.tanggalUjian)}<br/>Tutor Les Private Matematika</p>
                <br/><br/><br/>
                <p style="font-weight:bold; text-decoration:underline; margin:0;">${esc(identitas.namaGuru)}</p>
                <p style="margin:2pt 0 0 0; font-size:9.5pt;">${esc(identitas.namaSekolah)}</p>
              </td>
            </tr>
          </table>
        </div>
      `;
    }

    const headerHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Dokumen Soal Matematika - ${esc(identitas.mapel)}</title>
      <style>
        @page Section1 { size: 21cm 29.7cm; margin: 1.27cm 1.27cm 1.27cm 1.27cm; }
        div.Section1 { page: Section1; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; line-height: 1.25; color: #000; margin: 0; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 6pt; }
        th, td { border: 1px solid #000; padding: 3pt 4.5pt; vertical-align: top; text-align: left; }
        th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
        .no-border td, .no-border th { border: none; padding: 1pt 3pt; }
        .kop-surat { border-bottom: 2pt double #000; padding-bottom: 4pt; margin-bottom: 6pt; text-align: center; }
        .page-break { page-break-before: always; }
        .soal-item { margin-bottom: 5pt; }
        .stimulus-box { border: 1px solid #666; background-color: #f8fafc; padding: 3pt 5pt; margin-bottom: 2pt; font-size: 9.5pt; }
      </style>
      </head><body><div class="Section1">`;

    const footerHtml = "</div></body></html>";
    const fullHtml = headerHtml + bodyContent + footerHtml;

    const blob = new Blob(["\ufeff", fullHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeMapel = identitas.mapel.replace(/[^a-zA-Z0-9]/g, "_");
    link.download = `Soal_${safeMapel}_Kelas_${identitas.kelas}_studywith_aisyabella.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify("success", "File dokumen Word (.doc) berhasil diunduh (layout mengalir padat per halaman)!");
  };

  /* ===== FUNGSI CETAK / SIMPAN PDF (MENDUKUNG SANDBOX IFRAME) ===== */
  const handlePrintPdf = () => {
    const printEl = document.getElementById("dokumen-asesmen-cetak");
    if (!printEl || soalList.length === 0) {
      notify("error", "Belum ada butir soal untuk dicetak atau disimpan ke PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Soal_${identitas.mapel}_Kelas_${identitas.kelas}</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.35;
            color: #000;
            margin: 0;
            padding: 0;
          }
          table { border-collapse: collapse; width: 100%; margin-bottom: 8pt; }
          th, td { border: 1px solid #000; padding: 4pt 6pt; vertical-align: top; text-align: left; }
          th { background-color: #f1f5f9; font-weight: bold; text-align: center; }
          .no-border td, .no-border th { border: none !important; padding: 2pt 4pt; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .underline { text-decoration: underline; }
          .page-break { page-break-before: always; }
          .kop-surat { border-bottom: 3px double #000; padding-bottom: 6pt; margin-bottom: 10pt; text-align: center; }
          .soal-box { margin-bottom: 8pt; }
          .stimulus-box { border: 1px solid #666; background-color: #f8fafc; padding: 4pt 6pt; margin-bottom: 4pt; font-size: 10pt; }
          .flex { display: flex; }
          .items-start { align-items: flex-start; }
          .gap-2 { gap: 6pt; }
          .flex-1 { flex: 1; }
          .whitespace-pre-line { white-space: pre-line; }
        </style>
      </head>
      <body>
        ${printEl.innerHTML}
      </body>
      </html>
    `;

    // Gunakan iframe tersembunyi agar tetap berfungsi meskipun popup/window.print diblokir
    const existingFrame = document.getElementById("print-frame-helper");
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "print-frame-helper";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          notify("info", "Dialog Cetak / Simpan sebagai PDF telah dibuka.");
        } catch (e) {
          window.print();
        }
      }, 300);
    } else {
      window.print();
    }
  };

  /* ===== FUNGSI GENERATE SOAL DENGAN GEMINI AI + FALLBACK CERDAS ===== */
  const handleGenerateSoal = async () => {
    if (totalSoal <= 0) {
      notify("error", "Jumlah soal minimal harus 1 butir. Silakan atur jumlah soal terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    setStatusMsg(null);

    const elemenTerpilihObj = cpData.elemen.filter((el) => selectedElemen.includes(el.e));
    const ringkasanCP = (elemenTerpilihObj.length > 0 ? elemenTerpilihObj : cpData.elemen)
      .map((el) => `- Elemen "${el.e}": ${el.t}`)
      .join("\n");

    const rincianBentuk = Object.entries(bentukSoal)
      .filter(([_, jml]) => Number(jml) > 0)
      .map(([bentuk, jml]) => `${bentuk}: ${jml} soal`)
      .join(", ");

    const promptText = `Anda adalah tutor dan pakar penyusun soal les private Matematika (studywith.aisyabella) Kurikulum Merdeka Indonesia.
Buatlah instrumen soal Matematika yang SANGAT SPESIFIK, AKURAT SECARA MATEMATIS, dan BENAR-BENAR MENGUJI TOPIK MATERI YANG DIMINTA.

IDENTITAS ASESMEN:
- Jenjang: ${JENJANG[identitas.jenjang].nama} | Kelas: ${identitas.kelas} | Fase: ${faseAktif}
- Mata Pelajaran: ${identitas.mapel}
- Jenis Asesmen: ${identitas.jenisAsesmen}
- Topik / Lingkup Materi WAJIB: ${topikMateri}
- Tujuan Pembelajaran (TP): ${tujuanPembelajaran}
- Dimensi Profil Lulusan: ${dimensiProfil.join(", ")}

CAPAIAN PEMBELAJARAN:
${ringkasanCP}

ATURAN KETAT PENYUSUNAN SOAL MATEMATIKA:
1. SELURUH butir soal HARUS langsung berupa soal Matematika (perhitungan, pemodelan matematika, pembuktian, atau pemecahan masalah nyata) yang sesuai dengan topik "${topikMateri}". DILARANG membuat soal hafalan definisi umum.
2. Pastikan setiap angka, rumus, dan perhitungan pada pertanyaan, opsi jawaban, kunci jawaban, dan pembahasan telah dihitung dengan tepat 100%.
3. Total Soal: ${totalSoal} butir (${rincianBentuk}).
4. Opsi Pilihan Ganda: ${opsiPG} pilihan (${opsiPG === 5 ? "A, B, C, D, E" : "A, B, C, D"}).
5. Proporsi Kesulitan: Mudah ${proporsiKesulitan.mudah}%, Sedang ${proporsiKesulitan.sedang}%, Sulit/HOTS ${proporsiKesulitan.sulit}%.
6. Stimulus Literasi/Numerasi: ${gunakanStimulusLiterasi ? "Sertakan ilustrasi cerita/data numerik kontekstual pada soal-soal HOTS/sedang" : "Gunakan stimulus seperlunya"}.
${instruksiKhusus ? `7. Instruksi Tambahan: ${instruksiKhusus}` : ""}

FORMAT OUTPUT WAJIB:
Kembalikan HANYA array JSON valid (tanpa markdown \`\`\`json, tanpa teks pembuka/penutup) dengan struktur setiap elemen objek sebagai berikut:
[
  {
    "nomor": 1,
    "bentuk": "PG",
    "elemenCP": "Nama Elemen CP",
    "tujuanPembelajaran": "Rumusan TP",
    "indikatorSoal": "Indikator soal spesifik",
    "levelKognitif": "C3 (Menerapkan)",
    "tingkatKesulitan": "Sedang",
    "stimulus": "Teks cerita/data soal jika ada, atau string kosong",
    "pertanyaan": "Teks pertanyaan matematika",
    "opsi": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "kunciJawaban": "A",
    "pembahasan": "Langkah penyelesaian matematika secara rinci",
    "skorMaksimal": 1
  }
]`;

    try {
      const activeKey = customApiKey.trim() || "";
      const activeModel = modelName || "gemini-3-flash-preview";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`;

      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      let response = null;
      let delay = 1000;
      for (let attempt = 0; attempt < 3; attempt++) {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) break;
        if (response.status === 429 || response.status >= 500) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
        } else {
          break;
        }
      }

      if (!response || !response.ok) {
        throw new Error(`API status ${response ? response.status : "unknown"}`);
      }

      const result = await response.json();
      const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Respons AI tidak berbentuk daftar soal yang valid.");
      }

      const normalized = parsed.map((item, idx) => ({
        id: `soal-${Date.now()}-${idx + 1}`,
        nomor: idx + 1,
        bentuk: item.bentuk || "PG",
        elemenCP: item.elemenCP || cpData.elemen[0]?.e || "Matematika",
        tujuanPembelajaran: item.tujuanPembelajaran || tujuanPembelajaran,
        indikatorSoal: item.indikatorSoal || `Disajikan soal ${topikMateri}, siswa dapat menyelesaikannya.`,
        levelKognitif: item.levelKognitif || "C3 (Menerapkan)",
        tingkatKesulitan: item.tingkatKesulitan || "Sedang",
        stimulus: item.stimulus || "",
        pertanyaan: item.pertanyaan || "",
        opsi: item.opsi && typeof item.opsi === "object" ? item.opsi : {},
        kunciJawaban: item.kunciJawaban || "",
        pembahasan: item.pembahasan || "",
        skorMaksimal: Number(item.skorMaksimal || 1)
      }));

      setSoalList(normalized);
      setActiveTab("hasil");
      notify("success", `Berhasil menyusun ${normalized.length} butir soal Matematika sesuai topik!`);
    } catch (err) {
      const fallback = generateOfflineFallback(
        {
          mapel: identitas.mapel,
          jenjang: identitas.jenjang,
          kelas: identitas.kelas,
          fase: faseAktif,
          jenisAsesmen: identitas.jenisAsesmen,
          topikMateri,
          tujuanPembelajaran,
          proporsiKesulitan,
          bentukSoal,
          opsiPG
        },
        cpData
      );
      setSoalList(fallback);
      setActiveTab("hasil");
      notify("info", `Menyusun ${fallback.length} butir soal Matematika dari bank soal kurikulum.`);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ===== FUNGSI EDITOR BUTIR SOAL ===== */
  const addManualSoal = () => {
    const nextNo = soalList.length + 1;
    const defaultOpsi =
      opsiPG === 5
        ? { A: "", B: "", C: "", D: "", E: "" }
        : { A: "", B: "", C: "", D: "" };
    const newSoal = {
      id: `soal-${Date.now()}-${nextNo}`,
      nomor: nextNo,
      bentuk: "PG",
      elemenCP: cpData.elemen[0]?.e || "Pemahaman Konsep Matematika",
      tujuanPembelajaran,
      indikatorSoal: `Siswa mampu menyelesaikan soal pada materi ${topikMateri}.`,
      levelKognitif: "C3 (Menerapkan)",
      tingkatKesulitan: "Sedang",
      stimulus: "",
      pertanyaan: "Tuliskan pertanyaan matematika di sini...",
      opsi: defaultOpsi,
      kunciJawaban: "A",
      pembahasan: "Tuliskan langkah pembahasan di sini...",
      skorMaksimal: 1
    };
    setSoalList((prev) => [...prev, newSoal]);
    setEditingSoalId(newSoal.id);
    setEditDraft({ ...newSoal });
  };

  const startEditSoal = (soal) => {
    setEditingSoalId(soal.id);
    setEditDraft({
      ...soal,
      opsi: soal.opsi ? { ...soal.opsi } : {}
    });
  };

  const saveEditSoal = () => {
    if (!editDraft) return;
    setSoalList((prev) =>
      prev.map((item) => (item.id === editDraft.id ? { ...editDraft } : item))
    );
    setEditingSoalId(null);
    setEditDraft(null);
    notify("success", "Perubahan butir soal berhasil disimpan.");
  };

  const deleteSoal = (id) => {
    setSoalList((prev) =>
      prev
        .filter((item) => item.id !== id)
        .map((item, idx) => ({ ...item, nomor: idx + 1 }))
    );
    if (editingSoalId === id) {
      setEditingSoalId(null);
      setEditDraft(null);
    }
    notify("info", "Butir soal dihapus dan penomoran diperbarui.");
  };

  /* ===== SIMPAN & MUAT PROYEK JSON ===== */
  const fileInputRef = useRef(null);

  const handleSaveProject = () => {
    const projectData = {
      versi: "2.0",
      tanggalSimpan: new Date().toISOString(),
      identitas,
      selectedElemen,
      topikMateri,
      tujuanPembelajaran,
      dimensiProfil,
      bentukSoal,
      opsiPG,
      proporsiKesulitan,
      soalList
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Proyek_Soal_${identitas.mapel.replace(/\s+/g, "_")}_Kls${identitas.kelas}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("success", "Proyek asesmen berhasil disimpan ke perangkat (.json).");
  };

  const handleLoadProject = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(String(ev.target?.result));
        if (data.identitas) setIdentitas(data.identitas);
        if (data.selectedElemen) setSelectedElemen(data.selectedElemen);
        if (data.topikMateri) setTopikMateri(data.topikMateri);
        if (data.tujuanPembelajaran) setTujuanPembelajaran(data.tujuanPembelajaran);
        if (data.dimensiProfil) setDimensiProfil(data.dimensiProfil);
        if (data.bentukSoal) setBentukSoal(data.bentukSoal);
        if (data.opsiPG) setOpsiPG(data.opsiPG);
        if (data.proporsiKesulitan) setProporsiKesulitan(data.proporsiKesulitan);
        if (data.soalList) setSoalList(data.soalList);
        notify("success", "Proyek asesmen berhasil dimuat kembali!");
      } catch (err) {
        notify("error", "File proyek tidak valid atau rusak.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ===== RENDER KOMPONEN ===== */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* STYLE KHUSUS CETAK */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #dokumen-asesmen-cetak, #dokumen-asesmen-cetak * { visibility: visible; }
          #dokumen-asesmen-cetak {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* NAVBAR ATAS */}
      <header className="no-print bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 p-2.5 rounded-xl backdrop-blur-sm border border-white/20">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight">Generator Soal Les Private — studywith.aisyabella</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  Khusus Matematika
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                SD/MI • SMP/MTs • SMA/MA — studywith.aisyabella
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleLoadProject}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition border border-white/15"
              title="Buka Proyek Tersimpan (.json)"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Buka</span>
            </button>
            <button
              onClick={handleSaveProject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition border border-white/15"
              title="Simpan Proyek (.json)"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Simpan</span>
            </button>
            <button
              onClick={() => setShowApiModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-xs font-medium transition border border-indigo-500"
              title="Pengaturan Mesin AI"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">AI Config</span>
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFIKASI STATUS */}
      {statusMsg && (
        <div className="no-print max-w-7xl mx-auto w-full px-4 pt-3">
          <div
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm shadow-sm ${
              statusMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : statusMsg.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-sky-50 border-sky-200 text-sky-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : statusMsg.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
            <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* KONTEN UTAMA */}
      <div className="max-w-7xl mx-auto w-full flex-1 px-4 py-5 flex flex-col lg:flex-row gap-5">
        {/* SIDEBAR LANGKAH KERJA */}
        <aside className={`no-print lg:w-64 shrink-0 ${sidebarOpen ? "block" : "hidden lg:block"}`}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sticky top-20 space-y-1.5">
            <div className="px-3 py-2 border-b border-slate-100 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Alur Penyusunan</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">
                {JENJANG[identitas.jenjang].nama} • Kelas {identitas.kelas} (Fase {faseAktif})
              </p>
            </div>

            {[
              { id: "identitas", step: "1", label: "Identitas & Satuan", icon: FileText, desc: "Sekolah, Mapel, Jenis" },
              { id: "cp", step: "2", label: "Capaian & Materi", icon: BookOpen, desc: "CP 2025/2026 & TP" },
              { id: "konfigurasi", step: "3", label: "Komposisi Soal", icon: Sliders, desc: `${totalSoal} Butir Soal` },
              { id: "hasil", step: "4", label: "Bank & Editor Soal", icon: Edit3, desc: `${soalList.length} Tersusun` },
              { id: "cetak", step: "5", label: "Pratinjau & Ekspor", icon: Printer, desc: "Kisi-kisi, Naskah, Kunci" }
            ].map((nav) => {
              const Icon = nav.icon;
              const active = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {nav.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{nav.label}</div>
                    <div className={`text-[11px] truncate ${active ? "text-indigo-100" : "text-slate-400"}`}>
                      {nav.desc}
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="pt-3 mt-3 border-t border-slate-100">
              <button
                onClick={handleGenerateSoal}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyusun Soal...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Soal Otomatis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* AREA PANEL KONTEN */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: IDENTITAS & SATUAN PENDIDIKAN */}
          {activeTab === "identitas" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">1. Identitas Asesmen Les Private</h2>
                  <p className="text-xs text-slate-500">
                    Struktur mata pelajaran mengacu pada Permendikdasmen No. 13 Tahun 2025.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                  Fase Kurikulum: Fase {faseAktif}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenjang Pendidikan</label>
                  <select
                    value={identitas.jenjang}
                    onChange={(e) => {
                      const j = e.target.value;
                      setIdentitas({
                        ...identitas,
                        jenjang: j,
                        kelas: JENJANG[j].kelas[0]
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(JENJANG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.nama} ({v.jp} menit/JP)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas & Fase</label>
                  <select
                    value={identitas.kelas}
                    onChange={(e) => setIdentitas({ ...identitas, kelas: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {JENJANG[identitas.jenjang].kelas.map((kls) => (
                      <option key={kls} value={kls}>
                        Kelas {kls} — Fase {FASE[kls]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Asesmen</label>
                  <select
                    value={identitas.jenisAsesmen}
                    onChange={(e) => setIdentitas({ ...identitas, jenisAsesmen: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {JENIS_ASESMEN.map((ja) => (
                      <option key={ja.id} value={ja.id}>
                        {ja.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mata Pelajaran</label>
                  <select
                    value={identitas.mapel}
                    onChange={(e) => setIdentitas({ ...identitas, mapel: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {availableMapel.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Alokasi Waktu</label>
                  <input
                    type="text"
                    value={identitas.alokasiWaktu}
                    onChange={(e) => setIdentitas({ ...identitas, alokasiWaktu: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Contoh: 90 Menit"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Data Kop Naskah Les Private</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Les Private</label>
                    <input
                      type="text"
                      value={identitas.namaSekolah}
                      onChange={(e) => setIdentitas({ ...identitas, namaSekolah: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan / Tagline</label>
                    <input
                      type="text"
                      value={identitas.alamatSekolah}
                      onChange={(e) => setIdentitas({ ...identitas, alamatSekolah: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun Ajaran</label>
                      <input
                        type="text"
                        value={identitas.tahunAjaran}
                        onChange={(e) => setIdentitas({ ...identitas, tahunAjaran: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Semester</label>
                      <select
                        value={identitas.semester}
                        onChange={(e) => setIdentitas({ ...identitas, semester: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="Ganjil">Ganjil (1)</option>
                        <option value="Genap">Genap (2)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Pelaksanaan</label>
                    <input
                      type="date"
                      value={identitas.tanggalUjian}
                      onChange={(e) => setIdentitas({ ...identitas, tanggalUjian: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Tutor / Guru Penyusun</label>
                    <input
                      type="text"
                      value={identitas.namaGuru}
                      onChange={(e) => setIdentitas({ ...identitas, namaGuru: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab("cp")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
                >
                  <span>Lanjut: Capaian Pembelajaran</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CAPAIAN PEMBELAJARAN & MATERI */}
          {activeTab === "cp" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-800">2. Capaian Pembelajaran (CP) & Lingkup Materi</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih elemen CP yang diujikan pada <strong>{identitas.mapel} — Fase {faseAktif} (Kelas {identitas.kelas})</strong>.
                </p>
              </div>

              {/* Daftar Elemen CP */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Elemen Capaian Pembelajaran Fase {faseAktif}
                </label>
                {cpData.elemen.map((el) => {
                  const checked = selectedElemen.includes(el.e);
                  return (
                    <div
                      key={el.e}
                      onClick={() => {
                        setSelectedElemen((prev) =>
                          prev.includes(el.e) ? prev.filter((x) => x !== el.e) : [...prev, el.e]
                        );
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        checked
                          ? "bg-indigo-50/70 border-indigo-300"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="font-semibold text-sm text-slate-800">{el.e}</div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{el.t}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Topik & Tujuan Pembelajaran */}
              <div className="grid grid-cols-1 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Topik / Lingkup Materi Utama
                  </label>
                  <input
                    type="text"
                    value={topikMateri}
                    onChange={(e) => setTopikMateri(e.target.value)}
                    placeholder="Contoh: Perubahan Wujud Zat, Pecahan Senilai, Teks Eksplanasi..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tujuan Pembelajaran (TP) yang Diukur
                  </label>
                  <textarea
                    rows={3}
                    value={tujuanPembelajaran}
                    onChange={(e) => setTujuanPembelajaran(e.target.value)}
                    placeholder="Tuliskan rumusan Tujuan Pembelajaran yang akan diturunkan menjadi indikator soal..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Dimensi Profil Lulusan yang Diintegrasikan
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIMENSI.map((dim) => {
                      const active = dimensiProfil.includes(dim);
                      return (
                        <button
                          type="button"
                          key={dim}
                          onClick={() =>
                            setDimensiProfil((prev) =>
                              prev.includes(dim) ? prev.filter((x) => x !== dim) : [...prev, dim]
                            )
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                            active
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {active ? "✓ " : "+ "}
                          {dim}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab("identitas")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  onClick={() => setActiveTab("konfigurasi")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                >
                  <span>Lanjut: Komposisi Soal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: KONFIGURASI & KOMPOSISI SOAL */}
          {activeTab === "konfigurasi" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">3. Komposisi Bentuk Soal & Tingkat Kesulitan</h2>
                  <p className="text-xs text-slate-500">
                    Tentukan jumlah butir tiap bentuk asesmen (AKM / Kurikulum Merdeka) dan distribusi kognitif.
                  </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                  Total: {totalSoal} Butir Soal
                </div>
              </div>

              {/* Bentuk Soal */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Jumlah Butir per Bentuk Soal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {BENTUK_SOAL_LIST.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{b.label}</div>
                        <div className="text-[11px] text-slate-500">Kode: {b.id}</div>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={bentukSoal[b.id] ?? 0}
                        onChange={(e) =>
                          setBentukSoal({
                            ...bentukSoal,
                            [b.id]: Math.max(0, parseInt(e.target.value || "0", 10))
                          })
                        }
                        className="w-20 text-center font-bold rounded-lg border border-slate-300 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Opsi PG & Stimulus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Jumlah Opsi Pilihan Ganda</label>
                  <div className="flex gap-3">
                    {[4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setOpsiPG(num)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                          opsiPG === num
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 text-slate-700 border-slate-300"
                        }`}
                      >
                        {num} Opsi ({num === 4 ? "A - D" : "A - E"})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-700">Stimulus Literasi & Numerasi (AKM)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Sertakan wacana singkat, kasus, atau data pada soal penalaran.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={gunakanStimulusLiterasi}
                    onChange={(e) => setGunakanStimulusLiterasi(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600"
                  />
                </div>
              </div>

              {/* Proporsi Tingkat Kesulitan */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Proporsi Tingkat Kesulitan (%)</span>
                  <span
                    className={`text-xs font-bold ${
                      proporsiKesulitan.mudah + proporsiKesulitan.sedang + proporsiKesulitan.sulit === 100
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    Total: {proporsiKesulitan.mudah + proporsiKesulitan.sedang + proporsiKesulitan.sulit}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-700 mb-1">Mudah (LOTS / C1-C2)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={proporsiKesulitan.mudah}
                      onChange={(e) =>
                        setProporsiKesulitan({ ...proporsiKesulitan, mudah: Number(e.target.value || 0) })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-700 mb-1">Sedang (MOTS / C3)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={proporsiKesulitan.sedang}
                      onChange={(e) =>
                        setProporsiKesulitan({ ...proporsiKesulitan, sedang: Number(e.target.value || 0) })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-700 mb-1">Sulit (HOTS / C4-C6)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={proporsiKesulitan.sulit}
                      onChange={(e) =>
                        setProporsiKesulitan({ ...proporsiKesulitan, sulit: Number(e.target.value || 0) })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Instruksi Tambahan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Instruksi Khusus untuk Penyusunan Soal (Opsional)
                </label>
                <input
                  type="text"
                  value={instruksiKhusus}
                  onChange={(e) => setInstruksiKhusus(e.target.value)}
                  placeholder="Contoh: Gunakan konteks kearifan lokal Indonesia, hindari soal hafalan semata..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab("cp")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>

                <button
                  onClick={handleGenerateSoal}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-bold shadow-md transition disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sedang Menyusun Paket Soal...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Generate {totalSoal} Soal Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: BANK & EDITOR BUTIR SOAL */}
          {activeTab === "hasil" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">4. Editor Butir Soal, Kunci & Pembahasan</h2>
                  <p className="text-xs text-slate-500">
                    Total {soalList.length} butir soal • Akumulasi Skor Maksimal: <strong>{totalSkor}</strong>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={addManualSoal}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Soal Manual</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("cetak")}
                    disabled={soalList.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Pratinjau Dokumen Siap Cetak</span>
                  </button>
                </div>
              </div>

              {soalList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-700">Belum Ada Butir Soal</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Klik tombol <strong>Generate Soal Otomatis</strong> di panel kiri untuk menyusun soal berdasarkan CP {identitas.mapel}, atau tambahkan soal secara manual.
                  </p>
                  <button
                    onClick={handleGenerateSoal}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Soal Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {soalList.map((soal) => {
                    const isEditing = editingSoalId === soal.id;
                    return (
                      <div
                        key={soal.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 transition hover:border-indigo-200"
                      >
                        {isEditing && editDraft ? (
                          /* MODE EDIT SOAL */
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <span className="font-bold text-sm text-indigo-700">
                                Mengedit Butir Soal No. {editDraft.nomor}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingSoalId(null);
                                    setEditDraft(null);
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600"
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={saveEditSoal}
                                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Simpan Perubahan</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bentuk Soal</label>
                                <select
                                  value={editDraft.bentuk}
                                  onChange={(e) => setEditDraft({ ...editDraft, bentuk: e.target.value })}
                                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                                >
                                  {BENTUK_SOAL_LIST.map((b) => (
                                    <option key={b.id} value={b.id}>{b.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Level Kognitif</label>
                                <select
                                  value={editDraft.levelKognitif}
                                  onChange={(e) => setEditDraft({ ...editDraft, levelKognitif: e.target.value })}
                                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                                >
                                  {TAKSONOMI_BLOOM.map((tk) => (
                                    <option key={tk} value={tk}>{tk}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kesulitan</label>
                                <select
                                  value={editDraft.tingkatKesulitan}
                                  onChange={(e) => setEditDraft({ ...editDraft, tingkatKesulitan: e.target.value })}
                                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                                >
                                  <option value="Mudah">Mudah</option>
                                  <option value="Sedang">Sedang</option>
                                  <option value="Sulit (HOTS)">Sulit (HOTS)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Skor Maksimal</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={editDraft.skorMaksimal}
                                  onChange={(e) =>
                                    setEditDraft({ ...editDraft, skorMaksimal: Number(e.target.value || 1) })
                                  }
                                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Indikator Soal (Kisi-kisi)</label>
                              <input
                                type="text"
                                value={editDraft.indikatorSoal}
                                onChange={(e) => setEditDraft({ ...editDraft, indikatorSoal: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Stimulus / Teks Ilustrasi (Opsional)</label>
                              <textarea
                                rows={2}
                                value={editDraft.stimulus}
                                onChange={(e) => setEditDraft({ ...editDraft, stimulus: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pertanyaan</label>
                              <textarea
                                rows={3}
                                value={editDraft.pertanyaan}
                                onChange={(e) => setEditDraft({ ...editDraft, pertanyaan: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                              />
                            </div>

                            {editDraft.opsi && Object.keys(editDraft.opsi).length > 0 && (
                              <div className="space-y-2">
                                <label className="block text-[11px] font-semibold text-slate-600">Opsi Jawaban</label>
                                {Object.entries(editDraft.opsi).map(([k, v]) => (
                                  <div key={k} className="flex items-center gap-2">
                                    <span className="w-6 font-bold text-xs text-slate-600">{k}.</span>
                                    <input
                                      type="text"
                                      value={String(v)}
                                      onChange={(e) =>
                                        setEditDraft({
                                          ...editDraft,
                                          opsi: { ...editDraft.opsi, [k]: e.target.value }
                                        })
                                      }
                                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1 text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-emerald-700 mb-1">Kunci Jawaban</label>
                                <input
                                  type="text"
                                  value={editDraft.kunciJawaban}
                                  onChange={(e) => setEditDraft({ ...editDraft, kunciJawaban: e.target.value })}
                                  className="w-full rounded-lg border border-emerald-300 bg-emerald-50/40 px-3 py-1.5 text-xs font-semibold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pembahasan / Rubrik Skor</label>
                                <textarea
                                  rows={2}
                                  value={editDraft.pembahasan}
                                  onChange={(e) => setEditDraft({ ...editDraft, pembahasan: e.target.value })}
                                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* MODE TAMPIL SOAL */
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs">
                                  No. {soal.nomor}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                                  {soal.bentuk}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs">
                                  {soal.levelKognitif}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-xs">
                                  {soal.tingkatKesulitan} • Skor {soal.skorMaksimal}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => startEditSoal(soal)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => deleteSoal(soal.id)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                              <strong>Elemen CP:</strong> {soal.elemenCP} &nbsp;|&nbsp; <strong>Indikator:</strong> {soal.indikatorSoal}
                            </div>

                            {soal.stimulus && (
                              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                                {soal.stimulus}
                              </div>
                            )}

                            <div className="text-sm text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                              {soal.pertanyaan}
                            </div>

                            {soal.opsi && Object.keys(soal.opsi).length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                                {Object.entries(soal.opsi).map(([k, v]) => (
                                  <div key={k} className="text-xs text-slate-700 flex items-start gap-2">
                                    <span className="font-bold text-indigo-700">{k}.</span>
                                    <span>{String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div className="text-emerald-700 font-semibold">
                                Kunci Jawaban: <span className="underline">{soal.kunciJawaban}</span>
                              </div>
                              <div className="text-slate-500 italic">{soal.pembahasan}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PRATINJAU & EKSPOR DOKUMEN */}
          {activeTab === "cetak" && (
            <div className="space-y-4">
              {/* TOOLBAR EKSPOR */}
              <div className="no-print bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="font-bold text-slate-700">Komponen Dokumen:</span>
                  {[
                    { key: "tampilkanKisiKisi", label: "Kisi-Kisi Soal" },
                    { key: "tampilkanNaskahSoal", label: "Naskah Soal Siswa" },
                    { key: "tampilkanKunciJawaban", label: "Kunci & Pembahasan" },
                    { key: "tampilkanPedomanSkor", label: "Pedoman Penilaian" }
                  ].map((opt) => (
                    <label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={printOptions[opt.key]}
                        onChange={(e) =>
                          setPrintOptions({ ...printOptions, [opt.key]: e.target.checked })
                        }
                        className="rounded text-indigo-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportWord}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Word (.doc)</span>
                  </button>
                  <button
                    onClick={handlePrintPdf}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak / Simpan PDF</span>
                  </button>
                </div>
              </div>

              {/* LEMBAR PRATINJAU DOKUMEN STANDAR RESMI */}
              <div
                id="dokumen-asesmen-cetak"
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 text-slate-900 font-serif leading-relaxed"
              >
                {/* BAGIAN A: KISI-KISI PENULISAN SOAL */}
                {printOptions.tampilkanKisiKisi && (
                  <div className="mb-10">
                    <div className="text-center border-b-2 border-black pb-3 mb-4">
                      <h2 className="text-base font-bold uppercase">
                        KISI-KISI PENULISAN SOAL {identitas.jenisAsesmen.toUpperCase()}
                      </h2>
                      <p className="text-sm font-semibold uppercase">{identitas.namaSekolah}</p>
                      <p className="text-xs">TAHUN AJARAN {identitas.tahunAjaran} • SEMESTER {identitas.semester.toUpperCase()}</p>
                    </div>

                    <table className="w-full text-xs mb-4 no-border">
                      <tbody>
                        <tr>
                          <td className="w-40 font-semibold py-0.5">Jenjang / Kelas / Fase</td>
                          <td className="py-0.5">: {JENJANG[identitas.jenjang].nama} / Kelas {identitas.kelas} / Fase {faseAktif}</td>
                          <td className="w-36 font-semibold py-0.5">Alokasi Waktu</td>
                          <td className="py-0.5">: {identitas.alokasiWaktu}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold py-0.5">Mata Pelajaran</td>
                          <td className="py-0.5">: {identitas.mapel}</td>
                          <td className="font-semibold py-0.5">Jumlah Soal</td>
                          <td className="py-0.5">: {soalList.length} Butir</td>
                        </tr>
                        <tr>
                          <td className="font-semibold py-0.5">Topik Materi</td>
                          <td colSpan={3} className="py-0.5">: {topikMateri}</td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="w-full border-collapse border border-black text-xs">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-black p-1.5 w-10 text-center">No</th>
                          <th className="border border-black p-1.5">Elemen CP</th>
                          <th className="border border-black p-1.5">Tujuan Pembelajaran / Materi</th>
                          <th className="border border-black p-1.5">Indikator Soal</th>
                          <th className="border border-black p-1.5 w-24 text-center">Level Kognitif</th>
                          <th className="border border-black p-1.5 w-20 text-center">Bentuk</th>
                          <th className="border border-black p-1.5 w-14 text-center">No. Soal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {soalList.map((s) => (
                          <tr key={s.id}>
                            <td className="border border-black p-1.5 text-center">{s.nomor}</td>
                            <td className="border border-black p-1.5">{s.elemenCP}</td>
                            <td className="border border-black p-1.5">{topikMateri}</td>
                            <td className="border border-black p-1.5">{s.indikatorSoal}</td>
                            <td className="border border-black p-1.5 text-center">{s.levelKognitif}</td>
                            <td className="border border-black p-1.5 text-center">{s.bentuk}</td>
                            <td className="border border-black p-1.5 text-center font-bold">{s.nomor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* BAGIAN B: NASKAH SOAL PESERTA DIDIK */}
                {printOptions.tampilkanNaskahSoal && (
                  <div className={printOptions.tampilkanKisiKisi ? "page-break pt-4" : ""}>
                    <div className="kop-surat text-center border-b-4 border-double border-black pb-3 mb-4">
                      <h2 className="text-base font-bold uppercase tracking-wide">{identitas.namaSekolah}</h2>
                      <p className="text-xs">{identitas.alamatSekolah}</p>
                      <h3 className="text-sm font-bold uppercase mt-2">
                        NASKAH SOAL {JENIS_ASESMEN.find((j) => j.id === identitas.jenisAsesmen)?.label || identitas.jenisAsesmen}
                      </h3>
                      <p className="text-xs font-semibold">
                        TAHUN AJARAN {identitas.tahunAjaran} — SEMESTER {identitas.semester.toUpperCase()}
                      </p>
                    </div>

                    <table className="w-full border border-black text-xs mb-5">
                      <tbody>
                        <tr>
                          <td className="border border-black p-1.5 w-1/2">
                            <strong>Mata Pelajaran:</strong> {identitas.mapel}
                          </td>
                          <td className="border border-black p-1.5 w-1/2">
                            <strong>Nama Peserta Didik:</strong> .....................................................
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-black p-1.5">
                            <strong>Kelas / Fase:</strong> {identitas.kelas} / Fase {faseAktif}
                          </td>
                          <td className="border border-black p-1.5">
                            <strong>Nomor Peserta / Absen:</strong> .............................................
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-black p-1.5">
                            <strong>Hari / Tanggal:</strong> {identitas.tanggalUjian}
                          </td>
                          <td className="border border-black p-1.5">
                            <strong>Alokasi Waktu:</strong> {identitas.alokasiWaktu}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="space-y-5 text-sm">
                      {soalList.map((s) => (
                        <div key={s.id} className="soal-box">
                          {s.stimulus && (
                            <div className="stimulus-box border border-slate-400 bg-slate-50 p-2.5 mb-2 text-xs whitespace-pre-line">
                              {s.stimulus}
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <span className="font-bold min-w-[24px]">{s.nomor}.</span>
                            <div className="flex-1">
                              <div className="whitespace-pre-line">{s.pertanyaan}</div>

                              {s.opsi && Object.keys(s.opsi).length > 0 && (
                                <div className="mt-1.5 space-y-1 pl-1">
                                  {Object.entries(s.opsi).map(([k, v]) => (
                                  <div key={k} className="flex items-start gap-2">
                                    <span className="font-semibold">{k}.</span>
                                    <span>{String(v)}</span>
                                  </div>
                                  ))}
                                </div>
                              )}

                              {(s.bentuk === "Uraian" || s.bentuk === "Isian") && (
                                <div className="mt-2 border-b border-dotted border-slate-400 h-6 w-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* BAGIAN C: KUNCI JAWABAN, PEMBAHASAN & PEDOMAN PENSKORAN */}
                {(printOptions.tampilkanKunciJawaban || printOptions.tampilkanPedomanSkor) && (
                  <div className="page-break pt-6 mt-8 border-t-2 border-dashed border-slate-300">
                    <div className="text-center border-b-2 border-black pb-2 mb-4">
                      <h2 className="text-base font-bold uppercase">
                        KUNCI JAWABAN, PEMBAHASAN, DAN PEDOMAN PENSKORAN
                      </h2>
                      <p className="text-xs">
                        {identitas.mapel} • Kelas {identitas.kelas} (Fase {faseAktif}) • {identitas.jenisAsesmen}
                      </p>
                    </div>

                    {printOptions.tampilkanKunciJawaban && (
                      <table className="w-full border-collapse border border-black text-xs mb-5">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-black p-1.5 w-12 text-center">No</th>
                            <th className="border border-black p-1.5 w-24 text-center">Bentuk</th>
                            <th className="border border-black p-1.5 w-36">Kunci Jawaban</th>
                            <th className="border border-black p-1.5">Pembahasan / Rubrik Penilaian</th>
                            <th className="border border-black p-1.5 w-16 text-center">Skor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {soalList.map((s) => (
                            <tr key={s.id}>
                              <td className="border border-black p-1.5 text-center font-bold">{s.nomor}</td>
                              <td className="border border-black p-1.5 text-center">{s.bentuk}</td>
                              <td className="border border-black p-1.5 font-bold">{s.kunciJawaban}</td>
                              <td className="border border-black p-1.5 whitespace-pre-line">{s.pembahasan}</td>
                              <td className="border border-black p-1.5 text-center">{s.skorMaksimal}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50 font-bold">
                            <td colSpan={4} className="border border-black p-1.5 text-right">
                              Total Skor Maksimal
                            </td>
                            <td className="border border-black p-1.5 text-center">{totalSkor}</td>
                          </tr>
                        </tbody>
                      </table>
                    )}

                    {printOptions.tampilkanPedomanSkor && (
                      <div className="border border-black p-3 text-xs mb-6 bg-slate-50/50">
                        <p className="font-bold mb-1">Rumus Perhitungan Nilai Akhir Peserta Didik:</p>
                        <p className="font-mono">
                          Nilai Akhir = (Jumlah Skor Perolehan ÷ {totalSkor}) × 100
                        </p>
                      </div>
                    )}

                    {/* BLOK TANDA TANGAN PENGESAHAN PERSONAL */}
                    <table className="w-full text-xs mt-8 no-border">
                      <tbody>
                        <tr>
                          <td className="w-1/2"></td>
                          <td className="w-1/2 text-center align-top">
                            <p>{identitas.tanggalUjian}</p>
                            <p>Tutor Les Private Matematika</p>
                            <div className="h-14"></div>
                            <p className="font-bold underline">{identitas.namaGuru}</p>
                            <p>{identitas.namaSekolah}</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL PENGATURAN API AI */}
      {showApiModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>Pengaturan Mesin Generator AI</span>
              </h3>
              <button onClick={() => setShowApiModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Pada lingkungan Canvas Gemini, kunci API disediakan secara otomatis. Jika Anda menjalankan aplikasi secara mandiri di luar Canvas, masukkan Google Gemini API Key di bawah ini:
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gemini API Key (Opsional)</label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Model Gemini</label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="gemini-3-flash-preview">gemini-3-flash-preview (Cepat & Direkomendasikan)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Penalaran Mendalam)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setShowApiModal(false);
                  notify("success", "Konfigurasi AI disimpan.");
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}