import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartTestPage from "./pages/StartTestPage";
import QuestionPage from "./pages/QuestionPage";
import SummaryPage from "./pages/SummaryPage";
import ScraperButton from "./pages/ScraperButton"; // adjust path if needed


function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<StartTestPage />} />
        <Route path="/question" element={<QuestionPage />} />
        <Route path="/summary" element={<SummaryPage />} />
          <Route path="/admin" element={<ScraperButton />} />
      </Routes>
    </Router>
  );
}

export default App;
