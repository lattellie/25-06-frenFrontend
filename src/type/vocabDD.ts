export interface VocabEntry {
  engl: string;
  fren: string;
}

export interface Vocab {
  vocab: VocabBackend;
  selected: boolean
}
export interface VocabUnit {
  name: string;
  vocabs: Vocab[];
}

export interface VocabBackend {
  _id: string;
  french: string;
  english: string;
  unit: string;
  class: string;
  mp3_url: string;
  qc_url:string;
  tmp_url:string;
}

export interface InsertVocabBackend {
  french: string;
  english: string;
  unit: string;
  class: string;
  mp3_url: string;
  qc_url:string;
  tmp_url:string;
}
export const Accent = {
  IA: "Intelligence Artificielle (AI)",
  FR: "Français (France)",
  QC: "Québécois (Canada)",
  OT: "Other"
} as const;
export type Accent = typeof Accent[keyof typeof Accent];
