/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/getData.ts

import type { VocabEntry } from "../type/vocabDD";


export async function getData(title: string): Promise<VocabEntry[]> {
  const files: Record<string, () => Promise<any>> = import.meta.glob('../data/*.json');
  const matchedKey = Object.keys(files).find((path) => path.includes(`${title}.json`));

  if (!matchedKey) throw new Error(`No data file found for title: ${title}`);

  const jsonData = await files[matchedKey]();
  const data = jsonData.default as Record<string, string>; // 👈 Cast the type

  const entries: VocabEntry[] = Object.entries(data).map(([engl, fren]) => ({
    engl,
    fren,
  }));

  return entries;
}

export function getTitles(): string[] {
  const files = import.meta.glob('../data/*.json', { eager: true });
  return Object.keys(files).map((path) =>
    path.split('/').pop()?.replace('.json', '') || ''
  );
}
