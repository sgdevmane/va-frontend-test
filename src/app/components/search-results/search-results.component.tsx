'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import searchResults from '../../../../fixtures/search-results.json';
import type { BookingResponse } from '@/types/booking';
import { normalizeHolidays, deriveFilterFacets } from '@/utils/normalize-holidays';
import { filterHolidays, sortHolidays } from '@/utils/filter-and-sort';
import { useHolidayFilters } from '@/hooks/useHolidayFilters';
import { Rooms } from '@/utils/composition.service';
import { FilterSidebar } from './filter-sidebar/filter-sidebar.component';
import { SortToolbar } from './sort-toolbar/sort-toolbar.component';
import { ActiveFilters } from './active-filters/active-filters.component';
import { HolidayCard } from './holiday-card/holiday-card.component';
import { EmptyState } from './empty-state/empty-state.component';
import styles from './search-results.module.css';

// Ensure the fixture matches the contract
const fixtureResults = searchResults as BookingResponse;

type SearchParams = { [key: string]: string | string[] | undefined };

const getSingleParam = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const getArrayParam = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

interface SearchResultsComponentProps {
  searchParams: SearchParams;
}

/**
 * Main SearchResultsComponent orchestrating:
 * - Data normalization of fixture/backend holidays
 * - Dynamic facet extraction
 * - URL synchronized filtering and sorting
 * - Accessible layout with sidebar filters and responsive results list
 */
export default function SearchResultsComponent({ searchParams }: SearchResultsComponentProps) {
  // 1. Extract search context parameters from query
  const locationParam = getSingleParam(searchParams.location);
  const departureDateParam = getSingleParam(searchParams.departureDate);
  const durationParam = getSingleParam(searchParams.duration) || '7';
  const gatewayParam = getSingleParam(searchParams.gateway);
  const rawParty = getArrayParam(searchParams.partyCompositions);

  // Parse party composition (e.g. "a2" -> "2 people / 1 room")
  const partyParsed = Rooms.parse(rawParty);
  const partySummary = partyParsed ? Rooms.prettyFormat(partyParsed) : undefined;

  const formattedLocation = locationParam
    ? locationParam.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Orlando';

  // 2. Normalize raw fixture data once
  const allHolidays = useMemo(() => {
    return normalizeHolidays(fixtureResults.holidays);
  }, []);

  // 3. Dynamically derive filter facets from the normalized dataset
  const facets = useMemo(() => {
    return deriveFilterFacets(allHolidays);
  }, [allHolidays]);

  // 4. Manage filter and sort state synced with URL
  const {
    filters,
    hasActiveFilters,
    setMaxPrice,
    toggleFacility,
    toggleStarRating,
    setSortBy,
    resetAllFilters,
  } = useHolidayFilters(facets.maxPrice);

  // 5. Apply filters and sorting
  const filteredHolidays = useMemo(() => {
    return filterHolidays(allHolidays, filters);
  }, [allHolidays, filters]);

  const displayedHolidays = useMemo(() => {
    return sortHolidays(filteredHolidays, filters.sortBy);
  }, [filteredHolidays, filters.sortBy]);

  return (
    <div className={styles.container}>
      {/* Search Header Summary */}
      <section className={styles.searchSummaryBanner} aria-label="Search criteria summary">
        <div className={styles.summaryText}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.backLink}>
              ← Edit search
            </Link>
          </div>
          <h1 className={styles.searchTitle}>Holidays in {formattedLocation}</h1>
          <div className={styles.summaryTags}>
            {departureDateParam && (
              <span className={styles.tag}>
                <strong>Departing:</strong> {departureDateParam}
              </span>
            )}
            <span className={styles.tag}>
              <strong>Duration:</strong> {durationParam} Nights
            </span>
            {gatewayParam && (
              <span className={styles.tag}>
                <strong>Flying from:</strong> {gatewayParam}
              </span>
            )}
            {partySummary && (
              <span className={styles.tag}>
                <strong>Guests:</strong> {partySummary}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Results Layout */}
      <div className={styles.layoutGrid}>
        {/* Left: Filter Sidebar */}
        <FilterSidebar
          facets={facets}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onMaxPriceChange={setMaxPrice}
          onToggleFacility={toggleFacility}
          onToggleStarRating={toggleStarRating}
          onResetAll={resetAllFilters}
        />

        {/* Right: Results Content Area */}
        <main className={styles.resultsMain}>
          <SortToolbar
            totalResults={displayedHolidays.length}
            location={formattedLocation}
            sortBy={filters.sortBy}
            onSortChange={setSortBy}
          />

          <ActiveFilters
            filters={filters}
            maxPriceBound={facets.maxPrice}
            onRemovePrice={() => setMaxPrice(null)}
            onRemoveFacility={(facility) => toggleFacility(facility)}
            onRemoveStarRating={(rating) => toggleStarRating(rating)}
            onResetAll={resetAllFilters}
          />

          {displayedHolidays.length === 0 ? (
            <EmptyState onResetFilters={resetAllFilters} />
          ) : (
            <div className={styles.holidayList} aria-label="Holiday results list">
              {displayedHolidays.map((holiday) => (
                <HolidayCard
                  key={holiday.id}
                  holiday={holiday}
                  duration={durationParam}
                  partySummary={partySummary}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
