import { Link } from 'react-router-dom';

/**
 * Modern footer component with quick links and university portal branding
 */
const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto py-5 text-secondary">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center text-white"
                style={{ width: '32px', height: '32px', backgroundColor: '#4f46e5' }}
              >
                <i className="bi bi-calendar2-check-fill fs-6"></i>
              </div>
              <span className="fw-bold fs-5 text-dark brand-font">Campus<span style={{ color: '#4f46e5' }}>Pulse</span></span>
            </div>
            <p className="text-muted small pe-lg-4">
              The official centralized platform for university students and administrators to discover, organize, register, and celebrate campus events and workshops.
            </p>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-dark small text-uppercase mb-3">Explore</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
              <li><Link to="/events" className="text-muted text-decoration-none">All Events</Link></li>
              <li><Link to="/events?category=Technical" className="text-muted text-decoration-none">Tech & Coding</Link></li>
              <li><Link to="/events?category=Cultural" className="text-muted text-decoration-none">Cultural Fests</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-dark small text-uppercase mb-3">Students</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/my-registrations" className="text-muted text-decoration-none">My Registrations</Link></li>
              <li><Link to="/register" className="text-muted text-decoration-none">Create Account</Link></li>
              <li><Link to="/login" className="text-muted text-decoration-none">Student Portal</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold text-dark small text-uppercase mb-3">Campus Info</h6>
            <p className="text-muted small mb-2">
              <i className="bi bi-geo-alt me-2 text-primary"></i>University Student Activity Center, Main Campus
            </p>
            <p className="text-muted small mb-0">
              <i className="bi bi-envelope me-2 text-primary"></i>events-support@campus.edu
            </p>
          </div>
        </div>

        <div className="border-top mt-4 pt-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <small className="text-muted">
            &copy; {new Date().getFullYear()} CampusPulse Event Management System. All rights reserved.
          </small>
          <div className="d-flex gap-3 small text-muted">
            <span>Production Build</span>
            <span>•</span>
            <span>MySQL 8 + Express + React</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
