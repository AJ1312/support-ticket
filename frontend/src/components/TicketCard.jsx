import React, { useState } from 'react';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

const STATUS_LABELS = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
};

const PRIORITY_COLORS = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    critical: 'priority-critical',
};

function TicketCard({ ticket, onStatusChange, adminMode }) {
    const [editing, setEditing] = useState(false);

    const truncate = (text, maxLen = 120) =>
        text.length > maxLen ? text.substring(0, maxLen) + '...' : text;

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`ticket-card ${PRIORITY_COLORS[ticket.priority]}`}>
            <div className="ticket-card-header">
                <span className="ticket-id">#{ticket.id}</span>
                <span className={`status-badge status-${ticket.status}`}>
                    {STATUS_LABELS[ticket.status] || ticket.status.replace('_', ' ')}
                </span>
            </div>

            <h3 className="ticket-title">{ticket.title}</h3>
            <p className="ticket-desc">{truncate(ticket.description)}</p>

            <div className="ticket-meta">
                <span className="meta-tag category-tag">
                    {ticket.category}
                </span>
                <span className={`meta-tag priority-tag ${PRIORITY_COLORS[ticket.priority]}`}>
                    {ticket.priority}
                </span>
                <span className="meta-tag date-tag">
                    {formatDate(ticket.created_at)}
                </span>
            </div>

            {ticket.ai_response && (
                <div className="ai-response-box">
                    <strong>AI Response:</strong> {ticket.ai_response}
                </div>
            )}

            {adminMode && (
                <div className="ticket-actions">
                    {!editing ? (
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setEditing(true)}
                        >
                            Change Status
                        </button>
                    ) : (
                        <div className="status-change">
                            {STATUSES.map((s) => (
                                <button
                                    key={s}
                                    className={`btn btn-sm ${ticket.status === s ? 'btn-active' : 'btn-outline'}`}
                                    onClick={() => {
                                        if (s !== ticket.status) onStatusChange(ticket.id, s);
                                        setEditing(false);
                                    }}
                                    disabled={ticket.status === s}
                                >
                                    {STATUS_LABELS[s]}
                                </button>
                            ))}
                            <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TicketCard;
