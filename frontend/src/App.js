
import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dash from "./pages/Dash";
import InternHomePage from "./pages/InternHomePage";
import LoginPage from "./pages/LoginPage";
import Reset from "./pages/Reset";
import Recovery from "./pages/Recovery";
import LeaveManagement from "./pages/LeaveManagement";
import Tasks from "./pages/Tasks";
import Create from "./pages/Create";
import InternHoursCalculator from "./pages/InternHoursCalculator";
import AssetReport from "./pages/AssetReport";
import PerformancePage from "./pages/PerformancePage";
import AdminDashboard from "./pages/AdminDashboard";
import AboutUs from "./pages/AboutUs1";
import ContactUs from "./components/ContactUs1";
import Settings from "./pages/Settings";
import InternProfile from "./pages/InternProfile";
import InternOnboarding from "./pages/InternOnboarding";
import SimplePaymentPage from "./pages/SimplePaymentPage";
import AssetDashboard from "./pages/AssetDashboard";
import AttendanceDashboard from "./pages/AttendanceDashboard";
import InternDashboard from "./pages/InternDashboard";
import PayrollDashboard from "./pages/PayrollDashboard";
import DocumentsView from "./pages/DocumentView";
import PerformanceFeedbackList from "./pages/PerformanceFeedbackList";
import PerformanceFeedbackPage from "./pages/PerformanceFeedbackPage";
import InternManagement from "./pages/InternManagement";
import RegisterPage from "./pages/RegisterPage";
import InternLists from "./pages/InternLists";
import StaffList from "./pages/StaffList";
import AssetLists from './pages/AssetLists'; // adjust the path as needed
import LeaveList from "./pages/LeaveList";
import EditedForm from "./components/EditedForm";

// ...existing code...

function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // If no token, immediately set as invalid
    if (!token) {
      setIsValid(false);
      return;
    }

    // Verify token with the server
    fetch("http://localhost:8000/Sims/user-data/", {
      headers: { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        setIsValid(true);
      } else {
        localStorage.removeItem("token");
        setIsValid(false);
      }
    })
    .catch(() => {
      localStorage.removeItem("token");
      setIsValid(false);
    });
  }, []);

  // Show nothing while checking
  if (isValid === null) {
    return null;
  }

  // If not valid, redirect to login
  if (!isValid) {
    return <Navigate to="/loginpage" replace />;
  }

  // If valid, render children
  return children;
}
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InternHomePage />} />
        <Route path="/AboutUs1" element={<AboutUs />} />
        <Route path="/ContactUs1" element={<ContactUs />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/loginpage" element={<LoginPage />} />
        <Route path="/Reset" element={<Reset />} />
        <Route path="/Recovery" element={<Recovery />} />
        {/* Protected Routes */}
        <Route path="/Dash" element={
          <ProtectedRoute>
            <Dash />
          </ProtectedRoute>
        } />
        <Route path="/AdminDashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/Intern-profile" element={
          <ProtectedRoute>
            <InternProfile />
          </ProtectedRoute>
        } />
        <Route path="/LeaveManagement" element={
          <ProtectedRoute>
            <LeaveManagement />
          </ProtectedRoute>
        } />
        <Route path="/Tasks" element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/Create" element={
          <ProtectedRoute>
            <Create />
          </ProtectedRoute>
        } />
        <Route path="/assets" element={
          <ProtectedRoute>
            <AssetLists />
          </ProtectedRoute>
        } />
        <Route path="/InternHoursCalculator" element={
          <ProtectedRoute>
            <InternHoursCalculator />
          </ProtectedRoute>
        } />
        <Route path="/AssetReport" element={
          <ProtectedRoute>
            <AssetReport />
          </ProtectedRoute>
        } />
        <Route path="/PerformancePage" element={
          <ProtectedRoute>
            <PerformancePage />
          </ProtectedRoute>
        } />
        <Route path="/InternOnboarding" element={
          <ProtectedRoute>
            <InternOnboarding />
          </ProtectedRoute>
        } />
        <Route path="/SimplePaymentPage" element={
          <ProtectedRoute>
            <SimplePaymentPage />
          </ProtectedRoute>
        } />
        <Route path="/Intern" element={
          <ProtectedRoute>
            <InternDashboard />
          </ProtectedRoute>
        } />
        <Route path="/asset" element={
          <ProtectedRoute>
            <AssetDashboard />
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute>
            <AttendanceDashboard />
          </ProtectedRoute>
        } />
        <Route path="/payroll" element={
          <ProtectedRoute>
            <PayrollDashboard />
          </ProtectedRoute>
        } />
        <Route path="/documentsView" element={
          <ProtectedRoute>
            <DocumentsView />
          </ProtectedRoute>
        } />
        <Route path="/PerformanceFeedbackList" element={
          <ProtectedRoute>
            <PerformanceFeedbackList />
          </ProtectedRoute>
        } />
        <Route path="/PerformanceFeedbackPage" element={
          <ProtectedRoute>
            <PerformanceFeedbackPage />
          </ProtectedRoute>
        } />
        <Route path="/InternManagement" element={
          <ProtectedRoute>
            <InternManagement />
          </ProtectedRoute>
        } />
        <Route path="/register" element={
          <ProtectedRoute>
            <RegisterPage />
          </ProtectedRoute>
        } />
        <Route path="/InternLists" element={
          <ProtectedRoute>
            <InternLists />
          </ProtectedRoute>
        } />
        <Route path="/StaffList" element={
          <ProtectedRoute>
            <StaffList />
          </ProtectedRoute>
        } />
        <Route path="/LeaveList" element={
          <ProtectedRoute>
            <LeaveList />
          </ProtectedRoute>
        } />
        <Route path="/EditedForm" element={
          <ProtectedRoute>
            <EditedForm />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;