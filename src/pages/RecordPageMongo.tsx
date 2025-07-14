import Select from 'react-select';
import { useEffect, useState, useRef } from "react";
import Uploadcsv from '../components/Uploadcsv';

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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // for the add csv pop up
    const chunks: Blob[] = [];

    // --- NEW STATE for Delete Unit modal ---
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

    const unitOptions = units.map((unit) => ({
        value: unit,
        label: unit,
    }));

    const filteredVocabs = vocabData.filter(v => v.unit === selectedUnit);
    const currentVocab = filteredVocabs[currentIndex];

    // --- NEW: Function to delete selected unit ---
    const handleDeleteUnit = async () => {
        if (!unitToDelete) {
            alert("Please select a unit to delete.");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete all vocab from unit "${unitToDelete}"?`)) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:3001/delete-unit/${unitToDelete}`, {
                method: "DELETE",
            });
            const json = await res.json();

            if (json.success) {
                alert(`Deleted ${json.deletedCount} vocab(s) from unit "${unitToDelete}".`);
                // Update vocabData and units state locally
                const updatedVocab = vocabData.filter(v => v.unit !== unitToDelete);
                setVocabData(updatedVocab);

                const updatedUnits = units.filter(u => u !== unitToDelete);
                setUnits(updatedUnits);

                setSelectedUnit(null);
                setUnitToDelete(null);
                setIsDeleteOpen(false);
            } else {
                alert("Failed to delete unit: " + json.message);
            }
        } catch (err: any) {
            alert("Error deleting unit: " + err.message);
        }
    };

    // for the upload csv part
    const handleUploadSubmit = async (unit: string, className: string, file: File) => {
        const formData = new FormData();
        formData.append("unit", unit);
        formData.append("className", className);
        formData.append("csv", file); // must match the multer field name

        try {
            const res = await fetch("http://localhost:3001/upload-csv", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();
            console.log("Upload response:", result);

            if (result.success) {
                alert("Upload successful!");
            } else {
                alert("Upload failed: " + result.message);
            }
        } catch (err) {
            console.error("Upload error:", err);  // 👈 log the actual error
            alert("An error occurred during upload.");
        }
    };

    // fetching data from backend
    useEffect(() => {
        const fetchVocab = async () => {
            try {
                const res = await fetch("http://localhost:3001/vocab");
                const json = await res.json();
                if (json.success) {
                    const allVocabs: VocabItem[] = json.data;
                    setVocabData(allVocabs);

                    const uniqueUnits = Array.from(new Set(allVocabs.map(item => item.unit || ""))).filter(Boolean);
                    setUnits(uniqueUnits);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };
        fetchVocab();
    }, []);

    // set up all the keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                toggleRecording();
            } else if (e.code === "ArrowLeft" && currentIndex > 0) {
                goToPrevious();
            } else if (e.code === "ArrowRight" && currentIndex < filteredVocabs.length - 1) {
                goToNext();
            } else if (e.code === "KeyP") {
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

    return (
        <div className="flex h-[92vh]">
            <div className="w-[25%] min-w-[300px] flex flex-col p-5 items-center border-r-3 border-black">
                <div className="w-full flex flex-col h-full p-3 border-amber-600 border-2 overflow-y-auto">
                    <div className='flex justify-end space-x-2'>
                        <p
                            onClick={() => setIsModalOpen(true)}
                            className="cursor-pointer inline-block px-4 py-2 bg-teal-800 text-white rounded hover:bg-teal-700 transition"
                        >
                            Add a unit
                        </p>

                        {/* --- NEW Delete a unit button */}
                        <p
                            onClick={() => setIsDeleteOpen(true)}
                            className="cursor-pointer inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                            Delete a unit
                        </p>
                    </div>

                    {/* --- NEW Delete Unit modal UI */}
                    {isDeleteOpen && (
                        <div className="mt-3 p-3 border border-red-600 rounded bg-red-50">
                            <label className="block mb-2 font-medium text-red-700">Select Unit to Delete</label>
                            <Select
                                options={unitOptions}
                                value={unitToDelete ? { value: unitToDelete, label: unitToDelete } : null}
                                onChange={(selected) => setUnitToDelete(selected?.value || null)}
                                placeholder="Select unit..."
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderRadius: '40px',
                                        borderColor: 'red',
                                        boxShadow: '0 0 0 1px red',
                                        '&:hover': { borderColor: 'red' },
                                        paddingLeft: '5px',
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        padding: '12px 20px',
                                        backgroundColor: state.isSelected ? 'red' : state.isFocused ? '#F9D6D5' : 'white',
                                        color: state.isSelected ? '#FFF5F5' : 'black',
                                    }),
                                }}
                            />
                            <div className="mt-2 flex space-x-2">
                                <button
                                    onClick={handleDeleteUnit}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => {
                                        setIsDeleteOpen(false);
                                        setUnitToDelete(null);
                                    }}
                                    className="px-4 py-2 border border-red-600 rounded hover:bg-red-100"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className='border-pink-600 border-2 mb-3'>
                        <label className="block mb-2 font-medium text-gray-700">Select a Unit</label>
                        <Select
                            options={unitOptions}
                            value={selectedUnit ? { value: selectedUnit, label: selectedUnit } : null}
                            onChange={(selected) => setSelectedUnit(selected?.value || null)}
                            placeholder="Search or select..."
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: '40px',
                                    borderColor: 'teal',
                                    boxShadow: '0 0 0 1px teal',
                                    '&:hover': { borderColor: 'teal' },
                                    paddingLeft: '5px',
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    padding: '12px 20px',
                                    backgroundColor: state.isSelected ? 'teal' : state.isFocused ? '#C8D9E6' : 'white',
                                    color: state.isSelected ? '#F5EFEB' : 'black',
                                }),
                            }}
                        />
                    </div>

                    <div className='flex-1 border-teal-400 border-2 p-2'>
                        {selectedUnit ? (
                            filteredVocabs.map((word, index) => (
                                <p key={index} className='p-1'
                                    onClick={() => {
                                        const index = filteredVocabs.findIndex((v) => v._id === word._id);
                                        if (index !== -1) setCurrentIndex(index);
                                    }}
                                >{index + 1}. {word.french}</p>
                            ))
                        ) : (
                            <p className="text-gray-400">Select a unit to see vocabulary</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 flex flex-col items-center">
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

            </div>
            {/* Render the modal */}
            <Uploadcsv
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleUploadSubmit}
            />
        </div>
    );
}
