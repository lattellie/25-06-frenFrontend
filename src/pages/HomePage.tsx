// src/pages/HomePage.tsx
import { Box } from "@mui/material";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

import { useEffect, useState } from "react";
import {
  Accent,
  type Vocab,
  type VocabBackend,
} from "../type/vocabDD";
import { MdCheckBoxOutlineBlank, MdCheckBox } from "react-icons/md";
import { FaCirclePlay } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
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

export default function HomePage() {
  const voices = useVoices();
  const dispatch = useDispatch<AppDispatch>();
  // Selectors for unitClass slice
  const unitClassData: UnitClass[] = useSelector(
    (state: RootState) => state.unitClass.data
  );
  const unitClassLoading = useSelector(
    (state: RootState) => state.unitClass.loading
  );
  const unitClassError = useSelector(
    (state: RootState) => state.unitClass.error
  );

  // Selectors for vocab slice
  const vocabData = useSelector((state: RootState) => state.vocab.data);
  const vocabLoading = useSelector((state: RootState) => state.vocab.loading);
  const vocabError = useSelector((state: RootState) => state.vocab.error);

  const navigate = useNavigate();
  const [frenVocab, setFrenVocabs] = useState<VocabBackend[]>([]);
  const [expandedClasses, setExpandedClasses] = useState<string[]>([]); // controls dropdown visibility
  const [selectedClass, setSelectedClass] = useState<string | null>(null); // tracks selected class
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null); // tracks selected unit

  const [vocabList, setVocabList] = useState<Vocab[]>([]);
  useEffect(() => {
    dispatch(fetchUnitClassData());
  }, [dispatch]);
  useEffect(() => {
    if (selectedClass && selectedUnit) {
      dispatch(
        fetchVocabData({ className: selectedClass, unitName: selectedUnit })
      );
    }
  }, [dispatch, selectedClass, selectedUnit]);

  useEffect(() => {
    setVocabList(
      vocabData.map((v) => {
        return { vocab: v, selected: true };
      })
    );
  }, [vocabData]);

  useEffect(() => {
    const getData = async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND}/vocab`);
      const json = await res.json();
      const frenData = json.data as VocabBackend[];
      setFrenVocabs(frenData);
      console.log(frenData);
    };

    if (frenVocab.length === 0) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleClass = (className: string) => {
    setExpandedClasses((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className]
    );
  };

  const renderUnitClassToggle = (unitClassObj: UnitClass) => {
    const { class: className, units } = unitClassObj;

    const sortedUnits = [...units].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );

    const isExpanded = expandedClasses.includes(className);

    return (
      <Box
        key={className}
        className="border-gray-500 border-2 w-full mb-2 h-fit justify-start cursor-pointer select-none"
      >
        {/* Class Row */}
        <Box
          onClick={() => {
            toggleClass(className);
            setSelectedClass(className);
            setSelectedUnit(null);
          }}
          className={`p-2 px-6 flex justify-between items-center bg-sky-900 text-white ${isExpanded ? "border-b-2" : ""
            }`}
        >
          <Box>{className}</Box>
          <Box>{isExpanded ? <FiChevronUp /> : <FiChevronDown />}</Box>
        </Box>

        {isExpanded && (
          <Box>
            {sortedUnits.map((unit) => (
              <Box
                key={unit}
                onClick={() => {
                  if (selectedUnit === unit) {
                    setSelectedUnit(null)
                  } else {
                    setSelectedUnit(unit);
                  }
                  setSelectedClass(className);
                }}
                className={`p-2 px-6 w-full cursor-pointer flex justify-start select-none ${selectedUnit === unit ? "bg-sky-200" : ""
                  }`}
              >
                <div>{unit}</div>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  const handleNext = () => {
    const selectedList: VocabBackend[] = vocabList
      .filter((v) => v.selected)
      .map((r) => r.vocab);
    dispatch(updateFilteredData(selectedList));
    navigate("/play");
  };
  const handleTranslation = () => {
    const selectedList: VocabBackend[] = vocabList
      .filter((v) => v.selected)
      .map((r) => r.vocab);
    dispatch(updateFilteredData(selectedList));
    navigate("/translation");
  };
  function playAudio(vocab: VocabBackend, accent: Accent = Accent.IA) {
    const french: string = vocab.french;
    if (accent === Accent.IA) {
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

    } else if (accent === Accent.FR && vocab.mp3_url != "") {
      const audio = new Audio(vocab.mp3_url);
      audio.play();
    } else if (accent === Accent.QC && vocab.qc_url != "") {
      const audio = new Audio(vocab.qc_url);
      audio.play();
    } else if (accent === Accent.OT && vocab.tmp_url != "") {
      const audio = new Audio(vocab.tmp_url);
      audio.play();
    } 
  }

  function getUnitCards(unit: string, cls: string) {
    return (
      <li key={unit}
        onClick={() => {
          setSelectedClass(cls);
          setSelectedUnit(unit);
        }}
        className="p-10 bg-white shadow-lg m-2 mb-4  rounded-2xl cursor-pointer hover:bg-sky-200 hover:translate-1 ">
        <h1 className="text-2xl">{unit}</h1>
      </li>
    )
  }
  function vocabItem(vocab: Vocab, index: number) {
    const voc = vocab.vocab;
    const selected = vocab.selected;
    const isEven = index % 2 === 0;
    return (
      <div
        className={`flex border-b-[3px] ${isEven ? "bg-sky-100" : "bg-white"
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
          onClick={() => playAudio(voc, Accent.IA)}
          className={`text-xl cursor-pointer mr-4  text-cyan-500
            } p-0 m-0`}
        >
          <FaCirclePlay />
        </button>
        <button
          onClick={() => playAudio(voc, Accent.FR)}
          className={`text-xl mr-4  ${voc.mp3_url === "" ? "text-gray-200 !cursor-default" : "text-cyan-800 cursor-pointer"
            } p-0 m-0`}
          disabled={voc.mp3_url === ""}
        >
          <FaCirclePlay />
        </button>
        <button
          onClick={() => playAudio(voc, Accent.QC)}
          className={`text-xl cursor-pointer mr-4  ${voc.qc_url === "" ? "text-gray-200 !cursor-default" : "text-cyan-500 cursor-pointer"
            } p-0 m-0`}
          disabled={voc.qc_url === ""}
        >
          <FaCirclePlay />
        </button>
        <button
          onClick={() => playAudio(voc, Accent.OT)}
          className={`text-xl cursor-pointer mr-4  ${voc.tmp_url === "" ? "text-gray-200 !cursor-default" : "text-cyan-800 cursor-pointer"
            } p-0 m-0`}
          disabled={voc.tmp_url === ""}
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

  if (unitClassError || vocabError) {
    return <div>Error loading data</div>;
  }
  if (unitClassLoading || vocabLoading) {
    return <div>loading data...</div>;
  }
  return (
    <div className="flex h-[92vh] max-w-full">
      {/* Left Sidebar */}
      <div className="w-[20%] min-w-[200px] border-r-[3px] border-black overflow-y-scroll p-3 ml-1 space-y-2">
        {unitClassData.map((unitClassList) =>
          renderUnitClassToggle(unitClassList)
        )}
      </div>

      {/* Right Main Content */}
      <div className="flex flex-col flex-1 bg-cyan-50 overflow-auto">
        {selectedClass && selectedUnit && vocabData ? (
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
              <div
                className={`flex border-b-[3px] bg-white border-gray-300 pl-4 py-1 items-center`}
              >
                <div
                  className="mr-4 text-sky-900 text-xl opacity-0"
                >
                  <MdCheckBoxOutlineBlank />
                </div>

                <div
                  title="Intelligence Artificielle (AI)"
                  className="mr-4 text-sky-900 cursor-help text-xl"
                >
                  IA
                </div>
                <div
                  title="Français (France)"
                  className="mr-4 text-sky-900 cursor-help text-xl"
                >
                  FR
                </div>
                <div
                  title="Québécois (Canada)"
                  className="mr-4 text-sky-900 cursor-help text-xl"
                >
                  QC
                </div>
                <div
                  title="Another Accent"
                  className="mr-4 text-sky-900 cursor-help text-xl"
                >
                  ??
                </div>
              </div>

              <div className="scrollbar overflow-y-scroll h-[60vh] max-h-fit min-w-fit scrollbar">
                {vocabList.map((v, i) => vocabItem(v, i))}
              </div>
              <div className="flex flex-row gap-2 justify-end py-2">
                <button
                  className={`text-lg w-[150px] min-w-fit px-3 py-1 rounded-xl
                        ${vocabList.some((v) => v.selected)
                      ? "bg-[#0c4a6e] hover:bg-[#082f49] text-white cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  onClick={handleTranslation}
                  disabled={!vocabList.some((v) => v.selected)}
                >
                  Translation
                </button>

                <button
                  className={`text-lg w-[150px] min-w-fit px-3 py-1 rounded-xl
                        ${vocabList.some((v) => v.selected)
                      ? "bg-[#0c4a6e] hover:bg-[#082f49] text-white cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  onClick={handleNext}
                  disabled={!vocabList.some((v) => v.selected)}
                >
                  Dictation
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className=" p-4 w-full h-full flex flex-col justify-center text-center">
            {unitClassData.map((cls) => {
              return (
                <div className="flex flex-col gap-3 overflow-y-scroll mt-4 bg-sky-900 rounded-2xl">
                  <h1 className="text-xl text-left ml-4 mt-4 text-white">{cls.class}</h1>
                  <ul key={cls.class}
                    className=" flex flex-row overflow-scroll">
                    {cls.units.map((u) => { return getUnitCards(u, cls.class) })}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
