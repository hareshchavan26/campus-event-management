import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import EventList from '../components/EventList';
import { useAuth } from '../context/AuthContext';

/**
 * Homepage with hero section, statistics, category shortcuts, and upcoming featured events
 */
const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, catRes] = await Promise.all([
        api.get('/events'),
        api.get('/categories')
      ]);
      // Show first 6 upcoming events
      setFeaturedEvents((eventsRes.data.events || []).slice(0, 6));
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load homepage data:', err);
      setError('Unable to load upcoming campus events. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient py-5 py-lg-6 text-white">
        <div className="container py-4">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="badge bg-white text-primary fw-semibold px-3 py-2 rounded-pill mb-3 shadow-sm">
                <i className="bi bi-stars me-1 text-warning"></i> Campus Event Management Platform
              </span>
              <h1 className="display-4 fw-extrabold mb-3" style={{ lineHeight: 1.15 }}>
                Discover, Connect &amp; Lead Campus Experiences
              </h1>
              <p className="lead text-light opacity-90 mb-4" style={{ maxWidth: '580px' }}>
                Browse cutting-edge tech hackathons, dynamic cultural festivals, sports tournaments, and professional workshops organized across our university campus.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/events" className="btn btn-light btn-lg text-primary fw-bold px-4 shadow">
                  <i className="bi bi-compass me-2"></i> Browse Events
                </Link>
                {isAuthenticated ? (
                  <Link to="/my-registrations" className="btn btn-outline-light btn-lg px-4">
                    <i className="bi bi-ticket-perforated me-2"></i> My Registered Events
                  </Link>
                ) : (
                  <Link to="/register" className="btn btn-outline-light btn-lg px-4">
                    <i className="bi bi-person-plus me-2"></i> Join as Student
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="col-lg-5">
              <div className="row g-3">
                <div className="col-6">
                  <div className="card bg-white bg-opacity-10 border-0 text-white p-3 p-xl-4 rounded-4 backdrop-blur shadow-sm">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3 bg-white bg-opacity-20 p-2.5">
                        <i className="bi bi-calendar-check fs-3"></i>
                      </div>
                      <div>
                        <h3 className="fw-bold mb-0">12+</h3>
                        <small className="text-light opacity-75">Active Events</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="card bg-white bg-opacity-10 border-0 text-white p-3 p-xl-4 rounded-4 backdrop-blur shadow-sm">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3 bg-white bg-opacity-20 p-2.5">
                        <i className="bi bi-tags fs-3"></i>
                      </div>
                      <div>
                        <h3 className="fw-bold mb-0">5</h3>
                        <small className="text-light opacity-75">Categories</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="card bg-white bg-opacity-10 border-0 text-white p-3 p-xl-4 rounded-4 backdrop-blur shadow-sm">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3 bg-white bg-opacity-20 p-2.5">
                        <i className="bi bi-lightning-charge fs-3"></i>
                      </div>
                      <div>
                        <h3 className="fw-bold mb-0">1-Click</h3>
                        <small className="text-light opacity-75">Instant RSVP</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="card bg-white bg-opacity-10 border-0 text-white p-3 p-xl-4 rounded-4 backdrop-blur shadow-sm">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3 bg-white bg-opacity-20 p-2.5">
                        <i className="bi bi-shield-check fs-3"></i>
                      </div>
                      <div>
                        <h3 className="fw-bold mb-0">100%</h3>
                        <small className="text-light opacity-75">Verified Clubs</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="py-4 bg-white border-bottom shadow-xs">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <span className="fw-bold text-dark small text-uppercase letter-spacing-1">
              <i className="bi bi-funnel me-1 text-primary"></i> Browse by Category:
            </span>
            <div className="d-flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/events?category=${encodeURIComponent(c.name)}`}
                  className="btn btn-sm btn-light border rounded-pill px-3 py-1.5 fw-medium text-dark hover-primary"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events */}
      <section className="py-5">
        <div className="container py-2">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
            <div>
              <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase px-2.5 py-1 rounded-pill mb-1">
                Upcoming Highlights
              </span>
              <h2 className="fw-bold text-dark mb-0">Featured Campus Events</h2>
            </div>
            <Link to="/events" className="btn btn-outline-primary fw-semibold d-inline-flex align-items-center gap-1">
              <span>View All Events</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <EventList
            events={featuredEvents}
            loading={loading}
            error={error}
            emptyMessage="No upcoming campus events currently scheduled."
            onRetry={fetchData}
          />
        </div>
      </section>

      {/* Student Callout / Features */}
      <section className="py-5 bg-white border-top">
        <div className="container py-3">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Why Students Love CampusPulse</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Built specifically for university clubs, societies, and students to coordinate registrations seamlessly.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 p-4 text-center rounded-4 shadow-sm bg-light">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '60px', height: '60px', backgroundColor: '#eef2ff', color: '#4f46e5' }}
                >
                  <i className="bi bi-bell-fill fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark">Real-Time Seat Availability</h5>
                <p className="text-muted small mb-0">
                  Track live seat quotas with automatic low-capacity indicators and full capacity locks to ensure fair access.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 p-4 text-center rounded-4 shadow-sm bg-light">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '60px', height: '60px', backgroundColor: '#dcfce7', color: '#16a34a' }}
                >
                  <i className="bi bi-ticket-detailed-fill fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark">Instant RSVP &amp; Cancellation</h5>
                <p className="text-muted small mb-0">
                  Register with a single click. Change of plans? Cancel your ticket instantly so peers on waitlists can attend.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 p-4 text-center rounded-4 shadow-sm bg-light">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '60px', height: '60px', backgroundColor: '#fef3c7', color: '#d97706' }}
                >
                  <i className="bi bi-shield-lock-fill fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark">Admin Event Control</h5>
                <p className="text-muted small mb-0">
                  Campus administrators get full visibility into attendees, seat counts, and intuitive management tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
