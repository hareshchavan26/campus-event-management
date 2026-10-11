import EventCard from './EventCard';
import Loader from './Loader';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';

/**
 * Renders a responsive grid of event cards with loading, error, and empty state handlers
 */
const EventList = ({
  events = [],
  loading = false,
  error = null,
  emptyMessage = 'No campus events match your current criteria.',
  onRetry
}) => {
  if (loading) {
    return <Loader message="Fetching campus events..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState
        title="No events found"
        message={emptyMessage}
        actionText="Clear Filters"
        actionLink="/events"
      />
    );
  }

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {events.map((event) => (
        <div className="col" key={event.id}>
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
};

export default EventList;
