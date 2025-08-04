import { useEffect, useState, useRef } from "react";
import Uploadcsv from "../components/Uploadcsv";
import {
  Trash2,
  Pencil,
  X,
  Plus,
  Volume2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "./supabaseClient";

type VocabItem = {
  _id: string;
  french: string;
  english: string;
  unit?: string;
  class?: string;
  mp3_url?: string;
};

export default function RecordPageMongo2() {
  const [vocabData, setVocabData] = useState<VocabItem[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [IsModalOpen, setIsModalOpen] = useState(false); // for the add csv pop up
  const chunks: Blob[] = [];
  const [IsEditing, setIsEditing] = useState(false); // for the add csv pop up
  const selectedRef = useRef<HTMLDivElement>(null);
  const [expandedClasses, setExpandedClasses] = useState<string[]>([]);

  const toggleClass = (cls: string) => {
    setExpandedClasses(
      (prev) =>
        prev.includes(cls)
          ? prev.filter((c) => c !== cls) // remove it if already expanded
          : [...prev, cls] // add it if not expanded
    );
  };

  const [editVocab, setEditVocab] = useState<VocabItem>({
    _id: "",
    french: "",
    english: "",
    unit: "",
    class: "",
    mp3_url: "",
  });

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleUpdateVocab = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:3001/vocab/${editVocab._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editVocab),
      });

      const data = await res.json();
      if (data.success) {
        alert("Vocab updated!");
        // update local state
        setVocabData((prev) =>
          prev.map((v) => (v._id === editVocab._id ? editVocab : v))
        );
        setIsEditing(false);
      } else {
        alert("Failed to update vocab: " + data.message);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error updating vocab: " + err.message);
    }
  };

  // --- NEW STATE for Delete Unit modal ---

  const filteredVocabs = vocabData.filter(
    (v) =>
      (!selectedUnit || v.unit === selectedUnit) &&
      (!selectedClass || v.class === selectedClass)
  );
  const currentVocab = filteredVocabs[currentIndex];

  // --- NEW: Function to delete selected unit ---
  const handleDeleteUnit = async () => {
    if (!selectedUnit) {
      alert("Please select a unit to delete.");
      return;
    }

    const confirmation = window.prompt(
      `Are you sure you want to delete all vocab from unit "${selectedUnit}"?\n\nPlease type DELETE to confirm.`
    );

    if (confirmation !== "DELETE") {
      return; // User didn't confirm
    }

    // Continue with delete logic here

    // if (!window.confirm(`Are you sure you want to delete all vocab from unit "${selectedUnit}"?`)) {
    //     return;
    // }

    try {
      const res = await fetch(
        `http://localhost:3001/delete-unit/${selectedUnit}`,
        {
          method: "DELETE",
        }
      );
      const json = await res.json();

      if (json.success) {
        alert(
          `Deleted ${json.deletedCount} vocab(s) from unit "${selectedUnit}".`
        );
        // Update vocabData and units state locally
        const updatedVocab = vocabData.filter((v) => v.unit !== selectedUnit);
        setVocabData(updatedVocab);

        const updatedUnits = units.filter((u) => u !== selectedUnit);
        setUnits(updatedUnits);

        setSelectedUnit(null); // clear here
        fetchVocab();
      } else {
        alert("Failed to delete unit: " + json.message);
      }
    } catch (err: any) {
      alert("Error deleting unit: " + err.message);
    }
  };

  // for delete one single vocab

  const handleDeleteVocab = async (vocabId: string) => {
    if (!window.confirm("Are you sure you want to delete this vocab?")) return;

    try {
      const res = await fetch(`http://localhost:3001/vocab/${vocabId}`, {
        method: "DELETE",
      });
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        // process json
        if (json.success) {
          alert("Deleted vocab successfully.");
          // Remove from local state:
          setVocabData((prev) => prev.filter((v) => v._id !== vocabId));
          // Optionally reset current index or adjust if needed
          if (currentIndex >= filteredVocabs.length - 1 && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
        } else {
          alert("Failed to delete vocab: " + json.message);
        }
      } catch {
        console.error("Response is not JSON:", text);
      }
    } catch (error: any) {
      alert("Error deleting vocab: " + error.message);
    }
  };

  // for the upload csv part
  const handleUploadDone = async (
    unit: string,
    className: string,
    file: File
  ) => {
    const formData = new FormData();
    formData.append("unit", unit);
    formData.append("className", className);
    formData.append("csv", file); // must match the multer field name

    try {
      const res = await fetch("http://localhost:3001/vocab");
      const json = await res.json();

      if (json.success) {
        const allVocabs: VocabItem[] = json.data;
        setVocabData(allVocabs);

        const uniqueUnits = Array.from(
          new Set(allVocabs.map((item) => item.unit || ""))
        ).filter(Boolean);
        setUnits(uniqueUnits);

        const uniqueClasses = Array.from(
          new Set(allVocabs.map((item) => item.class || ""))
        ).filter(Boolean);
        setClasses(uniqueClasses);
      } else {
        alert("⚠️ Failed to fetch updated vocab.");
      }
    } catch (err) {
      console.error("Upload or fetch error:", err);
      alert("❌ An error occurred during upload.");
    }
  };

  // this function reruns the fetching and gets new data
  const fetchVocab = async () => {
    try {
      const res = await fetch("http://localhost:3001/vocab");
      const json = await res.json();
      if (json.success) {
        const allVocabs: VocabItem[] = json.data;
        setVocabData(allVocabs);

        const uniqueUnits = Array.from(
          new Set(allVocabs.map((item) => item.unit || ""))
        ).filter(Boolean);
        setUnits(uniqueUnits);

        const uniqueClasses = Array.from(
          new Set(allVocabs.map((item) => item.class || ""))
        ).filter(Boolean);
        setClasses(uniqueClasses);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  // fetching data from backend

  useEffect(() => {
    fetchVocab();
  }, []);

  // set up all the keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !IsEditing && !IsModalOpen) {
        e.preventDefault();
        toggleRecording();
      } else if (
        e.code === "ArrowUp" &&
        currentIndex > 0 &&
        !IsEditing &&
        !IsModalOpen
      ) {
        e.preventDefault();
        goToPrevious();
      } else if (
        e.code === "ArrowLeft" &&
        currentIndex > 0 &&
        !IsEditing &&
        !IsModalOpen
      ) {
        e.preventDefault();
        goToPrevious();
      } else if (
        e.code === "ArrowRight" &&
        currentIndex < filteredVocabs.length - 1 &&
        !IsEditing &&
        !IsModalOpen
      ) {
        e.preventDefault();
        goToNext();
      } else if (
        e.code === "ArrowDown" &&
        currentIndex < filteredVocabs.length - 1 &&
        !IsEditing &&
        !IsModalOpen
      ) {
        e.preventDefault();
        goToNext();
      } else if (e.code === "KeyP" && !IsEditing && !IsModalOpen) {
        if (currentVocab?.mp3_url) {
          const audio = new Audio(currentVocab.mp3_url);
          audio.play();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, filteredVocabs]);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "nearest",
      });
    }
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex(0); // reset index when changing unit
  }, [selectedUnit]);

  const startRecording = async () => {
    if (!currentVocab || !currentVocab.french) {
      alert("No vocab selected!");
      return;
    }

    const filename = currentVocab._id.trim() + ".mp3";

    setTimeout(async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        //setAudioURL(URL.createObjectURL(blob));
        setIsRecording(false);
        try {
          const filePath = `${filename}`;

          const { error } = await supabase.storage
            .from("vocabmp3files")
            .upload(filePath, blob, {
              upsert: true,
              cacheControl: "0", // prevent old cached version
            });

          if (error) throw error;

          // Get the public URL
          const { data: urlData } = supabase.storage
            .from("vocabmp3files")
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            // Force refresh via timestamp query param
            setAudioURL(`${urlData.publicUrl}?t=${Date.now()}`);
            await fetch("http://localhost:3001/update-vocab-url", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                vocabId: currentVocab._id,
                mp3URL: `${urlData.publicUrl}?t=${Date.now()}`,
              }),
            });
          }

          console.log(`${urlData.publicUrl}`);

          alert("Upload successful!");
          fetchVocab();
        } catch (error: any) {
          alert("Upload failed: " + error.message);
          console.error(error);
        }
      };
    }, 500);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < filteredVocabs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleEditVocab = (vocab: VocabItem) => {
    setEditVocab(vocab);
    setIsEditing(true); // you can use this to show/hide the form
  };

  function recordingPanel(word: VocabItem, index: number) {
    const isCurrent = currentVocab?._id === word._id;
    return (
      <div className="flex-col" key={word._id}>
        <div
          ref={isCurrent ? selectedRef : null}
          className={`flex border-b-2 border-gray-300 items-center justify-between cursor-pointer p-2
                ${isCurrent ? "!bg-sky-200" : ""}
                hover:bg-gray-200`}
          onClick={() => {
            const index = filteredVocabs.findIndex((v) => v._id === word._id);
            if (index !== -1) setCurrentIndex(index);
          }}
        >
          <div className="flex-col sm:flex-row"></div>
          <div className="flex-10/12 flex justify-between items-center">
            <div className="flex">
              <p className="p-1 font-bold">{index + 1}.</p>
              <div>
                <p className="font-bold text-xl">{word.french}</p>
                <p className="italic text-sm text-gray-600">{word.english}</p>
              </div>
            </div>

            <div className="flex">
              <button
                onClick={toggleRecording}
                className={`px-4 py-2 ${
                  isRecording && isCurrent ? "bg-amber-800" : "bg-sky-900"
                } text-white rounded text-sm`}
              >
                {isRecording && isCurrent
                  ? "Stop Recording"
                  : "Start Recording"}
              </button>
              {/* {word && word.mp3_url && (
                                                        <div>
                                                            <audio ref={audioRef} controls src={word.mp3_url} className=" h-6 w-45 mx-2" />
                                                        </div>
                                                    )} */}
            </div>
          </div>
          <div className="flex-2/12 gap-1 flex justify-end">
            {word.mp3_url && (
              <Volume2
                onClick={() => new Audio(`${word.mp3_url}`).play()}
                className="w-5 h-5 text-amber-800 hover:text-black cursor-pointer"
              />
            )}
            <Pencil
              onClick={() => {
                handleEditVocab(word);
              }}
              className="w-5 h-5 text-amber-800 hover:text-black cursor-pointer"
            />
            <Trash2
              onClick={() => handleDeleteVocab(word._id)}
              className="w-5 h-5 text-amber-800 hover:text-black cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[92vh]">
      <div className="w-[25%] flex flex-col items-center border-r-3 border-black">
        <div className="w-full flex flex-col h-full overflow-hidden">
          {/* The box for the new unit, drop down .etc */}
          <div className="flex flex-col">
            <div className="">
              <div
                className="p-3 border-2 m-2 rounded-2xl py-2 flex items-center cursor-pointer hover:bg-green-800/5"
                onClick={() => setIsModalOpen(true)}
              >
                <p
                  onClick={() => setIsModalOpen(true)}
                  className="h-8 w-8 flex items-center text-xl justify-center bg-sky-900 text-white rounded-3xl hover:bg-sky-700 transition"
                >
                  <Plus className="w-5 h-5 text-white" />
                </p>
                <p
                  onClick={() => setIsModalOpen(true)}
                  className=" ml-2 cursor-pointer px-2 h-7 flex items-center justify-center rounded transition"
                >
                  Add a Unit
                </p>
              </div>
            </div>
            {/* SELECT UNIT SOPHIE */}
            <div className="p-3 pb-1">Select Class/ Unit</div>
            <div className="w-full flex flex-col items-center border-t-2">
              {classes
                .sort((a, b) => a.localeCompare(b))
                .map((cls, index) => {
                  // Compute units for this class
                  const unitOptionsForClass = Array.from(
                    new Set(
                      vocabData
                        .filter((v) => v.class === cls)
                        .map((v) => v.unit || "")
                    )
                  )
                    .filter(Boolean)
                    .sort((a, b) =>
                      a.localeCompare(b, undefined, {
                        numeric: true,
                        sensitivity: "base",
                      })
                    )
                    .map((unit) => ({ value: unit, label: unit }));

                  return (
                    <div
                      className={`w-full border-b-2 border-gray-400 cursor-pointer select-none `}
                      key={index}
                    >
                      <div
                        onClick={() => {
                          toggleClass(cls);
                          setSelectedClass(cls);
                          setSelectedUnit(null);
                        }}
                        className={`p-2 px-6 flex justify-between bg-sky-900 text-white ${
                          expandedClasses.includes(cls) ? "border-b-2" : ""
                        }`}
                      >
                        <div>{cls}</div>
                        {expandedClasses.includes(cls) ? (
                          <ChevronUp></ChevronUp>
                        ) : (
                          <ChevronDown></ChevronDown>
                        )}
                      </div>

                      {expandedClasses.includes(cls) && (
                        <div>
                          {unitOptionsForClass.map(({ value }) => (
                            <div
                              key={value}
                              onClick={() => {
                                selectedUnit && selectedUnit === value
                                  ? setSelectedUnit(null)
                                  : setSelectedUnit(value);
                                setSelectedClass(cls);
                              }}
                              className={`p-2 px-6 w-full  cursor-pointer flex justify-between select-none
                                                                ${
                                                                  selectedUnit ===
                                                                  value
                                                                    ? "bg-sky-200"
                                                                    : ""
                                                                }`}
                            >
                              <div className="">{value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col overflow-hidden">
        {selectedUnit && selectedClass ? (
          <>
            {/* Header with class + unit + delete button */}
            <div className="flex justify-end p-2 mb-0 border-b-3">
              <div className="flex md:flex-row flex-col w-full h-full justify-between items-center mx-5">
                <h2 className="text-xl font-bold">
                  {selectedClass} | {selectedUnit}
                </h2>
                <p className="text-sm text-gray-700 py-2">
                  Recording progress:{" "}
                  {filteredVocabs.filter((v) => v.mp3_url).length} /{" "}
                  {filteredVocabs.length}(
                  {(
                    (filteredVocabs.filter((v) => v.mp3_url).length /
                      filteredVocabs.length) *
                    100
                  ).toFixed(0)}
                  %)
                </p>
                <button
                  onClick={handleDeleteUnit}
                  disabled={!selectedUnit}
                  className={`px-4 py-1 bg-sky-900 text-white hover:bg-sky-800 rounded-xl
                            ${selectedUnit ? "" : "hidden"}
                        `}
                >
                  Delete unit
                </button>
              </div>
            </div>
            {/* EDIT EACH VOCAB */}
            {IsEditing && (
              <div>
                <div className="absolute p-4 border rounded bg-white shadow max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4">Edit Vocabulary</h2>
                  <form onSubmit={handleUpdateVocab}>
                    <div className="mb-3">
                      <label className="block font-semibold mb-1">French</label>
                      <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={editVocab.french}
                        onChange={(e) =>
                          setEditVocab((prev) => ({
                            ...prev,
                            french: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block font-semibold mb-1">
                        English
                      </label>
                      <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={editVocab.english}
                        onChange={(e) =>
                          setEditVocab((prev) => ({
                            ...prev,
                            english: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block font-semibold mb-1">Unit</label>
                      <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={editVocab.unit}
                        onChange={(e) =>
                          setEditVocab((prev) => ({
                            ...prev,
                            unit: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block font-semibold mb-1">Class</label>
                      <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={editVocab.class}
                        onChange={(e) =>
                          setEditVocab((prev) => ({
                            ...prev,
                            class: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        type="submit"
                        className="bg-sky-700 text-white px-4 py-2 rounded hover:bg-sky-800"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <div className="mx-5 my-5 max-w-[1000px] overflow-y-scroll justify-center outline-none">
              <h2>Press Space to record, left right to switch words</h2>
              <div className="rounded-2xl border-gray-400 border-2 overflow-y-scroll justify-center outline-none">
                {filteredVocabs.map((word, index) => {
                  return recordingPanel(word, index);
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col w-full h-full bg-opacity-5 items-center justify-center bg-[rgba(120,53,15,0.05)]">
            <div>Please select a unit or add a unit</div>
          </div>
        )}
      </div>

      <Uploadcsv
        isOpen={IsModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(unit, className, file) => {
          handleUploadDone(unit, className, file); // sends file to backend
          fetchVocab();
          setSelectedClass(className);
          setSelectedUnit(unit);
        }}
        defaultclass={selectedClass ?? ""}
      />
    </div>
  );
}
