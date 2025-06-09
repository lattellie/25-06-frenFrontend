import { Box, Typography, useTheme } from '@mui/material';
import { useVocabContext } from '../contexts/VocabContext';
import React, { useState } from 'react';
import {
    TextField,
    Button,
    Paper,
    Alert
} from '@mui/material';


export default function VocabPractice() {
    const { vocabs } = useVocabContext()
    const initialVocabs = vocabs;
    const [currVocabs, setCurrVocabs] = useState(initialVocabs);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState('');


    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const current = currVocabs[currentIndex];
        const userAnswer = input.trim().toLowerCase();

        if (userAnswer === current.vocab.fren.toLowerCase()) {
            const updated = currVocabs.filter((_, i) => i !== currentIndex);
            setCurrVocabs(updated);
            setFeedback('✅ Correct!');
            setInput('');

            if (updated.length > 0) {
                setCurrentIndex(currentIndex % updated.length);
            }
        } else {
            setFeedback('❌ Incorrect. Try again.');
        }
    };

    if (currVocabs.length === 0) {
        return (
            <Box p={4} display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h4" gutterBottom>
                    🎉 All words completed!
                </Typography>
            </Box>
        );
    }

    return (
        <Box p={4} display="flex" flexDirection="column" alignItems="center">
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
                <Typography variant="h6" gutterBottom>
                    Translate this word to French:
                </Typography>

                <Typography variant="h4" gutterBottom>
                    {currVocabs[currentIndex].vocab.engl}
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    display="flex"
                    flexDirection="column"
                    gap={2}
                >
                    <TextField
                        label="Your Answer"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                    />
                    <Button type="submit" variant="contained">
                        Submit
                    </Button>
                </Box>

                {feedback && (
                    <Alert
                        severity={feedback.includes('Correct') ? 'success' : 'error'}
                        sx={{ mt: 2 }}
                    >
                        {feedback}
                    </Alert>
                )}
            </Paper>
        </Box>
    );
}
