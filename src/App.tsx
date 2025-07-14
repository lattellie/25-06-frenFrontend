import NavBar from './components/NavBar';
import DictationPage from './pages/DictationPage';
import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VocabPage from './pages/VocabPage';
import RecordPage from './pages/RecordPage';
import UploadAudio from './pages/uploadaudio';
import AddMongo from './pages/AddMongo';
import RecordPageMongo from './pages/RecordPageMongo';
import './App.css'

export default function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<DictationPage />}></Route>
        <Route path="/viewVocab" element={<VocabPage />}></Route>
        <Route path="/record" element={<RecordPage />}></Route>
        <Route path="/upload" element={<UploadAudio />}></Route>
        <Route path="/mongo" element={<AddMongo />} />
        <Route path="/recordmongo" element={<RecordPageMongo />} />
      </Routes>
    </Router>
  );
}