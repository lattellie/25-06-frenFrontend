import NavBar from './components/NavBar';
import DictationPage from './pages/DictationPage';
import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VocabPage from './pages/VocabPage';

export default function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<DictationPage/>}></Route>
        <Route path="/viewVocab" element={<VocabPage/>}></Route>
      </Routes>
    </Router>
  );
}