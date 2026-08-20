import type { Holiday, HotelImage } from '@/types/booking';
import type {
  NormalizedHoliday,
  FilterFacets,
  FacilityFacet,
  StarRatingFacet,
} from '@/types/normalized-holiday';

/**
 * Known facility canonical names to keep consistent formatting
 * (e.g. handles "free wifi" -> "Free WiFi").
 */
const CANONICAL_FACILITIES: Record<string, string> = {
  'free wifi': 'Free WiFi',
  'wifi': 'Free WiFi',
  'pool': 'Pool',
  'spa': 'Spa',
  'restaurant': 'Restaurant',
  'gym': 'Gym',
  'parking': 'Parking',
  'kids club': 'Kids Club',
  'kitchenette': 'Kitchenette',
  'laundry': 'Laundry',
};

/**
 * Converts a raw facility string to a consistent Title-Cased format
 * and corrects known casing inconsistencies from the API.
 */
export function normalizeFacilityName(rawName: string): string {
  if (!rawName || typeof rawName !== 'string') return '';
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();

  // Check known overrides first
  if (CANONICAL_FACILITIES[lower]) {
    return CANONICAL_FACILITIES[lower];
  }

  // Capitalize first letter of each word
  return trimmed
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Cleans, standardizes, and deduplicates an array of hotel facilities.
 */
export function normalizeFacilitiesList(rawFacilities: string[] | undefined | null): string[] {
  if (!Array.isArray(rawFacilities)) return [];

  const unique = new Set<string>();

  for (const item of rawFacilities) {
    const cleaned = normalizeFacilityName(item);
    if (cleaned) {
      unique.add(cleaned);
    }
  }

  return Array.from(unique);
}

/**
 * Parses raw rating values (number, string numbers like "4.5", or "Unrated")
 * into a structured object with a numeric score and a display label.
 */
export function parseStarRating(
  rawRating: number | string | undefined | null
): { numeric: number; display: string } {
  if (rawRating === undefined || rawRating === null) {
    return { numeric: 0, display: 'Unrated' };
  }

  if (typeof rawRating === 'number') {
    return {
      numeric: rawRating,
      display: rawRating.toString(),
    };
  }

  const parsed = parseFloat(rawRating);
  if (isNaN(parsed) || rawRating.toLowerCase() === 'unrated') {
    return { numeric: 0, display: 'Unrated' };
  }

  return {
    numeric: parsed,
    display: rawRating.trim(),
  };
}

/**
 * Safely extracts the first valid carousel image URL from the hotel content.
 */
export function extractImageUrl(images: HotelImage[] | undefined | null): string | null {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }
  const firstImage = images[0]?.RESULTS_CAROUSEL?.url;
  return firstImage && typeof firstImage === 'string' && firstImage.trim().length > 0
    ? firstImage.trim()
    : null;
}

/**
 * Normalizes a single raw holiday object from the fixture/API into a UI-friendly structure.
 */
export function normalizeHoliday(rawHoliday: Holiday, index: number): NormalizedHoliday {
  const hotel = rawHoliday.hotel || {};
  const content = hotel.content || {};

  // Build a distinct unique ID so duplicate hotels with different packages render without key conflicts
  const uniqueId = `${hotel.id || 'hotel'}-${rawHoliday.departureDate || index}-${hotel.boardBasis || 'standard'}-${index}`;

  const ratingInfo = parseStarRating(content.starRating);
  const vRatingParsed = typeof content.vRating === 'number'
    ? content.vRating
    : parseFloat(content.vRating as string);

  // Combine sub-location (e.g. Lake Buena Vista) and parent location (e.g. Orlando)
  const subLocation = Array.isArray(content.hotelLocation) && content.hotelLocation[0]
    ? content.hotelLocation[0]
    : '';
  const parentLocation = content.parentLocation || '';
  const combinedLocation = subLocation && parentLocation
    ? `${subLocation}, ${parentLocation}`
    : parentLocation || subLocation || 'Location unavailable';

  return {
    id: uniqueId,
    hotelId: hotel.id || `hotel-${index}`,
    hotelName: hotel.name || content.name || 'Hotel Name Unavailable',
    location: combinedLocation,
    parentLocation: parentLocation || 'Orlando',
    starRating: ratingInfo.numeric,
    starRatingDisplay: ratingInfo.display,
    vRating: !isNaN(vRatingParsed) ? vRatingParsed : null,
    hotelDescription: content.hotelDescription || 'No description available.',
    highlights: Array.isArray(content.atAGlance) ? content.atAGlance.filter(Boolean) : [],
    facilities: normalizeFacilitiesList(content.hotelFacilities),
    boardBasis: hotel.boardBasis || (Array.isArray(content.boardBasis) ? content.boardBasis[0] : 'Room Only') || 'Room Only',
    propertyType: content.propertyType || 'Hotel',
    imageUrl: extractImageUrl(content.images),
    imageAlt: `${hotel.name || 'Hotel'} preview`,
    pricePerPerson: Number(rawHoliday.pricePerPerson) || 0,
    totalPrice: Number(rawHoliday.totalPrice) || 0,
    departureDate: rawHoliday.departureDate || '',
    selectedDate: rawHoliday.selectedDate || rawHoliday.departureDate || '',
    virginPoints: Number(rawHoliday.virginPoints) || 0,
    flyingClubMiles: Number(rawHoliday.flyingClubMiles) || 0,
    tierPoints: Number(rawHoliday.tierPoints) || 0,
  };
}

/**
 * Transforms an array of raw holidays into normalized UI models.
 */
export function normalizeHolidays(rawHolidays: Holiday[] | undefined | null): NormalizedHoliday[] {
  if (!Array.isArray(rawHolidays)) return [];
  return rawHolidays.map((holiday, idx) => normalizeHoliday(holiday, idx));
}

/**
 * Dynamically derives available filter facets (price bounds, facilities with counts, star ratings with counts)
 * from the normalized dataset.
 */
export function deriveFilterFacets(holidays: NormalizedHoliday[]): FilterFacets {
  if (holidays.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 0,
      availableFacilities: [],
      availableStarRatings: [],
    };
  }

  // 1. Calculate price min and max
  let minPrice = holidays[0].pricePerPerson;
  let maxPrice = holidays[0].pricePerPerson;

  for (const h of holidays) {
    if (h.pricePerPerson < minPrice) minPrice = h.pricePerPerson;
    if (h.pricePerPerson > maxPrice) maxPrice = h.pricePerPerson;
  }

  // 2. Count facilities
  const facilityCounts = new Map<string, number>();
  for (const h of holidays) {
    for (const facility of h.facilities) {
      facilityCounts.set(facility, (facilityCounts.get(facility) || 0) + 1);
    }
  }

  const availableFacilities: FacilityFacet[] = Array.from(facilityCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  // 3. Count star ratings
  const starCounts = new Map<number, { label: string; count: number }>();
  for (const h of holidays) {
    const key = Math.floor(h.starRating); // Group by integer star (e.g. 3, 4, 5, or 0 for unrated)
    const existing = starCounts.get(key);
    const label = key === 0 ? 'Unrated' : `${key} Star${key > 1 ? 's' : ''}`;

    if (existing) {
      existing.count += 1;
    } else {
      starCounts.set(key, { label, count: 1 });
    }
  }

  const availableStarRatings: StarRatingFacet[] = Array.from(starCounts.entries())
    .map(([rating, { label, count }]) => ({ rating, label, count }))
    .sort((a, b) => b.rating - a.rating); // Sort highest stars first

  return {
    minPrice,
    maxPrice,
    availableFacilities,
    availableStarRatings,
  };
}
