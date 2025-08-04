import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Vocab, VocabUnit } from "../type/vocabDD";

// Existing interfaces
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
  setUseAccent: (useAccent: boolean) => void;
}

interface UseAudioContextType {
  useAudio: boolean;
  setUseAudio: (useAudio: boolean) => void;
}

interface SpeedContextType {
  speed: number;
  setSpeed: (speed: number) => void;
}

// Contexts
const VocabContext = createContext<VocabContextType | undefined>(undefined);
const VocabUnitContext = createContext<VocabUnitContextType | undefined>(
  undefined
);
const ShowEnglishContext = createContext<ShowEnglishContextType | undefined>(
  undefined
);
const UseAccentContext = createContext<UseAccentContextType | undefined>(
  undefined
);
const UseAudioContext = createContext<UseAudioContextType | undefined>(
  undefined
);
const SpeedContext = createContext<SpeedContextType | undefined>(undefined); // ✅

// Hooks
export const useVocabContext = () => {
  const context = useContext(VocabContext);
  if (!context)
    throw new Error("useVocabContext must be used within a VocabProvider");
  return context;
};

export const useVocabUnitContext = () => {
  const context = useContext(VocabUnitContext);
  if (!context)
    throw new Error("useVocabUnitContext must be used within a VocabProvider");
  return context;
};

export const useShowEnglishContext = () => {
  const context = useContext(ShowEnglishContext);
  if (!context)
    throw new Error(
      "useShowEnglishContext must be used within a VocabProvider"
    );
  return context;
};

export const useUseAccentContext = () => {
  const context = useContext(UseAccentContext);
  if (!context)
    throw new Error("useUseAccentContext must be used within a VocabProvider");
  return context;
};

export const useUseAudioContext = () => {
  const context = useContext(UseAudioContext);
  if (!context)
    throw new Error("useUseAudioContext must be used within a VocabProvider");
  return context;
};

export const useSpeedContext = () => {
  const context = useContext(SpeedContext);
  if (!context)
    throw new Error("useSpeedContext must be used within a VocabProvider");
  return context;
};

// Provider
export const VocabProvider = ({ children }: { children: ReactNode }) => {
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [units, setUnits] = useState<VocabUnit[]>([]);
  const [showEnglish, setShowEnglish] = useState<boolean>(true);
  const [useAccent, setUseAccent] = useState<boolean>(true);
  const [useAudio, setUseAudio] = useState<boolean>(true); // ✅ renamed
  const [speed, setSpeed] = useState<number>(5);

  return (
    <SpeedContext.Provider value={{ speed, setSpeed }}>
      <UseAudioContext.Provider value={{ useAudio, setUseAudio }}>
        <UseAccentContext.Provider value={{ useAccent, setUseAccent }}>
          <ShowEnglishContext.Provider value={{ showEnglish, setShowEnglish }}>
            <VocabUnitContext.Provider value={{ units, setUnits }}>
              <VocabContext.Provider value={{ vocabs, setVocabs }}>
                {children}
              </VocabContext.Provider>
            </VocabUnitContext.Provider>
          </ShowEnglishContext.Provider>
        </UseAccentContext.Provider>
      </UseAudioContext.Provider>
    </SpeedContext.Provider>
  );
};
