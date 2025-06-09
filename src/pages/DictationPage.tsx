import { Box, Button, Typography, useTheme } from '@mui/material';
import { useShowEnglishContext, useVocabContext, useVocabUnitContext } from '../contexts/VocabContext';
import type { Vocab } from '../type/vocabDD';
import { FaCirclePlay } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

const frenchCharSet = ['\'', 'a', 'à', 'â', 'b', 'c', 'ç', 'd', 'e', 'é', 'è', 'ê', 'ë', 'f', 'g', 'h', 'i', 'î', 'ï', 'j', 'k', 'l', 'm', 'n', 'o', 'ô', 'œ', 'p', 'q', 'r', 's', 't', 'u', 'ù', 'û', 'ü', 'v', 'w', 'x', 'y', 'ÿ', 'z', '-']

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

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

export default function DictationPage() {
    const theme = useTheme();
    const { vocabs } = useVocabContext()
    const { units } = useVocabUnitContext()
    const { showEnglish, setShowEnglish } = useShowEnglishContext()
    const [firstLoad, setFirstLoad] = useState(true);

    const voices = useVoices();
    const navigate = useNavigate()

    const [currVocabs, setCurrVocabs] = useState<Vocab[]>(shuffleArray(vocabs));
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    // const [typing, setTyping] = useState<string>('');
    const [nowSubmit, setNowSubmit] = useState<boolean>(true);
    const [typing, setTyping] = useState<string>('')

    let target = "";
    if (currVocabs.length > 0) {
        target = currVocabs[currentIndex].vocab.fren;
    }
    const targetNoSpace = target.replace(/\s/g, "");

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        if (currVocabs.length === 0) {
            e.preventDefault();
        } else if (firstLoad) {
            playAudio(currVocabs[currentIndex].vocab.fren)
            setNowSubmit(true)
        } else if (nowSubmit) {
            e.preventDefault();
            const userAnswer = typing.trim().toLowerCase();
            if (userAnswer === currVocabs[currentIndex].vocab.fren.replace(/\s/g, "").toLowerCase()) {
                const updated = currVocabs.filter((_, i) => i !== currentIndex);
                setCurrVocabs(updated);
                setTyping('');
                if (updated.length > 0) {
                    setCurrentIndex(currentIndex % updated.length);
                    playAudio(updated[currentIndex].vocab.fren)
                }
            } else {
                setTyping(currVocabs[currentIndex].vocab.fren.replace(/\s/g, ""))
                playAudio(currVocabs[currentIndex].vocab.fren)
                setNowSubmit(false)
            }
        } else {
            e.preventDefault()
            const removed = currVocabs[currentIndex];
            const updated = currVocabs.filter((_, i) => i !== currentIndex);
            const randomIndex = Math.floor(Math.random() * (updated.length + 1));
            const newVocabs = [
                ...updated.slice(0, randomIndex),
                removed,
                ...updated.slice(randomIndex),
            ];
            setCurrVocabs(newVocabs);
            setTyping('');
            setNowSubmit(true);
            if (updated.length > 0) {
                setCurrentIndex(currentIndex % updated.length);
                playAudio(updated[currentIndex].vocab.fren)
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Backspace') {
            if (typing.length > 0) {
                setTyping(typing.slice(0, -1))
            } else {
                setTyping('')
            }
        } else if (e.key === 'Delete') {
            setTyping('')
        } else if (frenchCharSet.includes(e.key) && typing.length < targetNoSpace.length) {
            setTyping(typing.concat(e.key));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    function textBox() {
        let temp = 0;
        const showString = target
            .split('')
            .map((char, i) => {
                if (char === ' ') {
                    temp++
                    return ' ';
                }
                return typing[i - temp] || '_';
            })
            .join('');

        return (
            <Box tabIndex={0} onKeyDown={e => handleKeyDown(e)} sx={{
                backgroundColor: nowSubmit ? theme.palette.white.main : theme.palette.yellow.main,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
            }}>
                <Box
                    sx={{
                        p: 1,
                    }}
                >
                    <Typography variant='h4'>{"  "}</Typography>
                </Box>
                {showString.split(' ').map((word, idx) => (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 1,
                        pb: 2,
                    }}>
                        {word.split('').map((char, cidx) => (
                            <Box
                                key={`${idx}-${cidx}`}
                            >
                                <Typography variant='h4'>{char}</Typography>
                            </Box>
                        ))}
                        <Box
                            sx={{
                                p: 1,
                            }}
                        >
                            <Typography variant='h4'>{"  "}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
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
                    p: '4px',
                    pl: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '250px',
                    borderColor: theme.palette.brown.main,
                    borderStyle: 'solid',
                    borderWidth: '2px',
                    borderRadius: '2rem',
                    textTransform: 'none',
                    gap: 1,
                    minWidth: 'fit-content',
                    height: 'fit-content',
                    '&:hover': {
                        backgroundColor: theme.palette.beige.dark,
                    },
                }}
            >
                <Typography variant='body2' sx={{
                }}>
                    {title}
                </Typography>
            </Button>
        );
    }
    function playAudio(french: string) {
        if (!french || voices.length === 0) {
            console.warn("Voices not loaded yet");
            return;
        }

        const msg = new SpeechSynthesisUtterance(french);
        msg.lang = 'fr';

        // Pick a French voice
        msg.voice = voices.find((v: { lang: string; }) => v.lang.startsWith('fr-CA')) || null;

        window.speechSynthesis.cancel(); // <-- Optional: cancel any ongoing speech
        window.speechSynthesis.speak(msg);
    }

    if (firstLoad) {
        return (
            <Box sx={{
                display: 'flex',
                height: '92vh',
            }}
            >
                <Box sx={{
                    width: '20%',
                    minWidth: '200px',
                    borderRight: `3px solid ${theme.palette.black.main}`,
                    overflowY: 'scroll',
                    justifyContent: 'start',
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    p: 1.2,
                    gap: 1,
                    ml: 1
                }}>
                    {units.map(u => titleItem(u.name))}
                </Box>
                <Box sx={{
                    width: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: theme.palette.beige.main
                }}>
                    <Box sx={{
                        p: 1,
                        pl: 2,
                        pt: 0,
                        minHeight: 'fit-content',
                        borderBottom: `3px solid ${theme.palette.beige.dark}`,
                        height: '7vh',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Typography variant='body1'> {`Current Progress: ${vocabs.length - currVocabs.length}/${vocabs.length}`} </Typography>
                        <Typography variant='h4' color={theme.palette.brown.main}> x </Typography>
                    </Box>
                    <Box
                        component="form"
                        onSubmit={(e) => {
                            handleSubmit(e);
                            setFirstLoad(false);
                        }}
                        sx={{
                            p: 1,
                            backgroundColor: theme.palette.white.main,
                            borderBottom: `3px solid ${theme.palette.black.main}`,
                            flex: 1,
                            pl: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            overflowX: 'scroll',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Box sx={{
                            fontSize: '30px',
                            gap: 2,
                            display: 'flex',
                            flexDirection: 'row',
                            m: 2,
                            cursor: 'pointer'
                        }} onClick={() => setShowEnglish(!showEnglish)}>
                            {showEnglish ? (
                                <MdCheckBox color={theme.palette.brown.main} />
                            ) : (
                                <MdCheckBoxOutlineBlank color={theme.palette.brown.main} />
                            )}
                            <Typography variant='h6'>
                                Display English translation
                            </Typography>
                        </Box>
                        <Button type="submit" sx={{
                            backgroundColor: theme.palette.brown.main,
                            color: theme.palette.brown.contrastText,
                            p: 2,
                            pl: 4,
                            pr: 4,
                            borderRadius: '1rem',
                            '&:hover': {
                                backgroundColor: theme.palette.brown.dark,
                            }
                        }}>
                            <Typography variant='h4'>Start</Typography>
                        </Button>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        p: 2,
                        justifyContent: 'space-between',
                        pr: '2rem',
                    }}>
                        <Button sx={{
                            backgroundColor: theme.palette.brown.main,
                            color: theme.palette.brown.contrastText,
                            borderRadius: '5rem',
                            width: '10vw',
                            '&:hover': {
                                backgroundColor: theme.palette.brown.dark
                            },
                        }} onClick={() => { navigate("/") }}>
                            Back to Home
                        </Button>
                    </Box>

                </Box>
            </Box>

        )
    }
    return (
        <Box sx={{
            display: 'flex',
            height: '92vh',
        }}
            tabIndex={0}
            onKeyDown={e => handleKeyDown(e)}
        >
            <Box sx={{
                width: '20%',
                minWidth: '200px',
                borderRight: `3px solid ${theme.palette.black.main}`,
                overflowY: 'scroll',
                justifyContent: 'start',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'wrap',
                p: 1.2,
                gap: 1,
                ml: 1
            }}>
                {units.map(u => titleItem(u.name))}
            </Box>
            <Box sx={{
                width: '80%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.palette.beige.main
            }}>
                <Box sx={{
                    p: 1,
                    pl: 2,
                    pt: 0,
                    minHeight: 'fit-content',
                    borderBottom: `3px solid ${theme.palette.beige.dark}`,
                    height: '7vh',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Typography variant='body1'> {`Current Progress: ${vocabs.length - currVocabs.length}/${vocabs.length}`} </Typography>
                    <Typography variant='h4' color={theme.palette.brown.main}> x </Typography>
                </Box>
                <Box sx={{
                    p: 1,
                    backgroundColor: theme.palette.white.main,
                    borderBottom: `3px solid ${theme.palette.black.main}`,
                    flex: 1,
                    pl: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    overflowX: 'scroll',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {currVocabs.length > 0 ?
                        (
                            <>
                                <Box sx={{
                                    m: 0,
                                    p: 0,
                                    cursor: 'pointer',
                                    color: theme.palette.yellow.main,
                                    transition: 'color 0.3s ease',
                                    '&:hover': {
                                        color: theme.palette.brown.main
                                    }
                                }} onClick={() => playAudio(currVocabs[currentIndex].vocab.fren)}
                                >
                                    <FaCirclePlay fontSize={'100px'} />
                                </Box>
                                {showEnglish ? (
                                    <Typography variant="h4" gutterBottom>
                                        {currVocabs[currentIndex].vocab.engl}
                                    </Typography>
                                ) : (
                                    <></>
                                )}
                                <Box
                                    component="form"
                                    onSubmit={handleSubmit}
                                    display="flex"
                                    flexDirection="column"
                                    gap={2}
                                >
                                    {textBox()}
                                    <Button type="submit" sx={{
                                        backgroundColor: theme.palette.brown.main,
                                        color: theme.palette.brown.contrastText
                                    }}>
                                        {nowSubmit ? "Submit" : "Continue"}
                                    </Button>
                                </Box>
                            </>
                        ) :
                        (<Typography variant='h5'>
                            Finish Practicing
                        </Typography>)}
                </Box>
                <Box sx={{
                    display: 'flex',
                    p: 2,
                    justifyContent: 'space-between',
                    pr: '2rem',
                }}>
                    <Button sx={{
                        backgroundColor: theme.palette.brown.main,
                        color: theme.palette.brown.contrastText,
                        borderRadius: '5rem',
                        width: '10vw',
                        '&:hover': {
                            backgroundColor: theme.palette.brown.dark
                        },
                    }} onClick={() => { navigate("/") }}>
                        Back to Home
                    </Button>
                    <Button sx={{
                        backgroundColor: currVocabs.length !== 0 ? theme.palette.beige.dark : theme.palette.brown.main,
                        color: theme.palette.brown.contrastText,
                        borderRadius: '5rem',
                        width: '10vw',
                        '&:hover': {
                            backgroundColor: currVocabs.length !== 0 ?
                                theme.palette.beige.dark :
                                theme.palette.brown.dark
                        },
                    }} onClick={() => { navigate("/viewVocab") }}>
                        Next
                    </Button>
                </Box>

            </Box>
        </Box>
    );

}
