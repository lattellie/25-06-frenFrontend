import { Box, Button, Typography, useTheme } from "@mui/material";
import { useVocabContext, useVocabUnitContext } from "../contexts/VocabContext";
import { FaCirclePlay } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

import { getData, getTitles } from "../utils/getData";
import {
  type Vocab,
  type VocabUnit,
  type VocabEntry,
  type VocabBackend,
} from "../type/vocabDD";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { fetchUnitClassData, type UnitClass } from "../slices/unitClassSlice";
import { fetchVocabData, updateFilteredData } from "../slices/vocabSlice";

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

export default function VocabPage() {
  const theme = useTheme();
  const { units, setUnits } = useVocabUnitContext();
  const voices = useVoices();
  const vocabData = useSelector((state: RootState) => state.vocab.data);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [vocabList, setVocabList] = useState<Vocab[]>([]);
  useEffect(() => {
    dispatch(fetchUnitClassData());
  }, [dispatch]);

  useEffect(() => {
    setVocabList(
      vocabData.map((v) => {
        return { vocab: v, selected: true };
      })
    );
  }, [vocabData]);

  function selectAll(currUnit: VocabUnit, allChosen: boolean) {
    setUnits(
      units.map((u: { name: string; vocabs: Vocab[] }) =>
        u.name === currUnit.name
          ? {
              ...u,
              vocabs: u.vocabs.map((v) => ({ ...v, selected: !allChosen })),
            }
          : u
      )
    );
  }
  function vocabItem(vocab: Vocab, index: number) {
    const voc = vocab.vocab;
    const selected = vocab.selected;
    const isEven = index % 2 === 0;
    return (
      <div
        className={`flex border-b-[3px] ${
          isEven ? "bg-sky-100" : "bg-white"
        } border-gray-300 pl-4 py-1 items-center`}
      >
        {/* Select checkbox button */}
        <button
          onClick={() => {
            setVocabList((prev) =>
              prev.map((item, idx) =>
                idx === index ? { ...item, selected: !item.selected } : item
              )
            );
          }}
          className="mr-4 text-sky-900 cursor-pointer text-xl"
        >
          {selected ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
        </button>

        {/* Play audio button */}
        <button
          onClick={() => playAudio(voc)}
          className={`text-xl cursor-pointer mr-4  ${
            voc.mp3_url === "" ? "text-cyan-500" : "text-cyan-800"
          } p-0 m-0`}
        >
          <FaCirclePlay />
        </button>

        {/* French word */}
        <div className="flex items-center w-[40%] min-w-[200px]">
          {voc.french}
        </div>

        {/* English translation */}
        <div className="w-full">{voc.english}</div>
      </div>
    );
  }
  function titleItem(title: string) {
    return (
      <Button
        key={title}
        sx={{
          backgroundColor: theme.palette.yellow.main,
          color: theme.palette.yellow.contrastText,
          m: 0,
          p: "4px",
          pl: "10px",
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "250px",
          borderColor: theme.palette.brown.main,
          borderStyle: "solid",
          borderWidth: "2px",
          borderRadius: "2rem",
          textTransform: "none",
          gap: 1,
          minWidth: "fit-content",
          height: "fit-content",
          "&:hover": {
            backgroundColor: theme.palette.beige.dark,
          },
        }}
      >
        <Typography variant="body2" sx={{}}>
          {title}
        </Typography>
      </Button>
    );
  }
  function playAudio(vocab: VocabBackend) {
    const french: string = vocab.french;
    if (vocab.mp3_url != "") {
      const audio = new Audio(vocab.mp3_url);
      audio.play();
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

  return (
    <Box
      sx={{
        display: "flex",
        height: "92vh",
      }}
    >
      <div className="w-full flex flex-col bg-cyan-50">
        {vocabData ? (
          <div className="w-full h-full flex flex-col justify-center p-2">
            <div className="min-w-fit h-fit flex flex-col mr-2 border-[3px] border-sky-200 bg-white rounded-2xl p-4">
              <div className="border-b-[3px] border-gray-400 pb-2">
                <button
                  className="text-white bg-sky-900 hover:bg-sky-950 px-3 py-1 rounded-xl cursor-pointer"
                  onClick={() => {
                    if (vocabList.every((vocab) => vocab.selected)) {
                      const vocUpdated = vocabList.map((v) => ({
                        vocab: v.vocab,
                        selected: false,
                      }));
                      setVocabList(vocUpdated);
                    } else {
                      const vocUpdated = vocabList.map((v) => ({
                        vocab: v.vocab,
                        selected: true,
                      }));
                      setVocabList(vocUpdated);
                    }
                  }}
                >
                  {vocabList.every((vocab) => vocab.selected)
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              <div className="scrollbar overflow-y-scroll h-[60vh] max-h-fit min-w-fit scrollbar">
                {vocabList.map((v, i) => vocabItem(v, i))}
              </div>
              <div className="flex flex-row gap-2 justify-end py-2">
                <Button
                  sx={{
                    backgroundColor: theme.palette.brown.main,
                    color: theme.palette.brown.contrastText,
                    borderRadius: "5rem",
                    width: "10vw",
                    "&:hover": {
                      backgroundColor: theme.palette.brown.dark,
                    },
                  }}
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  Back To Home
                </Button>
                <Button
                  sx={{
                    backgroundColor: theme.palette.brown.main,
                    color: theme.palette.brown.contrastText,
                    borderRadius: "5rem",
                    width: "10vw",
                    "&:hover": {
                      backgroundColor: theme.palette.brown.dark,
                    },
                  }}
                  onClick={() => {
                    const selectedList: VocabBackend[] = vocabList
                      .filter((v) => v.selected)
                      .map((r) => r.vocab);
                    if (selectedList.length > 0) {
                      dispatch(updateFilteredData(selectedList));
                      navigate("/play");
                    } else {
                      alert("select at least 1 vocab to continue");
                    }
                  }}
                >
                  Restart
                </Button>{" "}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-center text-center">
            <h5 className="text-2xl">
              Select a class from left bar to Continue
            </h5>
          </div>
        )}
      </div>
    </Box>
  );
}
