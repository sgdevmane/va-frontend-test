import type { HolidayFilterState } from '@/types/normalized-holiday';
import { formatCurrency } from '@/utils/filter-and-sort';
import styles from './active-filters.module.css';

interface ActiveFiltersProps {
  filters: HolidayFilterState;
  maxPriceBound: number;
  onRemovePrice: () => void;
  onRemoveFacility: (facility: string) => void;
  onRemoveStarRating: (rating: number) => void;
  onResetAll: () => void;
}

/**
 * ActiveFilters component renders clearable pills for each active filter.
 */
export function ActiveFilters({
  filters,
  maxPriceBound,
  onRemovePrice,
  onRemoveFacility,
  onRemoveStarRating,
  onResetAll,
}: ActiveFiltersProps) {
  const isPriceFiltered = filters.maxPrice !== null && filters.maxPrice < maxPriceBound;
  const hasAnyFilters =
    isPriceFiltered || filters.facilities.length > 0 || filters.starRatings.length > 0;

  if (!hasAnyFilters) return null;

  return (
    <div className={styles.container} aria-label="Applied filters">
      <span className={styles.label}>Active filters:</span>
      <div className={styles.pillsList}>
        {/* Price Pill */}
        {isPriceFiltered && (
          <button
            type="button"
            className={styles.pill}
            onClick={onRemovePrice}
            aria-label={`Remove price filter up to ${formatCurrency(filters.maxPrice!)}`}
          >
            <span>Max {formatCurrency(filters.maxPrice!)}</span>
            <span className={styles.closeIcon} aria-hidden="true">✕</span>
          </button>
        )}

        {/* Star Rating Pills */}
        {filters.starRatings.map((rating) => (
          <button
            key={`star-${rating}`}
            type="button"
            className={styles.pill}
            onClick={() => onRemoveStarRating(rating)}
            aria-label={`Remove ${rating === 0 ? 'Unrated' : `${rating} stars`} filter`}
          >
            <span>{rating === 0 ? 'Unrated' : `${rating} ★`}</span>
            <span className={styles.closeIcon} aria-hidden="true">✕</span>
          </button>
        ))}

        {/* Facilities Pills */}
        {filters.facilities.map((facility) => (
          <button
            key={`facility-${facility}`}
            type="button"
            className={styles.pill}
            onClick={() => onRemoveFacility(facility)}
            aria-label={`Remove ${facility} facility filter`}
          >
            <span>{facility}</span>
            <span className={styles.closeIcon} aria-hidden="true">✕</span>
          </button>
        ))}

        {/* Clear all link */}
        <button
          type="button"
          className={styles.clearAllButton}
          onClick={onResetAll}
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
