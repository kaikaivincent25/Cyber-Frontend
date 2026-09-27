import "./Pagination.css";

export default function Pagination({ total, limit, offset, onPageChange }) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) return null;

  return (
    <nav className="pagination-container" aria-label="Pagination Navigation">
      <button
        className="btn-pagination"
        disabled={currentPage === 1}
        onClick={() => onPageChange(offset - limit)}
        aria-label="Previous page"
      >
        ← Previous
      </button>
      
      <div className="pagination-status" aria-live="polite">
        <span className="pagination-current">Page {currentPage} of {totalPages}</span>
        <span className="pagination-divider">·</span>
        <span className="pagination-total">{total} total items</span>
      </div>

      <button
        className="btn-pagination"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(offset + limit)}
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}