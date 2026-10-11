import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import EventList from '../components/EventList';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';

/**
 * Events discovery page with interactive search, category filters, and live count
 */
const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state with URL params
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Load categories once
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

  // Fetch events based on current search and category
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.category = selectedCategory;

      const res = await api.get('/events', { params });
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Unable to load events. Please ensure backend server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, selectedCategory]);

  // Handle filter changes and update URL search params
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    const newParams = new URLSearchParams(searchParams);
    if (term) {
      newParams.set('search', term);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName) {
      newParams.set('category', catName);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSearchParams({});
  };

  const hasActiveFilters = !!searchTerm || !!selectedCategory;

  return (
    <div className="py-5">
      <div className="container">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="fw-bold text-dark mb-1">Browse Campus Events</h1>
          <p className="text-muted">
            Explore workshops, seminars, sports matches, and cultural gatherings across campus.
          </p>
        </div>

        {/* Filter Controls Card */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <div className="row g-3 align-items-center mb-3">
              <div className="col-lg-8">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  placeholder="Search events by title, description, venue, or club..."
                />
              </div>
              <div className="col-lg-4 text-lg-end">
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="btn btn-outline-secondary btn-sm px-3 rounded-pill"
                  >
                    <i className="bi bi-x-circle me-1"></i> Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="border-top pt-3">
              <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
                <span className="small text-muted fw-semibold text-nowrap">Filter by category:</span>
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategorySelect}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span className="text-muted small fw-medium">
            {!loading && (
              <>
                Showing <strong className="text-dark">{events.length}</strong> {events.length === 1 ? 'event' : 'events'}
                {selectedCategory && ` in "${selectedCategory}"`}
                {searchTerm && ` matching "${searchTerm}"`}
              </>
            )}
          </span>
        </div>

        {/* Events Grid */}
        <EventList
          events={events}
          loading={loading}
          error={error}
          emptyMessage="No events matched your current search or category filter. Try clearing filters to see upcoming events."
          onRetry={fetchEvents}
        />
      </div>
    </div>
  );
};

export default Events;
