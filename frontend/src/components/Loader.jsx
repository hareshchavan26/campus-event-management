/**
 * Reusable animated loading spinner component
 */
const Loader = ({ message = 'Loading campus events...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-4" role="status" aria-live="polite">
      <div 
        className="spinner-border text-primary" 
        style={{ width: '3rem', height: '3rem' }} 
        role="presentation"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-3 text-secondary fw-medium fs-6">{message}</p>}
    </div>
  );
};

export default Loader;
