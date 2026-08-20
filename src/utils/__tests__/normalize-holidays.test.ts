import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseStarRating,
  normalizeFacilityName,
  normalizeFacilitiesList,
  extractImageUrl,
  normalizeHoliday,
  deriveFilterFacets,
} from '../normalize-holidays';
import type { Holiday } from '@/types/booking';

describe('normalize-holidays utility', () => {
  describe('parseStarRating', () => {
    it('handles numeric ratings correctly', () => {
      assert.deepEqual(parseStarRating(4), { numeric: 4, display: '4' });
      assert.deepEqual(parseStarRating(5), { numeric: 5, display: '5' });
    });

    it('handles string numeric ratings correctly', () => {
      assert.deepEqual(parseStarRating('4'), { numeric: 4, display: '4' });
      assert.deepEqual(parseStarRating('4.5'), { numeric: 4.5, display: '4.5' });
    });

    it('handles Unrated and invalid values defensively', () => {
      assert.deepEqual(parseStarRating('Unrated'), { numeric: 0, display: 'Unrated' });
      assert.deepEqual(parseStarRating(null), { numeric: 0, display: 'Unrated' });
      assert.deepEqual(parseStarRating(undefined), { numeric: 0, display: 'Unrated' });
      assert.deepEqual(parseStarRating('unknown'), { numeric: 0, display: 'Unrated' });
    });
  });

  describe('normalizeFacilityName & normalizeFacilitiesList', () => {
    it('normalizes casing and known variants', () => {
      assert.equal(normalizeFacilityName('free wifi'), 'Free WiFi');
      assert.equal(normalizeFacilityName('Free WiFi'), 'Free WiFi');
      assert.equal(normalizeFacilityName('wifi'), 'Free WiFi');
      assert.equal(normalizeFacilityName('pool'), 'Pool');
      assert.equal(normalizeFacilityName('kids club'), 'Kids Club');
    });

    it('deduplicates facility arrays with mixed casing', () => {
      const raw = ['Free WiFi', 'free wifi', 'Pool', 'pool', 'Restaurant'];
      const normalized = normalizeFacilitiesList(raw);
      assert.deepEqual(normalized, ['Free WiFi', 'Pool', 'Restaurant']);
    });

    it('handles null/undefined facility lists gracefully', () => {
      assert.deepEqual(normalizeFacilitiesList(null), []);
      assert.deepEqual(normalizeFacilitiesList(undefined), []);
    });
  });

  describe('extractImageUrl', () => {
    it('extracts url from RESULTS_CAROUSEL object', () => {
      const images = [
        { RESULTS_CAROUSEL: { url: 'https://example.com/hotel.jpg' } },
      ];
      assert.equal(extractImageUrl(images), 'https://example.com/hotel.jpg');
    });

    it('returns null when images array is empty or malformed', () => {
      assert.equal(extractImageUrl([]), null);
      assert.equal(extractImageUrl(null), null);
      assert.equal(extractImageUrl(undefined), null);
    });
  });

  describe('normalizeHoliday & deriveFilterFacets', () => {
    const sampleHoliday: Holiday = {
      totalPrice: 2000,
      pricePerPerson: 1000,
      flyingClubMiles: 2000,
      virginPoints: 1000,
      tierPoints: 40,
      departureDate: '2026-09-14',
      selectedDate: '2026-09-14',
      hotel: {
        id: 'test-hotel',
        name: 'Grand Test Resort',
        boardBasis: 'All Inclusive',
        content: {
          name: 'Grand Test Resort',
          vRating: '4.5',
          hotelDescription: 'A wonderful resort.',
          atAGlance: ['Poolside bar'],
          parentLocation: 'Orlando',
          images: [{ RESULTS_CAROUSEL: { url: 'https://example.com/img.jpg' } }],
          holidayType: ['Family'],
          boardBasis: ['All Inclusive'],
          hotelLocation: ['Lake Buena Vista'],
          accommodationType: ['Hotel'],
          hotelFacilities: ['Pool', 'free wifi'],
          starRating: '4',
          propertyType: 'Resort',
        },
      },
    };

    it('transforms raw holiday into clean NormalizedHoliday model', () => {
      const normalized = normalizeHoliday(sampleHoliday, 0);
      assert.equal(normalized.hotelName, 'Grand Test Resort');
      assert.equal(normalized.location, 'Lake Buena Vista, Orlando');
      assert.equal(normalized.starRating, 4);
      assert.deepEqual(normalized.facilities, ['Pool', 'Free WiFi']);
      assert.equal(normalized.pricePerPerson, 1000);
      assert.equal(normalized.imageUrl, 'https://example.com/img.jpg');
    });

    it('computes correct facets from normalized holidays', () => {
      const normalized = [normalizeHoliday(sampleHoliday, 0)];
      const facets = deriveFilterFacets(normalized);

      assert.equal(facets.minPrice, 1000);
      assert.equal(facets.maxPrice, 1000);
      assert.deepEqual(facets.availableFacilities, [
        { name: 'Free WiFi', count: 1 },
        { name: 'Pool', count: 1 },
      ]);
      assert.deepEqual(facets.availableStarRatings, [
        { rating: 4, label: '4 Stars', count: 1 },
      ]);
    });
  });
});
