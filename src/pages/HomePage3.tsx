import { useEffect, useState } from "react";
import Select from 'react-select';
import { Volume2 } from 'lucide-react';

type VocabItem = {
    french: string;
    english: string;
    unit?: string;
    class?: string;
    mp3_url?: string;
};

export default function VocabBrowser() {
    const [vocabData, setVocabData] = useState<VocabItem[]>([]);
    const [classes, setClasses] = useState<string[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

    useEffect(() => {
        const fetchVocab = async () => {
            try {
                const res = await fetch("http://localhost:3001/vocab");
                const json = await res.json();
                if (json.success) {
                    const allVocabs: VocabItem[] = json.data;
                    setVocabData(allVocabs);

                    const uniqueClasses = Array.from(
                        new Set(allVocabs.map((item) => item.class || ""))
                    ).filter(Boolean);
                    setClasses(uniqueClasses);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };

        fetchVocab();
    }, []);

    const unitsForSelectedClass = Array.from(
        new Set(
            vocabData
                .filter((item) => item.class === selectedClass)
                .map((item) => item.unit || "")
        )
    ).filter(Boolean);

    const vocabForSelectedUnit = vocabData.filter(
        (item) => item.class === selectedClass && item.unit === selectedUnit
    );



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return (
        <div className="flex h-[92vh]">
            <div className="w-[25%] min-w-[300px] max-w-[400px] flex flex-col p-5 items-center border-r-3 border-black items-start">
                <div className="text-sm italic pb-2">Select a class to continue:</div>
                <div className="w-full">
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
                            // change the dropdown box
                            control: (base) => ({
                                ...base,
                                border: '2px solid #92400e',
                                borderRadius: '50px',
                                '&:hover': { background: 'rgba(120, 53, 15, 0.05)' },
                                paddingLeft: '5px',
                                boxShadow: 'none',
                                outline: 'none'
                            }),
                            // change the dropdown context
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
                    <div>

                        {selectedClass && (
                            <>
                                <h3 className="font-semibold mb-2">Units</h3>
                                <ul className="space-y-1">
                                    {unitsForSelectedClass.map((unit) => (
                                        <li
                                            key={unit}
                                            className={`cursor-pointer p-2 rounded ${selectedUnit === unit
                                                ? "bg-orange-300"
                                                : "hover:bg-orange-100"
                                                }`}
                                            onClick={() => setSelectedUnit(unit)}
                                        >
                                            {unit}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div >

    );
}
