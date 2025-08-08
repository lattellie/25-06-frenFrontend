import NavBar from './components/NavBar';
import DictationPage from './pages/DictationPage';
import DictationPage2 from './pages/Dictation2';
import HomePage from './pages/HomePage';
import HomePage2 from './pages/HomePage2';
import HomePage3 from './pages/HomePage3';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VocabPage from './pages/VocabPage';
import RecordPage from './pages/RecordPage';
import UploadAudio from './pages/uploadaudio';
import AddMongo from './pages/AddMongo';
import RecordPageMongo from './pages/RecordPageMongo';
import RecordPageMongo2 from './pages/recordpagemongo2';
import './App.css'
import HomePageOld from './pages/HomePageold';
import TranslationPage from './pages/TranslationPage';

export default function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/old" element={<HomePageOld />} />
        <Route path="/H" element={<HomePage3 />} />
        <Route path="/hh" element={<HomePage2 />} />
        <Route path="/play" element={<DictationPage />}></Route>
        <Route path="/translation" element={<TranslationPage />}></Route>
        <Route path="/play2" element={<DictationPage2 />}></Route>
        <Route path="/viewVocab" element={<VocabPage />}></Route>
        <Route path="/record" element={<RecordPage />}></Route>
        <Route path="/upload" element={<UploadAudio />}></Route>
        <Route path="/mongo" element={<AddMongo />} />
        <Route path="/recordmongo" element={<RecordPageMongo />} />
        <Route path="/uploaddata" element={<RecordPageMongo2 />} />
      </Routes>
    </Router>
  );
}