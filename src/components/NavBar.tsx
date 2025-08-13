// src/components/NavBar.tsx
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import { useSpeakerAccentContext } from '../contexts/VocabContext';
import React, { useState } from "react";
import { Accent } from '../type/vocabDD';

type DropdownProps = {
  options: string[];
  onChange: (value: string) => void;
  defaultValue?: string;
};

const Dropdown: React.FC<DropdownProps> = ({ options, onChange, defaultValue }) => {
  const [selected, setSelected] = useState(defaultValue || options[0] || "");

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelected(newValue);
    onChange(newValue);
  };

  return (
    <select value={selected} onChange={handleChange} className='border-2 p-2 rounded-2xl'>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};


export default function NavBar() {
  const { speakerAccent, setSpeakerAccent } = useSpeakerAccentContext()
  const options = Object.values(Accent);
  return (
    <div className="h-[8vh] justify-center bg-white text-black border-b-[3px] border-black">
      <div className='p-4 flex flex-row justify-between'>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" fontFamily="monospace" sx={{ cursor: 'pointer' }}>
            French Vocab
          </Typography>
        </Link>
        <div className='flex flex-row justify-center text-center align-middle'>
          <h2 className='text-xl p-2'>Current Accent: </h2>
          <Dropdown
            options={options}
            onChange={(val) => {
              if (Object.values(Accent).includes(val as Accent)) {
                const acc = val as Accent;
                setSpeakerAccent(acc);
              }
            }}
            defaultValue={speakerAccent}
          />
        </div>
      </div>
    </div>
  );
}
