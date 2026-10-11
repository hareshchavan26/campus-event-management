/**
 * Filter chips for selecting event categories
 */
const CategoryFilter = ({ categories = [], selectedCategory, onSelectCategory }) => {
  return (
    <div className="d-flex flex-wrap gap-2 align-items-center py-2" role="group" aria-label="Filter events by category">
      {/* "All" Chip */}
      <button
        type="button"
        className={`btn btn-sm rounded-pill px-3 py-1.5 transition-all ${
          !selectedCategory || selectedCategory === ''
            ? 'btn-primary'
            : 'btn-outline-secondary border-0 bg-white shadow-sm'
        }`}
        onClick={() => onSelectCategory('')}
      >
        <i className="bi bi-grid-fill me-1"></i> All Events
      </button>

      {/* Category List */}
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.name || selectedCategory === String(cat.id);
        return (
          <button
            key={cat.id}
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1.5 transition-all ${
              isSelected
                ? 'btn-primary'
                : 'btn-outline-secondary border-0 bg-white shadow-sm'
            }`}
            onClick={() => onSelectCategory(isSelected ? '' : cat.name)}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
