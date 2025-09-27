import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartTestPage from "./pages/StartTestPage";
import QuestionPage from "./pages/QuestionPage";
import SummaryPage from "./pages/SummaryPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartTestPage />} />
        <Route path="/question" element={<QuestionPage />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
