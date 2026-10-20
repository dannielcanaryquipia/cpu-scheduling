import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';

import Home from './pages/Home.jsx';
import Introduction from './pages/Introduction.jsx';
import Terminology from './pages/Terminology.jsx';
import Criteria from './pages/Criteria.jsx';
import Preemption from './pages/Preemption.jsx';
import AlgorithmsIndex from './pages/AlgorithmsIndex.jsx';
import AlgorithmPage from './pages/AlgorithmPage.jsx';
import Compare from './pages/Compare.jsx';
import Practice from './pages/Practice.jsx';
import Quiz from './pages/Quiz.jsx';
import SimulatorPage from './pages/SimulatorPage.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="lesson">
          <Route path="introduction" element={<Introduction />} />
          <Route path="terminology" element={<Terminology />} />
          <Route path="criteria" element={<Criteria />} />
          <Route path="preemption" element={<Preemption />} />
        </Route>
        <Route path="algorithms" element={<AlgorithmsIndex />} />
        <Route path="algorithms/:slug" element={<AlgorithmPage />} />
        <Route path="compare" element={<Compare />} />
        <Route path="practice" element={<Practice />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="simulator" element={<SimulatorPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
