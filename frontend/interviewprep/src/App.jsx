import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StartTestPage from "./pages/StartTestPage";
import QuestionPage from "./pages/QuestionPage";
import SummaryPage from "./pages/SummaryPage";
import ChooseTestTypePage from "./pages/ChooseTestTypePage";
import TestBasedOnSkillPage from "./pages/TestBasedOnSkillPage";
import AdminPage from "./pages/ScraperButton";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LogoutButton from "./pages/LogoutButton"; // Add this import
import Home from "./pages/Home";

// Simple route protection
const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("userId");
  return userId ? children : <Navigate to="/login" />;
};
function SkillTest() {
  return (
    <div className="flex justify-center items-center h-[80vh] text-2xl font-semibold">
      Skill Test Page (Coming Soon)
    </div>
  );
}

function Report() {
  return (
    <div className="flex justify-center items-center h-[80vh] text-2xl font-semibold">
      Report Page (Coming Soon)
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* Add Logout Button - will only show when logged in */}
      <LogoutButton />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/start" element={
          <ProtectedRoute>
            <StartTestPage />
          </ProtectedRoute>
        } />
        {/* <Route path="/" element={
          <ProtectedRoute>
            <ChooseTestTypePage />
          </ProtectedRoute>
        } /> */}
        <Route path="/test-skill" element={
          <ProtectedRoute>
            <TestBasedOnSkillPage />
          </ProtectedRoute>
        } />
        <Route path="/question" element={
          <ProtectedRoute>
            <QuestionPage />
          </ProtectedRoute>
        } />
        <Route path="/summary" element={
          <ProtectedRoute>
            <SummaryPage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<Home />} />
          <Route path="/skill-test" element={<SkillTest />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;