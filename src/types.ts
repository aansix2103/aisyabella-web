// ============================================================================
// GENERATOR SOAL LES PRIVATE MATEMATIKA (studywith.aisyabella)
// ============================================================================

export interface Soal {
  id: string;
  nomor: number;
  bentuk: string;
  elemenCP: string;
  tujuanPembelajaran: string;
  indikatorSoal: string;
  levelKognitif: string;
  tingkatKesulitan: string;
  stimulus: string;
  pertanyaan: string;
  opsi: Record<string, string>;
  kunciJawaban: string;
  pembahasan: string;
  skorMaksimal: number;
}

export interface Identitas {
  namaSekolah: string;
  alamatSekolah: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  jenjang: 'SD' | 'SMP' | 'SMA';
  kelas: string;
  mapel: string;
  jenisAsesmen: 'Formatif' | 'Sumatif' | 'ASTS' | 'ASAS';
  alokasiWaktu: string;
  tanggalUjian: string;
  namaGuru: string;
}

export interface BentukSoal {
  PG: number;
  PGK: number;
  BS: number;
  Menjodohkan: number;
  Isian: number;
  Uraian: number;
}

export interface ProporsiKesulitan {
  mudah: number;
  sedang: number;
  sulit: number;
}

export interface PrintOptions {
  tampilkanKisiKisi: boolean;
  tampilkanNaskahSoal: boolean;
  tampilkanKunciJawaban: boolean;
  tampilkanPedomanSkor: boolean;
}

export interface ProjectData {
  versi: string;
  tanggalSimpan: string;
  identitas: Identitas;
  selectedElemen: string[];
  topikMateri: string;
  tujuanPembelajaran: string;
  dimensiProfil: string[];
  bentukSoal: BentukSoal;
  opsiPG: number;
  proporsiKesulitan: ProporsiKesulitan;
  soalList: Soal[];
}

export interface StatusMsg {
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface CPElemen {
  e: string;
  t: string;
}

export interface CPFase {
  sumber: string;
  elemen: CPElemen[];
}

export interface AIGeneratorForm {
  jenjang: string;
  kelas: string;
  materi: string;
  submateri: string;
  difficulty: string;
  count: number;
  type: string;
  abilityLevel: string;
}
