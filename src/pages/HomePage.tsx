// src/pages/HomePage.tsx
import { Box, Button, Typography, useTheme } from '@mui/material';

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

export default function HomePage() {
  const theme = useTheme();
  const titleList: string[] = getTitles();
  const voices = useVoices();

  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [wordLists, setWordLists] = useState<VocabUnit[]>([])

  const { setVocabs } = useVocabContext();
  const { setUnits } = useVocabUnitContext();
  const navigate = useNavigate()

  const toggleTitle = async (title: string) => {
    const wasSelected = selectedTitles.includes(title);
    if (wasSelected) {
      setWordLists(prev =>
        prev.filter(p => p.name !== title)
      )
    } else {
      const currentVocabEntryList: VocabEntry[] = await getData(title);
      const currentVocab: Vocab[] = currentVocabEntryList.map(v => ({
        vocab: v,
        selected: true,
      }))
      setWordLists(prev =>
        [...prev, { name: title, vocabs: currentVocab }]
      )
    }
    setSelectedTitles(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  function playAudio(french: string) {
    if (!french || voices.length === 0) {
      console.warn("Voices not loaded yet");
      return;
    }

    const msg = new SpeechSynthesisUtterance(french);
    msg.lang = 'fr';

    // Pick a French voice
    msg.voice = voices.find(v => v.lang.startsWith('fr-CA')) || null;

    window.speechSynthesis.cancel(); // <-- Optional: cancel any ongoing speech
    window.speechSynthesis.speak(msg);
  }


  function titleItem(title: string) {
    const isSelected = selectedTitles.includes(title);

    return (
      <Button
        key={title}
        onClick={() => toggleTitle(title)}
        sx={{
          backgroundColor: isSelected ? theme.palette.yellow.main : theme.palette.white.main,
          color: isSelected ? theme.palette.yellow.contrastText : theme.palette.white.contrastText,
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
            backgroundColor: isSelected
              ? theme.palette.yellow.dark
              : theme.palette.beige.main,
          },
        }}
      >
        <Typography variant='body2' sx={{
        }}>
          {title}
        </Typography>
        <Typography sx={{
          display: 'flex',
          borderColor: theme.palette.brown.main,
          borderStyle: 'solid',
          borderWidth: '0px',
          borderRadius: '2rem',
          textTransform: 'none',
          width: '1.2rem',
          height: '1.2rem',
          justifyContent: 'center',
          pb: '1.5px',
          alignItems: 'center'
        }}>
          {isSelected ? 'x' : '>'}
        </Typography>
      </Button>
    );
  }

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
          setWordLists(prev => prev.map(u =>
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
  function selectAll(unit: VocabUnit, allChosen: boolean) {
    setWordLists(prev => prev.map(u =>
      u.name === unit.name ? {
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

  const handleNext = () => {
    const vocs: Vocab[] = wordLists.flatMap(wl => wl.vocabs).filter(v => v.selected)
    if (vocs.length > 0) {
      setVocabs(vocs);
      setUnits(wordLists);
      navigate("/play")
    } else {
      alert("select at least 1 vocab to continue")
    }
  };


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
        flexWrap: 'wrap',
        p: 1.2,
        gap: 1,
        ml: 1
      }}>
        {titleList.map(title => titleItem(title))}
      </Box>

      <Box sx={{
        width: '80%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.beige.main
      }}>
        {selectedTitles.length === 0 ? (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontStyle: 'italic',
            flex: 1
          }}>
            Please select a word topic from the left panel to continue
          </Box>
        ) : (
          <>
            <Box sx={{ // selected topics
              p: 1,
              pl: 2,
              minHeight: 'fit-content',
              borderBottom: `3px solid ${theme.palette.black.main}`,
              height: '14vh',
            }}>
              <Typography variant='body1'> Selected Topics:</Typography>
              <Box sx={{
                display: 'flex',
                gap: 1,
                pt: 1,
                overflowX: 'scroll',
              }}>
                <Box sx={{
                  minWidth: 'fit-content',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                }}>
                  {selectedTitles.map(title => titleItem(title))}
                </Box>
              </Box>
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
            }}>
              {[...wordLists].reverse().map(w => unitItem(w))}
            </Box>
            <Box sx={{
              display: 'flex',
              p: 2,
              justifyContent: 'end',
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
              }} onClick={handleNext}>
                Next
              </Button>
            </Box>
          </>

        )}
      </Box>
    </Box>
  );
}