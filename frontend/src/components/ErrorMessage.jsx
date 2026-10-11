/**
 * Accessible alert banner for network and validation errors
 */
const ErrorMessage = ({ message, onRetry, dismissible = false, onDismiss }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-danger d-flex align-items-center justify-content-between p-3 my-3 shadow-sm rounded-3 border-danger ${dismissible ? 'alert-dismissible' : ''}`} role="alert">
      <div className="d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill fs-4 me-3 text-danger flex-shrink-0"></i>
        <div>
          <strong className="d-block">Error encountered:</strong>
          <span>{message}</span>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2 ms-3">
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
          >
            <i className="bi bi-arrow-clockwise"></i> Retry
          </button>
        )}
        {dismissible && onDismiss && (
          <button 
            type="button" 
            className="btn-close" 
            aria-label="Close" 
            onClick={onDismiss}
          ></button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
