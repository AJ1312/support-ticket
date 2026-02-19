import React, { useState, useEffect } from 'react';
import { getStats } from '../api';

function StatsDashboard({ refreshKey }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await getStats();
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [refreshKey]);

    if (loading) {
        return (
            <div className="loading-state">
                <span className="spinner large"></span>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="empty-state">
                <p>Unable to load stats.</p>
            </div>
        );
    }

    return (
        <div className="stats-dashboard">
            <div className="card">
                <div className="card-header">
                    <h2>Dashboard</h2>
                    <p className="card-description">Real-time ticket analytics</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-kpi-row">
                <div className="kpi-card kpi-total">
                    <div className="kpi-value">{stats.total_tickets}</div>
                    <div className="kpi-label">Total Tickets</div>
                </div>
                <div className="kpi-card kpi-open">
                    <div className="kpi-value">{stats.open_tickets}</div>
                    <div className="kpi-label">Open Tickets</div>
                </div>
                <div className="kpi-card kpi-avg">
                    <div className="kpi-value">{stats.avg_tickets_per_day}</div>
                    <div className="kpi-label">Avg / Day</div>
                </div>
            </div>

            {/* Breakdowns */}
            <div className="stats-breakdown-row">
                <div className="breakdown-card">
                    <h3>Priority Breakdown</h3>
                    <div className="breakdown-bars">
                        {Object.entries(stats.priority_breakdown).map(([key, val]) => (
                            <div key={key} className="breakdown-item">
                                <div className="breakdown-label">
                                    <span className={`dot priority-dot-${key}`}></span>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </div>
                                <div className="breakdown-bar-wrapper">
                                    <div
                                        className={`breakdown-bar bar-${key}`}
                                        style={{
                                            width: stats.total_tickets > 0
                                                ? `${Math.max((val / stats.total_tickets) * 100, 2)}%`
                                                : '2%',
                                        }}
                                    ></div>
                                </div>
                                <span className="breakdown-count">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="breakdown-card">
                    <h3>Category Breakdown</h3>
                    <div className="breakdown-bars">
                        {Object.entries(stats.category_breakdown).map(([key, val]) => (
                            <div key={key} className="breakdown-item">
                                <div className="breakdown-label">
                                    <span className={`dot category-dot-${key}`}></span>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </div>
                                <div className="breakdown-bar-wrapper">
                                    <div
                                        className={`breakdown-bar bar-cat-${key}`}
                                        style={{
                                            width: stats.total_tickets > 0
                                                ? `${Math.max((val / stats.total_tickets) * 100, 2)}%`
                                                : '2%',
                                        }}
                                    ></div>
                                </div>
                                <span className="breakdown-count">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatsDashboard;
