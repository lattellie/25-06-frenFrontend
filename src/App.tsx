import NavBar from './components/NavBar';
import DictationPage from './pages/DictationPage';
import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import VocabPage from './pages/VocabPage';
import RecordPageMongo2 from './pages/recordpagemongo2';
import './App.css'
import TranslationPage from './pages/TranslationPage';
import NavBarAdmin from './components/NavBarAdmin';
import { Toaster } from "react-hot-toast";

function Layout() {
  const location = useLocation();
  const isAdminPage = location.pathname === "/uploaddata";

  return (
    <>
      <Toaster position="top-center" />
      {isAdminPage ? <NavBarAdmin /> : <NavBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<DictationPage />} />
        <Route path="/translation" element={<TranslationPage />} />
        <Route path="/viewVocab" element={<VocabPage />} />
        <Route path="/uploaddata" element={<RecordPageMongo2 />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}