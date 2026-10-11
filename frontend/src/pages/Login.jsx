import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Login page with client-side validation and 1-click demo login helpers
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      const { token, user } = res.data;
      login(token, user);

      // Redirect to previous route or default based on role
      const destination = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/events');
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to autofill demo credentials
  const fillCredentials = (email, password) => {
    setFormData({ email, password });
    setErrors({});
    setServerError(null);
  };

  return (
    <div className="py-5 my-auto">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div 
                    className="rounded-3 d-inline-flex align-items-center justify-content-center text-white mb-3 shadow-sm"
                    style={{ width: '48px', height: '48px', backgroundColor: '#4f46e5' }}
                  >
                    <i className="bi bi-person-lock fs-4"></i>
                  </div>
                  <h3 className="fw-bold text-dark">Welcome Back</h3>
                  <p className="text-muted small">Sign in to your CampusPulse account</p>
                </div>

                {serverError && (
                  <ErrorMessage message={serverError} dismissible onDismiss={() => setServerError(null)} />
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="login-email" className="form-label">
                      Campus Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="student1@campus.edu"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label htmlFor="login-password" className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <i className="bi bi-key"></i>
                      </span>
                      <input
                        id="login-password"
                        name="password"
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2.5 fw-bold shadow-sm mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  {/* Demo Credentials Quick Fill Box */}
                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="fw-bold text-dark">
                        <i className="bi bi-magic me-1 text-primary"></i> Quick Demo Login:
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => fillCredentials('student1@campus.edu', 'Student@123')}
                      >
                        Student Demo
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger flex-fill"
                        onClick={() => fillCredentials('admin@campus.edu', 'Admin@123')}
                      >
                        Admin Demo
                      </button>
                    </div>
                  </div>

                  {/* Link to Register */}
                  <div className="text-center">
                    <p className="text-muted small mb-0">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                        Register here
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
