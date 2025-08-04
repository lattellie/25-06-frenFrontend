import { useEffect, useState } from 'react';
import { getData, getTitles } from '../utils/getData';
import type { Vocab, VocabUnit, VocabEntry } from '../type/vocabDD';
import { MdCheckBoxOutlineBlank, MdCheckBox } from "react-icons/md";
import { FaCirclePlay } from 'react-icons/fa6';
import { useVocabContext, useVocabUnitContext } from '../contexts/VocabContext';
import { useNavigate } from 'react-router-dom';

function useVoices() {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            if (allVoices.length > 0) {
                setVoices(allVoices);
            }
        };

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

export default function HomePage3() {
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
        setSelectedTitles(prev =>
            prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
        );
    };

    const playAudio = (french: string) => {
        if (!french || voices.length === 0) return;
        const msg = new SpeechSynthesisUtterance(french);
        msg.lang = 'fr';
        msg.voice = voices.find(v => v.lang.startsWith('fr-CA')) || null;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(msg);
    };

    const handleNext = () => {
        const vocs: Vocab[] = wordLists.flatMap(wl => wl.vocabs).filter(v => v.selected);
        if (vocs.length > 0) {
            setVocabs(vocs);
            setUnits(wordLists);
            navigate("/play");
        } else {
            alert("Select at least 1 vocab to continue");
        }
    };

    return (
        <div className="flex h-[92vh]">
            <div className="w-1/5 min-w-[200px] border-r-4 border-black overflow-y-scroll p-3 flex flex-wrap gap-2 ml-2">
                {titleList.map(title => (
                    <button
                        key={title}
                        onClick={() => toggleTitle(title)}
                        className={`flex justify-between items-center text-sm px-4 py-1 rounded-full border-2 max-w-[250px] w-full ${selectedTitles.includes(title) ? 'bg-yellow-400 text-white' : 'bg-white text-black'
                            } border-yellow-900 hover:bg-yellow-300`}
                    >
                        <span>{title}</span>
                        <span className="ml-2">{selectedTitles.includes(title) ? 'x' : '>'}</span>
                    </button>
                ))}
            </div>

            <div className="w-4/5 flex flex-col bg-beige-200">
                {selectedTitles.length === 0 ? (
                    <div className="flex justify-center items-center italic flex-1">
                        Please select a word topic from the left panel to continue
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b-4 border-black h-[14vh]">
                            <div className="font-medium">Selected Topics:</div>
                            <div className="flex gap-2 pt-2 overflow-x-auto">
                                {selectedTitles.map(title => (
                                    <button
                                        key={title}
                                        onClick={() => toggleTitle(title)}
                                        className={`flex justify-between items-center text-sm px-4 py-1 rounded-full border-2 max-w-[250px] ${selectedTitles.includes(title) ? 'bg-yellow-400 text-white' : 'bg-white text-black'
                                            } border-yellow-900 hover:bg-yellow-300`}
                                    >
                                        <span>{title}</span>
                                        <span className="ml-2">{selectedTitles.includes(title) ? 'x' : '>'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-white border-b-4 border-black flex-1 flex flex-col gap-2 overflow-x-auto">
                            {[...wordLists].reverse().map(unit => (
                                <div key={unit.name} className="flex flex-col mr-4 border-4 border-beige-700 rounded-xl p-2 min-w-fit">
                                    <div className="flex items-center border-b-4 border-beige-700 pb-2">
                                        <button
                                            onClick={() => {
                                                const allChosen = unit.vocabs.every(vocab => vocab.selected);
                                                setWordLists(prev => prev.map(u =>
                                                    u.name === unit.name
                                                        ? { ...u, vocabs: u.vocabs.map(v => ({ ...v, selected: !allChosen })) }
                                                        : u
                                                ));
                                            }}
                                            className="bg-brown-600 text-white px-2 py-1 rounded hover:bg-brown-700 mr-3"
                                        >
                                            {unit.vocabs.every(v => v.selected) ? 'Deselect All' : 'Select All'}
                                        </button>
                                        Unit Chosen: {unit.name}
                                    </div>

                                    <div className="overflow-y-auto">
                                        {unit.vocabs.map((vocab, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex border-b-4 border-beige-700 px-2 py-1 ${idx % 2 === 0 ? 'bg-beige-100' : 'bg-white'}`}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setWordLists(prev => prev.map(u =>
                                                            u.name === unit.name
                                                                ? {
                                                                    ...u,
                                                                    vocabs: u.vocabs.map((v, i) =>
                                                                        i === idx ? { ...v, selected: !v.selected } : v
                                                                    ),
                                                                }
                                                                : u
                                                        ));
                                                    }}
                                                >
                                                    {vocab.selected ? <MdCheckBox className="text-brown-800" /> : <MdCheckBoxOutlineBlank className="text-brown-800" />}
                                                </button>
                                                <button className="mx-2" onClick={() => playAudio(vocab.vocab.fren)}>
                                                    <FaCirclePlay className="text-yellow-500" />
                                                </button>
                                                <div className="min-w-[200px] w-[30%] flex items-center">{vocab.vocab.fren}</div>
                                                <div className="min-w-[200px] w-[30%]">{vocab.vocab.engl}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end p-4 pr-10">
                            <button
                                onClick={handleNext}
                                className="bg-brown-700 text-black px-6 py-2 rounded-full w-[10vw] hover:bg-brown-800"
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
