'use client';

/**
 * Offer Card Component
 * Implements Figma design: PerkCard component
 *
 * Figma Source: https://www.figma.com/design/nKM13OcIYIJhSyop1XhjRC/CR---Refactor-intros-card-to-show-actions?node-id=4975-15264
 *
 * Props derived from Figma:
 * - property1: "loading" | "Populated"
 * - showDescription: boolean
 * - valueTag: boolean
 * - discountValue: boolean
 * - priceDifference: boolean
 * - priceValue: boolean
 *
 * API fields mapped:
 * - name → title
 * - description → description text
 * - picture → vendor logo
 * - deal_type → label text
 * - discount + discount_type → green discount badge
 * - estimated_value → blue value badge
 * - old_price + new_price → price strikethrough
 * - investment_levels[] → grey badges
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import type { GetProvenDeal } from '@/types';

interface OfferCardProps {
  offer: GetProvenDeal;
  vendorLogo?: string | null;  // Logo from vendors API (takes precedence over offer.picture)
  vendorName?: string;         // Vendor name from vendors API
  isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strip HTML tags from description
 */
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Format discount for display
 */
function formatDiscount(discount: number | null, discountType: string | null): string | null {
  if (discount === null) return null;
  if (discountType === 'percentage') {
    return `${discount}% off`;
  }
  return `$${discount.toLocaleString()} off`;
}

/**
 * Format estimated value for display
 */
function formatEstimatedValue(value: number | null): string | null {
  if (value === null) return null;
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K value`;
  }
  return `$${value.toLocaleString()} value`;
}

/**
 * Get deal type label (uppercased)
 */
function getDealTypeLabel(dealType: string | null): string {
  if (!dealType) return 'OFFER';
  return dealType.toUpperCase().replace('_', ' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS (matching Figma design system)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Placeholder Gift Icon - Figma design system fallback
 * Figma Source: https://www.figma.com/design/nKM13OcIYIJhSyop1XhjRC/?node-id=4982-15336
 *
 * Renders the gift-01 icon with stroke color #b3b7c4
 * DO NOT replace with hardcoded image URLs
 */
function PlaceholderGiftIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 7V22M12 7H8.46429C7.94332 7 7.4437 6.79018 7.07544 6.41421C6.70718 6.03824 6.5 5.52826 6.5 5C6.5 4.47174 6.70718 3.96176 7.07544 3.58579C7.4437 3.20982 7.94332 3 8.46429 3C11.2143 3 12 7 12 7ZM12 7H15.5357C16.0567 7 16.5563 6.79018 16.9246 6.41421C17.2928 6.03824 17.5 5.52826 17.5 5C17.5 4.47174 17.2928 3.96176 16.9246 3.58579C16.5563 3.20982 16.0567 3 15.5357 3C12.7857 3 12 7 12 7ZM5 12H19M5 12C4.46957 12 3.96086 11.7893 3.58579 11.4142C3.21071 11.0391 3 10.5304 3 10V9C3 8.46957 3.21071 7.96086 3.58579 7.58579C3.96086 7.21071 4.46957 7 5 7H19C19.5304 7 20.0391 7.21071 20.4142 7.58579C20.7893 7.96086 21 8.46957 21 9V10C21 10.5304 20.7893 11.0391 20.4142 11.4142C20.0391 11.7893 19.5304 12 19 12M5 12V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V12"
        stroke="#b3b7c4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Vendor Logo - 48x48 with Figma placeholder fallback
 *
 * Rendering Logic:
 * - If vendor logo exists → render the actual logo
 * - If vendor logo is missing/error → render Figma placeholder (gift icon)
 *
 * Figma placeholder: https://www.figma.com/design/nKM13OcIYIJhSyop1XhjRC/?node-id=4982-15336
 */
function VendorLogo({ src }: { src: string | null }) {
  const [error, setError] = useState(false);

  // Figma placeholder variant: no logo or load error
  if (!src || error) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-[#ecedf0]">
        <PlaceholderGiftIcon />
      </div>
    );
  }

  // Normal variant: render actual vendor logo
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-[#ecedf0]">
      <Image
        src={src}
        alt=""
        width={48}
        height={48}
        className="h-full w-full object-contain"
        unoptimized
        onError={() => setError(true)}
      />
    </div>
  );
}

/**
 * Color Label Badge (matches Figma ColorLabels component)
 */
function ColorLabel({
  text,
  color,
}: {
  text: string;
  color: 'green' | 'blue' | 'grey';
}) {
  const styles = {
    green: 'bg-[#e7f6ea] border-[#dbf1e0] text-[#005f15]',
    blue: 'bg-[#eef4ff] border-[#e6eeff] text-[#0036d7]',
    grey: 'bg-[#f9f9fa] border-[#ecedf0] text-[#3d445a]',
  };

  return (
    <span
      className={`inline-flex items-center rounded border px-2 text-sm font-semibold leading-6 tracking-[0.4px] ${styles[color]}`}
    >
      {text}
    </span>
  );
}

/**
 * Skeleton Loader (matches Figma loading state)
 */
function OfferCardSkeleton() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_3px_10px_0px_rgba(0,0,0,0.1)]">
      {/* Header - uses Figma placeholder */}
      <div className="border-b border-[#f2f3f5] p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded bg-[#ecedf0]">
          <PlaceholderGiftIcon />
        </div>
      </div>

      {/* Content - fixed height matching Figma */}
      <div className="flex h-[248px] flex-col gap-3 bg-white p-4">
        {/* Label + Title skeleton */}
        <div className="flex flex-col gap-1">
          <div className="h-4 w-[62px] rounded-full bg-[#e6e8ed]" />
          <div className="h-3.5 w-full rounded-full bg-[#e6e8ed]" />
          <div className="h-3.5 w-full rounded-full bg-[#e6e8ed]" />
        </div>
        {/* Description skeleton */}
        <div className="flex flex-col gap-1">
          <div className="h-3.5 w-[272px] rounded-full bg-[#e6e8ed]" />
          <div className="h-3.5 w-[249px] rounded-full bg-[#e6e8ed]" />
          <div className="h-3.5 w-[113px] rounded-full bg-[#e6e8ed]" />
        </div>
        {/* Tags skeleton */}
        <div className="h-4 w-[154px] rounded-full bg-[#e6e8ed]" />
        <div className="h-4 w-[154px] rounded-full bg-[#e6e8ed]" />
      </div>

      {/* Footer with spinner */}
      <div className="flex h-14 items-center border-t border-[#f2f3f5] bg-white p-4">
        <Loader2 className="h-6 w-6 animate-spin text-[#81879c]" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function OfferCard({ offer, vendorLogo, vendorName, isLoading = false }: OfferCardProps) {
  // Loading state → Figma "loading" variant
  if (isLoading) {
    return <OfferCardSkeleton />;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DERIVE FIGMA PROPS FROM API DATA
  // ─────────────────────────────────────────────────────────────────────────

  // API field extraction
  const name = offer.name;
  const description = stripHtml(offer.description);
  // Use vendor logo from vendors API (if provided), fallback to offer.picture
  const picture = vendorLogo ?? offer.picture;
  const dealType = offer.deal_type;
  const discount = offer.discount;
  const discountType = offer.discount_type;
  const estimatedValue = offer.estimated_value;
  const oldPrice = offer.old_price;
  const newPrice = offer.new_price;
  const investmentLevels = offer.investment_levels || [];

  // Figma prop derivation (based on data availability)
  const showDescription = Boolean(description);
  const discountValue = discount !== null;
  const priceValue = estimatedValue !== null;
  const priceDifference = oldPrice !== null && newPrice !== null;
  const valueTag = discountValue || priceValue;

  // Formatted display values
  const formattedDiscount = formatDiscount(discount, discountType);
  const formattedValue = formatEstimatedValue(estimatedValue);
  const dealTypeLabel = getDealTypeLabel(dealType);

  // Investment levels display (max 5 visible + count)
  const visibleLevels = investmentLevels.slice(0, 5);
  const remainingCount = Math.max(0, investmentLevels.length - 5);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER (matches Figma "Populated" variant structure exactly)
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Link
      href={`/perks/${offer.id}`}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_3px_10px_0px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0px_6px_20px_0px_rgba(0,0,0,0.15)]">

        {/* ═══════════════════════════════════════════════════════════════════
            HEADER (List item) - Figma node: List item
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="border-b border-[#f2f3f5] bg-white p-4">
          <div className="flex w-full items-center">
            <div className="flex flex-1 items-center gap-3">
              <VendorLogo src={picture} />
              {vendorName && (
                <p className="flex-1 text-base font-bold leading-[22px] text-[#3d445a]">
                  {vendorName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            CONTENT (Feed item content) - Figma node: Feed item content
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white p-4">
          <div className="flex flex-col gap-4">

            {/* Deal type label - Figma node: Solid label */}
            <div className="inline-flex w-fit items-center rounded border border-[#b3b7c4] px-[7px] py-1">
              <span className="text-[8px] font-bold uppercase leading-[8px] tracking-[1px] text-[#81879c]">
                {dealTypeLabel}
              </span>
            </div>

            {/* Title & Description - Figma node: Content */}
            <div className="flex flex-col gap-1">
              {/* Title */}
              <h3 className="text-lg font-bold leading-[27px] text-[#0d1531]">
                {name}
              </h3>

              {/* Description - only if showDescription */}
              {showDescription && (
                <p className="h-[60px] overflow-hidden text-sm font-normal leading-5 tracking-[0.4px] text-[#676c7e]">
                  {description}
                </p>
              )}
            </div>

            {/* Value Tags Section - only if valueTag */}
            {valueTag && (
              <div className="flex flex-col gap-3">
                {/* Discount & Value badges */}
                <div className="flex flex-wrap gap-2">
                  {/* Green discount badge - only if discountValue */}
                  {discountValue && formattedDiscount && (
                    <ColorLabel text={formattedDiscount} color="green" />
                  )}

                  {/* Blue value badge - only if priceValue */}
                  {priceValue && formattedValue && (
                    <ColorLabel text={formattedValue} color="blue" />
                  )}
                </div>

                {/* Price difference - only if priceDifference */}
                {priceDifference && (
                  <p className="text-base font-bold leading-[22px] text-[#0d1531]">
                    <span className="text-[#9a9fb0] line-through">
                      ${oldPrice!.toLocaleString()}
                    </span>{' '}
                    ${newPrice!.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Investment Levels - only if present */}
            {investmentLevels.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {visibleLevels.map((level, idx) => (
                  <ColorLabel key={idx} text={level.name} color="grey" />
                ))}
                {remainingCount > 0 && (
                  <span className="text-xs font-normal leading-[18px] tracking-[0.4px] text-[#676c7e]">
                    +{remainingCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER (Feed item actions) - Figma node: Feed item actions
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="border-t border-[#f2f3f5] bg-white p-4">
          <span className="text-sm font-semibold leading-6 tracking-[0.4px] text-[#0038ff]">
            View offer
          </span>
        </div>
      </div>
    </Link>
  );
}
