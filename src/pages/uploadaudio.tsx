import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from './supabaseClient';

type WordRow = {
    french: string;
    english: string;
};

const UploadAudio: React.FC = () => {
    const [statusMessage, setStatusMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setStatusMessage('❌ No file selected.');
            return;
        }

        setStatusMessage('');
        setIsUploading(true);

        Papa.parse<WordRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data;

                console.log('Parsed CSV:', rows);

                let successCount = 0;
                let failCount = 0;

                for (const row of rows) {
                    console.log('Raw row:', row);
                    const { french, english } = row;

                    // Skip invalid rows
                    if (!french || !english) {
                        failCount++;
                        continue;
                    }

                    const CourseName = 'SophieTry';
                    const Unit = 'SOPH 101';

                    // Check for duplicates before insert
                    const { data: existingRows, error: selectError } = await supabase
                        .from('FrenAudio')
                        .select()
                        .eq('french', french)
                        .eq('english', english)
                        .limit(1);

                    if (selectError) {
                        console.error('Error checking existing row:', selectError);
                        failCount++;
                        continue;
                    }

                    if (!existingRows || existingRows.length === 0) {
                        const { error: insertError } = await supabase.from('FrenAudio').insert([
                            { french, english, CourseName, Unit },
                        ]);

                        if (insertError) {
                            console.error('Insert error for row:', row);
                            console.error('Error message:', insertError.message);
                            failCount++;
                        } else {
                            successCount++;
                        }
                    } else {
                        console.log(`Skipping duplicate: ${french} / ${english}`);
                    }
                }

                setIsUploading(false);
                setStatusMessage(`✅ Upload complete: ${successCount} succeeded, ${failCount} failed.`);
                console.log('Upload finished.');
            },
            error: (error) => {
                console.error('CSV Parse Error:', error);
                setStatusMessage('❌ Failed to parse CSV.');
                setIsUploading(false);
            },
        });
    };

    return (
        <div style={{ padding: '2rem', maxWidth: 500, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Upload Vocabulary CSV</h2>
            <input type="file" accept=".csv" onChange={handleFileUpload} disabled={isUploading} />
            <p style={{ marginTop: '1rem', color: '#555' }}>
                CSV must include <strong>french</strong> and <strong>english</strong> columns.
            </p>
            {statusMessage && (
                <div style={{ marginTop: '1rem', fontWeight: 600, color: statusMessage.startsWith('✅') ? 'green' : 'red' }}>
                    {statusMessage}
                </div>
            )}
        </div>
    );
};

export default UploadAudio;


//gKju5iOiEbcnx4uy