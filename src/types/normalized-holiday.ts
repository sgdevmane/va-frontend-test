/**
 * Normalized types for the Virgin Atlantic holiday search results.
 * These types provide a clean, predictable shape for UI components,
 * decoupling them from dirty or inconsistent raw backend/fixture data.
 */

export interface NormalizedHoliday {
  /** Unique identifier for the holiday package (combines hotel id, date, board basis) */
  id: string;
  hotelId: string;
  hotelName: string;
  location: string;
  parentLocation: string;
  
  /** Clean numeric rating (0 if unrated/missing) */
  starRating: number;
  /** Human-readable rating display (e.g. "4", "4.5", "5", "Unrated") */
  starRatingDisplay: string;
  vRating: number | null;

  hotelDescription: string;
  highlights: string[];
  /** Deduplicated, title-cased list of facilities */
  facilities: string[];
  boardBasis: string;
  propertyType: string;

  /** Primary carousel image URL or null if missing */
  imageUrl: string | null;
  imageAlt: string;

  pricePerPerson: number;
  totalPrice: number;
  departureDate: string;
  selectedDate: string;

  /** Virgin loyalty rewards */
  virginPoints: number;
  flyingClubMiles: number;
  tierPoints: number;
}

export type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'rating-desc';

export interface HolidayFilterState {
  /** Maximum price per person filter (null means no cap) */
  maxPrice: number | null;
  /** Selected facility names (e.g., ['Free WiFi', 'Pool']) */
  facilities: string[];
  /** Selected star ratings (e.g., [4, 5]) */
  starRatings: number[];
  /** Current sort mode */
  sortBy: SortOption;
}

export interface FacilityFacet {
  name: string;
  count: number;
}

export interface StarRatingFacet {
  rating: number;
  label: string;
  count: number;
}

export interface FilterFacets {
  minPrice: number;
  maxPrice: number;
  availableFacilities: FacilityFacet[];
  availableStarRatings: StarRatingFacet[];
}
