import { Box, Typography, useTheme } from "@mui/material";
import {
  useSpeedContext,
  useUseAccentContext,
  useUseAudioContext,
} from "../contexts/VocabContext";
import type { VocabBackend } from "../type/vocabDD";
import { useEffect, useRef, useState } from "react";
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

export default function TranslationPage() {
  const theme = useTheme();
  const { useAudio, setUseAudio } = useUseAudioContext();
  const { useAccent, setUseAccent } = useUseAccentContext();
  const { speed, setSpeed } = useSpeedContext();
  const [falling, setFalling] = useState(true);
  const [duration, setDuration] = useState<number>(1000);
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
  const [frozenTransform, setFrozenTransform] = useState<string | null>(null);
  const [target, setTarget] = useState<VocabBackend>(stubVocabBackend);
  const [targetNoSpace, setTargetNoSpace] = useState<string>("");
  const [wordFlag, setWordFlag] = useState<boolean>(true)
  const [finishPracticing, setFinishPracticing] = useState<boolean>(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    setDuration(speed * 1000);
  }, [speed]);

  useEffect(() => {
    setFalling(false);
    setFrozenTransform(null);
  }, [wordFlag]);

  useEffect(() => {
    if (falling === false) {
      const timeout = setTimeout(() => {
        setFalling(true);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [falling]);


  useEffect(() => {
    if (!nowSubmit || finishPracticing) return;
    const timer = setTimeout(() => {
      handleWordSubmit({ preventDefault: () => { } });
    }, duration);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, finishPracticing, nowSubmit]);

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
    if (!useAudio) {
      return;
    }
    const french: string = vocab.french;
    if (vocab.mp3_url != "") {
      const audio = new Audio(vocab.mp3_url);
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
    if (isSubmittingRef.current) {
      console.log("unable to submit")
      return
    }
    console.log("able to submit")
    isSubmittingRef.current = true;
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

    const fallingDiv = document.getElementById("falling-word");
    if (fallingDiv) {
      const style = window.getComputedStyle(fallingDiv);
      const matrix: string = style.transform;
      if (matrix && matrix !== "none") {
        const match = matrix.match(/matrix.*\((.+)\)/);
        console.log("match: ", match);
        if (match && match[1]) {
          const values = match[1].split(", ");
          const translateX = parseFloat(values[4]);
          const translateY = parseFloat(values[5]);
          setFrozenTransform(`translate(${translateX}px, ${translateY}px)`);
        } else {
          setFrozenTransform(null);
        }
      } else {
        setFrozenTransform(null);
      }
    }
    setFalling(false);
    isSubmittingRef.current = false;
  }
  const gameInterface = () => {
    return (
      <>
        {!finishPracticing ? (<>
          <div className="relative  flex-3/4 w-full overflow-hidden">
            <div
              id="falling-word"
              className="absolute h-full top-0 left-1/2 transform -translate-x-1/2 text-2xl font-bold ease-linear"
              style={{
                transitionProperty: frozenTransform ? "none" : "transform",
                transitionDuration: frozenTransform
                  ? "0ms"
                  : falling
                    ? `${duration}ms`
                    : "0ms",
                transform: frozenTransform
                  ? frozenTransform
                  : falling
                    ? "translateX(-50%) translateY(90%)"
                    : "translateX(-50%) translateY(0)",
              }}
            >
              {target.english}
            </div>
          </div>
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
      </>
    )
  }
  function updateIndex(randomIndex: number) {
    setCurrentIndex(randomIndex);
    setWordFlag(!wordFlag);
  }
  async function updateAndGetNewWords() {
    setTyping('');
    if (currVocabs.length > 0) {
      const randomIndex = Math.floor(Math.random() * currVocabs.length);
      updateIndex(randomIndex);
      setTarget(currVocabs[randomIndex]);
      await playAudio(currVocabs[randomIndex]);
      setNowSubmit(true)
    } else {
      setFinishPracticing(true)
    }
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
              onClick={() => setUseAudio(!useAudio)}
            >
              {useAudio ? (
                <MdCheckBox className="text-sky-900" />
              ) : (
                <MdCheckBoxOutlineBlank className="text-sky-900" />
              )}
              <h6 className="text-lg">Play French audio</h6>
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

            <div className="flex flex-col gap-2 mb-4">
              <label
                htmlFor="speed"
                className="text-lg text-sky-900 font-medium"
              >
                Question Speed: {speed}
              </label>
              <input
                type="range"
                id="speed"
                name="speed"
                min="6"
                max="20"
                step="2"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-sky-900"
              />
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
