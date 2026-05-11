import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Vote, 
  Users, 
  ShieldCheck, 
  UserCheck, 
  LogOut 
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="admin-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>NeuraVoting</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Console</span>
        </div>

        <nav className="nav-links">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            <span>Dashboard Home</span>
          </NavLink>
          
          <NavLink to="/admin/elections" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Vote size={20} />
            <span>Manage Elections</span>
          </NavLink>

          <NavLink to="/admin/candidates" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={20} />
            <span>Manage Candidates</span>
          </NavLink>

          <NavLink to="/admin/verify" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <ShieldCheck size={20} />
            <span>Verify Ledger</span>
          </NavLink>

          <NavLink to="/admin/voters" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <UserCheck size={20} />
            <span>Approve Voters</span>
          </NavLink>
        </nav>

        {/* Logout Button pushed to bottom */}
        <div style={{ marginTop: 'auto', padding: '0 16px' }}>
          <button 
            onClick={handleLogout}
            className="nav-item" 
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={20} color="#EF4444" />
            <span style={{ color: '#EF4444' }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="glass-card" style={{ minHeight: 'calc(100vh - 80px)' }}>
          {/* This Outlet renders the specific Admin Page components */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
