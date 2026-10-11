import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ErrorMessage from './ErrorMessage';

/**
 * Reusable event form for creating and updating campus events
 */
const EventForm = ({ initialData = null, isEdit = false, eventId = null }) => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    venue: '',
    event_date: '',
    event_time: '10:00',
    capacity: 50,
    image_url: '',
    organizer: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Populate data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category_id: initialData.category_id || '',
        venue: initialData.venue || '',
        event_date: initialData.event_date ? initialData.event_date.split('T')[0] : '',
        event_time: initialData.event_time ? initialData.event_time.substring(0, 5) : '10:00',
        capacity: initialData.capacity || 50,
        image_url: initialData.image_url || '',
        organizer: initialData.organizer || ''
      });
    }
  }, [initialData]);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    } else if (formData.title.trim().length > 150) {
      newErrors.title = 'Title cannot exceed 150 characters.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long.';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category.';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue location is required.';
    }

    if (!formData.event_date) {
      newErrors.event_date = 'Event date is required.';
    } else if (formData.event_date < today) {
      newErrors.event_date = 'Event date cannot be in the past.';
    }

    if (!formData.event_time) {
      newErrors.event_time = 'Event time is required.';
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Capacity must be a positive integer greater than 0.';
    }

    if (!formData.organizer.trim()) {
      newErrors.organizer = 'Organizer name or club is required.';
    }

    if (formData.image_url && formData.image_url.trim()) {
      try {
        new URL(formData.image_url.trim());
      } catch {
        newErrors.image_url = 'Please enter a valid URL (e.g., https://example.com/image.jpg).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        category_id: Number(formData.category_id),
        capacity: Number(formData.capacity),
        image_url: formData.image_url.trim() || undefined
      };

      if (isEdit) {
        await api.put(`/events/${eventId}`, payload);
        setSuccessMessage('Event updated successfully! Redirecting...');
      } else {
        await api.post('/events', payload);
        setSuccessMessage('Event created successfully! Redirecting...');
      }

      setTimeout(() => {
        navigate('/admin');
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save event. Please check inputs and try again.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4 p-md-5">
        {serverError && <ErrorMessage message={serverError} dismissible onDismiss={() => setServerError(null)} />}

        {successMessage && (
          <div className="alert alert-success d-flex align-items-center mb-4">
            <i className="bi bi-check-circle-fill me-2 fs-5"></i>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Row 1: Title */}
          <div className="mb-4">
            <label htmlFor="event-title" className="form-label">
              Event Title <span className="text-danger">*</span>
            </label>
            <input
              id="event-title"
              name="title"
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="e.g., Annual Hackathon: HackTheCampus 2026"
              value={formData.title}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          {/* Row 2: Category and Organizer */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="event-category" className="form-label">
                Category <span className="text-danger">*</span>
              </label>
              <select
                id="event-category"
                name="category_id"
                className={`form-select ${errors.category_id ? 'is-invalid' : ''}`}
                value={formData.category_id}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">Select an event category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <div className="invalid-feedback">{errors.category_id}</div>}
            </div>

            <div className="col-md-6">
              <label htmlFor="event-organizer" className="form-label">
                Organizer / Department <span className="text-danger">*</span>
              </label>
              <input
                id="event-organizer"
                name="organizer"
                type="text"
                className={`form-control ${errors.organizer ? 'is-invalid' : ''}`}
                placeholder="e.g., Computer Science Society"
                value={formData.organizer}
                onChange={handleChange}
                disabled={submitting}
              >
              </input>
              {errors.organizer && <div className="invalid-feedback">{errors.organizer}</div>}
            </div>
          </div>

          {/* Row 3: Description */}
          <div className="mb-4">
            <label htmlFor="event-description" className="form-label">
              Detailed Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="event-description"
              name="description"
              rows="4"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              placeholder="Provide a comprehensive breakdown of the schedule, target audience, agenda, and requirements..."
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
            ></textarea>
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>

          {/* Row 4: Date, Time, Capacity */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label htmlFor="event-date" className="form-label">
                Event Date <span className="text-danger">*</span>
              </label>
              <input
                id="event-date"
                name="event_date"
                type="date"
                className={`form-control ${errors.event_date ? 'is-invalid' : ''}`}
                value={formData.event_date}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.event_date && <div className="invalid-feedback">{errors.event_date}</div>}
            </div>

            <div className="col-md-4">
              <label htmlFor="event-time" className="form-label">
                Event Time <span className="text-danger">*</span>
              </label>
              <input
                id="event-time"
                name="event_time"
                type="time"
                className={`form-control ${errors.event_time ? 'is-invalid' : ''}`}
                value={formData.event_time}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.event_time && <div className="invalid-feedback">{errors.event_time}</div>}
            </div>

            <div className="col-md-4">
              <label htmlFor="event-capacity" className="form-label">
                Seat Capacity <span className="text-danger">*</span>
              </label>
              <input
                id="event-capacity"
                name="capacity"
                type="number"
                min="1"
                className={`form-control ${errors.capacity ? 'is-invalid' : ''}`}
                placeholder="50"
                value={formData.capacity}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.capacity && <div className="invalid-feedback">{errors.capacity}</div>}
            </div>
          </div>

          {/* Row 5: Venue */}
          <div className="mb-4">
            <label htmlFor="event-venue" className="form-label">
              Venue / Location <span className="text-danger">*</span>
            </label>
            <input
              id="event-venue"
              name="venue"
              type="text"
              className={`form-control ${errors.venue ? 'is-invalid' : ''}`}
              placeholder="e.g., Central Auditorium Hall A / CS Lab 3"
              value={formData.venue}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.venue && <div className="invalid-feedback">{errors.venue}</div>}
          </div>

          {/* Row 6: Image URL (optional) */}
          <div className="mb-4">
            <label htmlFor="event-image" className="form-label">
              Banner Image URL <span className="text-muted fw-normal">(Optional - default image assigned if empty)</span>
            </label>
            <input
              id="event-image"
              name="image_url"
              type="url"
              className={`form-control ${errors.image_url ? 'is-invalid' : ''}`}
              placeholder="https://picsum.photos/seed/myevent/600/400"
              value={formData.image_url}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.image_url && <div className="invalid-feedback">{errors.image_url}</div>}
            {formData.image_url && (
              <div className="mt-2">
                <small className="text-muted d-block mb-1">Preview:</small>
                <img
                  src={formData.image_url}
                  alt="Banner preview"
                  style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="d-flex align-items-center gap-3 pt-3 border-top">
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Saving Event...</span>
                </>
              ) : (
                <>
                  <i className={`bi ${isEdit ? 'bi-check-lg' : 'bi-plus-lg'}`}></i>
                  <span>{isEdit ? 'Update Event' : 'Publish Event'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary px-4 py-2"
              onClick={() => navigate('/admin')}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
