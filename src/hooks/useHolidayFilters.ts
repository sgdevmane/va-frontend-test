'use client';

import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { HolidayFilterState, SortOption } from '@/types/normalized-holiday';

/**
 * Custom hook to manage holiday filter and sort states.
 * Automatically synchronizes state with URL search query params
 * so the search results page can be refreshed, bookmarked, or shared.
 */
export function useHolidayFilters(initialMaxPrice: number) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Read current filter state directly from search parameters
  const currentFilters: HolidayFilterState = useMemo(() => {
    const rawPrice = searchParams.get('priceMax');
    const rawFacilities = searchParams.get('facilities');
    const rawStars = searchParams.get('stars');
    const rawSort = searchParams.get('sort');

    const maxPrice = rawPrice ? parseInt(rawPrice, 10) : null;
    const facilities = rawFacilities
      ? rawFacilities.split(',').map((f) => decodeURIComponent(f.trim())).filter(Boolean)
      : [];
    const starRatings = rawStars
      ? rawStars.split(',').map((s) => parseInt(s.trim(), 10)).filter((s) => !isNaN(s))
      : [];
    const sortBy: SortOption =
      rawSort === 'price-asc' ||
      rawSort === 'price-desc' ||
      rawSort === 'rating-desc' ||
      rawSort === 'recommended'
        ? (rawSort as SortOption)
        : 'recommended';

    return {
      maxPrice: maxPrice !== null && !isNaN(maxPrice) ? maxPrice : null,
      facilities,
      starRatings,
      sortBy,
    };
  }, [searchParams]);

  // 2. Helper to write updated filter values back into the URL
  const updateUrlParams = useCallback(
    (newFilters: Partial<HolidayFilterState>) => {
      const nextFilters: HolidayFilterState = {
        ...currentFilters,
        ...newFilters,
      };

      const params = new URLSearchParams(searchParams.toString());

      // Max price
      if (nextFilters.maxPrice !== null && nextFilters.maxPrice < initialMaxPrice) {
        params.set('priceMax', nextFilters.maxPrice.toString());
      } else {
        params.delete('priceMax');
      }

      // Facilities
      if (nextFilters.facilities.length > 0) {
        params.set(
          'facilities',
          nextFilters.facilities.map((f) => encodeURIComponent(f)).join(',')
        );
      } else {
        params.delete('facilities');
      }

      // Star ratings
      if (nextFilters.starRatings.length > 0) {
        params.set('stars', nextFilters.starRatings.join(','));
      } else {
        params.delete('stars');
      }

      // Sort
      if (nextFilters.sortBy && nextFilters.sortBy !== 'recommended') {
        params.set('sort', nextFilters.sortBy);
      } else {
        params.delete('sort');
      }

      // Shallow update to URL without full page reload or scrolling up
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [currentFilters, initialMaxPrice, pathname, router, searchParams]
  );

  // 3. User action handlers
  const setMaxPrice = useCallback(
    (price: number | null) => {
      updateUrlParams({ maxPrice: price });
    },
    [updateUrlParams]
  );

  const toggleFacility = useCallback(
    (facilityName: string) => {
      const exists = currentFilters.facilities.includes(facilityName);
      const newFacilities = exists
        ? currentFilters.facilities.filter((f) => f !== facilityName)
        : [...currentFilters.facilities, facilityName];
      updateUrlParams({ facilities: newFacilities });
    },
    [currentFilters.facilities, updateUrlParams]
  );

  const toggleStarRating = useCallback(
    (rating: number) => {
      const exists = currentFilters.starRatings.includes(rating);
      const newStars = exists
        ? currentFilters.starRatings.filter((r) => r !== rating)
        : [...currentFilters.starRatings, rating];
      updateUrlParams({ starRatings: newStars });
    },
    [currentFilters.starRatings, updateUrlParams]
  );

  const setSortBy = useCallback(
    (sortBy: SortOption) => {
      updateUrlParams({ sortBy });
    },
    [updateUrlParams]
  );

  const resetAllFilters = useCallback(() => {
    updateUrlParams({
      maxPrice: null,
      facilities: [],
      starRatings: [],
      // keep or reset sort? Keep sort as user's preference or reset if needed
    });
  }, [updateUrlParams]);

  const hasActiveFilters = useMemo(() => {
    return (
      (currentFilters.maxPrice !== null && currentFilters.maxPrice < initialMaxPrice) ||
      currentFilters.facilities.length > 0 ||
      currentFilters.starRatings.length > 0
    );
  }, [currentFilters, initialMaxPrice]);

  return {
    filters: currentFilters,
    hasActiveFilters,
    setMaxPrice,
    toggleFacility,
    toggleStarRating,
    setSortBy,
    resetAllFilters,
  };
}
