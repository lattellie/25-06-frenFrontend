import NavBar from './components/NavBar';
import DictationPage from './pages/DictationPage';
import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VocabPage from './pages/VocabPage';
import RecordPageMongo2 from './pages/recordpagemongo2';
import './App.css'
import TranslationPage from './pages/TranslationPage';

export default function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<><HomePage /></>} />
        <Route path="/play" element={<><DictationPage /></>}/>
        <Route path="/translation" element={<><TranslationPage /></>}></Route>
        <Route path="/viewVocab" element={<><VocabPage /></>}></Route>
        <Route path="/uploaddata" element={<><RecordPageMongo2 /></>} />
      </Routes>
    </Router>
  );
}