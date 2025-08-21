import { Box, Typography, useTheme } from "@mui/material";
import {
  useShowEnglishContext,
  useSpeakerAccentContext,
  useUseAccentContext,
} from "../contexts/VocabContext";
import { Accent, type VocabBackend } from "../type/vocabDD";
import { FaCirclePlay } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const frenchCharSet = [
  "'",
  "a",
  "à",
  "â",
  "b",
  "c",
  "ç",
  "d",
  "e",
  "é",
  "è",
  "ê",
  "ë",
  "f",
  "g",
  "h",
  "i",
  "î",
  "ï",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "ô",
  "œ",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "ù",
  "û",
  "ü",
  "v",
  "w",
  "x",
  "y",
  "ÿ",
  "z",
  "-",
];

function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        setVoices(allVoices);
      }
    };

    // Some browsers delay loading voices
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      loadVoices();
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return voices;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

function noAccentEqual(str1: string, str2: string) {
  const str11 = str1.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const str22 = str2.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return str11 === str22;
}

function playMp3(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);

    audio.onended = () => resolve();
    audio.onerror = (e) => reject(e);

    audio.play();
  });
}

const stubVocabBackend: VocabBackend = {
  _id: '0',
  french: '0',
  english: '0',
  unit: '0',
  class: '0',
  mp3_url: ''
} as VocabBackend

export default function DictationPage() {
  const theme = useTheme();
  const { speakerAccent } = useSpeakerAccentContext();
  const { useAccent, setUseAccent } = useUseAccentContext();
  const { showEnglish, setShowEnglish } = useShowEnglishContext();
  const vocabs: VocabBackend[] = useSelector(
    (state: RootState) => state.vocab.filteredData
  );
  const [firstLoad, setFirstLoad] = useState(true);

  const voices = useVoices();
  const navigate = useNavigate();

  const [currVocabs, setCurrVocabs] = useState<VocabBackend[]>(
    shuffleArray(vocabs)
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [nowSubmit, setNowSubmit] = useState<boolean>(true); // if it's displaying answer or submitting
  const [typing, setTyping] = useState<string>("");
  const [target, setTarget] = useState<VocabBackend>(stubVocabBackend);
  const [targetNoSpace, setTargetNoSpace] = useState<string>("");

  const [finishPracticing, setFinishPracticing] = useState<boolean>(false);

  useEffect(() => {
    setTargetNoSpace(target.french.replace(/\s/g, ""));
  }, [target]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace") {
      if (typing.length > 0) {
        setTyping(typing.slice(0, -1));
      } else {
        setTyping("");
      }
    } else if (e.key === "Delete") {
      setTyping("");
    } else if (
      frenchCharSet.includes(e.key) &&
      typing.length < targetNoSpace.length
    ) {
      setTyping(typing.concat(e.key));
    } else if (e.key === "Enter") {
      handleSubmitOrContinue(e);
    }
  };

  function textBox() {
    let temp = 0;
    const showString = target.french
      .split("")
      .map((char, i) => {
        if (char === " ") {
          temp++;
          return " ";
        }
        return typing[i - temp] || "_";
      })
      .join("");

    return (
      <Box
        tabIndex={0}
        sx={{
          backgroundColor: nowSubmit
            ? theme.palette.white.main
            : theme.palette.yellow.main,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box
          sx={{
            p: 1,
          }}
        >
          <Typography variant="h4">{"  "}</Typography>
        </Box>
        {showString.split(" ").map((word, idx) => (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 1,
              pb: 2,
            }}
          >
            {word.split("").map((char, cidx) => (
              <Box key={`${idx}-${cidx}`}>
                <Typography variant="h4">{char}</Typography>
              </Box>
            ))}
            <Box
              sx={{
                p: 1,
              }}
            >
              <Typography variant="h4">{"  "}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  async function playAudio(vocab: VocabBackend) {
    const french: string = vocab.french;
    if (speakerAccent === Accent.FR && vocab.mp3_url !== "") {
      const audio = new Audio(vocab.mp3_url);
      await audio.play();
    } else if (speakerAccent === Accent.QC && vocab.qc_url !== "") {
      const audio = new Audio(vocab.qc_url);
      await audio.play();
    } else {
      if (!french || voices.length === 0) {
        console.warn("Voices not loaded yet");
        return;
      }

      const msg = new SpeechSynthesisUtterance(french);
      msg.lang = "fr";

      // Pick a French voice
      msg.voice = voices.find((v) => v.lang.startsWith("fr-CA")) || null;

      window.speechSynthesis.cancel(); // <-- Optional: cancel any ongoing speech
      window.speechSynthesis.speak(msg);
    }
  }

  const handleSubmitOrContinue = async (e: { preventDefault: () => void }) => {
    if (nowSubmit) {
      await handleWordSubmit(e)
    } else {
      await updateAndGetNewWords()
    }
  }
  const handleWordSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("typing:", typing);
    const userAnswer = typing.trim().toLowerCase();
    if (
      (userAnswer === target.french.replace(/\s/g, "").toLowerCase())
      || (!useAccent && noAccentEqual(
        userAnswer,
        target.french.replace(/\s/g, "").toLowerCase()
      ))
    ) {
      await playMp3("/correct1.mp3");
      const updated = currVocabs.filter((_, i) => i !== currentIndex);
      setCurrVocabs(updated);
    } else {
      await playMp3("/wrong.mp3");
    }
    setTyping(target.french.replace(/\s/g, ""));
    setNowSubmit(false);
  }
  const gameInterface = () => {
    return (
      <div className="p-2 pl-4 flex-1 flex flex-col gap-2 overflow-x-scroll h-full justify-center items-center bg-white border-b-[3px] border-black">
        {!finishPracticing ? (<>
          <div
            className="m-0 p-0 cursor-pointer text-cyan-400 transition-colors duration-300 hover:text-sky-900"
            onClick={async () => {
              await playAudio(target)
            }}
          >
            <FaCirclePlay fontSize="100px" />
          </div>
          {showEnglish &&
            <h1 className="text-2xl mb-2">
              {target.english}
            </h1>}
          <form onSubmit={
            (e) => {
              handleSubmitOrContinue(e)
            }
          } className="flex flex-col gap-4">
            {textBox()}
            <button
              type="submit"
              className="bg-sky-900 text-white px-4 py-2 rounded hover:bg-sky-950"
            >
              {nowSubmit ? "Submit" : "Continue"}
            </button>
          </form>
        </>) : (
          <h2 className="text-xl">Finish Practicing</h2>
        )}

      </div>

    )
  }
  async function updateAndGetNewWords() {
    if (currVocabs.length > 0) {
      const randomIndex = Math.floor(Math.random() * currVocabs.length);
      setCurrentIndex(randomIndex);
      setTarget(currVocabs[randomIndex]);
      await playAudio(currVocabs[randomIndex]);
      setNowSubmit(true)
    } else {
      setFinishPracticing(true)
    }
    setTyping('');
  }

  if (firstLoad) {
    return (
      <div className="flex h-[92vh]">
        <div className="w-full flex flex-col bg-cyan-50">
          <div className="p-2 pl-4 pt-0 min-h-fit h-[7vh] border-b-[3px] border-cyan-200 flex items-center justify-between">
            <p>{`Current Progress: ${vocabs.length - currVocabs.length}/${vocabs.length
              }`}</p>
            <h2
              className="text-sky-900 text-2xl cursor-pointer"
              onClick={() => navigate("/")}
            >
              x
            </h2>
          </div>

          <div
            className="p-2 bg-white border-b-[3px] border-black flex-1 pl-4 flex flex-col gap-2 overflow-x-scroll h-full justify-center items-center"
          >
            <div
              className="text-[30px] gap-2 flex flex-row m-0 cursor-pointer"
              onClick={() => setShowEnglish(!showEnglish)}
            >
              {showEnglish ? (
                <MdCheckBox className="text-sky-900" />
              ) : (
                <MdCheckBoxOutlineBlank className="text-sky-900" />
              )}
              <h6 className="text-lg">Display English translation</h6>
            </div>

            <div
              className="text-[30px] gap-2 flex flex-row m-0 mb-4 cursor-pointer"
              onClick={() => setUseAccent(!useAccent)}
            >
              {useAccent ? (
                <MdCheckBox className="text-sky-900" />
              ) : (
                <MdCheckBoxOutlineBlank className="text-sky-900" />
              )}
              <h6 className="text-lg">Test me with accent</h6>
            </div>
            <button
              onClick={async () => {
                setFirstLoad(false)
                await updateAndGetNewWords()
              }}
              className="bg-sky-900 text-white px-6 py-2 rounded-xl hover:bg-sky-950 cursor-pointer"
            >
              <h4 className="text-xl">Start</h4>
            </button>
          </div>

          <div className="flex p-4 justify-between pr-8">
            <button
              className="bg-sky-900 text-white rounded-full w-250px min-w-fit py-2 px-4 hover:bg-sky-950"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex h-[92vh]"
      tabIndex={0}
      onKeyDown={(e) => handleKeyDown(e)}
    >
      <div className="w-full flex flex-col bg-cyan-50">
        <div className="p-2 pl-4 pt-0 min-h-fit border-b-[3px] border-cyan-50 h-[7vh] flex flex-row items-center justify-between">
          <p className="text-base">
            {`Current Progress: ${vocabs.length - currVocabs.length}/${vocabs.length
              }`}
          </p>
          <h1
            className="text-2xl text-sky-900 cursor-pointer"
            onClick={() => navigate("/")}
          >
            x
          </h1>
        </div>

        <div className="p-2 pl-4 flex-1 flex flex-col gap-2 overflow-x-scroll h-full justify-center items-center bg-white border-b-[3px] border-black">
          {gameInterface()}
        </div>

        <div className="flex p-4 justify-between pr-8">
          <button
            className="bg-sky-900 text-white rounded-full hover:bg-sky-950 px-4 py-2"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>

          <button
            className={`${currVocabs.length !== 0
              ? "bg-cyan-50"
              : "bg-sky-900 hover:bg-sky-950"
              } text-white rounded-full w-[10vw] px-4 py-2`}
            onClick={() => navigate("/viewVocab")}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
