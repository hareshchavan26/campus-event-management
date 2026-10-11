import { Link } from 'react-router-dom';

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
 * Event card component for event discovery grid
 */
const EventCard = ({ event }) => {
  const seatsLeft = event.seats_left !== undefined ? event.seats_left : (event.capacity - (event.registered_count || 0));
  const isFull = seatsLeft <= 0;
  const isLowSeats = seatsLeft > 0 && seatsLeft < 10;

  // Stable image fallback
  const imageUrl = event.image_url || `https://picsum.photos/seed/${event.id}/600/400`;

  return (
    <div className="card h-100 card-hover shadow-sm border-0 position-relative">
      {/* Event Image & Badges */}
      <div className="position-relative overflow-hidden" style={{ height: '200px', backgroundColor: '#e2e8f0' }}>
        <img
          src={imageUrl}
          alt={event.title}
          className="w-100 h-100 object-fit-cover"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://picsum.photos/seed/default-${event.id}/600/400`;
          }}
        />
        
        {/* Category Badge */}
        <div className="position-absolute top-0 start-0 m-3">
          <span className={`badge badge-category badge-${event.category_name || 'Technical'} shadow-sm`}>
            {event.category_name || 'Event'}
          </span>
        </div>

        {/* Capacity / Seats Badge */}
        <div className="position-absolute top-0 end-0 m-3">
          {isFull ? (
            <span className="badge badge-seats-full shadow-sm py-2 px-2.5">
              <i className="bi bi-x-circle me-1"></i> Full
            </span>
          ) : isLowSeats ? (
            <span className="badge badge-seats-low shadow-sm py-2 px-2.5">
              <i className="bi bi-fire me-1"></i> Only {seatsLeft} Left!
            </span>
          ) : (
            <span className="badge badge-seats-available shadow-sm py-2 px-2.5">
              <i className="bi bi-check-circle me-1"></i> {seatsLeft} Seats Left
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body d-flex flex-column p-4">
        {/* Date and Time */}
        <div className="d-flex align-items-center text-primary fw-semibold small mb-2 gap-2">
          <i className="bi bi-calendar-event"></i>
          <span>{formatDate(event.event_date)}</span>
          <span>•</span>
          <i className="bi bi-clock"></i>
          <span>{formatTime(event.event_time)}</span>
        </div>

        {/* Title */}
        <h5 className="card-title fw-bold text-dark mb-2 text-truncate-2" title={event.title} style={{ lineHeight: '1.3' }}>
          <Link to={`/events/${event.id}`} className="text-dark text-decoration-none hover-primary">
            {event.title}
          </Link>
        </h5>

        {/* Description Snippet */}
        <p className="card-text text-muted small mb-3 flex-grow-1" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {event.description}
        </p>

        {/* Venue and Organizer */}
        <div className="border-top pt-3 mt-auto">
          <div className="d-flex align-items-center text-secondary small mb-1 text-truncate">
            <i className="bi bi-geo-alt me-2 text-danger flex-shrink-0"></i>
            <span className="text-truncate">{event.venue}</span>
          </div>
          <div className="d-flex align-items-center text-secondary small text-truncate">
            <i className="bi bi-person-badge me-2 text-primary flex-shrink-0"></i>
            <span className="text-truncate">{event.organizer}</span>
          </div>
        </div>
      </div>

      {/* Card Footer / Action */}
      <div className="card-footer bg-white border-0 pt-0 pb-4 px-4">
        <Link
          to={`/events/${event.id}`}
          className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <span>View Event Details</span>
          <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
