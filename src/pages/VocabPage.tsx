import { Box, Button, Typography, useTheme } from '@mui/material';
import { useVocabContext, useVocabUnitContext } from '../contexts/VocabContext';
import type { Vocab, VocabUnit } from '../type/vocabDD';
import { FaCirclePlay } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

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

export default function VocabPage() {
    const theme = useTheme();
    const { setVocabs } = useVocabContext()
    const { units, setUnits } = useVocabUnitContext()
    const voices = useVoices();
    const navigate = useNavigate();

    function vocabItem(unitName: string, vocab: Vocab, index: number) {
        const isEven = index % 2 === 0;
        return (
            <Box sx={{
                display: 'flex',
                borderBottom: `3px solid ${theme.palette.beige.dark}`,
                backgroundColor: isEven ? theme.palette.beige.light : theme.palette.white.main,
                pl: 1
            }}>
                <Button onClick={() => {
                    setUnits(units.map(u =>
                        u.name === unitName
                            ? {
                                ...u,
                                vocabs: u.vocabs.map((v, i) =>
                                    i === index ? { ...v, selected: !v.selected } : v
                                ),
                            }
                            : u
                    )
                    )
                }}>
                    {vocab.selected ? (
                        <MdCheckBox color={theme.palette.brown.main} />
                    ) : (
                        <MdCheckBoxOutlineBlank color={theme.palette.brown.main} />
                    )}
                </Button>
                <Button sx={{ m: 0, p: 0 }} onClick={() => playAudio(vocab.vocab.fren)}>
                    <FaCirclePlay color={theme.palette.yellow.main} />
                </Button>
                <Box sx={{
                    display: 'flex',
                    width: '30%',
                    minWidth: '200px',
                    alignItems: 'center'
                }}>
                    {vocab.vocab.fren}
                </Box>
                <Box sx={{
                    width: '30%',
                    minWidth: '200px'
                }}>
                    {vocab.vocab.engl}
                </Box>
            </Box>
        )
    }
    function selectAll(currUnit: VocabUnit, allChosen: boolean) {
        setUnits(units.map((u: { name: string; vocabs: Vocab[]; }) =>
            u.name === currUnit.name ? {
                ...u, vocabs: u.vocabs.map(v => ({ ...v, selected: !allChosen }))
            } : u
        ))
    }
    function unitItem(unit: VocabUnit) {
        const allChosen: boolean = unit.vocabs.every(vocab => vocab.selected);;
        return (
            <Box sx={{
                minWidth: 'fit-content',
                height: 'fit-content',
                display: 'flex',
                flexDirection: 'column',
                mr: 2,
                border: `3px solid ${theme.palette.beige.dark}`,
                borderRadius: '1rem',
                p: 1
            }}>
                <Typography sx={{
                    borderBottom: `3px solid ${theme.palette.beige.dark}`,
                    pb: 2
                }}>
                    <Button sx={{
                        color: theme.palette.brown.contrastText,
                        backgroundColor: theme.palette.brown.main,
                        mr: 2,
                        p: 0,
                        pl: 1,
                        pr: 1,
                        borderRadius: 2,
                        '&:hover': {
                            backgroundColor: theme.palette.brown.dark
                        }
                    }} onClick={() => selectAll(unit, allChosen)}>
                        {allChosen ? "Deselect All" : "Select All"}
                    </Button>
                    {`Unit Chosen: ${unit.name}`}
                </Typography>
                <Box sx={{
                    height: 'fit-content',
                    overflowY: 'scroll',
                    minWidth: 'fit-content'
                }}>
                    {unit.vocabs.map((v, i) => vocabItem(unit.name, v, i))}
                </Box>
            </Box>
        )
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

    return (
        <Box sx={{
            display: 'flex',
            height: '92vh',
        }}>
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
                    <Typography variant='body1'> {"Progress"} </Typography>
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
                    height: '100%',
                    justifyContent: 'start',
                    alignItems: 'center',
                    overflowY: 'scroll'
                }}>
                    {units.map(u => unitItem(u))}
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
                        Back To Home
                    </Button>
                    <Button sx={{
                        backgroundColor: theme.palette.brown.main,
                        color: theme.palette.brown.contrastText,
                        borderRadius: '5rem',
                        width: '10vw',
                        '&:hover': {
                            backgroundColor: theme.palette.brown.dark
                        },
                    }} onClick={() => {
                        const vocs: Vocab[] = units.flatMap(wl => wl.vocabs).filter(v => v.selected)
                        if (vocs.length > 0) {
                            setVocabs(vocs);
                            navigate("/play")
                        } else {
                            alert("select at least 1 vocab to continue")
                        }
                    }}>
                        Restart
                    </Button>
                </Box>

            </Box>
        </Box>
    );

}
