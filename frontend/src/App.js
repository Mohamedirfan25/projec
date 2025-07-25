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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

function ProtectedDashboardRoute({ children, requiredPermission }) {
  const [isValid, setIsValid] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [userPermissions, setUserPermissions] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // If no token, redirect to login
    if (!token) {
      setIsValid(false);
      return;
    }

    // Fetch user data and permissions
    Promise.all([
      fetch("http://localhost:8000/Sims/user-data/", {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch("http://localhost:8000/Sims/user-permissions/", {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      })
    ])
    .then(([userRes, permRes]) => {
      if (!userRes.ok || !permRes.ok) {
        throw new Error('Failed to fetch user data or permissions');
      }
      return Promise.all([userRes.json(), permRes.json()]);
    })
    .then(([userData, permissions]) => {
      // Check if user has the required permission
      const hasPermission = permissions[requiredPermission];
      
      if (!hasPermission) {
        setShowWarning(true);
        // Redirect to first available dashboard after 3 seconds
        const availableDashboard = Object.entries(permissions).find(([_, hasAccess]) => hasAccess);
        if (availableDashboard) {
          const [perm] = availableDashboard;
          const dashboardPath = {
            'hasAssetAccess': '/asset',
            'hasAttendanceAccess': '/attendance',
            'hasPayrollAccess': '/payroll',
            'hasInternAccess': '/Intern'
          }[perm];
          
          if (dashboardPath) {
            setTimeout(() => {
              window.location.href = dashboardPath;
            }, 3000); // Redirect after 3 seconds
          }
        } else {
          // If no dashboards available, redirect to home
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      }
      
      setIsValid(hasPermission);
      setUserPermissions(permissions);
    })
    .catch((error) => {
      console.error('Error:', error);
      localStorage.removeItem("token");
      setIsValid(false);
    });
  }, [requiredPermission]);

  // Show nothing while checking
  if (isValid === null) {
    return null;
  }

  // Show warning if user doesn't have permission
  if (showWarning) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '20px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this dashboard. Redirecting you to an authorized dashboard...</p>
          <div style={{ marginTop: '20px' }}>
            <div className="spinner-border text-warning" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not valid, redirect to login
  if (!isValid) {
    return <Navigate to="/loginpage" replace />;
  }

  // If valid, render children with permissions
  return React.cloneElement(children, { userPermissions });
}

function App() {
  return (
    <>
    <ToastContainer 
    position="top-center"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
  />
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
          <ProtectedDashboardRoute requiredPermission="hasInternAccess">
            <InternDashboard />
          </ProtectedDashboardRoute>
        } />
        <Route path="/asset" element={
          <ProtectedDashboardRoute requiredPermission="hasAssetAccess">
            <AssetDashboard />
          </ProtectedDashboardRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedDashboardRoute requiredPermission="hasAttendanceAccess">
            <AttendanceDashboard />
          </ProtectedDashboardRoute>
        } />
        <Route path="/payroll" element={
          <ProtectedDashboardRoute requiredPermission="hasPayrollAccess">
            <PayrollDashboard />
          </ProtectedDashboardRoute>
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
    </>
  );
}

export default App;