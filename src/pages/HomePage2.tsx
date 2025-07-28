import { useEffect, useState } from 'react';
import { getData, getTitles } from '../utils/getData';
import type { Vocab, VocabUnit, VocabEntry } from '../type/vocabDD';
import { MdCheckBoxOutlineBlank, MdCheckBox } from "react-icons/md";
import { FaCirclePlay } from 'react-icons/fa6';
import { useVocabContext, useVocabUnitContext } from '../contexts/VocabContext';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

type VocabItem = {
    french: string;
    english: string;
    unit?: string;
    class?: string;
    mp3_url?: string;
};


function useVoices() {

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);


    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            if (allVoices.length > 0) setVoices(allVoices);
        };
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        } else loadVoices();
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    return voices;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
export default function HomePage2() {
    const titleList: string[] = getTitles();
    const voices = useVoices();

    const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
    const [wordLists, setWordLists] = useState<VocabUnit[]>([]);

    const { setVocabs } = useVocabContext();
    const { setUnits } = useVocabUnitContext();
    const navigate = useNavigate();

    const toggleTitle = async (title: string) => {
        const wasSelected = selectedTitles.includes(title);
        if (wasSelected) {
            setWordLists(prev => prev.filter(p => p.name !== title));
        } else {
            const currentVocabEntryList: VocabEntry[] = await getData(title);
            const currentVocab: Vocab[] = currentVocabEntryList.map(v => ({ vocab: v, selected: true }));
            setWordLists(prev => [...prev, { name: title, vocabs: currentVocab }]);
        }
        setSelectedTitles(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
    };


    //--------------------------------------------------------------------------------------------------------------
    // for Mongo DB
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

    //------------------------------------------------------------------------------------------------------------


    function playAudio(french: string) {
        if (!french || voices.length === 0) return;
        const msg = new SpeechSynthesisUtterance(french);
        msg.lang = 'fr';
        msg.voice = voices.find(v => v.lang.startsWith('fr-CA')) || null;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(msg);
    }

    /// Returns a list of units -- should change to the data I fetched
    function titleItem(title: string) {
        const isSelected = selectedTitles.includes(title);
        return (
            <button
                key={title}
                onClick={() => toggleTitle(title)}
                className={`flex justify-between w-full max-w-[250px] px-2 py-1 border-2 rounded-full text-sm ${isSelected ? 'bg-yellow-400 text-black' : 'bg-white text-black border-brown-700'} hover:${isSelected ? 'bg-yellow-500' : 'bg-yellow-100'}`}
            >
                <span>{title} - Sophie</span>
                <span className="w-5 h-5 text-center">{isSelected ? 'x' : '>'}</span>
            </button>
        );
    }

    function vocabItem(unitName: string, vocab: Vocab, index: number) {
        const isEven = index % 2 === 0;
        return (
            <div className={`flex border-b px-2 py-1 ${isEven ? 'bg-yellow-50' : 'bg-white'} border-yellow-200 items-center`}>
                <button onClick={() => {
                    setWordLists(prev => prev.map(u => u.name === unitName ? {
                        ...u,
                        vocabs: u.vocabs.map((v, i) => i === index ? { ...v, selected: !v.selected } : v)
                    } : u))
                }}>
                    {vocab.selected ? <MdCheckBox className="text-yellow-700" /> : <MdCheckBoxOutlineBlank className="text-yellow-700" />}
                </button>
                <button className="mx-2" onClick={() => playAudio(vocab.vocab.fren)}>
                    <FaCirclePlay className="text-yellow-500" />
                </button>
                <div className="w-[30%] min-w-[200px]">{vocab.vocab.fren}</div>
                <div className="w-[30%] min-w-[200px]">{vocab.vocab.engl}</div>
            </div>
        );
    }

    function selectAll(unit: VocabUnit, allChosen: boolean) {
        setWordLists(prev => prev.map(u => u.name === unit.name ? {
            ...u,
            vocabs: u.vocabs.map(v => ({ ...v, selected: !allChosen }))
        } : u));
    }

    function unitItem(unit: VocabUnit) {
        const allChosen = unit.vocabs.every(vocab => vocab.selected);
        return (
            <div className="min-w-fit flex flex-col mr-2 border-2 rounded-xl p-2 border-yellow-400 bg-white">
                <div className="pb-2 border-b border-yellow-400">
                    <button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white mr-2 px-2 py-1 rounded"
                        onClick={() => selectAll(unit, allChosen)}
                    >
                        {allChosen ? "Deselect All" : "Select All"}
                    </button>
                    {`Unit Chosen: ${unit.name}`}
                </div>
                <div className="overflow-y-scroll max-h-[40vh]">
                    {unit.vocabs.map((v, i) => vocabItem(unit.name, v, i))}
                </div>
            </div>
        );
    }

    const handleNext = () => {
        const vocs: Vocab[] = wordLists.flatMap(wl => wl.vocabs).filter(v => v.selected);
        if (vocs.length > 0) {
            setVocabs(vocs);
            setUnits(wordLists);
            navigate("/play");
        } else {
            alert("select at least 1 vocab to continue");
        }
    };


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    return (
        <div className="flex h-[92vh]">
            <div className="w-[20%] min-w-[200px] border-r-4 border-black overflow-y-scroll p-3 gap-2 flex flex-col">
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

                {unitsForSelectedClass.map(title => titleItem(title))}
            </div>
            <div className="w-[80%] flex flex-col bg-yellow-50">
                {selectedTitles.length === 0 ? (
                    <div className="flex justify-center items-center italic flex-1">
                        Please select a word topic from the left panel to continue
                    </div>
                ) : (
                    <>
                        <div className="p-2 pl-4 h-[14vh] border-b-4 border-black">
                            <p className="text-base">Selected Topics:</p>
                            <div className="flex gap-2 pt-2 overflow-x-scroll">
                                <div className="min-w-fit flex flex-row gap-2">
                                    {selectedTitles.map(title => titleItem(title))}
                                </div>
                            </div>
                        </div>
                        <div className="p-2 bg-white border-b-4 border-black flex flex-col gap-2 overflow-x-scroll flex-1 h-full pl-4">
                            {[...wordLists].reverse().map(w => unitItem(w))}
                        </div>
                        <div className="flex p-4 justify-end pr-8">
                            <button
                                className="bg-yellow-600 rounded-full w-[10vw] hover:bg-yellow-700 py-1 text-white"
                                onClick={handleNext}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
