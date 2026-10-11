/**
 * SearchBar component with input clear button and accessible controls
 */
const SearchBar = ({ searchTerm, onSearchChange, placeholder = 'Search events by title, venue, or speaker...' }) => {
  return (
    <div className="position-relative w-100">
      <label htmlFor="event-search-input" className="visually-hidden">
        Search Campus Events
      </label>
      <div className="input-group shadow-sm">
        <span className="input-group-text bg-white border-end-0 text-muted ps-3">
          <i className="bi bi-search"></i>
        </span>
        <input
          id="event-search-input"
          type="text"
          className="form-control border-start-0 py-2.5 ps-2"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="btn btn-white bg-white border-start-0 border-end-0 text-muted"
            onClick={() => onSearchChange('')}
            aria-label="Clear search query"
          >
            <i className="bi bi-x-circle-fill"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
