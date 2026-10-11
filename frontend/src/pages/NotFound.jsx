import { Link } from 'react-router-dom';

/**
 * 404 Not Found fallback page
 */
const NotFound = () => {
  return (
    <div className="py-5 my-auto text-center">
      <div className="container py-5">
        <div 
          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-sm"
          style={{ width: '90px', height: '90px', backgroundColor: '#eef2ff', color: '#4f46e5' }}
        >
          <i className="bi bi-compass fs-1"></i>
        </div>
        <h1 className="display-4 fw-bold text-dark mb-2">404 - Page Not Found</h1>
        <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: '480px' }}>
          The campus event or page you are looking for doesn't exist, has been removed, or has moved to a new URL.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/" className="btn btn-primary px-4 py-2">
            <i className="bi bi-house-door me-2"></i> Return to Homepage
          </Link>
          <Link to="/events" className="btn btn-outline-secondary px-4 py-2">
            <i className="bi bi-calendar3 me-2"></i> Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
