'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './hotel-image.module.css';

interface HotelImageProps {
  src: string | null;
  alt: string;
  propertyType?: string;
}

/**
 * Robust image component with fallback handling.
 * If the image URL is missing, or fails to load (common in tests/offline/dummy fixtures),
 * it gracefully displays a branded fallback card placeholder with property metadata.
 */
export function HotelImage({ src, alt, propertyType = 'Hotel' }: HotelImageProps) {
  const [hasError, setHasError] = useState(false);

  // Show placeholder if no image URL provided or if image failed to load
  if (!src || hasError) {
    return (
      <div className={styles.placeholder} aria-label={`${alt} - Image not available`}>
        <div className={styles.placeholderIcon} aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 3h6a2 2 0 0 1 2 2v2H7V5a2 2 0 0 1 2-2z" />
          </svg>
        </div>
        <span className={styles.placeholderType}>{propertyType}</span>
        <span className={styles.placeholderLabel}>Virgin Atlantic Holidays</span>
      </div>
    );
  }

  return (
    <div className={styles.imageWrapper}>
      <Image
        src={src}
        alt={alt}
        className={styles.image}
        width={320}
        height={220}
        unoptimized
        onError={() => setHasError(true)}
      />
    </div>
  );
}
