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
import LogoutButton from "./pages/LogoutButton";
import VerifyEmailPage from "./pages/VerifyEmailPage"; // Add this import
import ResendVerificationPage from "./pages/ResendVerificationPage"; // Add this import

// Simple route protection
const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("userId");
  return userId ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      {/* Add Logout Button - will only show when logged in */}
      <LogoutButton />
      
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/resend-verification" element={<ResendVerificationPage />} />
        
        {/* Protected routes */}
        <Route path="/start" element={
          <ProtectedRoute>
            <StartTestPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <ChooseTestTypePage />
          </ProtectedRoute>
        } />
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
      </Routes>
    </Router>
  );
}

export default App;