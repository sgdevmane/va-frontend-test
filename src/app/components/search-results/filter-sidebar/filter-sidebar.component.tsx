'use client';

import { useState } from 'react';
import type { FilterFacets, HolidayFilterState } from '@/types/normalized-holiday';
import { formatCurrency } from '@/utils/filter-and-sort';
import styles from './filter-sidebar.module.css';

interface FilterSidebarProps {
  facets: FilterFacets;
  filters: HolidayFilterState;
  hasActiveFilters: boolean;
  onMaxPriceChange: (price: number | null) => void;
  onToggleFacility: (facilityName: string) => void;
  onToggleStarRating: (rating: number) => void;
  onResetAll: () => void;
}

/**
 * FilterSidebar component providing accessible controls for:
 * 1. Maximum price per person slider
 * 2. Star rating multi-select checkboxes
 * 3. Hotel facilities multi-select checkboxes
 */
export function FilterSidebar({
  facets,
  filters,
  hasActiveFilters,
  onMaxPriceChange,
  onToggleFacility,
  onToggleStarRating,
  onResetAll,
}: FilterSidebarProps) {
  // Local state for mobile collapsible drawer
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeFilterCount =
    (filters.maxPrice !== null && filters.maxPrice < facets.maxPrice ? 1 : 0) +
    filters.facilities.length +
    filters.starRatings.length;

  const currentPriceValue = filters.maxPrice ?? facets.maxPrice;

  return (
    <aside className={styles.sidebarWrapper} aria-label="Search results filters">
      {/* Mobile Toggle Button */}
      <div className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.mobileFilterButton}
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-expanded={isMobileOpen}
          aria-controls="filter-controls-container"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span>{isMobileOpen ? 'Hide Filters' : 'Filter Results'}</span>
          {activeFilterCount > 0 && (
            <span className={styles.mobileBadge}>{activeFilterCount}</span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetLinkMobile}
            onClick={onResetAll}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Main Filter Container */}
      <div
        id="filter-controls-container"
        className={`${styles.filterContent} ${isMobileOpen ? styles.mobileOpen : ''}`}
      >
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Filter Results</h2>
          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetButton}
              onClick={onResetAll}
              aria-label="Clear all applied filters"
            >
              Clear all
            </button>
          )}
        </div>

        {/* 1. Price Per Person Filter */}
        <div className={styles.filterSection}>
          <h3 className={styles.sectionTitle}>Price per person</h3>
          <div className={styles.priceDisplayRow}>
            <span className={styles.priceBound}>From {formatCurrency(facets.minPrice)}</span>
            <span className={styles.activePriceBadge}>
              Up to {formatCurrency(currentPriceValue)}
            </span>
          </div>

          <label htmlFor="price-range-slider" className="sr-only">
            Maximum price per person: up to {formatCurrency(currentPriceValue)}
          </label>
          <input
            id="price-range-slider"
            type="range"
            min={facets.minPrice}
            max={facets.maxPrice}
            step={25}
            value={currentPriceValue}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              onMaxPriceChange(value);
            }}
            className={styles.rangeSlider}
            aria-valuemin={facets.minPrice}
            aria-valuemax={facets.maxPrice}
            aria-valuenow={currentPriceValue}
          />
          <div className={styles.sliderLabels}>
            <span>{formatCurrency(facets.minPrice)}</span>
            <span>{formatCurrency(facets.maxPrice)}</span>
          </div>
        </div>

        {/* 2. Star Rating Filter */}
        {facets.availableStarRatings.length > 0 && (
          <fieldset className={styles.filterSection}>
            <legend className={styles.sectionTitle}>Star rating</legend>
            <div className={styles.optionsList}>
              {facets.availableStarRatings.map(({ rating, label, count }) => {
                const inputId = `star-rating-${rating}`;
                const isChecked = filters.starRatings.includes(rating);

                return (
                  <label key={rating} htmlFor={inputId} className={styles.checkboxOption}>
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleStarRating(rating)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.optionLabel}>
                      {rating > 0 ? (
                        <span className={styles.starDisplay}>
                          {'★'.repeat(rating)}
                          <span className={styles.starText}>{label}</span>
                        </span>
                      ) : (
                        <span>{label}</span>
                      )}
                    </span>
                    <span className={styles.optionCount}>({count})</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* 3. Hotel Facilities Filter */}
        {facets.availableFacilities.length > 0 && (
          <fieldset className={styles.filterSection}>
            <legend className={styles.sectionTitle}>Hotel facilities</legend>
            <div className={styles.optionsList}>
              {facets.availableFacilities.map(({ name, count }) => {
                const inputId = `facility-${name.toLowerCase().replace(/\s+/g, '-')}`;
                const isChecked = filters.facilities.includes(name);

                return (
                  <label key={name} htmlFor={inputId} className={styles.checkboxOption}>
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleFacility(name)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.optionLabel}>{name}</span>
                    <span className={styles.optionCount}>({count})</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      </div>
    </aside>
  );
}
