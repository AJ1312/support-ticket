import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLogin from './components/AdminLogin';
import StatsDashboard from './components/StatsDashboard';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import './App.css';

// ── Protected Route Wrapper ──────────────────────────

const RequireAuth = ({ children }) => {
    const token = localStorage.getItem('access_token');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return children;
};

// ── Pages ────────────────────────────────────────────

const UserPanel = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleTicketCreated = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    return (
        <div className="panel-container">
            <div className="panel-header">
                <h2>User Support Panel</h2>
                <p>Submit a ticket or view the public board.</p>
            </div>

            <section className="section-block">
                <h3>Submit a Ticket</h3>
                <TicketForm onTicketCreated={handleTicketCreated} />
            </section>

            <section className="section-block">
                <h3>Public Ticket Board</h3>
                <TicketList refreshKey={refreshKey} />
            </section>
        </div>
    );
};

const AdminPanel = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUpdate = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    return (
        <div className="panel-container">
            <div className="panel-header">
                <h2>Admin Dashboard</h2>
                <p>Manage tickets and view statistics.</p>
            </div>

            <section className="section-block">
                <StatsDashboard refreshKey={refreshKey} />
            </section>

            <section className="section-block">
                <h3>Ticket Management</h3>
                <TicketList refreshKey={refreshKey} onUpdate={handleUpdate} adminMode={true} />
            </section>
        </div>
    );
};

// ── App Component ────────────────────────────────────

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* Public User Routes */}
                <Route index element={<UserPanel />} />

                {/* Admin Routes */}
                <Route path="admin/login" element={<AdminLogin />} />
                <Route
                    path="admin/*"
                    element={
                        <RequireAuth>
                            <AdminPanel />
                        </RequireAuth>
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
