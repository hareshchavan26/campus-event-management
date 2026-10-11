import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Format date string into human readable format: e.g. "Sat, Nov 14, 2026"
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format 24-hr time to 12-hr format: e.g. "09:00:00" -> "9:00 AM"
 */
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hour, minute] = timeStr.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${minute} ${ampm}`;
};

/**
 * Page displaying all campus events the logged-in student has registered for
 */
const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/my-registrations');
      setRegistrations(res.data.registrations || []);
    } catch (err) {
      console.error('Failed to load user registrations:', err);
      setError('Unable to load your registered events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;

    setCancelling(true);
    try {
      await api.delete(`/events/${cancelTarget.event_id}/register`);
      setRegistrations(prev => prev.filter(r => r.registration_id !== cancelTarget.registration_id));
      setFeedbackMessage(`Your registration for "${cancelTarget.title}" has been successfully cancelled.`);
      setCancelTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration.');
      setCancelTarget(null);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        {/* Header */}
        <div className="mb-4">
          <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase px-2.5 py-1 rounded-pill mb-1">
            Student Portal
          </span>
          <h1 className="fw-bold text-dark mb-1">My Registered Events</h1>
          <p className="text-muted">
            Manage your upcoming event tickets, schedules, and active reservations.
          </p>
        </div>

        {/* Feedback Banner */}
        {feedbackMessage && (
          <div className="alert alert-success alert-dismissible fade show shadow-sm mb-4" role="alert">
            <i className="bi bi-check-circle-fill me-2 fs-5"></i>
            <span>{feedbackMessage}</span>
            <button type="button" className="btn-close" onClick={() => setFeedbackMessage(null)} aria-label="Close"></button>
          </div>
        )}

        {error && <ErrorMessage message={error} onRetry={fetchRegistrations} dismissible onDismiss={() => setError(null)} />}

        {loading ? (
          <Loader message="Loading your tickets..." />
        ) : registrations.length === 0 ? (
          <EmptyState
            icon="bi-ticket"
            title="No event registrations yet"
            message="You haven't reserved seats for any upcoming campus events. Browse the events schedule to RSVP!"
            actionText="Browse Upcoming Events"
            actionLink="/events"
          />
        ) : (
          <div className="row g-4">
            {registrations.map((reg) => (
              <div className="col-lg-6" key={reg.registration_id}>
                <div className="card shadow-sm border-0 h-100 overflow-hidden card-hover">
                  <div className="row g-0 h-100">
                    {/* Event thumbnail */}
                    <div className="col-sm-4 bg-light position-relative" style={{ minHeight: '160px' }}>
                      <img
                        src={reg.image_url || `https://picsum.photos/seed/${reg.event_id}/600/400`}
                        alt={reg.title}
                        className="w-100 h-100 object-fit-cover"
                        loading="lazy"
                      />
                      <div className="position-absolute top-0 start-0 m-2">
                        <span className={`badge badge-category badge-${reg.category_name} shadow-sm`}>
                          {reg.category_name}
                        </span>
                      </div>
                    </div>

                    {/* Event info */}
                    <div className="col-sm-8 d-flex flex-column p-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-success-subtle text-success fw-bold">
                          <i className="bi bi-check-circle me-1"></i> RSVP Confirmed
                        </span>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Registered {new Date(reg.registered_at).toLocaleDateString()}
                        </small>
                      </div>

                      <h5 className="fw-bold text-dark mb-2">
                        <Link to={`/events/${reg.event_id}`} className="text-dark text-decoration-none hover-primary">
                          {reg.title}
                        </Link>
                      </h5>

                      <div className="text-secondary small mb-1">
                        <i className="bi bi-calendar-event me-2 text-primary"></i>
                        <span>{formatDate(reg.event_date)} at {formatTime(reg.event_time)}</span>
                      </div>

                      <div className="text-secondary small mb-3 text-truncate">
                        <i className="bi bi-geo-alt me-2 text-danger"></i>
                        <span>{reg.venue}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="d-flex align-items-center gap-2 mt-auto pt-3 border-top">
                        <Link
                          to={`/events/${reg.event_id}`}
                          className="btn btn-outline-primary btn-sm flex-fill"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => setCancelTarget(reg)}
                          className="btn btn-outline-danger btn-sm"
                          title="Cancel Registration"
                        >
                          <i className="bi bi-x-circle me-1"></i> Cancel RSVP
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Cancellation */}
      {cancelTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-danger">Cancel Event RSVP</h5>
                <button type="button" className="btn-close" onClick={() => setCancelTarget(null)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel your registration for <strong>{cancelTarget.title}</strong>?</p>
                <p className="text-muted small mb-0">Your seat will be immediately made available to other students.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setCancelTarget(null)}>
                  Keep RSVP
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
