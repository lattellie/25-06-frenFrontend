import { Box, Typography, Button} from "@mui/material";
import type { VocabUnit } from "../type/vocabDD";
import theme from "../theme";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

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
  export default function selectAll(unit: VocabUnit, allChosen: boolean) {
    setWordLists(prev => prev.map(u =>
      u.name === unit.name ? {
        ...u, vocabs: u.vocabs.map(v => ({ ...v, selected: !allChosen }))
      } : u
    ))
  }

  export default function UnitItem(unit: VocabUnit) {
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

