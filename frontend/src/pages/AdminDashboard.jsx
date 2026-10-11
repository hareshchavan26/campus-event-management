import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Format date string into human readable format: e.g. "Nov 14, 2026"
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Admin dashboard displaying full event management table and key stats
 */
const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search filter inside table
  const [tableSearch, setTableSearch] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/events');
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to load admin events:', err);
      setError('Unable to load events for administration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await api.delete(`/events/${deleteTarget.id}`);
      setEvents(prev => prev.filter(e => e.id !== deleteTarget.id));
      setStatusMessage(`Event "${deleteTarget.title}" deleted successfully.`);
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // Filtered events
  const filteredEvents = events.filter(e => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.category_name.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.organizer.toLowerCase().includes(q)
    );
  });

  // Calculate stats
  const totalCapacity = events.reduce((sum, e) => sum + Number(e.capacity || 0), 0);
  const totalRegistrations = events.reduce((sum, e) => sum + Number(e.registered_count || 0), 0);

  return (
    <div className="py-5">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <span className="badge bg-danger-subtle text-danger fw-bold text-uppercase px-2.5 py-1 rounded-pill mb-1">
              Admin Control Center
            </span>
            <h1 className="fw-bold text-dark mb-1">Campus Events Management</h1>
            <p className="text-muted mb-0">Create, modify, monitor attendance, and control university events.</p>
          </div>
          <Link to="/admin/events/new" className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm">
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create New Event</span>
          </Link>
        </div>

        {/* Status banner */}
        {statusMessage && (
          <div className="alert alert-success alert-dismissible fade show shadow-sm mb-4" role="alert">
            <i className="bi bi-check-circle-fill me-2 fs-5"></i>
            <span>{statusMessage}</span>
            <button type="button" className="btn-close" onClick={() => setStatusMessage(null)} aria-label="Close"></button>
          </div>
        )}

        {error && <ErrorMessage message={error} onRetry={fetchEvents} dismissible onDismiss={() => setError(null)} />}

        {/* Metrics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 p-3 bg-primary-subtle text-primary">
                  <i className="bi bi-calendar-event fs-3"></i>
                </div>
                <div>
                  <small className="text-muted text-uppercase fw-semibold">Total Events</small>
                  <h3 className="fw-bold text-dark mb-0">{events.length}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 p-3 bg-success-subtle text-success">
                  <i className="bi bi-people-fill fs-3"></i>
                </div>
                <div>
                  <small className="text-muted text-uppercase fw-semibold">Total Registrations</small>
                  <h3 className="fw-bold text-dark mb-0">{totalRegistrations}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-3 p-3 bg-warning-subtle text-warning">
                  <i className="bi bi-ticket-fill fs-3"></i>
                </div>
                <div>
                  <small className="text-muted text-uppercase fw-semibold">Total Seating Capacity</small>
                  <h3 className="fw-bold text-dark mb-0">{totalCapacity}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Table Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white border-bottom p-3 p-md-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
            <h5 className="fw-bold text-dark mb-0">All Scheduled Events ({filteredEvents.length})</h5>
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0"
                placeholder="Filter table..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-5 text-center">
              <Loader message="Loading events registry..." />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              <p className="mb-0">No events found matching your filter.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle custom-table mb-0">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '50px' }}>#</th>
                    <th scope="col">Event Title</th>
                    <th scope="col">Category</th>
                    <th scope="col">Date &amp; Venue</th>
                    <th scope="col" className="text-center">Capacity</th>
                    <th scope="col" className="text-center">Registrations</th>
                    <th scope="col" className="text-center">Seats Left</th>
                    <th scope="col" className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((e) => {
                    const isFull = e.seats_left <= 0;
                    const isLow = e.seats_left > 0 && e.seats_left < 10;
                    return (
                      <tr key={e.id}>
                        <td className="text-muted small">{e.id}</td>
                        <td>
                          <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '240px' }} title={e.title}>
                            <Link to={`/events/${e.id}`} className="text-dark text-decoration-none hover-primary">
                              {e.title}
                            </Link>
                          </div>
                          <small className="text-muted d-block text-truncate" style={{ maxWidth: '240px' }}>
                            By {e.organizer}
                          </small>
                        </td>
                        <td>
                          <span className={`badge badge-category badge-${e.category_name}`}>
                            {e.category_name}
                          </span>
                        </td>
                        <td>
                          <div className="small fw-semibold text-dark">{formatDate(e.event_date)}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: '180px' }}>
                            {e.venue}
                          </small>
                        </td>
                        <td className="text-center fw-semibold text-secondary">{e.capacity}</td>
                        <td className="text-center">
                          <Link
                            to={`/admin/events/${e.id}/registrations`}
                            className="badge bg-light text-primary text-decoration-none border px-2.5 py-1.5"
                            title="View registered students"
                          >
                            <i className="bi bi-people me-1"></i>
                            {e.registered_count}
                          </Link>
                        </td>
                        <td className="text-center">
                          {isFull ? (
                            <span className="badge badge-seats-full">Full</span>
                          ) : isLow ? (
                            <span className="badge badge-seats-low">{e.seats_left}</span>
                          ) : (
                            <span className="badge badge-seats-available">{e.seats_left}</span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            <Link
                              to={`/admin/events/${e.id}/registrations`}
                              className="btn btn-sm btn-outline-info"
                              title="View Attendees"
                            >
                              <i className="bi bi-people"></i>
                            </Link>
                            <Link
                              to={`/admin/events/${e.id}/edit`}
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Event"
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(e)}
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Event"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-danger">Confirm Event Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteTarget(null)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to permanently delete event <strong>"{deleteTarget.title}"</strong>?</p>
                <div className="alert alert-warning small mb-0">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  All {deleteTarget.registered_count} existing attendee registrations will be permanently deleted.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
