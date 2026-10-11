import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import EventForm from '../components/EventForm';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Admin page wrapper for creating a new event or editing an existing event
 */
const AdminEventForm = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchEvent = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await api.get(`/events/${id}`);
          setInitialData(res.data.event);
        } catch (err) {
          console.error('Failed to load event data for editing:', err);
          setError('Could not retrieve event details for editing.');
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEdit]);

  return (
    <div className="py-5">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/admin" className="text-decoration-none">Admin Dashboard</Link></li>
            <li className="breadcrumb-item active" aria-current="page">
              {isEdit ? 'Edit Event' : 'Create New Event'}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-4">
          <h1 className="fw-bold text-dark mb-1">
            {isEdit ? 'Update Campus Event' : 'Create New Campus Event'}
          </h1>
          <p className="text-muted">
            {isEdit
              ? 'Modify schedule, seating capacity, or venue details for this event.'
              : 'Publish an upcoming university workshop, seminar, sports match, or cultural festival.'}
          </p>
        </div>

        {loading ? (
          <Loader message="Loading event details..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <EventForm initialData={initialData} isEdit={isEdit} eventId={id} />
        )}
      </div>
    </div>
  );
};

export default AdminEventForm;
