'use client';

/**
 * Offer Card Component
 * Displays a single offer from the GetProven API
 *
 * STRICT: Shows ONLY API-provided fields
 * - NO claimed/redeemed states
 * - NO expiry indicators
 * - NO popularity indicators
 */

import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge } from '@/components/ui';
import type { GetProvenDeal } from '@/types';

interface OfferCardProps {
  offer: GetProvenDeal;
}

/**
 * Strip HTML tags from description
 */
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Truncate text to max length
 */
function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format discount display
 */
function formatDiscount(discount: number | null, discountType: string | null): string | null {
  if (!discount) return null;
  if (discountType === 'percentage') {
    return `${discount}% off`;
  }
  return `$${discount.toLocaleString()} off`;
}

/**
 * Format estimated value
 */
function formatValue(value: number | null): string | null {
  if (!value) return null;
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K value`;
  }
  return `$${value.toLocaleString()} value`;
}

export function OfferCard({ offer }: OfferCardProps) {
  const description = truncate(stripHtml(offer.description), 100);
  const discount = formatDiscount(offer.discount, offer.discount_type);
  const estimatedValue = formatValue(offer.estimated_value);
  const hasPricing = offer.old_price !== null && offer.new_price !== null;

  return (
    <Link
      href={`/perks/${offer.id}`}
      className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <Card hover className="h-full">
        <div className="p-5">
          {/* Image - only show if picture exists */}
          {offer.picture && (
            <div className="mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              <Image
                src={offer.picture}
                alt=""
                width={48}
                height={48}
                className="h-full w-full object-contain"
                unoptimized
              />
            </div>
          )}

          {/* Name */}
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
            {offer.name}
          </h3>

          {/* Description - truncated to 1-2 lines */}
          {description && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {description}
            </p>
          )}

          {/* Value/Discount section */}
          <div className="mt-4 flex flex-wrap gap-2">
            {/* Discount */}
            {discount && (
              <Badge variant="success" className="text-xs">
                {discount}
              </Badge>
            )}

            {/* Estimated value */}
            {estimatedValue && (
              <Badge variant="info" className="text-xs">
                {estimatedValue}
              </Badge>
            )}

            {/* Deal type */}
            {offer.deal_type && (
              <Badge variant="default" className="text-xs capitalize">
                {offer.deal_type}
              </Badge>
            )}
          </div>

          {/* Pricing - only if both old_price and new_price exist */}
          {hasPricing && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-slate-400 line-through">
                ${offer.old_price?.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                ${offer.new_price?.toLocaleString()}
              </span>
            </div>
          )}

          {/* Categories */}
          {offer.offer_categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {offer.offer_categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Investment levels */}
          {offer.investment_levels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {offer.investment_levels.map((level, idx) => (
                <span
                  key={idx}
                  className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                >
                  {level.name}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-4">
            <span className="text-sm font-medium text-brand-600 group-hover:text-brand-700">
              View Offer →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
