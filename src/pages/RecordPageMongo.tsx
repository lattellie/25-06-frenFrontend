import Select from 'react-select';
import { useEffect, useState, useRef } from "react";
import Uploadcsv from '../components/Uploadcsv';
import { Trash2, Pencil, X, Plus } from 'lucide-react';


type VocabItem = {
    _id: string;
    french: string;
    english: string;
    unit?: string;
    class?: string;
    mp3_url?: string;
};

export default function RecordPageMongo() {
    const [vocabData, setVocabData] = useState<VocabItem[]>([]);
    const [units, setUnits] = useState<string[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [classes, setClasses] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [IsModalOpen, setIsModalOpen] = useState(false); // for the add csv pop up
    const chunks: Blob[] = [];
    const [IsEditing, setIsEditing] = useState(false); // for the add csv pop up

    const [editVocab, setEditVocab] = useState<VocabItem>({
        _id: '',
        french: '',
        english: '',
        unit: '',
        class: '',
        mp3_url: ''
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

    const unitOptions = Array.from(
        new Set(
            vocabData
                .filter(v => !selectedClass || v.class === selectedClass)
                .map(v => v.unit || "")
        )
    )
        .filter(Boolean) // remove empty strings
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })) // sort alphabetically
        .map(unit => ({
            value: unit,
            label: unit,
        }));

    const filteredVocabs = vocabData.filter(v =>
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

        if (!window.confirm(`Are you sure you want to delete all vocab from unit "${selectedUnit}"?`)) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:3001/delete-unit/${selectedUnit}`, {
                method: "DELETE",
            });
            const json = await res.json();

            if (json.success) {
                alert(`Deleted ${json.deletedCount} vocab(s) from unit "${selectedUnit}".`);
                // Update vocabData and units state locally
                const updatedVocab = vocabData.filter(v => v.unit !== selectedUnit);
                setVocabData(updatedVocab);

                const updatedUnits = units.filter(u => u !== selectedUnit);
                setUnits(updatedUnits);

                setSelectedUnit(null);  // clear here
                fetchVocab()
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
                    setVocabData(prev => prev.filter(v => v._id !== vocabId));
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
    const handleUploadDone = async (unit: string, className: string, file: File) => {
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

                const uniqueUnits = Array.from(new Set(allVocabs.map(item => item.unit || ""))).filter(Boolean);
                setUnits(uniqueUnits);

                const uniqueClasses = Array.from(new Set(allVocabs.map(item => item.class || ""))).filter(Boolean);
                setClasses(uniqueClasses);
            }

        } catch (err) {
            console.error("Reload error:", err);  // 👈 log the actual error
            alert("An error occurred during upload.");
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

                const uniqueUnits = Array.from(new Set(allVocabs.map(item => item.unit || ""))).filter(Boolean);
                setUnits(uniqueUnits);

                const uniqueClasses = Array.from(new Set(allVocabs.map(item => item.class || ""))).filter(Boolean);
                setClasses(uniqueClasses);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };
    // fetching data from backend

    useEffect(() => {
        fetchVocab()
    }, []);

    // set up all the keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space" && !IsEditing && !IsModalOpen) {
                e.preventDefault();
                toggleRecording();
            } else if (e.code === "ArrowLeft" && currentIndex > 0 && !IsEditing && !IsModalOpen) { //hello sophie
                goToPrevious();
            } else if (e.code === "ArrowRight" && currentIndex < filteredVocabs.length - 1 && !IsEditing && !IsModalOpen) {
                goToNext();
            } else if (e.code === "KeyP" && !IsEditing && !IsModalOpen) {
                if (audioRef.current) {
                    audioRef.current.play();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, filteredVocabs]);

    useEffect(() => {
        setCurrentIndex(0); // reset index when changing unit
    }, [selectedUnit]);

    const startRecording = async () => {
        setTimeout(async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            recorder.start();
            setIsRecording(true);

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                setAudioURL(URL.createObjectURL(blob));
                setIsRecording(false);
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
            setCurrentIndex(prev => prev - 1);
        }
    };

    const goToNext = () => {
        if (currentIndex < filteredVocabs.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleEditVocab = (vocab: VocabItem) => {
        setEditVocab(vocab);
        setIsEditing(true); // you can use this to show/hide the form
    };

    return (
        <div className="flex h-[92vh]">
            <div className="w-[25%] min-w-[300px] flex flex-col p-5 items-center border-r-3 border-black">
                <div className="w-full flex flex-col h-full overflow-hidden">
                    {/* The box for the new unit, drop down .etc */}
                    <div className='flex flex-col px-1 gap-3 pb-3'>

                        <div className='flex items-center cursor-pointer hover:bg-amber-800/5'
                            onClick={() => setIsModalOpen(true)}>
                            <p
                                onClick={() => setIsModalOpen(true)}
                                className="h-8 w-8 flex items-center text-xl justify-center bg-amber-800 text-white rounded-3xl hover:bg-teal-700 transition"
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

                        <div className='text-sm italic'>
                            Or select an existing unit:
                        </div>

                        {/* <div className='flex justify-end w-full'>
                            <div className='bg-amber-800 p-2 text-white w-fit  rounded-3xl text-sm px-4'>Clear Selected</div>
                        </div> */}
                        <div className='w-full flex items-center'>
                            <div className='flex-1'>
                                <Select
                                    options={classes
                                        .slice() // create a shallow copy to avoid mutating the original
                                        .sort((a, b) => a.localeCompare(b))
                                        .map(cls => ({ value: cls, label: cls }))}
                                    value={selectedClass ? { value: selectedClass, label: selectedClass } : null}
                                    onChange={(selected) => {
                                        setSelectedClass(selected?.value || null)
                                            , setSelectedUnit(null)
                                    }}
                                    placeholder="Select Class..."
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderRadius: '12px 0px 0px 12px',
                                            border: '2px solid #92400e',
                                            '&:hover': { background: 'rgba(120, 53, 15, 0.05)' },
                                            paddingLeft: '5px',
                                            boxShadow: 'none',
                                            outline: 'none'
                                        }),
                                        valueContainer: (base) => ({
                                            ...base,
                                            padding: '0 5px'
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            margin: 0,                   // 👈 Removes extra spacing from input
                                            padding: 0,
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            padding: '12px 20px',
                                            backgroundColor: state.isSelected ? '#92400e' : state.isFocused ? 'rgba(146, 64, 14, 0.05)' : 'white',
                                            color: state.isSelected ? 'white' : 'black',
                                            ':active': {
                                                backgroundColor: state.isSelected
                                                    ? '#92400e'
                                                    : 'rgba(146, 64, 14, 0.1)', // Optional: slightly darker for active click
                                            }
                                        }),
                                    }}
                                />
                            </div>
                            <p
                                onClick={() => {
                                    setSelectedClass(null);
                                    setSelectedUnit(null);
                                }}
                                className="cursor-pointer h-full w-8 flex items-center text-xl justify-center text-white bg-amber-800 rounded-r-xl"
                            >
                                <X className="w-5 h-5 text-white" />
                            </p>
                        </div>

                        {selectedClass && (
                            <div className='w-full flex items-center'>
                                <div className='flex-1'>
                                    <Select
                                        options={unitOptions}
                                        value={selectedUnit ? { value: selectedUnit, label: selectedUnit } : null}
                                        onChange={(selected) => setSelectedUnit(selected?.value || null)}
                                        placeholder="Select Unit..."
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderRadius: '12px 0px 0px 12px',
                                                border: '2px solid #92400e',
                                                '&:hover': { background: 'rgba(146, 64, 14, 0.05)' },
                                                paddingLeft: '5px',
                                                boxShadow: 'none',
                                                outline: 'none'
                                            }),
                                            valueContainer: (base) => ({
                                                ...base,
                                                padding: '0 5px'
                                            }),
                                            input: (base) => ({
                                                ...base,
                                                margin: 0,                   // 👈 Removes extra spacing from input
                                                padding: 0,
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                padding: '12px 20px',
                                                backgroundColor: state.isSelected ? '#92400e' : state.isFocused ? 'rgba(146, 64, 14, 0.05)' : 'white',
                                                color: state.isSelected ? '#F5F8FF' : 'black',
                                                ':active': {
                                                    backgroundColor: state.isSelected
                                                        ? '#92400e'
                                                        : 'rgba(146, 64, 14, 0.1)', // Optional: slightly darker for active click
                                                }
                                            }),
                                        }}
                                    />
                                </div>
                                <p
                                    onClick={() => {
                                        setSelectedUnit(null);
                                    }}
                                    className="cursor-pointer h-full w-8 flex items-center text-xl justify-center text-white bg-amber-800 rounded-r-xl"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </p>
                            </div>
                        )
                        }

                    </div>




                    {/* THE VOCAB LIST SECTION */}
                    <div className='border-2 border-dotted border-amber-800 rounded-xl flex flex-col overflow-hidden'>
                        <div className='flex justify-end m-2 mb-0'>
                            <button
                                onClick={handleDeleteUnit}
                                disabled={!selectedUnit}
                                className={`px-4 py-1 bg-teal-700 text-white hover:bg-teal-800 rounded-xl
                                ${selectedUnit ? "" : "hidden"}
                                `}
                            >
                                Delete all
                            </button>
                        </div>

                        <div className='flex-1 p-2 overflow-y-scroll'>
                            <div>
                                {selectedUnit ? (
                                    filteredVocabs.map((word, index) => {
                                        const isCurrent = currentVocab?._id === word._id;
                                        return (
                                            <div
                                                key={word._id}
                                                className={`flex items-center justify-between cursor-pointer
                                                    ${isCurrent ? '!bg-yellow-300' : ''}
                                                    hover:bg-[rgba(120,53,15,0.05)]`}
                                                onClick={() => {
                                                    const index = filteredVocabs.findIndex((v) => v._id === word._id);
                                                    if (index !== -1) setCurrentIndex(index);
                                                }}
                                            >
                                                <p key={index} className='p-1'
                                                    onClick={() => {
                                                        const index = filteredVocabs.findIndex((v) => v._id === word._id);
                                                        if (index !== -1) setCurrentIndex(index);
                                                    }}
                                                >{index + 1}. {word.french}</p>
                                                <div className='flex gap-1'>
                                                    <Pencil
                                                        onClick={() => { handleEditVocab(word) }}
                                                        className="w-5 h-5 text-amber-800 hover:text-black cursor-pointer" />
                                                    <Trash2
                                                        onClick={() => handleDeleteVocab(word._id)}
                                                        className="w-5 h-5 text-amber-800 hover:text-black cursor-pointer" />
                                                </div>

                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-gray-400">Select a unit to see vocabulary</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* EDIT EACH VOCAB */}
            {IsEditing && (
                <div className="p-4 border rounded bg-white shadow max-w-md w-full">
                    <h2 className="text-xl font-bold mb-4">Edit Vocabulary</h2>
                    <form onSubmit={handleUpdateVocab}>
                        <div className="mb-3">
                            <label className="block font-semibold mb-1">French</label>
                            <input
                                type="text"
                                className="w-full border px-2 py-1 rounded"
                                value={editVocab.french}
                                onChange={(e) =>
                                    setEditVocab((prev) => ({ ...prev, french: e.target.value }))
                                }
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block font-semibold mb-1">English</label>
                            <input
                                type="text"
                                className="w-full border px-2 py-1 rounded"
                                value={editVocab.english}
                                onChange={(e) =>
                                    setEditVocab((prev) => ({ ...prev, english: e.target.value }))
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
                                    setEditVocab((prev) => ({ ...prev, unit: e.target.value }))
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
                                    setEditVocab((prev) => ({ ...prev, class: e.target.value }))
                                }
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                type="submit"
                                className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800"
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

            )}
            {
                selectedUnit && (
                    // <div className='flex w-full'>
                    <div className='w-full h-full'>
                        <div className="flex p-4  flex-col items-center">
                            <div className="p-5 items-center">
                                <h2>({filteredVocabs.length > 0 ? currentIndex + 1 : 0} / {filteredVocabs.length})</h2>
                                <div className='min-h-[300px] flex items-center justify-center p-10'>
                                    <button
                                        onClick={goToPrevious}
                                        className={currentIndex === 0 ? "px-2 py-1 text-xl bg-gray-100 text-gray-300" :
                                            "px-2 py-1 text-xl bg-gray-200 rounded hover:bg-gray-300"}
                                    >
                                        ←
                                    </button>
                                    <h1 className="w-[500px] text-center text-3xl font-bold pl-10 pr-10">
                                        {currentVocab ? currentVocab.french : 'No vocab'}
                                    </h1>
                                    <button
                                        onClick={goToNext}
                                        className={currentIndex === filteredVocabs.length - 1 ? "px-2 py-1 text-xl bg-gray-100 text-gray-300" :
                                            "px-2 py-1 text-xl bg-gray-200 rounded hover:bg-gray-300"}
                                    >
                                        →
                                    </button>
                                </div>

                                <div className='flex flex-col items-center'>
                                    <button
                                        onClick={toggleRecording}
                                        className={`px-4 py-2 ${isRecording ? 'bg-red-500' : 'bg-teal-800'} text-white rounded`}
                                    >
                                        {isRecording ? "Stop Recording" : "Start Recording"}
                                    </button>

                                    {audioURL && (
                                        <audio ref={audioRef} controls src={audioURL} className="mt-4" />
                                    )}
                                </div>
                            </div>
                            {currentVocab && (
                                <div className="mt-4 p-2 border-t border-gray-300 text-sm">
                                    <p><strong>French:</strong> {currentVocab.french}</p>
                                    <p><strong>English:</strong> {currentVocab.english}</p>
                                    <p><strong>Unit:</strong> {currentVocab.unit}</p>
                                    <p><strong>Class:</strong> {currentVocab.class}</p>
                                    <p><strong>MP3 URL:</strong> {currentVocab.mp3_url}</p>
                                </div>
                            )}

                        </div></div>
                    // </div>
                )
            }

            {
                !selectedUnit && (
                    <div className='flex flex-col w-full h-full bg-opacity-5 items-center justify-center bg-[rgba(120,53,15,0.05)]'
                    >
                        <div>Please select a unit or add a unit to continue</div>
                    </div>
                )
            }

            {/* Render the modal */}
            <Uploadcsv
                isOpen={IsModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(unit, className, file) => {
                    handleUploadDone(unit, className, file); // sends file to backend
                    setSelectedClass(className);   // 👈 this happens in the main page
                    setSelectedUnit(unit);         // 👈 and this too
                }}
                defaultclass={selectedClass ?? ""}
            />
        </div >
    );
}
