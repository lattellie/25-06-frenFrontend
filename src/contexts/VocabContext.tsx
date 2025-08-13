import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { Accent, type Vocab, type VocabUnit } from "../type/vocabDD";

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

interface DisplayHintContextType {
  displayHint: boolean;
  setDisplayHint: (displayHint: boolean) => void;
}
interface SpeedContextType {
  speed: number;
  setSpeed: (speed: number) => void;
}

interface SpeakerAccentContextType {
  speakerAccent: Accent;
  setSpeakerAccent: (speakerAccent: Accent) => void;
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
const DisplayHintContext = createContext<DisplayHintContextType | undefined>(
  undefined
);
const SpeedContext = createContext<SpeedContextType | undefined>(undefined);
const SpeakerAccentContext = createContext<SpeakerAccentContextType | undefined>(undefined);

export const useSpeakerAccentContext = () => {
  const context = useContext(SpeakerAccentContext);
  if (!context)
    throw new Error("SpeakerAccentContext must be used within a VocabProvider");
  return context;
}
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
export const useDisplayHintContext = () => {
  const context = useContext(DisplayHintContext);
  if (!context)
    throw new Error("useDisplayHintContextType must be used within a VocabProvider");
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
  const [useAudio, setUseAudio] = useState<boolean>(true);
  const [displayHint, setDisplayHint] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(5);
  const [speakerAccent, setSpeakerAccent] = useState<Accent>(Accent.IA);
  return (
    <SpeedContext.Provider value={{ speed, setSpeed }}>
      <UseAudioContext.Provider value={{ useAudio, setUseAudio }}>
        <UseAccentContext.Provider value={{ useAccent, setUseAccent }}>
          <ShowEnglishContext.Provider value={{ showEnglish, setShowEnglish }}>
            <VocabUnitContext.Provider value={{ units, setUnits }}>
              <VocabContext.Provider value={{ vocabs, setVocabs }}>
                <DisplayHintContext.Provider value={{ displayHint, setDisplayHint }}>
                  <SpeakerAccentContext.Provider value={{ speakerAccent, setSpeakerAccent }}>
                    {children}
                  </SpeakerAccentContext.Provider>
                </DisplayHintContext.Provider>
              </VocabContext.Provider>
            </VocabUnitContext.Provider>
          </ShowEnglishContext.Provider>
        </UseAccentContext.Provider>
      </UseAudioContext.Provider>
    </SpeedContext.Provider>
  );
};
