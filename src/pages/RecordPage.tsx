import Select from 'react-select';
import { useEffect, useState, useRef } from "react";

const Units = ["unit1", "unit2", "unit3", "unit5"]
const Vocabs = ["rouge", "jaune", "vert", "bleu", "noir", "blanc"];



export default function RecordPage() {
    const options = Units.map((unit) => ({
        value: unit.toLowerCase().replace(/\s+/g, '_'), // e.g. "unit 2" → "unit_2"
        label: unit,
    }));
    // ------------------------------------------------------------------------------
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const chunks: Blob[] = [];

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

    // --------------------------------SPACEBAR
    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault(); // prevent scrolling when pressing space
                toggleRecording();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isRecording]);
    // ------------------------------ P key
    const audioRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "KeyP") {
                if (audioRef.current) {
                    audioRef.current.play();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    // --------------------LEFT AND RIGHT BUTTON
    const [currentIndex, setCurrentIndex] = useState(0);
    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? Vocabs.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === Vocabs.length - 1 ? 0 : prev + 1));
    };
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "ArrowLeft") {
                goToPrevious();
            } else if (e.code === "ArrowRight") {
                goToNext();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    //   ---------------------------------------------------------------------------
    return (
        <div className="flex min-h-screen">
            {/* 30% width column */}
            <div className="w-[25%] min-w-[300px] flex flex-col p-5 items-center border-r-3 border-black">
                {/*THIS IS THE SELECT DROP DOWN*/}
                <div className="w-full max-w-xs">
                    <label className="block mb-2 font-medium text-gray-700">
                        Select a Unit
                    </label>
                    <Select
                        options={options}
                        placeholder="Search or select..."
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                borderRadius: '40px', // more rounded
                                borderColor: state.isFocused ? '#567C8D' : '#567C8D', // border pink or hotpink on focus
                                boxShadow: state.isFocused ? '0 0 0 1px #567C8D' : '0 0 0 1px #567C8D',
                                '&:hover': {
                                    borderColor: '#567C8D',
                                },
                                paddingLeft: '5px',
                            }),
                            option: (base, state) => ({
                                ...base,
                                padding: '12px 20px',
                                backgroundColor: state.isSelected ? '#567C8D' : state.isFocused ? '#C8D9E6' : 'white',
                                color: state.isSelected ? '#F5EFEB' : 'black',
                            }),
                        }}
                        classNames={{
                            control: () => 'rounded-md',
                        }}
                    />
                </div>
                {/* THIS IS THE VOCAB LIST */}
                {Vocabs.map((word, index) => (
                    <p key={index} className={index === 0 ? "mt-4" : "mt-2"}>
                        {word}
                    </p>
                ))}
            </div>
            <div className="flex-1 p-4 flex flex-col items-center">
                <div className="p-5 items-center">
                    <button
                        onClick={goToPrevious}
                        className="px-2 py-1 text-xl bg-gray-200 rounded hover:bg-gray-300"
                    >
                        ←
                    </button>
                    <h1 className="text-2xl font-bold">{Vocabs[currentIndex]}</h1>
                    <button
                        onClick={goToNext}
                        className="px-2 py-1 text-xl bg-gray-200 rounded hover:bg-gray-300"
                    >
                        →
                    </button>
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`px-4 py-2 ${isRecording ? 'bg-red-500' : 'bg-blue-500'} text-white rounded`}
                    >
                        {isRecording ? "Stop Recording" : "Start Recording"}
                    </button>

                    {audioURL && (
                        <audio ref={audioRef} controls src={audioURL} className="mt-4" />
                    )}</div>
            </div>
        </div>
    );
}
