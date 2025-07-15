import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AssetDashboard from './components/AssetDashboard';
import AttendanceDashboard from './components/AttendanceDashboard';
import InternDashboard from './components/InternDashboard';
import PayrollDashboard from './components/PayrollDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InternDashboard />} />
        <Route path="/intern" element={<InternDashboard />} />
        <Route path="/asset" element={<AssetDashboard />} />
        <Route path="/attendance" element={<AttendanceDashboard />} />
        <Route path="/payroll" element={<PayrollDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;