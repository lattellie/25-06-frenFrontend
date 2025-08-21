// src/components/NavBar.tsx
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import { useSpeakerAccentContext } from '../contexts/VocabContext';
import React, { useEffect, useState } from "react";
import { Accent } from '../type/vocabDD';
import { useAuth0 } from '@auth0/auth0-react';
import { PiUserCircle, PiUserCircleCheckFill } from "react-icons/pi";
import toast from 'react-hot-toast';

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


export default function NavBarAdmin() {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const { speakerAccent, setSpeakerAccent } = useSpeakerAccentContext();
  const [open, setOpen] = useState<boolean>(false);
  const options = Object.values(Accent).filter(val => val !== Accent.IA);

  useEffect(() => {
    const opts = options as Accent[];
    if (!opts.includes(speakerAccent)) {
      setSpeakerAccent(options[0]);
    }
  }, [speakerAccent, options, setSpeakerAccent]);

  return (
    <div className="h-[8vh] justify-center bg-white text-black border-b-[3px] border-black">
      <div className='flex flex-row justify-between p-2'>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" fontFamily="monospace" sx={{ cursor: 'pointer' }}>
            French Vocab
          </Typography>
        </Link>
        <div className='flex flex-row justify-center text-center align-middle'>
          <h2 className='text-md p-2'>Current Accent: </h2>
          <Dropdown
            options={options}
            onChange={(val) => {
              if (Object.values(Accent).includes(val as Accent)) {
                const acc = val as Accent;
                setSpeakerAccent(acc);
                toast.success(`Accent switched to ${acc}`, {
                  duration: 3000,
                  style: {
                    background: "#0c4a6e",
                    color: "#fff",
                    fontWeight: "bold",
                  },
                });

              }
            }}
            defaultValue={speakerAccent}
          />
          <div>
            {!isAuthenticated ? (
              <>
                <button onClick={() => {
                  loginWithRedirect({
                    authorizationParams: {
                      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                      scope: "openid profile email",
                      redirect_uri: window.location.href,
                    },
                  })
                }}
                  className='text-4xl pl-2 text-sky-900' title='log in'>
                  <PiUserCircle />
                </button></>
            ) : (
              <><button onClick={() => {
                setOpen(!open);
              }}
                className='text-4xl pl-2 text-cyan-400' title={`log out ${user?.name}`}>
                <PiUserCircleCheckFill />
              </button>
                {open && (
                  <div className="absolute right-2 mt-2 w-fit bg-white border border-gray-500 rounded-lg shadow-lg p-2 z-10">
                    <div className='flex-col flex'>
                      <button
                        onClick={() => {
                          setOpen(false)
                          logout({ logoutParams: { returnTo: window.location.origin } })
                        }}
                        className="px-3 py-2 text-left rounded-md hover:bg-gray-100"
                      >
                        Log out {user?.name}
                      </button>
                      <button
                        onClick={() => {
                          setOpen(false);
                          alert("Action 2")
                        }}
                        className="px-3 py-2 text-left rounded-md hover:bg-gray-100"
                      >
                        Switch to Admin
                      </button>

                    </div>
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
