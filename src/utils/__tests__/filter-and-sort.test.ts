import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterHolidays, sortHolidays, formatCurrency } from '../filter-and-sort';
import type { NormalizedHoliday, HolidayFilterState } from '@/types/normalized-holiday';

const mockHolidays: NormalizedHoliday[] = [
  {
    id: '1',
    hotelId: 'h1',
    hotelName: 'Budget Inn',
    location: 'Orlando',
    parentLocation: 'Orlando',
    starRating: 3,
    starRatingDisplay: '3',
    vRating: 3,
    hotelDescription: 'Basic hotel',
    highlights: [],
    facilities: ['Free WiFi'],
    boardBasis: 'Room Only',
    propertyType: 'Motel',
    imageUrl: null,
    imageAlt: 'Budget Inn',
    pricePerPerson: 799,
    totalPrice: 1598,
    departureDate: '2026-09-14',
    selectedDate: '2026-09-14',
    virginPoints: 799,
    flyingClubMiles: 1600,
    tierPoints: 20,
  },
  {
    id: '2',
    hotelId: 'h2',
    hotelName: 'Skyline Grand',
    location: 'International Drive, Orlando',
    parentLocation: 'Orlando',
    starRating: 4,
    starRatingDisplay: '4',
    vRating: 4.5,
    hotelDescription: 'City hotel',
    highlights: ['Rooftop'],
    facilities: ['Free WiFi', 'Restaurant', 'Gym', 'Pool'],
    boardBasis: 'Bed and Breakfast',
    propertyType: 'Hotel',
    imageUrl: 'https://example.com/skyline.jpg',
    imageAlt: 'Skyline Grand',
    pricePerPerson: 1705,
    totalPrice: 3410,
    departureDate: '2026-09-14',
    selectedDate: '2026-09-14',
    virginPoints: 1705,
    flyingClubMiles: 3400,
    tierPoints: 60,
  },
  {
    id: '3',
    hotelId: 'h3',
    hotelName: 'Lagoon Villas',
    location: 'Kissimmee, Orlando',
    parentLocation: 'Orlando',
    starRating: 5,
    starRatingDisplay: '5',
    vRating: 5,
    hotelDescription: 'Luxury resort',
    highlights: ['Private villa'],
    facilities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
    boardBasis: 'All Inclusive',
    propertyType: 'Villa',
    imageUrl: 'https://example.com/villas.jpg',
    imageAlt: 'Lagoon Villas',
    pricePerPerson: 2560,
    totalPrice: 5120,
    departureDate: '2026-09-14',
    selectedDate: '2026-09-15',
    virginPoints: 2560,
    flyingClubMiles: 5120,
    tierPoints: 80,
  },
];

describe('filter-and-sort utility', () => {
  describe('filterHolidays', () => {
    it('returns all holidays when default empty filter state is applied', () => {
      const defaultFilters: HolidayFilterState = {
        maxPrice: null,
        facilities: [],
        starRatings: [],
        sortBy: 'recommended',
      };
      const result = filterHolidays(mockHolidays, defaultFilters);
      assert.equal(result.length, 3);
    });

    it('filters by maximum price per person', () => {
      const filters: HolidayFilterState = {
        maxPrice: 1500,
        facilities: [],
        starRatings: [],
        sortBy: 'recommended',
      };
      const result = filterHolidays(mockHolidays, filters);
      assert.equal(result.length, 1);
      assert.equal(result[0].hotelName, 'Budget Inn');
    });

    it('filters by multiple facilities (AND conjunction)', () => {
      const filters: HolidayFilterState = {
        maxPrice: null,
        facilities: ['Pool', 'Spa'],
        starRatings: [],
        sortBy: 'recommended',
      };
      const result = filterHolidays(mockHolidays, filters);
      assert.equal(result.length, 1);
      assert.equal(result[0].hotelName, 'Lagoon Villas');
    });

    it('filters by star rating', () => {
      const filters: HolidayFilterState = {
        maxPrice: null,
        facilities: [],
        starRatings: [4, 5],
        sortBy: 'recommended',
      };
      const result = filterHolidays(mockHolidays, filters);
      assert.deepEqual(
        result.map((h) => h.hotelName),
        ['Skyline Grand', 'Lagoon Villas']
      );
    });

    it('combines price, facilities, and star rating filters correctly', () => {
      const filters: HolidayFilterState = {
        maxPrice: 2000,
        facilities: ['Free WiFi', 'Pool'],
        starRatings: [4],
        sortBy: 'recommended',
      };
      const result = filterHolidays(mockHolidays, filters);
      assert.equal(result.length, 1);
      assert.equal(result[0].hotelName, 'Skyline Grand');
    });

    it('returns empty array when no matches are found', () => {
      const filters: HolidayFilterState = {
        maxPrice: 500,
        facilities: [],
        starRatings: [],
        sortBy: 'recommended',
      };
      const result = filterHolidays(mockHolidays, filters);
      assert.equal(result.length, 0);
    });
  });

  describe('sortHolidays', () => {
    it('sorts price low to high (price-asc)', () => {
      const result = sortHolidays(mockHolidays, 'price-asc');
      assert.deepEqual(
        result.map((h) => h.pricePerPerson),
        [799, 1705, 2560]
      );
    });

    it('sorts price high to low (price-desc)', () => {
      const result = sortHolidays(mockHolidays, 'price-desc');
      assert.deepEqual(
        result.map((h) => h.pricePerPerson),
        [2560, 1705, 799]
      );
    });

    it('sorts rating high to low (rating-desc)', () => {
      const result = sortHolidays(mockHolidays, 'rating-desc');
      assert.deepEqual(
        result.map((h) => h.starRating),
        [5, 4, 3]
      );
    });

    it('preserves recommended default order', () => {
      const result = sortHolidays(mockHolidays, 'recommended');
      assert.deepEqual(
        result.map((h) => h.id),
        ['1', '2', '3']
      );
    });
  });

  describe('formatCurrency', () => {
    it('formats number to UK GBP currency string', () => {
      assert.equal(formatCurrency(1199), '£1,199');
      assert.equal(formatCurrency(0), '£0');
    });
  });
});
