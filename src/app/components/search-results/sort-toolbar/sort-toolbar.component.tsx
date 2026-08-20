import type { SortOption } from '@/types/normalized-holiday';
import styles from './sort-toolbar.module.css';

interface SortToolbarProps {
  totalResults: number;
  location?: string;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Star Rating: High to Low' },
];

/**
 * SortToolbar component displaying results count and an accessible sort select dropdown.
 */
export function SortToolbar({
  totalResults,
  location,
  sortBy,
  onSortChange,
}: SortToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.resultsCount} aria-live="polite">
        <h2 className={styles.countText}>
          {totalResults} {totalResults === 1 ? 'holiday' : 'holidays'} found
          {location ? ` in ${location}` : ''}
        </h2>
      </div>

      <div className={styles.sortWrapper}>
        <label htmlFor="sort-by-select" className={styles.sortLabel}>
          Sort by:
        </label>
        <div className={styles.selectContainer}>
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className={styles.sortSelect}
            aria-label="Sort search results"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.selectArrow} aria-hidden="true">▼</span>
        </div>
      </div>
    </div>
  );
}
