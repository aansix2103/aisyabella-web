import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  getIdTokenResult
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  BookOpen,
  Sparkles,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Flag,
  Play,
  GraduationCap,
  ShieldAlert,
  Menu,
  X,
  RefreshCw,
  User,
  Lock,
  Mail,
  ArrowRight,
  Printer,
  FileDown,
  Database,
  ShieldCheck,
  Terminal,
  Copy,
  Check
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// ============================================================================
// 0. INISIALISASI FIREBASE (PROYEK AI-GENERATOR-AISYABELLA)
// ============================================================================
// Konfigurasi nyata terhubung langsung ke proyek Firebase "ai-generator-aisyabella"
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA7224mD0LKU7G9i7_vwDztKnp5R91dfbc",
  authDomain: "ai-generator-aisyabella.firebaseapp.com",
  projectId: "ai-generator-aisyabella",
  storageBucket: "ai-generator-aisyabella.firebasestorage.app",
  messagingSenderId: "102803906578",
  appId: "1:102803906578:web:4ccf82d1f850fa877778cb"
};

// Prioritaskan konfigurasi proyek ai-generator-aisyabella agar tidak tertimpa sandbox Canvas
const firebaseConfig = DEFAULT_FIREBASE_CONFIG;

// Pertahankan appId Firestore aplikasi untuk path artifacts/aisyabella-tka-math/public/data/
const appId = 'aisyabella-tka-math';

let firebaseApp = null;
let auth = null;
let db = null;
let isFirebaseConfigured = false;

try {
  firebaseApp = initializeApp(firebaseConfig, 'aisyabella-main-app');
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  isFirebaseConfigured = true;
} catch (err) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    isFirebaseConfigured = true;
  } catch (e) {
    auth = getAuth();
    db = getFirestore();
    isFirebaseConfigured = Boolean(auth && db);
  }
}

// Diagnostik aman di console browser (hanya projectId dan authDomain aktif)
if (isFirebaseConfigured && firebaseApp?.options) {
  console.info('[Firebase Diagnostik AisyaBella]', {
    projectId: firebaseApp.options.projectId,
    authDomain: firebaseApp.options.authDomain,
    firestoreAppIdPath: appId
  });
}

// ============================================================================
// 1. KURIKULUM & DATA MASTER MATEMATIKA (SD, SMP, SMA)
// ============================================================================
const CURRICULUM = {
  SD: {
    label: 'Sekolah Dasar (SD)',
    kelas: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
    materi: [
      'Mengenal Angka',
      'Penjumlahan',
      'Pengurangan',
      'Perkalian',
      'Pembagian',
      'Pecahan',
      'Pengukuran',
      'Satuan Panjang, Berat, dan Waktu',
      'Bangun Datar',
      'Bangun Ruang',
      'Keliling dan Luas',
      'Soal Cerita'
    ]
  },
  SMP: {
    label: 'Sekolah Menengah Pertama (SMP)',
    kelas: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
    materi: [
      'Bilangan Bulat',
      'Pecahan dan Desimal',
      'Rasio dan Perbandingan',
      'Aljabar',
      'Persamaan Linear',
      'Himpunan',
      'Aritmetika Sosial',
      'Teorema Pythagoras',
      'Bangun Ruang',
      'Statistika',
      'Peluang',
      'Fungsi'
    ]
  },
  SMA: {
    label: 'Sekolah Menengah Atas (SMA)',
    kelas: ['Kelas 10', 'Kelas 11', 'Kelas 12'],
    materi: [
      'Eksponen',
      'Logaritma',
      'Persamaan dan Pertidaksamaan',
      'Fungsi',
      'Barisan dan Deret',
      'Trigonometri',
      'Matriks',
      'Limit',
      'Turunan',
      'Integral',
      'Statistika',
      'Peluang',
      'Geometri Analitik'
    ]
  }
};

const QUESTION_TYPES = [
  'Pilihan Ganda',
  'Pilihan Ganda Kompleks',
  'Isian Singkat',
  'Benar atau Salah'
];

const DIFFICULTIES = ['Mudah', 'Sedang', 'Sulit'];

// ============================================================================
// 2. DOKUMENTASI ARSITEKTUR BACKEND (SECURITY RULES, ADMIN SDK, CLOUD FUNCTIONS)
// ============================================================================

const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    // Role admin diverifikasi melalui Custom Claims atau dokumen role tepercaya
    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.role == 'admin' ||
        get(/databases/$(database)/documents/artifacts/$(appId)/public/data/users/$(request.auth.uid)).data.role == 'admin'
      );
    }

    match /artifacts/{appId}/public/data/users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      // Registrasi publik HANYA boleh membuat role 'siswa'
      allow create: if isSignedIn()
        && request.auth.uid == userId
        && request.resource.data.role == 'siswa';
      // Siswa dilarang mengubah field 'role'
      allow update: if isSignedIn()
        && request.auth.uid == userId
        && request.resource.data.role == resource.data.role;
      allow delete: if isAdmin();
    }

    match /artifacts/{appId}/public/data/questionBank/{questionId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isAdmin();
    }

    match /artifacts/{appId}/public/data/exercises/{exerciseId} {
      allow read: if isSignedIn() && (resource.data.status == 'published' || isAdmin());
      allow create, update, delete: if isAdmin();
    }

    match /artifacts/{appId}/public/data/attempts/{attemptId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      // Nilai yang sudah dinilai tidak dapat dimanipulasi siswa
      allow update, delete: if isAdmin();
    }

    match /artifacts/{appId}/public/data/activityLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isSignedIn();
    }
  }
}`;

const ADMIN_PROVISIONING_SNIPPET = `// scripts/setAdminClaim.js (Jalankan sekali di server / terminal lokal aman)
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function provisionAdmin(email, name = 'AisyaBella') {
  const user = await admin.auth().getUserByEmail(email);
  // 1. Set Custom Claims 'admin' pada Firebase Auth Token
  await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
  // 2. Sinkronkan dokumen profil admin di Firestore
  await admin.firestore()
    .doc(\`artifacts/aisyabella-tka-math/public/data/users/\${user.uid}\`)
    .set({
      uid: user.uid,
      name,
      email,
      role: 'admin',
      jenjang: 'Semua Jenjang',
      kelas: 'Administrator',
      isActive: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  console.log(\`Sukses! \${email} resmi menjadi Admin AisyaBella.\`);
}

provisionAdmin('aisyabella@admin.edu');`;

const CLOUD_FUNCTIONS_SNIPPET = `// functions/index.js (Firebase Cloud Functions - Backend Gemini API & Penilaian)
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
admin.initializeApp();

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

// 1. Generate Soal AI (Khusus Admin AisyaBella)
exports.generateMathQuestions = onCall({ secrets: [GEMINI_API_KEY] }, async (request) => {
  if (!request.auth || request.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Hanya Admin AisyaBella yang dapat mengakses AI Generator.');
  }
  const { jenjang, kelas, materi, difficulty, count, type } = request.data;
  const response = await fetch(
    \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${GEMINI_API_KEY.value()}\`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: \`Buat \${count} soal matematika \${jenjang} \${kelas} materi \${materi} tingkat \${difficulty} tipe \${type} dalam format JSON array.\` }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    }
  );
  return await response.json();
});

// 2. Penilaian Otomatis Tepercaya di Server
exports.submitAndGradeAttempt = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Login diperlukan.');
  const { exerciseId, answers, startedAtMs } = request.data;
  // Validasi durasi menggunakan waktu server & hitung skor dari kunci jawaban server
  const db = admin.firestore();
  const exSnap = await db.doc(\`artifacts/aisyabella-tka-math/public/data/exercises/\${exerciseId}\`).get();
  const exercise = exSnap.data();
  let correctCount = 0;
  for (const qId of exercise.questionIds) {
    const qSnap = await db.doc(\`artifacts/aisyabella-tka-math/public/data/questionBank/\${qId}\`).get();
    if (qSnap.exists && (answers[qId] || '').trim().toLowerCase() === qSnap.data().correctAnswer.trim().toLowerCase()) {
      correctCount++;
    }
  }
  const score = Math.round((correctCount / exercise.questionIds.length) * 100);
  const attemptRef = await db.collection('artifacts/aisyabella-tka-math/public/data/attempts').add({
    userId: request.auth.uid,
    exerciseId,
    answers,
    score,
    correctCount,
    totalQuestions: exercise.questionIds.length,
    submittedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { attemptId: attemptRef.id, score, correctCount };
});`;

// ============================================================================
// 3. AUTH CONTEXT & PROTECTED ROUTE (SESUAI ARSITEKTUR FIREBASE)
// ============================================================================

const AuthContext = createContext(null);

function useAuth() {
  return useContext(AuthContext);
}

function ProtectedRoute({ allowedRole, children, onUnauthorized }) {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-pink-600">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <p className="text-sm font-bold">Memverifikasi sesi Firebase...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 text-center max-w-md mx-auto my-12 shadow-lg">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-extrabold text-slate-800">Akses Ditolak (403)</h2>
        <p className="text-sm text-slate-600 mt-1 mb-5">
          Halaman ini dilindungi oleh <strong>ProtectedRoute</strong> khusus untuk role{' '}
          <code className="px-1.5 py-0.5 bg-pink-50 text-pink-700 rounded">{allowedRole}</code>.
        </p>
        <button
          onClick={onUnauthorized}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm"
        >
          Kembali ke Dashboard Anda
        </button>
      </div>
    );
  }

  return children;
}

// ============================================================================
// 4. HELPER ANALISIS BELAJAR, EXPORT PDF & AI GENERATOR
// ============================================================================

function getScoreCategory(score) {
  if (score >= 90) {
    return {
      label: 'Sangat Baik',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      motivation:
        'Luar biasa! Pemahaman konsep matematikamu sangat matang. Pertahankan konsistensi dan coba tantangan tingkat lanjut!'
    };
  }
  if (score >= 80) {
    return {
      label: 'Baik',
      color: 'text-pink-600 bg-pink-50 border-pink-200',
      motivation:
        'Hebat! Kamu sudah menguasai sebagian besar materi. Tinjau kembali satu atau dua soal yang keliru agar semakin sempurna.'
    };
  }
  if (score >= 70) {
    return {
      label: 'Cukup',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      motivation:
        'Bagus! Dasar pemahamanmu sudah terbentuk. Perbanyak latihan soal bertahap untuk meningkatkan ketelitian berhitung.'
    };
  }
  if (score >= 60) {
    return {
      label: 'Perlu Latihan',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      motivation:
        'Jangan menyerah! Fokus pelajari kembali rumus dasar dan pembahasan langkah demi langkah di bawah ini.'
    };
  }
  return {
    label: 'Perlu Bimbingan',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    motivation:
      'Setiap ahli matematika memulai dari langkah pertama. Pelajari pembahasan dengan tenang dan mulai dari tingkat kesulitan Mudah.'
  };
}

function exportQuestionsToPDF({ title, subtitle, questions, includeAnswers = false }) {
  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (!printWindow) return false;

  const esc = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const questionHtml = questions
    .map((q, idx) => {
      const optionsHtml =
        q.options && q.options.length > 0
          ? `<div style="margin-top:8px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              ${q.options
                .map(
                  (opt, i) => `
                  <div style="padding:6px 10px; border:1px solid #fbcfe8; border-radius:6px; font-size:13px;">
                    <strong>${String.fromCharCode(65 + i)}.</strong> ${esc(opt)}
                  </div>`
                )
                .join('')}
            </div>`
          : `<div style="margin-top:8px; font-style:italic; color:#64748b; font-size:13px;">Jawaban: ........................................................................</div>`;

      const answerSection = includeAnswers
        ? `<div style="margin-top:10px; padding:10px 12px; background:#fdf2f8; border-left:4px solid #ec4899; border-radius:6px; font-size:13px;">
            <div style="color:#be185d; font-weight:bold; margin-bottom:4px;">Kunci Jawaban: ${esc(q.correctAnswer)}</div>
            <div style="color:#334155; white-space:pre-line;"><strong>Pembahasan:</strong>\n${esc(q.explanation)}</div>
          </div>`
        : '';

      return `
        <div style="margin-bottom:18px; padding:14px; border:1px solid #f1f5f9; border-radius:10px; page-break-inside:avoid;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; margin-bottom:6px;">
            <span><strong>Soal No. ${idx + 1}</strong> • ${esc(q.jenjang)} ${esc(q.kelas)} (${esc(q.materi)})</span>
            <span>Tingkat: ${esc(q.difficulty)}</span>
          </div>
          <div style="font-size:14px; color:#0f172a; font-weight:500; line-height:1.5;">
            ${esc(q.question)}
          </div>
          ${optionsHtml}
          ${answerSection}
        </div>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>${esc(title)} - AI Generator AisyaBella</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 28px; max-width: 820px; margin: 0 auto; }
        .header { border-bottom: 3px solid #ec4899; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .brand { color: #ec4899; font-size: 13px; font-weight: 800; text-transform: uppercase; }
        h1 { margin: 4px 0; font-size: 20px; color: #0f172a; }
        .meta { font-size: 12px; color: #64748b; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">AI Generator AisyaBella • Platform TKA Matematika</div>
          <h1>${esc(title)}</h1>
          <div class="meta">${esc(subtitle)} • Total: ${questions.length} Soal</div>
        </div>
        <div style="text-align:right; font-size:11px; color:#64748b;">
          <div>Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}</div>
          <div>Mode: ${includeAnswers ? 'Soal + Kunci & Pembahasan' : 'Lembar Soal Siswa'}</div>
        </div>
      </div>
      ${questionHtml}
      <script>
        window.onload = function() { setTimeout(function() { window.print(); }, 300); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  return true;
}

async function generateMathQuestionsWithAI(config) {
  const { jenjang, kelas, materi, submateri, difficulty, count, type, abilityLevel } = config;

  const prompt = `Buatkan tepat ${count} soal Tes Kemampuan Akademik (TKA) Matematika dalam Bahasa Indonesia yang akurat secara matematis untuk siswa ${jenjang} ${kelas}.
Detail spesifikasi:
- Materi Utama: ${materi}
- Submateri: ${submateri || materi}
- Tingkat Kesulitan: ${difficulty}
- Tingkat Kemampuan Kognitif: ${abilityLevel || 'Menengah'}
- Jenis Soal: ${type}

Aturan WAJIB:
1. Tingkat kesulitan dan bahasa HARUS sesuai usia siswa ${jenjang} ${kelas}.
2. Jika Jenis Soal adalah "Pilihan Ganda" atau "Pilihan Ganda Kompleks", sediakan tepat 4 opsi jawaban pada array "options" dan "correctAnswer" HARUS sama persis dengan salah satu isi di "options".
3. Jika Jenis Soal adalah "Benar atau Salah", sediakan "options": ["Benar", "Salah"] dan "correctAnswer" bernilai "Benar" atau "Salah".
4. Jika Jenis Soal adalah "Isian Singkat", kosongkan "options": [] dan isi "correctAnswer" dengan jawaban singkat yang pasti.
5. Sertakan "explanation" berupa pembahasan langkah demi langkah.`;

  const apiKey = "";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING' },
            options: { type: 'ARRAY', items: { type: 'STRING' } },
            correctAnswer: { type: 'STRING' },
            explanation: { type: 'STRING' }
          },
          required: ['question', 'options', 'correctAnswer', 'explanation']
        }
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => ({
            tempId: `AI-${Date.now()}-${idx + 1}`,
            jenjang,
            kelas,
            materi,
            submateri: submateri || materi,
            difficulty,
            type,
            question: item.question,
            options:
              type === 'Isian Singkat'
                ? []
                : type === 'Benar atau Salah'
                ? ['Benar', 'Salah']
                : Array.isArray(item.options) && item.options.length >= 2
                ? item.options.slice(0, 4)
                : ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
            correctAnswer: item.correctAnswer,
            explanation: item.explanation,
            source: 'AI Generator AisyaBella'
          }));
        }
      }
    }
  } catch (err) {
    // Fallback generator jika jaringan/API belum aktif
  }

  const generated = [];
  for (let i = 0; i < count; i++) {
    const numA = (i + 2) * (jenjang === 'SD' ? 3 : jenjang === 'SMP' ? 5 : 7);
    const numB = (i + 1) * (jenjang === 'SD' ? 2 : 4);
    let questionText = '';
    let correct = '';
    let opts = [];
    let expl = '';

    if (jenjang === 'SD') {
      const hasil = numA + numB;
      questionText = `[${materi} - ${kelas}] Ani memiliki ${numA} kelereng berwarna pink, kemudian ia diberi lagi ${numB} kelereng oleh kakaknya. Berapa jumlah seluruh kelereng Ani sekarang?`;
      correct = `${hasil} kelereng`;
      opts = [
        `${hasil} kelereng`,
        `${hasil + 2} kelereng`,
        `${Math.max(1, hasil - 3)} kelereng`,
        `${hasil + 5} kelereng`
      ];
      expl = `Langkah 1: Jumlah awal = ${numA}.\nLangkah 2: Tambahan = ${numB}.\nLangkah 3: Total = ${numA} + ${numB} = ${hasil} kelereng.`;
    } else if (jenjang === 'SMP') {
      const xVal = i + 3;
      const rhs = 2 * xVal + numB;
      questionText = `[${materi} - ${kelas}] Tentukan nilai x yang memenuhi persamaan linear 2x + ${numB} = ${rhs}.`;
      correct = `x = ${xVal}`;
      opts = [
        `x = ${xVal}`,
        `x = ${xVal + 2}`,
        `x = ${xVal + 4}`,
        `x = ${Math.max(1, xVal - 1)}`
      ];
      expl = `Langkah 1: Kurangi kedua ruas dengan ${numB}: 2x = ${rhs - numB}.\nLangkah 2: Bagi 2: x = ${xVal}.`;
    } else {
      const p = i + 2;
      const valAt2 = 3 * p * 2 - 4;
      questionText = `[${materi} - ${kelas}] Diketahui fungsi f(x) = ${3 * p}x - 4. Tentukan nilai dari f(2) + ${numB}.`;
      correct = `${valAt2 + numB}`;
      opts = [
        `${valAt2 + numB}`,
        `${valAt2 + numB + 3}`,
        `${valAt2}`,
        `${valAt2 + numB - 2}`
      ];
      expl = `Langkah 1: f(2) = ${3 * p}(2) - 4 = ${valAt2}.\nLangkah 2: ${valAt2} + ${numB} = ${valAt2 + numB}.`;
    }

    if (type === 'Benar atau Salah') {
      opts = ['Benar', 'Salah'];
      questionText = `Pernyataan (${materi} - ${kelas}): Hasil dari "${questionText}" adalah ${correct}. Apakah pernyataan ini benar?`;
      correct = 'Benar';
    } else if (type === 'Isian Singkat') {
      opts = [];
    }

    generated.push({
      tempId: `AI-${Date.now()}-${i + 1}`,
      jenjang,
      kelas,
      materi,
      submateri: submateri || materi,
      difficulty,
      type,
      question: questionText,
      options: opts,
      correctAnswer: correct,
      explanation: expl,
      source: 'AI Generator AisyaBella'
    });
  }

  return generated;
}

// ============================================================================
// 5. KOMPONEN UTAMA APLIKASI (FIREBASE AUTH + REALTIME CLOUD FIRESTORE)
// ============================================================================

export default function App() {
  // --- STATE AUTH & PROFILE ---
  const [firebaseAuthUser, setFirebaseAuthUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- STATE REALTIME FIRESTORE COLLECTIONS ---
  const [usersList, setUsersList] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [dbLoading, setDbLoading] = useState(false);

  // --- STATE NOTIFIKASI TOAST ---
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- STATE FORM AUTH ---
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    jenjang: 'SMP',
    kelas: 'Kelas 7'
  });
  const [forgotEmail, setForgotEmail] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // --- STATE BANK SOAL ADMIN ---
  const [qSearch, setQSearch] = useState('');
  const [qFilterJenjang, setQFilterJenjang] = useState('Semua');
  const [qFilterKelas, setQFilterKelas] = useState('Semua');
  const [qFilterDifficulty, setQFilterDifficulty] = useState('Semua');
  const [qFilterType, setQFilterType] = useState('Semua');
  const [qPage, setQPage] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // --- STATE AI GENERATOR (KHUSUS ADMIN AISYABELLA) ---
  const [aiForm, setAiForm] = useState({
    jenjang: 'SMP',
    kelas: 'Kelas 7',
    materi: 'Aljabar',
    submateri: '',
    difficulty: 'Sedang',
    count: 5,
    type: 'Pilihan Ganda',
    abilityLevel: 'Menengah'
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([]);
  const [selectedAiIds, setSelectedAiIds] = useState([]);
  const [editingAiQuestion, setEditingAiQuestion] = useState(null);

  // --- STATE PAKET LATIHAN ADMIN ---
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({
    title: '',
    description: '',
    jenjang: 'SMP',
    kelas: 'Kelas 7',
    materi: 'Aljabar',
    duration: 20,
    difficulty: 'Sedang',
    status: 'published',
    questionIds: []
  });

  // --- STATE PENGERJAAN LATIHAN & TIMER SERVER ---
  const [activeExercise, setActiveExercise] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [exerciseEndTimestamp, setExerciseEndTimestamp] = useState(null);
  const [exerciseStartTimestamp, setExerciseStartTimestamp] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestAttemptResult, setLatestAttemptResult] = useState(null);

  // --- STATE FILTER RIWAYAT SISWA & COPY SNIPPET ---
  const [historyFilterJenjang, setHistoryFilterJenjang] = useState('Semua');
  const [copiedKey, setCopiedKey] = useState('');

  // ============================================================================
  // HELPER COLLECTION PATHS (STRICT RULE 1: /artifacts/{appId}/public/data/...)
  // ============================================================================
  const getColRef = (colName) => collection(db, 'artifacts', appId, 'public', 'data', colName);
  const getDocRef = (colName, docId) => doc(db, 'artifacts', appId, 'public', 'data', colName, docId);

  const logActivityToFirestore = async (userId, activity, description) => {
    if (!isFirebaseConfigured || !db) return;
    try {
      await addDoc(getColRef('activityLogs'), {
        userId,
        activity,
        description,
        createdAt: new Date().toISOString(),
        serverTs: serverTimestamp()
      });
    } catch (e) {
      // Abaikan error log non-kritikal
    }
  };

  // ============================================================================
  // EFFECT 1: INISIALISASI FIREBASE AUTH & LISTENER SESI
  // ============================================================================
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthLoading(false);
      return;
    }

    // Tidak menjalankan signInWithCustomToken milik sandbox Canvas agar tidak bentrok dengan proyek ai-generator-aisyabella
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseAuthUser(fbUser);
      if (!fbUser || fbUser.isAnonymous) {
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        // Verifikasi Firebase Authentication Custom Claims (role admin)
        const tokenResult = await getIdTokenResult(fbUser, true);
        const isClaimAdmin = tokenResult?.claims?.role === 'admin';

        const userSnap = await getDoc(getDocRef('users', fbUser.uid));
        if (userSnap.exists()) {
          const docData = userSnap.data();
          const resolvedRole = isClaimAdmin ? 'admin' : (docData.role === 'admin' ? 'admin' : 'siswa');
          const profile = { uid: fbUser.uid, ...docData, role: resolvedRole };
          setCurrentUser(profile);
          if (currentView === 'login' || currentView === 'register') {
            setCurrentView(resolvedRole === 'admin' ? 'admin-dashboard' : 'student-dashboard');
          }
        } else {
          // Jika profil belum ada di Firestore, tentukan role HANYA berdasarkan Custom Claims (default: 'siswa')
          const resolvedRole = isClaimAdmin ? 'admin' : 'siswa';
          const newProfile = {
            uid: fbUser.uid,
            name: fbUser.displayName || (resolvedRole === 'admin' ? 'AisyaBella' : fbUser.email.split('@')[0]),
            email: fbUser.email,
            role: resolvedRole,
            jenjang: resolvedRole === 'admin' ? 'Semua Jenjang' : 'SMP',
            kelas: resolvedRole === 'admin' ? 'Administrator' : 'Kelas 7',
            isActive: true,
            createdAt: new Date().toISOString()
          };
          await setDoc(getDocRef('users', fbUser.uid), newProfile);
          setCurrentUser(newProfile);
          setCurrentView(resolvedRole === 'admin' ? 'admin-dashboard' : 'student-dashboard');
        }
      } catch (err) {
        showToast('Gagal memuat profil pengguna dari Firestore.', 'error');
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ============================================================================
  // EFFECT 2: REAL-TIME FIRESTORE LISTENERS (GUARDED BY currentUser)
  // ============================================================================
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !currentUser) return;

    setDbLoading(true);

    // 1. Listener Bank Soal
    const unsubQuestions = onSnapshot(
      getColRef('questionBank'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setQuestions(list);
        setDbLoading(false);
      },
      () => {
        setDbLoading(false);
      }
    );

    // 2. Listener Paket Latihan
    const unsubExercises = onSnapshot(
      getColRef('exercises'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setExercises(list);
      },
      () => {}
    );

    // 3. Listener Riwayat & Hasil Latihan (Difilter di memori sesuai RULE 2)
    const unsubAttempts = onSnapshot(
      getColRef('attempts'),
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        all.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
        if (currentUser.role === 'admin') {
          setAttempts(all);
        } else {
          setAttempts(all.filter((a) => a.userId === currentUser.uid));
        }
      },
      () => {}
    );

    // 4. Listener Daftar Siswa & Activity Logs (Khusus Admin)
    let unsubUsers = () => {};
    let unsubLogs = () => {};
    if (currentUser.role === 'admin') {
      unsubUsers = onSnapshot(
        getColRef('users'),
        (snap) => {
          setUsersList(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
        },
        () => {}
      );

      unsubLogs = onSnapshot(
        getColRef('activityLogs'),
        (snap) => {
          const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          logs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setActivityLogs(logs);
        },
        () => {}
      );
    }

    return () => {
      unsubQuestions();
      unsubExercises();
      unsubAttempts();
      unsubUsers();
      unsubLogs();
    };
  }, [currentUser]);

  // ============================================================================
  // NAVIGASI DENGAN PROTEKSI ROLE KETAT
  // ============================================================================
  const navigateTo = (view) => {
    const adminViews = [
      'admin-dashboard',
      'admin-bank-soal',
      'admin-ai-generator',
      'admin-paket-latihan',
      'admin-data-siswa',
      'admin-hasil-latihan',
      'admin-statistik',
      'admin-pengaturan'
    ];
    const studentViews = [
      'student-dashboard',
      'student-latihan-list',
      'student-riwayat',
      'student-perkembangan',
      'student-profil',
      'take-exercise',
      'exercise-result'
    ];

    if (adminViews.includes(view)) {
      if (!currentUser) {
        setCurrentView('login');
        return;
      }
      if (currentUser.role !== 'admin') {
        setCurrentView('access-denied');
        showToast('Akses ditolak! Halaman ini khusus untuk Admin AisyaBella.', 'error');
        return;
      }
    }

    if (studentViews.includes(view)) {
      if (!currentUser) {
        setCurrentView('login');
        return;
      }
      if (currentUser.role !== 'siswa') {
        setCurrentView('admin-dashboard');
        return;
      }
    }

    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================================
  // COUNTDOWN TIMER KONSISTEN BERBASIS TIMESTAMP (TAHAN REFRESH)
  // ============================================================================
  useEffect(() => {
    if (currentView !== 'take-exercise' || !activeExercise || !exerciseEndTimestamp) return;

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.floor((exerciseEndTimestamp - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);
      if (remaining <= 0) {
        localStorage.removeItem(`active_attempt_${currentUser?.uid}`);
        handleFinalSubmitExercise(true);
      }
    };

    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);
    return () => clearInterval(timer);
  }, [currentView, activeExercise, exerciseEndTimestamp]);

  // Simpan progres jawaban sementara di cache lokal selama ujian berlangsung
  useEffect(() => {
    if (currentView === 'take-exercise' && activeExercise && currentUser) {
      localStorage.setItem(
        `active_attempt_${currentUser.uid}`,
        JSON.stringify({
          exerciseId: activeExercise.id,
          endTimestamp: exerciseEndTimestamp,
          startTimestamp: exerciseStartTimestamp,
          answers: userAnswers
        })
      );
    }
  }, [userAnswers, currentView, activeExercise, exerciseEndTimestamp]);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ============================================================================
  // HANDLER FIREBASE AUTHENTICATION (LOGIN, REGISTER, FORGOT, LOGOUT)
  // ============================================================================

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!isFirebaseConfigured || !auth) {
      showToast('Konfigurasi Firebase belum diisi. Silakan isi firebaseConfig terlebih dahulu.', 'error');
      return;
    }

    setAuthSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        loginForm.email.trim(),
        loginForm.password
      );
      await logActivityToFirestore(
        cred.user.uid,
        'Login Firebase Auth',
        `${cred.user.email} berhasil login ke sistem.`
      );
      showToast('Login berhasil! Memuat dashboard...');
    } catch (err) {
      let msg = 'Email atau password salah.';
      if (err.code === 'auth/user-not-found') msg = 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential')
        msg = 'Email atau password tidak sesuai.';
      if (err.code === 'auth/too-many-requests')
        msg = 'Terlalu banyak percobaan login. Coba beberapa saat lagi.';
      showToast(msg, 'error');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!isFirebaseConfigured || !auth || !db) {
      showToast('Konfigurasi Firebase belum diisi.', 'error');
      return;
    }
    if (!registerForm.name.trim()) {
      showToast('Nama lengkap wajib diisi.', 'error');
      return;
    }
    if (registerForm.password.length < 6) {
      showToast('Password minimal 6 karakter.', 'error');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      showToast('Konfirmasi password tidak cocok.', 'error');
      return;
    }

    setAuthSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        registerForm.email.trim(),
        registerForm.password
      );

      // KEAMANAN: Setiap registrasi publik OTOMATIS mendapatkan role 'siswa'
      const studentDoc = {
        uid: cred.user.uid,
        name: registerForm.name.trim(),
        email: registerForm.email.trim().toLowerCase(),
        role: 'siswa',
        jenjang: registerForm.jenjang,
        kelas: registerForm.kelas,
        isActive: true,
        createdAt: new Date().toISOString(),
        serverCreatedAt: serverTimestamp()
      };

      await setDoc(getDocRef('users', cred.user.uid), studentDoc);
      await logActivityToFirestore(
        cred.user.uid,
        'Registrasi Siswa Baru',
        `${studentDoc.name} mendaftar sebagai siswa ${studentDoc.jenjang} ${studentDoc.kelas}.`
      );
      setCurrentUser(studentDoc);
      setCurrentView('student-dashboard');
      showToast(`Selamat datang di AisyaBella, ${studentDoc.name}!`);
    } catch (err) {
      let msg = 'Gagal membuat akun.';
      if (err.code === 'auth/email-already-in-use') msg = 'Email sudah terdaftar. Silakan login.';
      if (err.code === 'auth/weak-password') msg = 'Password terlalu lemah (minimal 6 karakter).';
      showToast(msg, 'error');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!isFirebaseConfigured || !auth) return;
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      showToast(`Email reset password telah dikirim ke ${forgotEmail}`);
      setCurrentView('login');
    } catch (err) {
      showToast('Gagal mengirim email reset password. Pastikan email terdaftar.', 'error');
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      await logActivityToFirestore(currentUser.uid, 'Logout', `${currentUser.name} keluar dari sesi.`);
    }
    if (auth) await signOut(auth);
    setCurrentUser(null);
    setCurrentView('login');
    showToast('Anda telah logout.');
  };

  // ============================================================================
  // HANDLER CRUD BANK SOAL FIRESTORE (KHUSUS ADMIN)
  // ============================================================================

  const openNewQuestionModal = () => {
    setEditingQuestion({
      id: null,
      jenjang: 'SMP',
      kelas: 'Kelas 7',
      materi: 'Aljabar',
      submateri: '',
      difficulty: 'Sedang',
      type: 'Pilihan Ganda',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      source: 'Input Manual Admin'
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') return;
    if (!editingQuestion.question.trim() || !editingQuestion.correctAnswer.trim()) {
      showToast('Pertanyaan dan kunci jawaban wajib diisi!', 'error');
      return;
    }

    try {
      const payload = {
        jenjang: editingQuestion.jenjang,
        kelas: editingQuestion.kelas,
        materi: editingQuestion.materi,
        submateri: editingQuestion.submateri || editingQuestion.materi,
        difficulty: editingQuestion.difficulty,
        type: editingQuestion.type,
        question: editingQuestion.question.trim(),
        options: editingQuestion.type === 'Isian Singkat' ? [] : editingQuestion.options,
        correctAnswer: editingQuestion.correctAnswer.trim(),
        explanation: editingQuestion.explanation.trim(),
        source: editingQuestion.source || 'Input Manual Admin',
        createdBy: currentUser.name,
        updatedAt: new Date().toISOString()
      };

      if (editingQuestion.id) {
        await updateDoc(getDocRef('questionBank', editingQuestion.id), payload);
        showToast('Soal berhasil diperbarui di Cloud Firestore!');
      } else {
        await addDoc(getColRef('questionBank'), {
          ...payload,
          createdAt: new Date().toISOString(),
          serverCreatedAt: serverTimestamp()
        });
        showToast('Soal baru berhasil disimpan ke Cloud Firestore!');
      }

      await logActivityToFirestore(
        currentUser.uid,
        'Kelola Bank Soal',
        `Admin ${currentUser.name} menyimpan soal ${payload.jenjang} (${payload.materi}).`
      );
      setShowQuestionModal(false);
      setEditingQuestion(null);
    } catch (err) {
      showToast('Gagal menyimpan soal ke Firestore. Periksa Security Rules.', 'error');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (currentUser?.role !== 'admin') return;
    try {
      await deleteDoc(getDocRef('questionBank', id));
      showToast('Soal berhasil dihapus dari Firestore.');
    } catch (err) {
      showToast('Gagal menghapus soal.', 'error');
    }
  };

  // ============================================================================
  // HANDLER AI GENERATOR SOAL (KHUSUS ADMIN AISYABELLA)
  // ============================================================================

  const handleRunAiGenerator = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') {
      showToast('Hanya Admin AisyaBella yang dapat mengakses AI Generator Soal.', 'error');
      return;
    }

    setAiGenerating(true);
    setAiGeneratedQuestions([]);
    setSelectedAiIds([]);

    try {
      const results = await generateMathQuestionsWithAI(aiForm);
      setAiGeneratedQuestions(results);
      setSelectedAiIds(results.map((r) => r.tempId));
      showToast(`AI berhasil membuat ${results.length} soal ${aiForm.jenjang} ${aiForm.kelas}!`);
    } catch (err) {
      showToast('Terjadi kendala saat menghasilkan soal AI.', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveAiToGlobalBank = async () => {
    if (currentUser?.role !== 'admin') return;
    const chosen = aiGeneratedQuestions.filter((q) => selectedAiIds.includes(q.tempId));
    if (chosen.length === 0) {
      showToast('Pilih minimal 1 soal untuk disimpan ke Bank Soal.', 'error');
      return;
    }

    try {
      for (const item of chosen) {
        const { tempId, ...cleanData } = item;
        await addDoc(getColRef('questionBank'), {
          ...cleanData,
          createdBy: currentUser.name,
          source: 'AI Generator AisyaBella',
          createdAt: new Date().toISOString(),
          serverCreatedAt: serverTimestamp()
        });
      }
      await logActivityToFirestore(
        currentUser.uid,
        'Simpan Hasil AI',
        `Admin menyimpan ${chosen.length} soal hasil AI ke Bank Soal Firestore.`
      );
      showToast(`${chosen.length} soal AI berhasil disimpan ke Firestore!`);
    } catch (err) {
      showToast('Gagal menyimpan soal AI ke Firestore.', 'error');
    }
  };

  // ============================================================================
  // HANDLER PAKET LATIHAN FIRESTORE (KHUSUS ADMIN)
  // ============================================================================

  const openNewPackageModal = () => {
    setEditingPackage(null);
    setPackageForm({
      title: '',
      description: '',
      jenjang: 'SMP',
      kelas: 'Kelas 7',
      materi: 'Aljabar',
      duration: 20,
      difficulty: 'Sedang',
      status: 'published',
      questionIds: []
    });
    setShowPackageModal(true);
  };

  const openEditPackageModal = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      title: pkg.title,
      description: pkg.description,
      jenjang: pkg.jenjang,
      kelas: pkg.kelas,
      materi: pkg.materi,
      duration: pkg.duration,
      difficulty: pkg.difficulty,
      status: pkg.status,
      questionIds: pkg.questionIds || []
    });
    setShowPackageModal(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') return;
    if (!packageForm.title.trim() || packageForm.questionIds.length === 0) {
      showToast('Judul paket dan minimal 1 butir soal wajib diisi!', 'error');
      return;
    }

    try {
      const payload = {
        ...packageForm,
        ownerId: currentUser.uid,
        createdByRole: 'admin',
        visibility: 'public',
        updatedAt: new Date().toISOString()
      };

      if (editingPackage) {
        await updateDoc(getDocRef('exercises', editingPackage.id), payload);
        showToast('Paket latihan diperbarui di Firestore!');
      } else {
        await addDoc(getColRef('exercises'), {
          ...payload,
          createdAt: new Date().toISOString(),
          publishedAt: packageForm.status === 'published' ? new Date().toISOString() : null,
          serverCreatedAt: serverTimestamp()
        });
        showToast('Paket latihan baru berhasil diterbitkan ke Firestore!');
      }
      setShowPackageModal(false);
    } catch (err) {
      showToast('Gagal menyimpan paket latihan ke Firestore.', 'error');
    }
  };

  // ============================================================================
  // HANDLER PENGERJAAN & PENILAIAN LATIHAN SISWA (TERSIMPAN KE FIRESTORE)
  // ============================================================================

  const handleStartExercise = (exercise) => {
    const qList = (exercise.questionIds || [])
      .map((id) => questions.find((q) => q.id === id))
      .filter(Boolean);

    if (qList.length === 0) {
      showToast('Paket latihan ini belum memiliki butir soal aktif.', 'error');
      return;
    }

    const now = Date.now();
    const durationMs = (exercise.duration || 15) * 60 * 1000;
    let endTs = now + durationMs;
    let startTs = now;
    let savedAnswers = {};

    // Cek apakah siswa sempat me-refresh halaman saat ujian ini masih aktif
    try {
      const cached = JSON.parse(localStorage.getItem(`active_attempt_${currentUser.uid}`) || 'null');
      if (cached && cached.exerciseId === exercise.id && cached.endTimestamp > now) {
        endTs = cached.endTimestamp;
        startTs = cached.startTimestamp || now;
        savedAnswers = cached.answers || {};
        showToast('Melanjutkan sesi ujian yang sedang berjalan...');
      }
    } catch (e) {}

    setActiveExercise(exercise);
    setActiveQuestions(qList);
    setCurrentQuestionIdx(0);
    setUserAnswers(savedAnswers);
    setFlaggedQuestions({});
    setExerciseStartTimestamp(startTs);
    setExerciseEndTimestamp(endTs);
    setTimeLeftSeconds(Math.max(1, Math.floor((endTs - now) / 1000)));
    setIsSubmitting(false);
    setShowSubmitConfirm(false);
    setCurrentView('take-exercise');
  };

  const handleFinalSubmitExercise = async (autoTimeout = false) => {
    if (isSubmitting || !activeExercise || !currentUser) return;
    setIsSubmitting(true);
    setShowSubmitConfirm(false);
    localStorage.removeItem(`active_attempt_${currentUser.uid}`);

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    activeQuestions.forEach((q) => {
      const ans = (userAnswers[q.id] || '').trim();
      if (!ans) {
        unansweredCount++;
      } else if (ans.toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const total = activeQuestions.length;
    const score = Math.round((correctCount / total) * 100);
    const durationUsed = Math.max(1, Math.round((Date.now() - (exerciseStartTimestamp || Date.now())) / 1000));

    const attemptPayload = {
      userId: currentUser.uid,
      studentName: currentUser.name,
      exerciseId: activeExercise.id,
      exerciseTitle: activeExercise.title,
      jenjang: activeExercise.jenjang,
      materi: activeExercise.materi,
      answers: { ...userAnswers },
      questionSnapshot: activeQuestions,
      score,
      totalQuestions: total,
      correctCount,
      wrongCount,
      unansweredCount,
      durationUsed,
      submittedAt: new Date().toISOString(),
      serverSubmittedAt: serverTimestamp(),
      status: 'completed'
    };

    try {
      const docRef = await addDoc(getColRef('attempts'), attemptPayload);
      setLatestAttemptResult({ id: docRef.id, ...attemptPayload });
      await logActivityToFirestore(
        currentUser.uid,
        'Selesai Latihan',
        `${currentUser.name} menyelesaikan "${activeExercise.title}" dengan nilai ${score}.`
      );
      showToast(
        autoTimeout
          ? 'Waktu habis! Jawaban otomatis dikumpulkan & tersimpan di Firestore.'
          : 'Jawaban berhasil dikumpulkan & dinilai!'
      );
    } catch (err) {
      setLatestAttemptResult({ id: `LOCAL-${Date.now()}`, ...attemptPayload });
      showToast('Hasil dinilai (gagal sinkronisasi ke Firestore, periksa aturan akses).', 'error');
    }

    setActiveExercise(null);
    setExerciseEndTimestamp(null);
    setCurrentView('exercise-result');
  };

  // ============================================================================
  // STATISTIK REAL-TIME DARI DATA FIRESTORE
  // ============================================================================

  const adminStats = useMemo(() => {
    const students = usersList.filter((u) => u.role === 'siswa');
    const avgScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((acc, a) => acc + (a.score || 0), 0) / attempts.length)
        : 0;

    const byJenjang = [
      { name: 'SD', jumlah: students.filter((s) => s.jenjang === 'SD').length },
      { name: 'SMP', jumlah: students.filter((s) => s.jenjang === 'SMP').length },
      { name: 'SMA', jumlah: students.filter((s) => s.jenjang === 'SMA').length }
    ];

    const scoreTrend = attempts
      .slice()
      .reverse()
      .map((a, idx) => ({
        name: `Latihan #${idx + 1}`,
        nilai: a.score || 0
      }));

    return {
      totalStudents: students.length,
      totalQuestions: questions.length,
      totalExercises: exercises.length,
      totalAttempts: attempts.length,
      avgScore,
      byJenjang,
      scoreTrend
    };
  }, [usersList, questions, exercises, attempts]);

  const studentStats = useMemo(() => {
    if (!currentUser || currentUser.role !== 'siswa') return null;
    const myAttempts = attempts.filter((a) => a.userId === currentUser.uid);
    const totalDone = myAttempts.length;
    const avgScore =
      totalDone > 0
        ? Math.round(myAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / totalDone)
        : 0;
    const highestScore =
      totalDone > 0 ? Math.max(...myAttempts.map((a) => a.score || 0)) : 0;

    const trendData = myAttempts
      .slice()
      .reverse()
      .map((a, idx) => ({
        name: `#${idx + 1}`,
        nilai: a.score || 0,
        judul: a.exerciseTitle
      }));

    const availableMateri = CURRICULUM[currentUser.jenjang]?.materi || [];
    const practicedMateri = new Set(myAttempts.map((a) => a.materi));
    const recommendedMateri = availableMateri
      .filter((m) => !practicedMateri.has(m))
      .slice(0, 4);

    return {
      myAttempts,
      totalDone,
      avgScore,
      highestScore,
      trendData,
      recommendedMateri
    };
  }, [currentUser, attempts]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        (q.question || '').toLowerCase().includes(qSearch.toLowerCase()) ||
        (q.materi || '').toLowerCase().includes(qSearch.toLowerCase()) ||
        (q.id || '').toLowerCase().includes(qSearch.toLowerCase());
      const matchJenjang = qFilterJenjang === 'Semua' || q.jenjang === qFilterJenjang;
      const matchKelas = qFilterKelas === 'Semua' || q.kelas === qFilterKelas;
      const matchDiff = qFilterDifficulty === 'Semua' || q.difficulty === qFilterDifficulty;
      const matchType = qFilterType === 'Semua' || q.type === qFilterType;
      return matchSearch && matchJenjang && matchKelas && matchDiff && matchType;
    });
  }, [questions, qSearch, qFilterJenjang, qFilterKelas, qFilterDifficulty, qFilterType]);

  const PAGE_SIZE = 5;
  const totalQuestionPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const paginatedQuestions = filteredQuestions.slice((qPage - 1) * PAGE_SIZE, qPage * PAGE_SIZE);

  // ============================================================================
  // KOMPONEN LOGO
  // ============================================================================

  const BrandLogo = () => (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 via-pink-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-pink-500/25 font-bold text-lg">
        ∑π
      </div>
      <div>
        <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent leading-none">
          AisyaBella
        </div>
        <div className="text-[11px] font-medium text-pink-500 tracking-wide mt-0.5">
          AI Generator TKA
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // HALAMAN PUBLIK: LOGIN, REGISTRASI, LUPA PASSWORD, AKSES DITOLAK
  // ============================================================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFF7FB] flex flex-col items-center justify-center gap-3 text-pink-600">
        <RefreshCw className="w-9 h-9 animate-spin" />
        <p className="text-sm font-bold">Menghubungkan ke Firebase Authentication...</p>
      </div>
    );
  }

  if (!currentUser || ['login', 'register', 'forgot-password', 'access-denied'].includes(currentView)) {
    return (
      <AuthContext.Provider value={{ currentUser, authLoading }}>
        <div className="min-h-screen bg-[#FFF7FB] text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-pink-200/40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl pointer-events-none" />

          {toast && (
            <div
              className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-sm font-semibold ${
                toast.type === 'error'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white text-pink-700 border-pink-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
              <span>{toast.message}</span>
            </div>
          )}

          {/* Banner Status Koneksi Firebase */}
          <div className="w-full max-w-md mb-4 relative z-10">
            <div
              className={`px-4 py-2.5 rounded-2xl border text-xs flex items-center justify-between ${
                isFirebaseConfigured
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50/95 border-amber-200 text-amber-800'
              }`}
            >
              <span className="font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                {isFirebaseConfigured
                  ? `Firebase Terhubung (${firebaseConfig.projectId})`
                  : 'Konfigurasi Firebase belum diisi (isi DEFAULT_FIREBASE_CONFIG)'}
              </span>
            </div>
          </div>

          {currentView === 'access-denied' && (
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-pink-500/10 border border-pink-100 p-8 text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Akses Ditolak</h2>
              <p className="text-sm text-slate-600 mb-6">
                Halaman ini hanya dapat diakses oleh Administrator (<strong>AisyaBella</strong>).
              </p>
              <button
                onClick={() => navigateTo(currentUser ? 'student-dashboard' : 'login')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-md"
              >
                Kembali
              </button>
            </div>
          )}

          {currentView !== 'register' && currentView !== 'forgot-password' && currentView !== 'access-denied' && (
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-pink-500/10 border border-pink-100 p-6 sm:p-8 relative z-10">
              <div className="flex flex-col items-center text-center mb-6">
                <BrandLogo />
                <h1 className="text-2xl font-extrabold text-slate-800 mt-5">
                  Masuk ke Akun Anda
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Belajar Matematika Lebih Mudah, Cerdas, dan Menyenangkan!
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-pink-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="Masukkan email terdaftar..."
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-pink-50/30"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setCurrentView('forgot-password')}
                      className="text-xs font-semibold text-pink-600 hover:underline"
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-pink-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-pink-50/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-pink-600 to-purple-500 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span>{authSubmitting ? 'Memproses...' : 'Masuk dengan Firebase'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <p className="text-center text-xs text-slate-600 mt-6">
                Belum punya akun siswa?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('register')}
                  className="font-bold text-pink-600 hover:underline"
                >
                  Daftar Akun Siswa
                </button>
              </p>
            </div>
          )}

          {currentView === 'register' && (
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-pink-500/10 border border-pink-100 p-6 sm:p-8 relative z-10">
              <div className="flex flex-col items-center text-center mb-6">
                <BrandLogo />
                <h1 className="text-2xl font-extrabold text-slate-800 mt-4">
                  Daftar Akun Siswa Baru
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Setiap registrasi baru otomatis ditetapkan dengan role <strong>siswa</strong> di Firestore.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Lengkap Siswa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Nadia Putri Azzahra"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Jenjang Pendidikan
                    </label>
                    <select
                      value={registerForm.jenjang}
                      onChange={(e) => {
                        const newJenjang = e.target.value;
                        setRegisterForm({
                          ...registerForm,
                          jenjang: newJenjang,
                          kelas: CURRICULUM[newJenjang].kelas[0]
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none text-sm bg-white font-semibold"
                    >
                      <option value="SD">SD (Kelas 1 - 6)</option>
                      <option value="SMP">SMP (Kelas 7 - 9)</option>
                      <option value="SMA">SMA (Kelas 10 - 12)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Kelas
                    </label>
                    <select
                      value={registerForm.kelas}
                      onChange={(e) => setRegisterForm({ ...registerForm, kelas: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none text-sm bg-white font-semibold"
                    >
                      {CURRICULUM[registerForm.jenjang].kelas.map((kls) => (
                        <option key={kls} value={kls}>
                          {kls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Konfirmasi Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Ulangi password"
                      value={registerForm.confirmPassword}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:opacity-95 transition disabled:opacity-60"
                >
                  {authSubmitting ? 'Mendaftarkan...' : 'Buat Akun Siswa'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-600 mt-5">
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="font-bold text-pink-600 hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          )}

          {currentView === 'forgot-password' && (
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-pink-500/10 border border-pink-100 p-6 sm:p-8 relative z-10">
              <div className="flex flex-col items-center text-center mb-5">
                <BrandLogo />
                <h2 className="text-xl font-extrabold text-slate-800 mt-4">Reset Password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan email terdaftar untuk menerima tautan pengaturan ulang kata sandi.
                </p>
              </div>
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="Masukkan email Anda..."
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none text-sm"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm shadow-md"
                >
                  Kirim Tautan Reset
                </button>
              </form>
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="w-full text-center text-xs font-bold text-pink-600 mt-4 hover:underline"
              >
                Kembali ke Halaman Login
              </button>
            </div>
          )}
        </div>
      </AuthContext.Provider>
    );
  }

  // ============================================================================
  // HALAMAN PENGERJAAN LATIHAN SISWA (COUNTDOWN TIMER KONSISTEN)
  // ============================================================================

  if (currentView === 'take-exercise' && activeExercise && activeQuestions.length > 0) {
    const q = activeQuestions[currentQuestionIdx];
    const answeredCount = Object.keys(userAnswers).filter((k) => userAnswers[k]).length;
    const progressPercent = Math.round((answeredCount / activeQuestions.length) * 100);

    return (
      <AuthContext.Provider value={{ currentUser, authLoading }}>
        <div className="min-h-screen bg-[#FFF7FB] text-slate-800 flex flex-col">
          <header className="bg-white border-b border-pink-100 sticky top-0 z-30 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  {activeExercise.jenjang} • {activeExercise.materi}
                </span>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-800 mt-0.5">
                  {activeExercise.title}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2 rounded-2xl font-mono font-extrabold text-base flex items-center gap-2 border ${
                    timeLeftSeconds < 60
                      ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                      : 'bg-pink-50 text-pink-700 border-pink-200'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{formatTimer(timeLeftSeconds)}</span>
                </div>

                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition"
                >
                  Kumpulkan Jawaban
                </button>
              </div>
            </div>

            <div className="w-full bg-pink-100 h-1.5">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </header>

          <main className="max-w-6xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-pink-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-pink-50 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-pink-500 text-white font-extrabold flex items-center justify-center text-sm">
                      {currentQuestionIdx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-400">
                        Soal {currentQuestionIdx + 1} dari {activeQuestions.length}
                      </div>
                      <div className="text-xs font-semibold text-pink-600">
                        {q.type} • Tingkat {q.difficulty}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFlaggedQuestions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                      flaggedQuestions[q.id]
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    {flaggedQuestions[q.id] ? 'Ditandai' : 'Tandai Soal'}
                  </button>
                </div>

                <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed mb-6 whitespace-pre-line">
                  {q.question}
                </p>

                {q.type === 'Isian Singkat' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Ketik Jawaban Singkat Anda:
                    </label>
                    <input
                      type="text"
                      value={userAnswers[q.id] || ''}
                      onChange={(e) =>
                        setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Tulis jawaban di sini..."
                      className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-500 outline-none text-base font-semibold"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(q.options || []).map((opt, idx) => {
                      const isSelected = userAnswers[q.id] === opt;
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setUserAnswers((prev) => ({ ...prev, [q.id]: opt }))
                          }
                          className={`w-full text-left p-4 rounded-2xl border-2 transition flex items-center gap-3.5 ${
                            isSelected
                              ? 'border-pink-500 bg-pink-50/80 shadow-sm'
                              : 'border-slate-100 hover:border-pink-200 bg-white'
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-xl font-extrabold text-sm flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-pink-500 text-white'
                                : 'bg-pink-100/70 text-pink-700'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="font-semibold text-slate-800 text-sm sm:text-base">
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 mt-8 border-t border-pink-50">
                <button
                  type="button"
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((i) => Math.max(0, i - 1))}
                  className="px-4 py-2.5 rounded-xl border border-pink-200 text-pink-700 font-bold text-sm disabled:opacity-40 flex items-center gap-1.5 hover:bg-pink-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Sebelumnya
                </button>

                {currentQuestionIdx < activeQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIdx((i) => Math.min(activeQuestions.length - 1, i + 1))
                    }
                    className="px-5 py-2.5 rounded-xl bg-pink-500 text-white font-bold text-sm flex items-center gap-1.5 hover:bg-pink-600 transition shadow-sm"
                  >
                    Selanjutnya <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-md"
                  >
                    Selesai & Kumpulkan
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-6 h-fit">
              <h3 className="font-extrabold text-slate-800 text-sm mb-1">Navigasi Nomor Soal</h3>
              <p className="text-xs text-slate-500 mb-4">
                Terjawab: <strong>{answeredCount}</strong> / {activeQuestions.length} soal
              </p>

              <div className="grid grid-cols-5 gap-2 mb-5">
                {activeQuestions.map((item, idx) => {
                  const isAnswered = Boolean(userAnswers[item.id]);
                  const isFlagged = Boolean(flaggedQuestions[item.id]);
                  const isCurrent = idx === currentQuestionIdx;

                  let btnClass = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (isFlagged) btnClass = 'bg-amber-100 text-amber-800 border-amber-400';
                  else if (isAnswered) btnClass = 'bg-pink-500 text-white border-pink-600';

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-10 rounded-xl font-bold text-xs border transition ${btnClass} ${
                        isCurrent ? 'ring-2 ring-purple-500 ring-offset-1' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-pink-50 pt-4">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-pink-500 inline-block" /> Sudah dijawab
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-amber-200 border border-amber-400 inline-block" /> Ditandai ragu-ragu
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-slate-200 inline-block" /> Belum dijawab
                </div>
              </div>
            </div>
          </main>

          {showSubmitConfirm && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100">
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                  Kumpulkan Jawaban Sekarang?
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Kamu telah menjawab <strong>{answeredCount}</strong> dari{' '}
                  <strong>{activeQuestions.length}</strong> soal. Hasil akan dinilai dan disimpan otomatis ke Firestore.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Periksa Lagi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFinalSubmitExercise(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-md"
                  >
                    Ya, Kumpulkan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AuthContext.Provider>
    );
  }

  // ============================================================================
  // LAYOUT UTAMA DASHBOARD (ADMIN AISYABELLA & SISWA)
  // ============================================================================

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'admin-bank-soal', label: 'Bank Soal', icon: BookOpen },
    { id: 'admin-ai-generator', label: 'AI Generator Soal', icon: Sparkles },
    { id: 'admin-paket-latihan', label: 'Paket Latihan', icon: FileText },
    { id: 'admin-data-siswa', label: 'Data Siswa', icon: Users },
    { id: 'admin-hasil-latihan', label: 'Hasil Latihan', icon: Award },
    { id: 'admin-statistik', label: 'Statistik Pembelajaran', icon: TrendingUp },
    { id: 'admin-pengaturan', label: 'Arsitektur & Rules', icon: Settings }
  ];

  // Sidebar Siswa (TANPA AI Generator Soal)
  const studentNavItems = [
    { id: 'student-dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'student-latihan-list', label: 'Mulai Latihan', icon: Play },
    { id: 'student-riwayat', label: 'Riwayat Nilai', icon: Clock },
    { id: 'student-perkembangan', label: 'Perkembangan Belajar', icon: TrendingUp },
    { id: 'student-profil', label: 'Profil', icon: User }
  ];

  const navItems = currentUser.role === 'admin' ? adminNavItems : studentNavItems;

  return (
    <AuthContext.Provider value={{ currentUser, authLoading }}>
      <div className="min-h-screen bg-[#FFF7FB] text-slate-800 flex flex-col lg:flex-row">
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-sm font-semibold ${
              toast.type === 'error'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-white text-pink-700 border-pink-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
            <span>{toast.message}</span>
          </div>
        )}

        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-pink-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <BrandLogo />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-pink-50 text-pink-600"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-68 bg-white border-r border-pink-100 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="p-5">
            <div className="mb-6 hidden lg:block">
              <BrandLogo />
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-800 truncate">{currentUser.name}</div>
                  <div className="text-[11px] font-semibold text-pink-600">
                    {currentUser.role === 'admin'
                      ? 'Administrator Utama'
                      : `${currentUser.jenjang} • ${currentUser.kelas}`}
                  </div>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                      active
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-500/20'
                        : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-5 border-t border-pink-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ========================================================================
            KONTEN UTAMA (DILINDUNGI PROTECTED ROUTE)
           ======================================================================== */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {/* ======================================================================
              PANEL ADMIN (DILINDUNGI role === 'admin')
             ====================================================================== */}
          {currentView.startsWith('admin-') && (
            <ProtectedRoute
              allowedRole="admin"
              onUnauthorized={() => navigateTo('student-dashboard')}
            >
              {/* 1. ADMIN DASHBOARD */}
              {currentView === 'admin-dashboard' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-800">
                        Dashboard Admin — Halo, {currentUser.name} 👋
                      </h1>
                      <p className="text-sm text-slate-500">
                        Data langsung tersinkronisasi dengan Cloud Firestore secara real-time.
                      </p>
                    </div>
                    <button
                      onClick={() => navigateTo('admin-ai-generator')}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 hover:opacity-95"
                    >
                      <Sparkles className="w-4 h-4" /> Generate Soal AI
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { label: 'Total Siswa', value: adminStats.totalStudents, icon: Users, color: 'from-pink-500 to-rose-500' },
                      { label: 'Bank Soal', value: adminStats.totalQuestions, icon: BookOpen, color: 'from-purple-500 to-indigo-500' },
                      { label: 'Paket Latihan', value: adminStats.totalExercises, icon: FileText, color: 'from-pink-400 to-pink-600' },
                      { label: 'Total Dikerjakan', value: adminStats.totalAttempts, icon: CheckCircle2, color: 'from-fuchsia-500 to-purple-600' },
                      { label: 'Rata-rata Nilai', value: `${adminStats.avgScore}`, icon: Award, color: 'from-emerald-500 to-teal-500' }
                    ].map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div key={i} className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm">
                          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-3`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-2xl font-extrabold text-slate-800">{stat.value}</div>
                          <div className="text-xs font-semibold text-slate-500 mt-0.5">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
                      <h3 className="font-extrabold text-slate-800 mb-4">Statistik Siswa per Jenjang</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={adminStats.byJenjang}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="jumlah" fill="#EC4899" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
                      <h3 className="font-extrabold text-slate-800 mb-4">Tren Nilai Latihan Siswa</h3>
                      {adminStats.scoreTrend.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                          Belum ada data pengerjaan latihan di Firestore.
                        </div>
                      ) : (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={adminStats.scoreTrend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Line type="monotone" dataKey="nilai" stroke="#A78BFA" strokeWidth={3} dot={{ r: 5, fill: '#EC4899' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
                    <h3 className="font-extrabold text-slate-800 mb-4">Log Aktivitas Firestore Terbaru</h3>
                    {activityLogs.length === 0 ? (
                      <p className="text-sm text-slate-400">Belum ada log aktivitas tercatat.</p>
                    ) : (
                      <div className="space-y-3">
                        {activityLogs.slice(0, 6).map((log) => (
                          <div key={log.id} className="flex items-start justify-between gap-4 p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100/70">
                            <div>
                              <span className="text-xs font-bold text-pink-600">{log.activity}</span>
                              <p className="text-sm text-slate-700 mt-0.5">{log.description}</p>
                            </div>
                            <span className="text-[11px] text-slate-400 shrink-0">
                              {log.createdAt ? new Date(log.createdAt).toLocaleDateString('id-ID') : '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. BANK SOAL ADMIN */}
              {currentView === 'admin-bank-soal' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-800">Bank Soal Matematika</h1>
                      <p className="text-sm text-slate-500">
                        Koleksi soal global di Cloud Firestore ({questions.length} soal).
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() =>
                          exportQuestionsToPDF({
                            title: 'Bank Soal Matematika TKA',
                            subtitle: `Filter: ${qFilterJenjang} • ${qFilterKelas}`,
                            questions: filteredQuestions,
                            includeAnswers: true
                          })
                        }
                        className="px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-pink-700 font-bold text-xs sm:text-sm hover:bg-pink-50 flex items-center gap-2"
                      >
                        <FileDown className="w-4 h-4" /> Download PDF
                      </button>
                      <button
                        onClick={openNewQuestionModal}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Tambah Soal Manual
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="lg:col-span-2 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Cari pertanyaan, materi..."
                        value={qSearch}
                        onChange={(e) => {
                          setQSearch(e.target.value);
                          setQPage(1);
                        }}
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-pink-200 text-sm outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>

                    <select
                      value={qFilterJenjang}
                      onChange={(e) => {
                        setQFilterJenjang(e.target.value);
                        setQFilterKelas('Semua');
                        setQPage(1);
                      }}
                      className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                    >
                      <option value="Semua">Semua Jenjang</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                    </select>

                    <select
                      value={qFilterKelas}
                      onChange={(e) => {
                        setQFilterKelas(e.target.value);
                        setQPage(1);
                      }}
                      className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                    >
                      <option value="Semua">Semua Kelas</option>
                      {(qFilterJenjang !== 'Semua'
                        ? CURRICULUM[qFilterJenjang].kelas
                        : [...CURRICULUM.SD.kelas, ...CURRICULUM.SMP.kelas, ...CURRICULUM.SMA.kelas]
                      ).map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>

                    <select
                      value={qFilterDifficulty}
                      onChange={(e) => {
                        setQFilterDifficulty(e.target.value);
                        setQPage(1);
                      }}
                      className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                    >
                      <option value="Semua">Semua Kesulitan</option>
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    <select
                      value={qFilterType}
                      onChange={(e) => {
                        setQFilterType(e.target.value);
                        setQPage(1);
                      }}
                      className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                    >
                      <option value="Semua">Semua Tipe</option>
                      {QUESTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    {paginatedQuestions.length === 0 ? (
                      <div className="bg-white rounded-3xl p-10 text-center border border-pink-100">
                        <p className="text-slate-500 font-semibold">
                          Belum ada soal di Bank Soal Firestore. Gunakan AI Generator atau Tambah Soal Manual!
                        </p>
                      </div>
                    ) : (
                      paginatedQuestions.map((q) => (
                        <div key={q.id} className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                                {q.jenjang} • {q.kelas}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                                {q.materi}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                                {q.difficulty} • {q.type}
                              </span>
                            </div>
                            <p className="font-semibold text-slate-800 text-sm sm:text-base line-clamp-2">
                              {q.question}
                            </p>
                            <div className="text-xs text-emerald-600 font-bold">
                              Kunci: {q.correctAnswer}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setViewingQuestion(q)}
                              className="p-2.5 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-600 hover:text-pink-600 transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingQuestion({ ...q });
                                setShowQuestionModal(true);
                              }}
                              className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {totalQuestionPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        disabled={qPage === 1}
                        onClick={() => setQPage((p) => p - 1)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-xs font-bold disabled:opacity-40"
                      >
                        Sebelumnya
                      </button>
                      <span className="text-xs font-bold text-slate-600">
                        Halaman {qPage} dari {totalQuestionPages}
                      </span>
                      <button
                        disabled={qPage === totalQuestionPages}
                        onClick={() => setQPage((p) => p + 1)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-xs font-bold disabled:opacity-40"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 3. AI GENERATOR SOAL (KHUSUS ADMIN AISYABELLA) */}
              {currentView === 'admin-ai-generator' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-pink-500" />
                      AI Generator Soal Matematika (Admin AisyaBella)
                    </h1>
                    <p className="text-sm text-slate-500">
                      Generate soal TKA Matematika otomatis lalu simpan langsung ke Cloud Firestore atau unduh PDF.
                    </p>
                  </div>

                  <form onSubmit={handleRunAiGenerator} className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Jenjang Pendidikan
                        </label>
                        <select
                          value={aiForm.jenjang}
                          onChange={(e) => {
                            const j = e.target.value;
                            setAiForm({
                              ...aiForm,
                              jenjang: j,
                              kelas: CURRICULUM[j].kelas[0],
                              materi: CURRICULUM[j].materi[0]
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-sm font-semibold"
                        >
                          <option value="SD">SD (Kelas 1 - 6)</option>
                          <option value="SMP">SMP (Kelas 7 - 9)</option>
                          <option value="SMA">SMA (Kelas 10 - 12)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Kelas
                        </label>
                        <select
                          value={aiForm.kelas}
                          onChange={(e) => setAiForm({ ...aiForm, kelas: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-sm font-semibold"
                        >
                          {CURRICULUM[aiForm.jenjang].kelas.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Materi Matematika
                        </label>
                        <select
                          value={aiForm.materi}
                          onChange={(e) => setAiForm({ ...aiForm, materi: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-sm font-semibold"
                        >
                          {CURRICULUM[aiForm.jenjang].materi.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Submateri (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Soal cerita"
                          value={aiForm.submateri}
                          onChange={(e) => setAiForm({ ...aiForm, submateri: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Tingkat Kesulitan
                        </label>
                        <select
                          value={aiForm.difficulty}
                          onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-sm font-semibold"
                        >
                          {DIFFICULTIES.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Jumlah Soal
                        </label>
                        <select
                          value={aiForm.count}
                          onChange={(e) => setAiForm({ ...aiForm, count: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-sm font-semibold"
                        >
                          {[5, 10, 15, 20, 25, 30].map((num) => (
                            <option key={num} value={num}>
                              {num} Soal
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Jenis Soal
                        </label>
                        <select
                          value={aiForm.type}
                          onChange={(e) => setAiForm({ ...aiForm, type: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-sm font-semibold"
                        >
                          {QUESTION_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Tingkat Kemampuan
                        </label>
                        <select
                          value={aiForm.abilityLevel}
                          onChange={(e) => setAiForm({ ...aiForm, abilityLevel: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-sm font-semibold"
                        >
                          <option value="Dasar">Dasar</option>
                          <option value="Menengah">Menengah</option>
                          <option value="Lanjutan">Lanjutan</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        Target: <strong>{aiForm.jenjang} — {aiForm.kelas} ({aiForm.materi})</strong>
                      </span>
                      <button
                        type="submit"
                        disabled={aiGenerating}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:opacity-95 transition flex items-center gap-2 disabled:opacity-60"
                      >
                        {aiGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Menghasilkan Soal AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> Generate Soal AI
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {aiGeneratedQuestions.length > 0 && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-3xl p-5 border border-pink-200 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-extrabold text-slate-800">
                            Hasil AI Generator ({aiGeneratedQuestions.length} Soal)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Simpan soal terpilih ke Cloud Firestore atau unduh PDF.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              exportQuestionsToPDF({
                                title: `Latihan Matematika ${aiForm.jenjang} ${aiForm.kelas}`,
                                subtitle: `Materi: ${aiForm.materi} • Tingkat: ${aiForm.difficulty}`,
                                questions: aiGeneratedQuestions,
                                includeAnswers: false
                              })
                            }
                            className="px-3.5 py-2 rounded-xl border border-pink-200 text-pink-700 font-bold text-xs hover:bg-pink-50 flex items-center gap-1.5"
                          >
                            <FileDown className="w-4 h-4" /> PDF Soal Saja
                          </button>
                          <button
                            onClick={() =>
                              exportQuestionsToPDF({
                                title: `Soal & Pembahasan ${aiForm.jenjang} ${aiForm.kelas}`,
                                subtitle: `Materi: ${aiForm.materi} • Tingkat: ${aiForm.difficulty}`,
                                questions: aiGeneratedQuestions,
                                includeAnswers: true
                              })
                            }
                            className="px-3.5 py-2 rounded-xl border border-purple-200 text-purple-700 font-bold text-xs hover:bg-purple-50 flex items-center gap-1.5"
                          >
                            <Printer className="w-4 h-4" /> PDF + Pembahasan
                          </button>
                          <button
                            onClick={handleSaveAiToGlobalBank}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Simpan ke Firestore ({selectedAiIds.length})
                          </button>
                        </div>
                      </div>

                      {aiGeneratedQuestions.map((q, index) => {
                        const isChecked = selectedAiIds.includes(q.tempId);
                        return (
                          <div key={q.tempId} className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAiIds((prev) => [...prev, q.tempId]);
                                    } else {
                                      setSelectedAiIds((prev) => prev.filter((id) => id !== q.tempId));
                                    }
                                  }}
                                  className="w-4 h-4 accent-pink-500"
                                />
                                <span className="font-extrabold text-pink-600 text-sm">
                                  Soal #{index + 1} ({q.jenjang} {q.kelas})
                                </span>
                              </label>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingAiQuestion({ ...q })}
                                  className="text-xs font-bold text-purple-600 hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    setAiGeneratedQuestions((prev) =>
                                      prev.filter((item) => item.tempId !== q.tempId)
                                    )
                                  }
                                  className="text-xs font-bold text-rose-600 hover:underline"
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>

                            <p className="font-semibold text-slate-800 whitespace-pre-line">{q.question}</p>

                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, idx) => (
                                  <div
                                    key={idx}
                                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                                      opt === q.correctAnswer
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + idx)}. {opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 text-xs space-y-1">
                              <div className="font-bold text-pink-700">Kunci Jawaban: {q.correctAnswer}</div>
                              <div className="text-slate-700 whitespace-pre-line">
                                <strong>Pembahasan:</strong> {q.explanation}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 4. PAKET LATIHAN ADMIN */}
              {currentView === 'admin-paket-latihan' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-800">Paket Latihan TKA</h1>
                      <p className="text-sm text-slate-500">
                        Susun dan terbitkan paket ujian dari Bank Soal Firestore.
                      </p>
                    </div>
                    <button
                      onClick={openNewPackageModal}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Buat Paket Latihan
                    </button>
                  </div>

                  {exercises.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 text-center border border-pink-100">
                      <p className="text-slate-500 font-semibold">
                        Belum ada paket latihan. Klik "Buat Paket Latihan" untuk menerbitkan paket pertama.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exercises.map((ex) => {
                        const pkgQuestions = (ex.questionIds || [])
                          .map((id) => questions.find((q) => q.id === id))
                          .filter(Boolean);
                        return (
                          <div key={ex.id} className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                                  {ex.jenjang} • {ex.kelas}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    ex.status === 'published'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {ex.status === 'published' ? 'Published' : 'Draft'}
                                </span>
                              </div>
                              <h3 className="font-extrabold text-lg text-slate-800">{ex.title}</h3>
                              <p className="text-xs text-slate-500 mt-1">{ex.description}</p>
                              <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600 mt-3">
                                <span>{(ex.questionIds || []).length} Soal</span>
                                <span>• {ex.duration} Menit</span>
                                <span>• {ex.difficulty}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-3 border-t border-pink-50">
                              <button
                                onClick={() =>
                                  exportQuestionsToPDF({
                                    title: ex.title,
                                    subtitle: `${ex.jenjang} ${ex.kelas} • Durasi ${ex.duration} Menit`,
                                    questions: pkgQuestions,
                                    includeAnswers: true
                                  })
                                }
                                className="px-3 py-2 rounded-xl border border-pink-200 text-pink-700 text-xs font-bold hover:bg-pink-50 flex items-center gap-1"
                              >
                                <FileDown className="w-3.5 h-3.5" /> PDF
                              </button>
                              <button
                                onClick={() => openEditPackageModal(ex)}
                                className="px-3 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100"
                              >
                                Edit Paket
                              </button>
                              <button
                                onClick={async () => {
                                  await deleteDoc(getDocRef('exercises', ex.id));
                                  showToast('Paket latihan dihapus dari Firestore.');
                                }}
                                className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 5. DATA SISWA ADMIN */}
              {currentView === 'admin-data-siswa' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Data Siswa Terdaftar</h1>
                    <p className="text-sm text-slate-500">
                      Seluruh akun siswa dari koleksi <code>users</code> Cloud Firestore.
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-pink-100 bg-pink-50/50 text-xs font-bold text-slate-600 uppercase">
                          <th className="p-4">Nama Siswa</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Jenjang & Kelas</th>
                          <th className="p-4">Latihan Selesai</th>
                          <th className="p-4">Rata-rata Nilai</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-50 text-sm">
                        {usersList
                          .filter((u) => u.role === 'siswa')
                          .map((s) => {
                            const sAttempts = attempts.filter((a) => a.userId === s.uid);
                            const avg =
                              sAttempts.length > 0
                                ? Math.round(
                                    sAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
                                      sAttempts.length
                                  )
                                : '-';
                            return (
                              <tr key={s.uid} className="hover:bg-pink-50/30">
                                <td className="p-4 font-bold text-slate-800">{s.name}</td>
                                <td className="p-4 text-slate-600">{s.email}</td>
                                <td className="p-4">
                                  <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                                    {s.jenjang} • {s.kelas}
                                  </span>
                                </td>
                                <td className="p-4 font-semibold">{sAttempts.length} latihan</td>
                                <td className="p-4 font-extrabold text-pink-600">{avg}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6. HASIL LATIHAN ADMIN */}
              {currentView === 'admin-hasil-latihan' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-extrabold text-slate-800">Rekap Hasil Latihan Siswa</h1>
                  <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-pink-100 bg-pink-50/50 text-xs font-bold text-slate-600 uppercase">
                          <th className="p-4">Siswa</th>
                          <th className="p-4">Paket Latihan</th>
                          <th className="p-4">Jenjang</th>
                          <th className="p-4">Benar / Total</th>
                          <th className="p-4">Nilai Akhir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-50 text-sm">
                        {attempts.map((a) => (
                          <tr key={a.id}>
                            <td className="p-4 font-bold text-slate-800">
                              {a.studentName || a.userId}
                            </td>
                            <td className="p-4 text-slate-700">{a.exerciseTitle}</td>
                            <td className="p-4">{a.jenjang}</td>
                            <td className="p-4">
                              {a.correctCount} / {a.totalQuestions}
                            </td>
                            <td className="p-4 font-extrabold text-pink-600">{a.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 7. STATISTIK PEMBELAJARAN */}
              {currentView === 'admin-statistik' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-extrabold text-slate-800">Statistik Pembelajaran</h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['SD', 'SMP', 'SMA'].map((j) => {
                      const countQ = questions.filter((q) => q.jenjang === j).length;
                      const countEx = exercises.filter((e) => e.jenjang === j).length;
                      return (
                        <div key={j} className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
                          <div className="text-lg font-extrabold text-pink-600 mb-2">Jenjang {j}</div>
                          <p className="text-sm text-slate-600">Total Bank Soal: <strong>{countQ}</strong></p>
                          <p className="text-sm text-slate-600">Total Paket Latihan: <strong>{countEx}</strong></p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 8. ARSITEKTUR FIREBASE, SECURITY RULES & ADMIN SDK */}
              {currentView === 'admin-pengaturan' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-pink-500" />
                      Arsitektur Firebase, Security Rules & Admin Provisioning
                    </h1>
                    <p className="text-sm text-slate-500">
                      Salin konfigurasi di bawah ini ke proyek Firebase Console Anda untuk keamanan produksi penuh.
                    </p>
                  </div>

                  {/* Snippet 1: Provisioning Admin */}
                  <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-pink-500" />
                        1. Script Provisioning Akun Admin (Firebase Admin SDK)
                      </h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ADMIN_PROVISIONING_SNIPPET);
                          setCopiedKey('admin');
                          setTimeout(() => setCopiedKey(''), 2000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-pink-50 text-pink-700 text-xs font-bold flex items-center gap-1"
                      >
                        {copiedKey === 'admin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'admin' ? 'Tersalin' : 'Salin Kode'}
                      </button>
                    </div>
                    <pre className="p-4 rounded-2xl bg-slate-900 text-pink-200 text-xs overflow-x-auto">
                      {ADMIN_PROVISIONING_SNIPPET}
                    </pre>
                  </div>

                  {/* Snippet 2: Firestore Security Rules */}
                  <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-500" />
                        2. Cloud Firestore Security Rules (firestore.rules)
                      </h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(FIRESTORE_RULES_SNIPPET);
                          setCopiedKey('rules');
                          setTimeout(() => setCopiedKey(''), 2000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold flex items-center gap-1"
                      >
                        {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'rules' ? 'Tersalin' : 'Salin Rules'}
                      </button>
                    </div>
                    <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-200 text-xs overflow-x-auto">
                      {FIRESTORE_RULES_SNIPPET}
                    </pre>
                  </div>

                  {/* Snippet 3: Cloud Functions Gemini & Penilaian */}
                  <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink-500" />
                        3. Firebase Cloud Functions (Gemini API & Penilaian Server)
                      </h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(CLOUD_FUNCTIONS_SNIPPET);
                          setCopiedKey('functions');
                          setTimeout(() => setCopiedKey(''), 2000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-pink-50 text-pink-700 text-xs font-bold flex items-center gap-1"
                      >
                        {copiedKey === 'functions' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'functions' ? 'Tersalin' : 'Salin Functions'}
                      </button>
                    </div>
                    <pre className="p-4 rounded-2xl bg-slate-900 text-sky-200 text-xs overflow-x-auto">
                      {CLOUD_FUNCTIONS_SNIPPET}
                    </pre>
                  </div>
                </div>
              )}
            </ProtectedRoute>
          )}

          {/* ======================================================================
              PANEL SISWA (DILINDUNGI role === 'siswa' & TANPA AI GENERATOR)
             ====================================================================== */}
          {!currentView.startsWith('admin-') && (
            <ProtectedRoute
              allowedRole="siswa"
              onUnauthorized={() => navigateTo('admin-dashboard')}
            >
              {/* 1. STUDENT DASHBOARD */}
              {currentView === 'student-dashboard' && studentStats && (
                <div className="space-y-6">
                  <div className="rounded-3xl bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur">
                        {currentUser.jenjang} • {currentUser.kelas}
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
                        Halo, {currentUser.name}! 👋
                      </h1>
                      <p className="text-sm text-pink-100 mt-1">
                        Pilih paket latihan TKA Matematika dari Admin dan ukur perkembangan belajarmu!
                      </p>
                    </div>
                    <button
                      onClick={() => navigateTo('student-latihan-list')}
                      className="px-5 py-3 rounded-2xl bg-white text-pink-600 font-extrabold text-xs sm:text-sm shadow-md hover:bg-pink-50 transition flex items-center gap-2 shrink-0"
                    >
                      <Play className="w-4 h-4" /> Mulai Latihan
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 uppercase">Latihan Dikerjakan</div>
                      <div className="text-3xl font-extrabold text-slate-800 mt-1">
                        {studentStats.totalDone}
                      </div>
                      <div className="text-xs text-pink-600 font-semibold mt-1">Tersimpan di Firestore</div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 uppercase">Rata-rata Nilai</div>
                      <div className="text-3xl font-extrabold text-pink-600 mt-1">
                        {studentStats.avgScore}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold mt-1">Skala 0 – 100</div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 uppercase">Nilai Tertinggi</div>
                      <div className="text-3xl font-extrabold text-purple-600 mt-1">
                        {studentStats.highestScore}
                      </div>
                      <div className="text-xs text-emerald-600 font-semibold mt-1">Pencapaian Terbaikmu</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
                      <h3 className="font-extrabold text-slate-800 mb-4">Grafik Perkembangan Nilaimu</h3>
                      {studentStats.trendData.length === 0 ? (
                        <div className="h-56 flex items-center justify-center text-sm text-slate-400">
                          Belum ada riwayat nilai. Yuk kerjakan latihan pertamamu!
                        </div>
                      ) : (
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={studentStats.trendData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="nilai"
                                stroke="#EC4899"
                                strokeWidth={3}
                                dot={{ r: 5, fill: '#A78BFA' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
                      <h3 className="font-extrabold text-slate-800 mb-3">
                        Rekomendasi Materi ({currentUser.jenjang})
                      </h3>
                      <div className="space-y-2.5">
                        {studentStats.recommendedMateri.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-pink-50/70 border border-pink-100 flex items-center justify-between"
                          >
                            <span className="text-xs font-bold text-slate-700">{m}</span>
                            <button
                              onClick={() => navigateTo('student-latihan-list')}
                              className="text-[11px] font-bold text-pink-600 hover:underline"
                            >
                              Latih →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. DAFTAR PAKET LATIHAN SISWA */}
              {currentView === 'student-latihan-list' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Daftar Paket Latihan TKA</h1>
                    <p className="text-sm text-slate-500">
                      Paket latihan resmi yang telah diterbitkan oleh Admin AisyaBella.
                    </p>
                  </div>

                  {exercises.filter((ex) => ex.status === 'published').length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 text-center border border-pink-100">
                      <p className="text-slate-500 font-semibold">
                        Belum ada paket latihan yang dipublikasikan oleh Admin.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exercises
                        .filter((ex) => ex.status === 'published')
                        .map((ex) => {
                          const pkgQuestions = (ex.questionIds || [])
                            .map((id) => questions.find((q) => q.id === id))
                            .filter(Boolean);
                          return (
                            <div
                              key={ex.id}
                              className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm flex flex-col justify-between gap-4"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                                    {ex.jenjang} • {ex.kelas}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                                    {ex.difficulty}
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-lg text-slate-800">{ex.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">{ex.description}</p>
                                <div className="flex gap-4 text-xs font-semibold text-slate-600 mt-3">
                                  <span>{(ex.questionIds || []).length} Soal</span>
                                  <span>• Durasi {ex.duration} Menit</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2.5 pt-3 border-t border-pink-50">
                                <button
                                  onClick={() => handleStartExercise(ex)}
                                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5"
                                >
                                  <Play className="w-4 h-4" /> Kerjakan Sekarang
                                </button>
                                <button
                                  onClick={() =>
                                    exportQuestionsToPDF({
                                      title: ex.title,
                                      subtitle: `${ex.jenjang} ${ex.kelas} • Durasi ${ex.duration} Menit`,
                                      questions: pkgQuestions,
                                      includeAnswers: false
                                    })
                                  }
                                  className="py-2.5 px-3.5 rounded-xl border border-pink-200 text-pink-700 font-bold text-xs hover:bg-pink-50 flex items-center gap-1.5"
                                >
                                  <FileDown className="w-4 h-4" /> PDF Soal
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* 3. HASIL LATIHAN & PEMBAHASAN SISWA */}
              {currentView === 'exercise-result' && latestAttemptResult && (
                <div className="space-y-6">
                  {(() => {
                    const cat = getScoreCategory(latestAttemptResult.score);
                    const qList =
                      latestAttemptResult.questionSnapshot ||
                      questions.filter((q) =>
                        Object.keys(latestAttemptResult.answers || {}).includes(q.id)
                      );

                    return (
                      <>
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="space-y-2 text-center md:text-left">
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${cat.color}`}>
                              Kategori: {cat.label}
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                              Hasil: {latestAttemptResult.exerciseTitle}
                            </h1>
                            <p className="text-sm text-slate-600 max-w-xl">{cat.motivation}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2.5 pt-2">
                              <button
                                onClick={() =>
                                  exportQuestionsToPDF({
                                    title: `Hasil & Pembahasan: ${latestAttemptResult.exerciseTitle}`,
                                    subtitle: `Siswa: ${currentUser.name} • Nilai: ${latestAttemptResult.score}`,
                                    questions: qList,
                                    includeAnswers: true
                                  })
                                }
                                className="px-4 py-2 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 font-bold text-xs flex items-center gap-1.5 hover:bg-pink-100"
                              >
                                <FileDown className="w-4 h-4" /> Download PDF Pembahasan
                              </button>
                              <button
                                onClick={() => navigateTo('student-latihan-list')}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs"
                              >
                                Latihan Lainnya
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 shrink-0">
                            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex flex-col items-center justify-center shadow-lg">
                              <span className="text-xs font-bold uppercase opacity-80">Nilai Akhir</span>
                              <span className="text-4xl font-extrabold">{latestAttemptResult.score}</span>
                            </div>
                            <div className="space-y-1.5 text-xs font-bold">
                              <div className="text-emerald-600">✓ Benar: {latestAttemptResult.correctCount}</div>
                              <div className="text-rose-600">✕ Salah: {latestAttemptResult.wrongCount}</div>
                              <div className="text-slate-500">• Kosong: {latestAttemptResult.unansweredCount}</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h2 className="text-xl font-extrabold text-slate-800">
                            Pembahasan Lengkap Per Soal
                          </h2>
                          {qList.map((q, idx) => {
                            const studentAns = latestAttemptResult.answers?.[q.id] || '(Tidak dijawab)';
                            const isCorrect =
                              studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                            return (
                              <div key={q.id} className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-sm text-slate-700">
                                    Soal No. {idx + 1}
                                  </span>
                                  <span
                                    className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                                      isCorrect
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-rose-100 text-rose-700'
                                    }`}
                                  >
                                    {isCorrect ? 'Jawaban Benar' : 'Perlu Ditinjau'}
                                  </span>
                                </div>
                                <p className="font-semibold text-slate-800">{q.question}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    Jawabanmu: <strong>{studentAns}</strong>
                                  </div>
                                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                                    Kunci Jawaban: <strong>{q.correctAnswer}</strong>
                                  </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-100 text-xs text-slate-700 whitespace-pre-line">
                                  <strong className="text-pink-700 block mb-1">Langkah Penyelesaian:</strong>
                                  {q.explanation}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* 4. RIWAYAT NILAI SISWA */}
              {currentView === 'student-riwayat' && studentStats && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-800">Riwayat Nilai Latihan</h1>
                      <p className="text-sm text-slate-500">
                        Catatan seluruh latihan yang tersimpan pada akunmu.
                      </p>
                    </div>
                    <select
                      value={historyFilterJenjang}
                      onChange={(e) => setHistoryFilterJenjang(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-pink-200 bg-white text-xs font-bold"
                    >
                      <option value="Semua">Semua Jenjang</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                    </select>
                  </div>

                  {studentStats.myAttempts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 text-center border border-pink-100">
                      <p className="text-slate-500 font-semibold">
                        Belum ada riwayat nilai. Mulai latihan sekarang!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {studentStats.myAttempts
                        .filter(
                          (a) => historyFilterJenjang === 'Semua' || a.jenjang === historyFilterJenjang
                        )
                        .map((att) => (
                          <div
                            key={att.id}
                            className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm flex flex-wrap items-center justify-between gap-4"
                          >
                            <div>
                              <span className="text-xs font-bold text-pink-600">
                                {att.jenjang} • {new Date(att.submittedAt).toLocaleDateString('id-ID')}
                              </span>
                              <h3 className="font-extrabold text-slate-800">{att.exerciseTitle}</h3>
                              <p className="text-xs text-slate-500">
                                Benar {att.correctCount} dari {att.totalQuestions} soal
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-extrabold text-pink-600">{att.score}</span>
                              <button
                                onClick={() => {
                                  setLatestAttemptResult(att);
                                  setCurrentView('exercise-result');
                                }}
                                className="px-3.5 py-2 rounded-xl bg-pink-50 text-pink-700 font-bold text-xs hover:bg-pink-100"
                              >
                                Lihat Pembahasan
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. PERKEMBANGAN BELAJAR SISWA */}
              {currentView === 'student-perkembangan' && studentStats && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-extrabold text-slate-800">Analisis Perkembangan Belajar</h1>
                  <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Grafik Evaluasi Nilai</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={studentStats.trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="nilai" stroke="#EC4899" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. PROFIL SISWA */}
              {currentView === 'student-profil' && (
                <div className="max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-5">
                  <h1 className="text-2xl font-extrabold text-slate-800">Profil Siswa</h1>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await updateDoc(getDocRef('users', currentUser.uid), {
                          name: currentUser.name,
                          jenjang: currentUser.jenjang,
                          kelas: currentUser.kelas,
                          updatedAt: new Date().toISOString()
                        });
                        showToast('Profil berhasil diperbarui di Cloud Firestore!');
                      } catch (err) {
                        showToast('Gagal memperbarui profil.', 'error');
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={currentUser.name}
                        onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Email (Read-Only)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Jenjang
                        </label>
                        <select
                          value={currentUser.jenjang}
                          onChange={(e) => {
                            const j = e.target.value;
                            setCurrentUser({
                              ...currentUser,
                              jenjang: j,
                              kelas: CURRICULUM[j].kelas[0]
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-sm font-semibold"
                        >
                          <option value="SD">SD</option>
                          <option value="SMP">SMP</option>
                          <option value="SMA">SMA</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                          Kelas
                        </label>
                        <select
                          value={currentUser.kelas}
                          onChange={(e) => setCurrentUser({ ...currentUser, kelas: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white text-sm font-semibold"
                        >
                          {CURRICULUM[currentUser.jenjang]?.kelas.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-md"
                    >
                      Simpan Perubahan Profil
                    </button>
                  </form>
                </div>
              )}
            </ProtectedRoute>
          )}
        </main>

        {/* ========================================================================
            MODALS (TAMBAH/EDIT SOAL, DETAIL SOAL, PAKET LATIHAN, EDIT AI)
           ======================================================================== */}

        {showQuestionModal && editingQuestion && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <form
              onSubmit={handleSaveQuestion}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-pink-100 space-y-4 my-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-800">Form Soal Matematika</h3>
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Jenjang</label>
                  <select
                    value={editingQuestion.jenjang}
                    onChange={(e) => {
                      const j = e.target.value;
                      setEditingQuestion({
                        ...editingQuestion,
                        jenjang: j,
                        kelas: CURRICULUM[j].kelas[0],
                        materi: CURRICULUM[j].materi[0]
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Kelas</label>
                  <select
                    value={editingQuestion.kelas}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, kelas: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                  >
                    {CURRICULUM[editingQuestion.jenjang].kelas.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Materi</label>
                  <select
                    value={editingQuestion.materi}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, materi: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                  >
                    {CURRICULUM[editingQuestion.jenjang].materi.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Tingkat Kesulitan</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Tipe Soal</label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, type: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Pertanyaan</label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-sm"
                />
              </div>

              {editingQuestion.type !== 'Isian Singkat' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx}>
                      <label className="block text-[11px] font-bold text-slate-500">
                        Pilihan {String.fromCharCode(65 + idx)}
                      </label>
                      <input
                        type="text"
                        value={editingQuestion.options?.[idx] || ''}
                        onChange={(e) => {
                          const updated = [...(editingQuestion.options || ['', '', '', ''])];
                          updated[idx] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-pink-200 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">Kunci Jawaban</label>
                <input
                  type="text"
                  required
                  value={editingQuestion.correctAnswer}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Pembahasan Langkah Demi Langkah</label>
                <textarea
                  rows={3}
                  value={editingQuestion.explanation}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-md"
                >
                  Simpan ke Firestore
                </button>
              </div>
            </form>
          </div>
        )}

        {viewingQuestion && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-600">
                  {viewingQuestion.jenjang} • {viewingQuestion.kelas} • {viewingQuestion.materi}
                </span>
                <button onClick={() => setViewingQuestion(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="font-bold text-slate-800">{viewingQuestion.question}</p>
              <div className="text-xs text-emerald-700 font-bold">
                Kunci Jawaban: {viewingQuestion.correctAnswer}
              </div>
              <div className="p-3.5 rounded-2xl bg-pink-50 text-xs text-slate-700 whitespace-pre-line">
                <strong>Pembahasan:</strong>
                {'\n'}
                {viewingQuestion.explanation}
              </div>
            </div>
          </div>
        )}

        {editingAiQuestion && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 space-y-3">
              <h3 className="font-extrabold text-slate-800">Edit Soal Hasil AI</h3>
              <textarea
                rows={3}
                value={editingAiQuestion.question}
                onChange={(e) =>
                  setEditingAiQuestion({ ...editingAiQuestion, question: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-pink-200 text-sm"
              />
              <input
                type="text"
                value={editingAiQuestion.correctAnswer}
                onChange={(e) =>
                  setEditingAiQuestion({ ...editingAiQuestion, correctAnswer: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-pink-200 text-sm"
              />
              <textarea
                rows={3}
                value={editingAiQuestion.explanation}
                onChange={(e) =>
                  setEditingAiQuestion({ ...editingAiQuestion, explanation: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-pink-200 text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingAiQuestion(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setAiGeneratedQuestions((prev) =>
                      prev.map((q) => (q.tempId === editingAiQuestion.tempId ? editingAiQuestion : q))
                    );
                    setEditingAiQuestion(null);
                    showToast('Soal AI diperbarui!');
                  }}
                  className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {showPackageModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <form
              onSubmit={handleSavePackage}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-pink-100 space-y-4 my-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-800">
                  {editingPackage ? 'Edit Paket Latihan' : 'Buat Paket Latihan Baru'}
                </h3>
                <button type="button" onClick={() => setShowPackageModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                required
                placeholder="Judul Paket Latihan..."
                value={packageForm.title}
                onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 text-sm font-semibold"
              />

              <textarea
                rows={2}
                placeholder="Deskripsi singkat paket latihan..."
                value={packageForm.description}
                onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-pink-200 text-sm"
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <select
                  value={packageForm.jenjang}
                  onChange={(e) => {
                    const j = e.target.value;
                    setPackageForm({
                      ...packageForm,
                      jenjang: j,
                      kelas: CURRICULUM[j].kelas[0]
                    });
                  }}
                  className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                >
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>

                <select
                  value={packageForm.kelas}
                  onChange={(e) => setPackageForm({ ...packageForm, kelas: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                >
                  {CURRICULUM[packageForm.jenjang].kelas.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  max={180}
                  value={packageForm.duration}
                  onChange={(e) =>
                    setPackageForm({ ...packageForm, duration: Number(e.target.value) })
                  }
                  className="px-3 py-2 rounded-xl border border-pink-200 text-sm"
                  placeholder="Durasi (menit)"
                />

                <select
                  value={packageForm.status}
                  onChange={(e) => setPackageForm({ ...packageForm, status: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Pilih Soal dari Bank Soal Firestore ({packageForm.questionIds.length} terpilih):
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 border border-pink-100 rounded-2xl p-3">
                  {questions.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      Bank Soal masih kosong. Tambahkan soal terlebih dahulu.
                    </p>
                  ) : (
                    questions.map((q) => {
                      const checked = packageForm.questionIds.includes(q.id);
                      return (
                        <label
                          key={q.id}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-pink-50/60 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPackageForm({
                                  ...packageForm,
                                  questionIds: [...packageForm.questionIds, q.id]
                                });
                              } else {
                                setPackageForm({
                                  ...packageForm,
                                  questionIds: packageForm.questionIds.filter((id) => id !== q.id)
                                });
                              }
                            }}
                            className="mt-0.5 accent-pink-500"
                          />
                          <div>
                            <span className="font-bold text-pink-600">
                              [{q.jenjang} {q.kelas} - {q.materi}]
                            </span>{' '}
                            <span className="text-slate-700">{q.question}</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-md"
                >
                  Simpan Paket ke Firestore
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AuthContext.Provider>
  );
}