export interface VocabEntry {
  engl: string;
  fren: string;
}

export interface Vocab {
    vocab: VocabEntry;
    selected: boolean
}
export interface VocabUnit {
    name: string;
    vocabs: Vocab[];
}