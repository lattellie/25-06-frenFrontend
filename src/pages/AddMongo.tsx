import React, { useState } from 'react';

const AddMongo: React.FC = () => {
    const [status, setStatus] = useState<string>('');

    const vocabToAdd = {
        french: "fromage",
        english: "cheese",
        unit: "U1",
        class: "SOPH 101",
        mp3_url: "https://supabase.storage.url/fromage.mp3"
    };

    const handleAddClick = async () => {
        setStatus('Adding...');
        try {
            const response = await fetch('http://localhost:3001/add-vocab', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(vocabToAdd),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus(`✅ Added successfully with ID: ${data.insertedId}`);
            } else {
                setStatus(`❌ Failed to add: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            setStatus('❌ Error connecting to server');
            console.error('Fetch error:', error);
        }
    };

    return (
        <div>
            <button onClick={handleAddClick}>Add</button>
            {status && <p>{status}</p>}
        </div>
    );
};

export default AddMongo;
