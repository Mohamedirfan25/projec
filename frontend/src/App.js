import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
        <Route path="/Dash" element={<Dash />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/Intern-profile" element={<InternProfile />} />
        <Route path="/LeaveManagement" element={<LeaveManagement />} />
        <Route path="/Tasks" element={<Tasks />} />
        <Route path="/Create" element={<Create />} />
        <Route path="/assets" element={<AssetLists />} />
        <Route
          path="/InternHoursCalculator"
          element={<InternHoursCalculator />}
        />
        <Route path="/AssetReport" element={<AssetReport />} />
        <Route path="/PerformancePage" element={<PerformancePage />} />
        <Route path="/InternOnboarding" element={<InternOnboarding />} />
        <Route path="/SimplePaymentPage" element={<SimplePaymentPage />} />
        <Route path="/Intern" element={<InternDashboard />} />
        <Route path="/asset" element={<AssetDashboard />} />
        <Route path="/attendance" element={<AttendanceDashboard />} />
        <Route path="/payroll" element={<PayrollDashboard />} />
        <Route path="/documentsView" element={<DocumentsView />} />
        <Route
          path="/PerformanceFeedbackList"
          element={<PerformanceFeedbackList />}
        />
        <Route
          path="/PerformanceFeedbackPage"
          element={<PerformanceFeedbackPage />}
        />
        <Route path="/InternManagement" element={<InternManagement />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/InternLists" element={<InternLists />} />
        <Route path="/StaffList" element={<StaffList />} />
        <Route path="/LeaveList" element={<LeaveList />} />
        <Route path="/EditedForm" element={<EditedForm />} />
      </Routes>
    </Router>
  );
}

export default App;
