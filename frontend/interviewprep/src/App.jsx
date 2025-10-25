import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartTestPage from "./pages/StartTestPage";
import QuestionPage from "./pages/QuestionPage";
import SummaryPage from "./pages/SummaryPage";

import ChooseTestTypePage from "./pages/chooseTestTypePage";
import TestBasedOnSkillPage from "./pages/TestBasedOnSkillPage";

import ScraperButton from "./pages/ScraperButton"; // adjust path if needed



function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/start" element={<StartTestPage />} />
        <Route path="/" element={<ChooseTestTypePage />} />
        <Route path="/test-skill" element={<TestBasedOnSkillPage />} />
        <Route path="/question" element={<QuestionPage />} />
        <Route path="/summary" element={<SummaryPage />} />
          <Route path="/admin" element={<ScraperButton />} />
      </Routes>
    </Router>
  );
}

export default App;
