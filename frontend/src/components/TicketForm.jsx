import React, { useState, useRef } from 'react';
import { createTicket, classifyTicket } from '../api';

const CATEGORIES = ['billing', 'technical', 'account', 'general'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

function TicketForm({ onTicketCreated }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium',
    });
    const [classifying, setClassifying] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiSuggested, setAiSuggested] = useState(false);
    const debounceRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');

        // Auto-classify when description changes (debounced)
        if (name === 'description' && value.trim().length > 20) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                handleClassify(value);
            }, 800);
        }
    };

    const handleClassify = async (description) => {
        if (!description || description.trim().length < 10) return;
        setClassifying(true);
        setAiSuggested(false);
        try {
            const res = await classifyTicket(description);
            setForm((prev) => ({
                ...prev,
                category: res.data.suggested_category || prev.category,
                priority: res.data.suggested_priority || prev.priority,
            }));
            setAiSuggested(true);
        } catch (err) {
            console.warn('LLM classification failed — using defaults', err);
        } finally {
            setClassifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) {
            setError('Title and Description are required.');
            return;
        }
        setSubmitting(true);
        setError('');
        setAiResponse('');
        try {
            const res = await createTicket(form);
            const responseMsg = res.data.ai_response || 'Thank you for reaching out. Our admin team will review your ticket shortly.';
            setAiResponse(responseMsg);
            setSuccess('Ticket created successfully!');
            setForm({ title: '', description: '', category: 'general', priority: 'medium' });
            setAiSuggested(false);
            if (onTicketCreated) onTicketCreated();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create ticket. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card ticket-form-card">
            <div className="card-header">
                <h2>Submit a New Ticket</h2>
                <p className="card-description">Describe your issue and our AI will suggest a category and priority</p>
            </div>
            <form onSubmit={handleSubmit} className="ticket-form">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {aiResponse && (
                    <div className="ai-response-banner">
                        <strong>AI Response:</strong> {aiResponse}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="title">Title <span className="required">*</span></label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        maxLength={200}
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Brief summary of the issue"
                        required
                    />
                    <span className="char-count">{form.title.length}/200</span>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description <span className="required">*</span></label>
                    <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe your problem in detail. The AI will analyze this to suggest category and priority..."
                        rows={5}
                        required
                    />
                </div>

                {classifying && (
                    <div className="ai-loading">
                        <span className="spinner"></span>
                        <span>AI is analyzing your description...</span>
                    </div>
                )}

                {aiSuggested && !classifying && (
                    <div className="ai-suggested">
                        AI suggested category and priority below — feel free to override
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="category">
                            Category
                            {aiSuggested && <span className="ai-badge">AI</span>}
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c.charAt(0).toUpperCase() + c.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">
                            Priority
                            {aiSuggested && <span className="ai-badge">AI</span>}
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                        >
                            {PRIORITIES.map((p) => (
                                <option key={p} value={p}>
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting || classifying}>
                    {submitting ? (
                        <>
                            <span className="spinner"></span> Submitting...
                        </>
                    ) : (
                        'Submit Ticket'
                    )}
                </button>
            </form>
        </div>
    );
}

export default TicketForm;
