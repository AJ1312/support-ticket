import React, { useState, useCallback } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import StatsDashboard from './components/StatsDashboard';

function App() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleTicketCreated = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <div className="logo">
                        <span className="logo-icon">🎫</span>
                        <h1>Support Ticket System</h1>
                    </div>
                    <p className="header-subtitle">AI-powered ticket classification &amp; management</p>
                </div>
            </header>

            <nav className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    📊 Dashboard
                </button>
                <button
                    className={`tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submit')}
                >
                    ➕ Submit Ticket
                </button>
                <button
                    className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tickets')}
                >
                    📋 All Tickets
                </button>
            </nav>

            <main className="app-main">
                {activeTab === 'dashboard' && (
                    <StatsDashboard refreshKey={refreshKey} />
                )}

                {activeTab === 'submit' && (
                    <TicketForm
                        onTicketCreated={() => {
                            handleTicketCreated();
                            setActiveTab('tickets');
                        }}
                    />
                )}

                {activeTab === 'tickets' && (
                    <TicketList refreshKey={refreshKey} onUpdate={handleTicketCreated} />
                )}
            </main>

            <footer className="app-footer">
                <p>Support Ticket System &mdash; Built with Django, React &amp; Google Gemini</p>
            </footer>
        </div>
    );
}

export default App;
