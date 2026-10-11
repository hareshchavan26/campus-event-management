import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Format timestamp into human readable format: e.g. "Nov 14, 2026, 02:45 PM"
 */
const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Admin view of registered attendees for a specific event
 */
const AdminRegistrations = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/events/${id}/registrations`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load attendees:', err);
      setError(err.response?.data?.message || 'Unable to retrieve attendee list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [id]);

  if (loading) {
    return (
      <div className="py-5">
        <div className="container">
          <Loader message="Loading attendee registry..." />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-5">
        <div className="container">
          <ErrorMessage message={error || 'Event attendees not found.'} onRetry={fetchRegistrations} />
          <Link to="/admin" className="btn btn-outline-primary mt-3">
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { event, registrations } = data;

  const filteredRegistrations = registrations.filter(r => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
  });

  return (
    <div className="py-5">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/admin" className="text-decoration-none">Admin Dashboard</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Attendee Registry</li>
          </ol>
        </nav>

        {/* Event Header Banner */}
        <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
          <div className="card-body p-4 p-md-5 bg-white">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
              <div>
                <span className={`badge badge-category badge-${event.category_name} mb-2`}>
                  {event.category_name}
                </span>
                <h2 className="fw-bold text-dark mb-2">{event.title}</h2>
                <div className="d-flex flex-wrap gap-3 text-muted small">
                  <span><i className="bi bi-calendar3 me-1 text-primary"></i> {event.event_date}</span>
                  <span><i className="bi bi-clock me-1 text-primary"></i> {event.event_time}</span>
                  <span><i className="bi bi-geo-alt me-1 text-danger"></i> {event.venue}</span>
                </div>
              </div>

              {/* Stats badges */}
              <div className="d-flex gap-2">
                <div className="card bg-light border-0 p-3 text-center rounded-3">
                  <span className="small text-muted fw-semibold">Registered</span>
                  <h4 className="fw-bold text-primary mb-0">{event.registered_count}</h4>
                </div>
                <div className="card bg-light border-0 p-3 text-center rounded-3">
                  <span className="small text-muted fw-semibold">Capacity</span>
                  <h4 className="fw-bold text-dark mb-0">{event.capacity}</h4>
                </div>
                <div className="card bg-light border-0 p-3 text-center rounded-3">
                  <span className="small text-muted fw-semibold">Seats Left</span>
                  <h4 className={`fw-bold mb-0 ${event.seats_left <= 0 ? 'text-danger' : 'text-success'}`}>
                    {event.seats_left}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendees Table Card */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white border-bottom p-3 p-md-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
            <h5 className="fw-bold text-dark mb-0">Registered Students ({filteredRegistrations.length})</h5>
            
            <div className="d-flex align-items-center gap-2">
              <div className="input-group" style={{ maxWidth: '280px' }}>
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm border-start-0"
                  placeholder="Filter student name/email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Link to="/admin" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-arrow-left me-1"></i> Back
              </Link>
            </div>
          </div>

          {registrations.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon="bi-people"
                title="No registrations recorded"
                message="No students have registered for this event yet. Check back once students RSVP."
                actionText=""
              />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <p className="mb-0">No registered students match your search.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle custom-table mb-0">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '60px' }}>#</th>
                    <th scope="col">Student Name</th>
                    <th scope="col">Campus Email</th>
                    <th scope="col">Role</th>
                    <th scope="col">RSVP Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg, idx) => (
                    <tr key={reg.registration_id}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center bg-primary-subtle text-primary fw-bold"
                            style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
                          >
                            {reg.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="fw-semibold text-dark">{reg.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-secondary">{reg.email}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {reg.role}
                        </span>
                      </td>
                      <td>
                        <span className="small text-muted">{formatDateTime(reg.registered_at)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRegistrations;
