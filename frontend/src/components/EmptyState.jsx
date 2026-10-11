import { Link } from 'react-router-dom';

/**
 * EmptyState component displayed when no events or data match current filters
 */
const EmptyState = ({
  icon = 'bi-calendar-x',
  title = 'No events found',
  message = 'Try modifying your search keywords or removing selected category filters.',
  actionText = 'View All Events',
  actionLink = '/events',
  onActionClick
}) => {
  return (
    <div className="card text-center p-5 my-4 border-dashed bg-white shadow-sm">
      <div className="card-body py-4">
        <div 
          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: '70px', height: '70px', backgroundColor: '#eef2ff', color: '#4f46e5' }}
        >
          <i className={`bi ${icon} fs-1`}></i>
        </div>
        <h4 className="card-title fw-bold text-dark">{title}</h4>
        <p className="card-text text-muted mx-auto" style={{ maxWidth: '420px' }}>
          {message}
        </p>
        {(actionText && (actionLink || onActionClick)) && (
          <div className="mt-3">
            {actionLink ? (
              <Link to={actionLink} className="btn btn-primary px-4">
                {actionText}
              </Link>
            ) : (
              <button onClick={onActionClick} className="btn btn-primary px-4">
                {actionText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
