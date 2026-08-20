import type { NormalizedHoliday, HolidayFilterState, SortOption } from '@/types/normalized-holiday';

/**
 * Filters the list of normalized holidays based on user criteria:
 * - Max price per person
 * - Selected facilities (hotel must contain all selected facilities)
 * - Selected star ratings
 */
export function filterHolidays(
  holidays: NormalizedHoliday[],
  filters: HolidayFilterState
): NormalizedHoliday[] {
  return holidays.filter((holiday) => {
    // 1. Price Filter (price per person <= maxPrice)
    if (filters.maxPrice !== null && holiday.pricePerPerson > filters.maxPrice) {
      return false;
    }

    // 2. Facilities Filter (hotel must provide every selected facility)
    if (filters.facilities.length > 0) {
      const hasAllFacilities = filters.facilities.every((selectedFacility) =>
        holiday.facilities.includes(selectedFacility)
      );
      if (!hasAllFacilities) {
        return false;
      }
    }

    // 3. Star Rating Filter (hotel's star rating must match one of the selected ratings)
    if (filters.starRatings.length > 0) {
      const holidayStarBucket = Math.floor(holiday.starRating);
      const matchesRating = filters.starRatings.includes(holidayStarBucket);
      if (!matchesRating) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sorts an array of normalized holidays according to the chosen sort strategy.
 * Creates a shallow copy so original array is not mutated.
 */
export function sortHolidays(
  holidays: NormalizedHoliday[],
  sortBy: SortOption
): NormalizedHoliday[] {
  const sorted = [...holidays];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.pricePerPerson - b.pricePerPerson);

    case 'price-desc':
      return sorted.sort((a, b) => b.pricePerPerson - a.pricePerPerson);

    case 'rating-desc':
      return sorted.sort((a, b) => {
        // First sort by star rating descending
        if (b.starRating !== a.starRating) {
          return b.starRating - a.starRating;
        }
        // Tie-breaker: sort by price per person ascending
        return a.pricePerPerson - b.pricePerPerson;
      });

    case 'recommended':
    default:
      // Keep natural curated fixture order (or tier points balance)
      return sorted;
  }
}

/**
 * Helper to format British Pounds (GBP) nicely with thousands separators.
 * e.g., 1199 -> "£1,199"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}
