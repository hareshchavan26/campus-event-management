import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Registration page for students with password strength and matching validation
 */
const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const numberRegex = /\d/;

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Campus email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    } else if (!numberRegex.test(formData.password)) {
      newErrors.password = 'Password must include at least one numerical digit (0-9).';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
      const { confirmPassword, ...payload } = formData;
      const res = await api.post('/auth/register', payload);
      const { token, user } = res.data;
      
      // Automatically log the student in
      login(token, user);
      navigate('/events', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 my-auto">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div 
                    className="rounded-3 d-inline-flex align-items-center justify-content-center text-white mb-3 shadow-sm"
                    style={{ width: '48px', height: '48px', backgroundColor: '#4f46e5' }}
                  >
                    <i className="bi bi-person-plus-fill fs-4"></i>
                  </div>
                  <h3 className="fw-bold text-dark">Create Account</h3>
                  <p className="text-muted small">Join CampusPulse to RSVP and attend university events</p>
                </div>

                {serverError && (
                  <ErrorMessage message={serverError} dismissible onDismiss={() => setServerError(null)} />
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Full Name */}
                  <div className="mb-3">
                    <label htmlFor="reg-name" className="form-label">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="e.g., Alex Johnson"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="reg-email" className="form-label">
                      Campus Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="e.g., alex.johnson@campus.edu"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="reg-password" className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      id="reg-password"
                      name="password"
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="At least 8 characters with a number"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                      Must be at least 8 characters long and contain at least one digit.
                    </small>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label htmlFor="reg-confirm" className="form-label">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <input
                      id="reg-confirm"
                      name="confirmPassword"
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Re-type your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
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
                        Creating Account...
                      </>
                    ) : (
                      'Create Student Account'
                    )}
                  </button>

                  {/* Link to Login */}
                  <div className="text-center">
                    <p className="text-muted small mb-0">
                      Already registered?{' '}
                      <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                        Sign In here
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

export default Register;
