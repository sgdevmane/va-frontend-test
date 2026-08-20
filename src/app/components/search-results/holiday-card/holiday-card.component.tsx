import type { NormalizedHoliday } from '@/types/normalized-holiday';
import { formatCurrency } from '@/utils/filter-and-sort';
import { HotelImage } from '../hotel-image/hotel-image.component';
import styles from './holiday-card.module.css';

interface HolidayCardProps {
  holiday: NormalizedHoliday;
  duration?: string;
  partySummary?: string;
}

/**
 * Holiday card component displaying comprehensive holiday information
 * in a clean, responsive, and accessible layout.
 */
export function HolidayCard({ holiday, duration = '7', partySummary }: HolidayCardProps) {
  // Render star rating symbols
  const renderStars = () => {
    if (holiday.starRating <= 0) {
      return <span className={styles.unratedBadge}>Unrated</span>;
    }

    const fullStars = Math.floor(holiday.starRating);
    const hasHalf = holiday.starRating % 1 !== 0;

    return (
      <div className={styles.starRating} aria-label={`${holiday.starRating} out of 5 stars`}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`star-${i}`} className={styles.starIcon} aria-hidden="true">★</span>
        ))}
        {hasHalf && <span className={styles.starIcon} aria-hidden="true">½</span>}
        <span className={styles.starRatingText}>{holiday.starRatingDisplay} Stars</span>
      </div>
    );
  };

  return (
    <article className={styles.card} aria-labelledby={`hotel-title-${holiday.id}`}>
      {/* 1. Media Section */}
      <div className={styles.mediaContainer}>
        <HotelImage
          src={holiday.imageUrl}
          alt={holiday.hotelName}
          propertyType={holiday.propertyType}
        />
        <div className={styles.mediaBadges}>
          <span className={styles.boardBadge}>{holiday.boardBasis}</span>
          {holiday.vRating && (
            <span className={styles.vRatingBadge} title="Virgin Holidays Rating">
              V-Rating: {holiday.vRating}
            </span>
          )}
        </div>
      </div>

      {/* 2. Content & Details Section */}
      <div className={styles.detailsContainer}>
        <div className={styles.headerInfo}>
          <div className={styles.locationTag}>
            <svg
              className={styles.locationIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{holiday.location}</span>
          </div>

          <h3 id={`hotel-title-${holiday.id}`} className={styles.hotelName} title={holiday.hotelName}>
            {holiday.hotelName}
          </h3>

          <div className={styles.ratingRow}>
            {renderStars()}
            <span className={styles.propertyTypeTag}>{holiday.propertyType}</span>
          </div>
        </div>

        <p className={styles.description}>{holiday.hotelDescription}</p>

        {/* Highlights / At A Glance */}
        {holiday.highlights.length > 0 && (
          <ul className={styles.highlightsList} aria-label="Key highlights">
            {holiday.highlights.slice(0, 3).map((item, idx) => (
              <li key={idx} className={styles.highlightItem}>
                <span className={styles.checkIcon} aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Facilities Badges */}
        {holiday.facilities.length > 0 && (
          <div className={styles.facilitiesRow} aria-label="Facilities">
            {holiday.facilities.slice(0, 5).map((facility) => (
              <span key={facility} className={styles.facilityBadge}>
                {facility}
              </span>
            ))}
            {holiday.facilities.length > 5 && (
              <span className={styles.moreFacilities}>
                +{holiday.facilities.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Pricing & Call to Action Section */}
      <div className={styles.pricingContainer}>
        <div className={styles.tripSummary}>
          <span className={styles.durationBadge}>{duration} Nights</span>
          {partySummary && <span className={styles.partySummaryText}>{partySummary}</span>}
          {holiday.departureDate && (
            <span className={styles.departureDateText}>
              Departs: {holiday.departureDate}
            </span>
          )}
        </div>

        {/* Virgin Loyalty Points Rewards */}
        {(holiday.virginPoints > 0 || holiday.tierPoints > 0) && (
          <div className={styles.rewardsBox}>
            <span className={styles.rewardsTitle}>Virgin Atlantic Points</span>
            <div className={styles.pointsGrid}>
              {holiday.virginPoints > 0 && (
                <span><strong>{holiday.virginPoints.toLocaleString()}</strong> Virgin Points</span>
              )}
              {holiday.tierPoints > 0 && (
                <span><strong>{holiday.tierPoints}</strong> Tier Points</span>
              )}
            </div>
          </div>
        )}

        <div className={styles.priceBlock}>
          <div className={styles.pricePerPersonWrapper}>
            <span className={styles.priceLabel}>From</span>
            <span className={styles.pricePerPerson}>
              {formatCurrency(holiday.pricePerPerson)}
            </span>
            <span className={styles.perPersonSubtext}>per person</span>
          </div>

          <div className={styles.totalPriceWrapper}>
            <span>Total price {formatCurrency(holiday.totalPrice)}</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.ctaButton}
          aria-label={`View deal for ${holiday.hotelName} at ${formatCurrency(holiday.pricePerPerson)} per person`}
        >
          View holiday
        </button>
      </div>
    </article>
  );
}
