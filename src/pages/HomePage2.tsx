import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient";
import { Trash2, Pencil, X, Plus, Volume2, ChevronDown, ChevronUp } from 'lucide-react';

type VocabItem = {
    _id: string;
    french: string;
    english: string;
    unit?: string;
    class?: string;
    mp3_url?: string;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
export default function HomePage2() {
    const [vocabData, setVocabData] = useState<VocabItem[]>([]);
    const [units, setUnits] = useState<string[]>([]); // all the units that are available in the database
    const [unitList, setUnitList] = useState<string[]>([]); // list of units that are selected
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null); // the one single selected unit
    const [selectedClass, setSelectedClass] = useState<string | null>(null); // the one single selected class
    const [currentIndex, setCurrentIndex] = useState(0);
    const [classes, setClasses] = useState<string[]>([]);
    const [expandedClasses, setExpandedClasses] = useState<string[]>([]);


    const filteredVocabs = vocabData.filter(v =>
        (!selectedUnit || v.unit === selectedUnit) &&
        (!selectedClass || v.class === selectedClass)
    );
    const currentVocab = filteredVocabs[currentIndex];

    const toggleClass = (cls: string) => {
        setExpandedClasses(prev =>
            prev.includes(cls)
                ? prev.filter(c => c !== cls)       // remove it if already expanded
                : [...prev, cls]                    // add it if not expanded
        );
    };

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

    return (
        <div className="flex h-[92vh]">
            {/* LEFT BAR */}
            <div className="w-[25%] flex flex-col items-center border-r-3 border-black">
                <div className="w-full flex flex-col h-full overflow-hidden">
                    {/* The box for the new unit, drop down .etc */}
                    <div className='flex flex-col'>
                        {/* SELECT UNIT SOPHIE */}
                        <div className='p-3 pb-1'>Select Class/ Unit</div>
                        <div className='w-full flex flex-col items-center border-t-2'>
                            {classes
                                .sort((a, b) => a.localeCompare(b))
                                .map((cls, index) => {
                                    // Compute units for this class
                                    const unitOptionsForClass = Array.from(
                                        new Set(
                                            vocabData
                                                .filter(v => v.class === cls)
                                                .map(v => v.unit || "")
                                        )
                                    )
                                        .filter(Boolean)
                                        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
                                        .map(unit => ({ value: unit, label: unit }));

                                    return (
                                        <div
                                            className={`w-full border-b-2 border-gray-400 cursor-pointer select-none `}
                                            key={index}>
                                            <div
                                                onClick={() => {
                                                    toggleClass(cls);
                                                    setSelectedClass(cls);
                                                }}
                                                className={`p-2 px-6 flex justify-between bg-sky-900 text-white ${expandedClasses.includes(cls) ? 'border-b-2' : ''}`}>
                                                <div>{cls}</div>
                                                {expandedClasses.includes(cls) ? <ChevronUp></ChevronUp> : <ChevronDown></ChevronDown>}
                                            </div>

                                            {
                                                expandedClasses.includes(cls) && (
                                                    <div>
                                                        {unitOptionsForClass.map(({ value }) => (
                                                            <div key={value}
                                                                onClick={() => {
                                                                    selectedUnit && selectedUnit === value ?
                                                                        setSelectedUnit(null) : setSelectedUnit(value);
                                                                    setSelectedClass(cls)
                                                                }}
                                                                className={`p-2 px-6 w-full  cursor-pointer flex justify-between select-none
                                                                ${selectedUnit === value ? "bg-sky-50" : ""}`}>
                                                                <div className=''>{value}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            }


                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>

            </div>
            {/* RIGHT BAR */}
            <div className="overflow-y-scroll w-full">
                {units && (
                    <div>hello
                        {units.map((unit) => (
                            <div>{unit}</div>
                        ))}
                    </div>
                )}
                {selectedUnit && (
                    <div>
                        {filteredVocabs.map((word, index) => (
                            <div className="text-lime-700">
                                {index}.{word.french}
                            </div>
                        ))}
                        <div className="flex justify-end p-4 pr-10">
                            <button
                                className="bg-lime-800 text-white px-6 py-2 rounded-full w-[10vw] hover:bg-brown-800"
                            >
                                Next
                            </button>
                        </div>

                    </div>

                )}

            </div>
        </div>
    );
}
