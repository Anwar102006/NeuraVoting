import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Guards
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Basic mock components for the pages (you would expand these in their own files)
const DashboardHome = () => <div><div className="page-header"><h1>Dashboard</h1><p>Welcome to the Admin Console</p></div></div>;
const ManageElections = () => <div><div className="page-header"><h1>Elections</h1><p>Add, edit, or delete elections.</p></div></div>;
const ManageCandidates = () => <div><div className="page-header"><h1>Candidates</h1><p>Manage election participants.</p></div></div>;
const VerifyLedger = () => <div><div className="page-header"><h1>Verify Ledger</h1><p>Trigger cryptographic blockchain audits.</p></div></div>;
const ApproveVoters = () => <div><div className="page-header"><h1>Approve Voters</h1><p>Review KYC and grant system access.</p></div></div>;

const Login = () => <div style={{ padding: 50 }}><h1>Login Page</h1><button onClick={() => { localStorage.setItem('token', 'fake'); localStorage.setItem('role', 'Admin'); window.location.href='/admin/dashboard'; }}>Mock Login as Admin</button></div>;
const Unauthorized = () => <div style={{ padding: 50, color: 'red' }}><h1>403 Unauthorized</h1><p>You do not have permission to view this page.</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="Admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Redirect /admin to /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="elections" element={<ManageElections />} />
            <Route path="candidates" element={<ManageCandidates />} />
            <Route path="verify" element={<VerifyLedger />} />
            <Route path="voters" element={<ApproveVoters />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
