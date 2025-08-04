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
}
