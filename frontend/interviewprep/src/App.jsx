import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartTestPage from "./pages/StartTestPage";
import QuestionPage from "./pages/QuestionPage";
import SummaryPage from "./pages/SummaryPage";
import ChooseTestTypePage from "./pages/chooseTestTypePage";
import TestBasedOnSkillPage from "./pages/TestBasedOnSkillPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/start" element={<StartTestPage />} />
        <Route path="/" element={<ChooseTestTypePage />} />
        <Route path="/test-skill" element={<TestBasedOnSkillPage />} />
        <Route path="/question" element={<QuestionPage />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
