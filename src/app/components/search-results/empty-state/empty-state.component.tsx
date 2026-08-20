import styles from './empty-state.module.css';

interface EmptyStateProps {
  onResetFilters: () => void;
}

/**
 * EmptyState component displayed when active filters yield zero matching holidays.
 */
export function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <div className={styles.emptyContainer} role="status" aria-live="polite">
      <div className={styles.iconCircle} aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>

      <h3 className={styles.title}>No holidays match your filters</h3>
      <p className={styles.message}>
        We couldn&apos;t find any holiday packages matching all of your selected criteria.
        Try broadening your price range, or clearing some facility filters.
      </p>

      <button
        type="button"
        className={styles.resetButton}
        onClick={onResetFilters}
      >
        Reset all filters
      </button>
    </div>
  );
}
