import React, { useState, useEffect, useCallback } from 'react';
import { getTickets, updateTicket } from '../api';
import FilterBar from './FilterBar';
import TicketCard from './TicketCard';

function TicketList({ refreshKey, onUpdate, adminMode }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        priority: '',
        status: '',
        search: '',
    });

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.category) params.category = filters.category;
            if (filters.priority) params.priority = filters.priority;
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;

            const res = await getTickets(params);
            setTickets(res.data.results || res.data);
        } catch (err) {
            console.error('Failed to fetch tickets', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets, refreshKey]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateTicket(id, { status: newStatus });
            fetchTickets();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to update ticket', err);
        }
    };

    return (
        <div className="ticket-list-section">
            <div className="card">
                <div className="card-header">
                    <h2>All Tickets</h2>
                    <p className="card-description">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found</p>
                </div>
            </div>

            <FilterBar filters={filters} setFilters={setFilters} />

            {loading ? (
                <div className="loading-state">
                    <span className="spinner large"></span>
                    <p>Loading tickets...</p>
                </div>
            ) : tickets.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">—</div>
                    <h3>No tickets found</h3>
                    <p>Try adjusting your filters or create a new ticket</p>
                </div>
            ) : (
                <div className="ticket-grid">
                    {tickets.map((ticket) => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            adminMode={adminMode}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default TicketList;
