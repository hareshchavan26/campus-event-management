import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Format date string into human readable format: e.g. "Saturday, November 14, 2026"
 */
const formatLongDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
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
 * Detailed view for an event with seat metrics and RSVP registration controls
 */
const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Modal / Confirm state for cancellation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.event);
    } catch (err) {
      console.error('Failed to load event details:', err);
      setError(err.response?.data?.message || 'Unable to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id, isAuthenticated]);

  // Handle student registration
  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setActionLoading(true);
    setActionMessage(null);
    setActionError(null);

    try {
      const res = await api.post(`/events/${id}/register`);
      setActionMessage(res.data.message || 'Successfully registered for this event!');
      // Update local event registration state
      setEvent(prev => ({
        ...prev,
        is_registered: true,
        registered_count: prev.registered_count + 1,
        seats_left: Math.max(0, prev.seats_left - 1)
      }));
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle student registration cancellation
  const handleCancelRegistration = async () => {
    setActionLoading(true);
    setActionMessage(null);
    setActionError(null);

    try {
      const res = await api.get(`/events/${id}`); // re-sync
      await api.delete(`/events/${id}/register`);
      setShowCancelModal(false);
      setActionMessage('Your registration has been cancelled successfully.');
      setEvent(prev => ({
        ...prev,
        is_registered: false,
        registered_count: Math.max(0, prev.registered_count - 1),
        seats_left: prev.seats_left + 1
      }));
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle admin deleting event
  const handleDeleteEvent = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/events/${id}`);
      setShowDeleteModal(false);
      navigate('/admin');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete event.');
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading event details..." />;
  }

  if (error || !event) {
    return (
      <div className="container py-5">
        <ErrorMessage message={error || 'Event not found.'} onRetry={fetchEvent} />
        <Link to="/events" className="btn btn-primary mt-3">
          <i className="bi bi-arrow-left me-1"></i> Back to All Events
        </Link>
      </div>
    );
  }

  const seatsLeft = event.seats_left;
  const isFull = seatsLeft <= 0;
  const isLowSeats = seatsLeft > 0 && seatsLeft < 10;
  const percentFilled = Math.min(100, Math.round((event.registered_count / event.capacity) * 100));

  return (
    <div className="py-5">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/events" className="text-decoration-none">Events</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{event.title}</li>
          </ol>
        </nav>

        {/* Action feedback banners */}
        {actionMessage && (
          <div className="alert alert-success alert-dismissible fade show shadow-sm mb-4" role="alert">
            <i className="bi bi-check-circle-fill me-2 fs-5"></i>
            <span>{actionMessage}</span>
            <button type="button" className="btn-close" onClick={() => setActionMessage(null)} aria-label="Close"></button>
          </div>
        )}

        {actionError && (
          <div className="alert alert-danger alert-dismissible fade show shadow-sm mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
            <span>{actionError}</span>
            <button type="button" className="btn-close" onClick={() => setActionError(null)} aria-label="Close"></button>
          </div>
        )}

        <div className="row g-4">
          {/* Left Column: Event Media & Overview */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 mb-4 overflow-hidden">
              {/* Event Cover Image */}
              <div style={{ height: '360px', backgroundColor: '#e2e8f0', position: 'relative' }}>
                <img
                  src={event.image_url || `https://picsum.photos/seed/${event.id}/600/400`}
                  alt={event.title}
                  className="w-100 h-100 object-fit-cover"
                />
                <div className="position-absolute top-0 start-0 m-3">
                  <span className={`badge badge-category badge-${event.category_name} shadow py-2 px-3 fs-6`}>
                    {event.category_name}
                  </span>
                </div>
              </div>

              {/* Event Body */}
              <div className="card-body p-4 p-md-5">
                <h1 className="fw-bold text-dark mb-3" style={{ lineHeight: '1.2' }}>{event.title}</h1>

                {/* Organizer badge */}
                <div className="d-flex align-items-center text-muted small mb-4 pb-3 border-bottom">
                  <span className="me-2">Hosted by:</span>
                  <strong className="text-dark me-3">{event.organizer}</strong>
                </div>

                {/* Description */}
                <h5 className="fw-bold text-dark mb-3">About This Event</h5>
                <p className="text-secondary fs-6" style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }}>
                  {event.description}
                </p>

                {/* Important Notes */}
                <div className="card bg-light border-0 p-4 mt-4 rounded-3">
                  <h6 className="fw-bold text-dark mb-2">
                    <i className="bi bi-info-circle-fill text-primary me-2"></i> Attendance Guidelines
                  </h6>
                  <ul className="text-muted small mb-0 ps-3">
                    <li>Please arrive at the venue 10 minutes prior to scheduled start time.</li>
                    <li>Bring your valid student identification card for check-in verification.</li>
                    <li>If you cannot attend, please cancel your RSVP to release seats to peers.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: RSVP Actions & Event Details Sidebar */}
          <div className="col-lg-4">
            {/* Action / RSVP Card */}
            <div className="card shadow-sm border-0 mb-4 sticky-top" style={{ top: '90px' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold text-dark mb-3">Registration Status</h5>

                {/* Capacity & Seats Left Indicator */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-muted fw-semibold">Capacity Fill</span>
                    <span className="small fw-bold text-dark">{event.registered_count} / {event.capacity} seats filled</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar ${isFull ? 'bg-danger' : isLowSeats ? 'bg-warning' : 'bg-primary'}`}
                      role="progressbar"
                      style={{ width: `${percentFilled}%` }}
                      aria-valuenow={percentFilled}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>

                  <div className="mt-2 text-center">
                    {isFull ? (
                      <span className="badge badge-seats-full py-2 px-3 w-100 fs-6">
                        <i className="bi bi-x-circle me-1"></i> Full - No Seats Left
                      </span>
                    ) : isLowSeats ? (
                      <span className="badge badge-seats-low py-2 px-3 w-100 fs-6">
                        <i className="bi bi-fire me-1"></i> Only {seatsLeft} Seats Remaining!
                      </span>
                    ) : (
                      <span className="badge badge-seats-available py-2 px-3 w-100 fs-6">
                        <i className="bi bi-check-circle me-1"></i> {seatsLeft} Seats Available
                      </span>
                    )}
                  </div>
                </div>

                {/* RSVP Status / Actions */}
                <div className="mb-4">
                  {event.is_registered ? (
                    <div className="card bg-success-subtle border-success p-3 text-center mb-3">
                      <div className="text-success fw-bold fs-6 mb-1">
                        <i className="bi bi-check-circle-fill me-1"></i> RSVP Confirmed!
                      </div>
                      <small className="text-success-emphasis mb-3">
                        You are registered for this event.
                      </small>
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="btn btn-outline-danger btn-sm"
                        disabled={actionLoading}
                      >
                        <i className="bi bi-x-circle me-1"></i> Cancel Registration
                      </button>
                    </div>
                  ) : isFull ? (
                    <button className="btn btn-secondary w-100 py-2 fw-semibold" disabled>
                      <i className="bi bi-slash-circle me-1"></i> Registration Full
                    </button>
                  ) : !isAuthenticated ? (
                    <Link
                      to="/login"
                      state={{ from: location }}
                      className="btn btn-primary w-100 py-2.5 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-box-arrow-in-right"></i>
                      <span>Log in to Register</span>
                    </Link>
                  ) : (
                    <button
                      onClick={handleRegister}
                      className="btn btn-primary w-100 py-2.5 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-ticket-perforated-fill"></i>
                          <span>Register for Event</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <hr />

                {/* Event Metadata List */}
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-3 bg-light p-2 text-primary flex-shrink-0">
                      <i className="bi bi-calendar3 fs-5"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Date</small>
                      <span className="fw-semibold text-dark">{formatLongDate(event.event_date)}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-3 bg-light p-2 text-primary flex-shrink-0">
                      <i className="bi bi-clock fs-5"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Time</small>
                      <span className="fw-semibold text-dark">{formatTime(event.event_time)}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-3 bg-light p-2 text-danger flex-shrink-0">
                      <i className="bi bi-geo-alt fs-5"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Venue</small>
                      <span className="fw-semibold text-dark">{event.venue}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-3 bg-light p-2 text-info flex-shrink-0">
                      <i className="bi bi-people fs-5"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Organizer</small>
                      <span className="fw-semibold text-dark">{event.organizer}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Management Section */}
                {isAdmin && (
                  <div className="mt-4 pt-3 border-top">
                    <small className="text-uppercase fw-bold text-muted d-block mb-2">
                      <i className="bi bi-shield-lock me-1"></i> Admin Controls
                    </small>
                    <div className="d-flex flex-column gap-2">
                      <Link
                        to={`/admin/events/${event.id}/registrations`}
                        className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-between"
                      >
                        <span><i className="bi bi-people me-1"></i> View Registered Attendees</span>
                        <span className="badge bg-primary rounded-pill">{event.registered_count}</span>
                      </Link>
                      <Link
                        to={`/admin/events/${event.id}/edit`}
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      >
                        <i className="bi bi-pencil me-1"></i> Edit Event Details
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                      >
                        <i className="bi bi-trash me-1"></i> Delete Event
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Cancel Registration */}
      {showCancelModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Confirm Registration Cancellation</h5>
                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel your RSVP for <strong>{event.title}</strong>?</p>
                <p className="text-muted small mb-0">Your seat will be released back to other students immediately.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowCancelModal(false)}>
                  Keep Reservation
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleCancelRegistration}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Cancelling...' : 'Yes, Cancel RSVP'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Event (Admin) */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-danger">Delete Campus Event</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to permanently delete <strong>{event.title}</strong>?</p>
                <p className="text-danger small mb-0">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  This will also cancel and remove all {event.registered_count} attendee registrations. This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteEvent}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
