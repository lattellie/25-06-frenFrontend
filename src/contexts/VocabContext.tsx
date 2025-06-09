import { createContext, useContext, useState } from 'react';
import type {ReactNode} from 'react';
import type { Vocab, VocabUnit} from '../type/vocabDD';


interface VocabContextType {
  vocabs: Vocab[];
  setVocabs: (vocabs: Vocab[]) => void;
}

interface VocabUnitContextType {
    units: VocabUnit[];
    setUnits: (units: VocabUnit[]) => void;

}

const VocabContext = createContext<VocabContextType | undefined>(undefined);
const VocabUnitContext = createContext<VocabUnitContextType | undefined>(undefined);

export const useVocabContext = () => {
  const context = useContext(VocabContext);
  if (!context) {
    throw new Error('useVocabContext must be used within a VocabProvider');
  }
  return context;
};

export const useVocabUnitContext = () => {
  const context = useContext(VocabUnitContext);
  if (!context) {
    throw new Error('useVocabUnitContext must be used within a VocabProvider');
  }
  return context;
};
export const VocabProvider = ({ children }: { children: ReactNode }) => {
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [units, setUnits] = useState<VocabUnit[]>([]);

  return (
    <VocabUnitContext.Provider value={{units, setUnits}}>
    <VocabContext.Provider value={{ vocabs, setVocabs }}>
      {children}
    </VocabContext.Provider>

    </VocabUnitContext.Provider>
  );
};
