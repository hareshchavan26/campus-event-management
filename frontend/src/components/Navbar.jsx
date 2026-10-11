import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Top navigation bar with active route indicators, user profile info, and role-based items
 */
const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
      <div className="container">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 text-dark text-decoration-none">
          <div 
            className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm"
            style={{ width: '38px', height: '38px', backgroundColor: '#4f46e5' }}
          >
            <i className="bi bi-calendar2-check-fill fs-5"></i>
          </div>
          <span className="brand-font">Campus<span style={{ color: '#4f46e5' }}>Pulse</span></span>
        </Link>

        {/* Mobile menu toggler */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links & Auth state */}
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-1">
            <li className="nav-item">
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                <i className="bi bi-house-door me-1"></i> Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-calendar3 me-1"></i> Browse Events
              </NavLink>
            </li>
            
            {/* Student & general authenticated user link */}
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink to="/my-registrations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-ticket-perforated me-1"></i> My Registrations
                </NavLink>
              </li>
            )}

            {/* Admin-only navigation links */}
            {isAdmin && (
              <li className="nav-item">
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-speedometer2 me-1"></i> Admin Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex flex-column text-end d-none d-sm-block">
                  <span className="fw-semibold text-dark small">{user?.name}</span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-primary'} rounded-pill`}>
                      {isAdmin ? 'ADMIN' : 'STUDENT'}
                    </span>
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                  title="Logout"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm px-3">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm px-3">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
