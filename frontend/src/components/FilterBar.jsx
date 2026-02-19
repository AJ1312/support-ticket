import React from 'react';

const CATEGORIES = ['', 'billing', 'technical', 'account', 'general'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'critical'];
const STATUSES = ['', 'open', 'in_progress', 'resolved', 'closed'];

function FilterBar({ filters, setFilters }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ category: '', priority: '', status: '', search: '' });
    };

    const hasFilters = filters.category || filters.priority || filters.status || filters.search;

    return (
        <div className="filter-bar">
            <div className="filter-row">
                <div className="filter-group">
                    <label>Search</label>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="Search by title or description..."
                    />
                </div>

                <div className="filter-group">
                    <label>Category</label>
                    <select name="category" value={filters.category} onChange={handleChange}>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All'}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Priority</label>
                    <select name="priority" value={filters.priority} onChange={handleChange}>
                        {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                                {p ? p.charAt(0).toUpperCase() + p.slice(1) : 'All'}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Status</label>
                    <select name="status" value={filters.status} onChange={handleChange}>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s ? s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'All'}
                            </option>
                        ))}
                    </select>
                </div>

                {hasFilters && (
                    <button className="btn btn-sm btn-ghost clear-btn" onClick={clearFilters}>
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}

export default FilterBar;
