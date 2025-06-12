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

interface ShowEnglishContextType {
    showEnglish: boolean;
    setShowEnglish: (showEnglish: boolean) => void;
}

interface UseAccentContextType {
    useAccent: boolean;
    setUseAccent: (showEnglish: boolean) => void;
}

const VocabContext = createContext<VocabContextType | undefined>(undefined);
const VocabUnitContext = createContext<VocabUnitContextType | undefined>(undefined);
const showEnglishContext = createContext<ShowEnglishContextType|undefined>(undefined);
const useAcdentContext = createContext<UseAccentContextType|undefined>(undefined);

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


export const useShowEnglishContext = () => {
  const context = useContext(showEnglishContext);
  if (!context) {
    throw new Error('useVocabContext must be used within a VocabProvider');
  }
  return context;
};

export const useUseAccentContext = () => {
  const context = useContext(useAcdentContext);
  if (!context) {
    throw new Error('useVocabContext must be used within a VocabProvider');
  }
  return context;
};

export const VocabProvider = ({ children }: { children: ReactNode }) => {
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [units, setUnits] = useState<VocabUnit[]>([]);
  const [showEnglish, setShowEnglish] = useState<boolean>(true);
  const [useAccent, setUseAccent] = useState<boolean>(true);
 
  return (
    <useAcdentContext.Provider value={{useAccent, setUseAccent}}>
    <showEnglishContext.Provider value={{showEnglish, setShowEnglish}}>
    <VocabUnitContext.Provider value={{units, setUnits}}>
    <VocabContext.Provider value={{ vocabs, setVocabs }}>
      {children}
    </VocabContext.Provider>
    </VocabUnitContext.Provider>
    </showEnglishContext.Provider>
    </useAcdentContext.Provider>
  );
};
