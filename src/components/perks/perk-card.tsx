/**
 * Perk Card component
 * Displays a perk in the listing grid
 * Hardened for real-world API data with graceful fallbacks
 *
 * Icon sourcing priority:
 * 1. provider.logo (if available from API)
 * 2. provider.faviconUrl (derived from vendor website domain)
 * 3. Provider initial letter (fallback)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPerkValue, formatCurrency } from '@/lib/utils';
import type { PerkListItem } from '@/types';

interface PerkCardProps {
  perk: PerkListItem;
  isLoading?: boolean;
}

/**
 * Vendor icon component with fallback chain:
 * logo -> favicon -> initial letter
 */
function VendorIcon({
  logo,
  faviconUrl,
  providerName,
}: {
  logo?: string;
  faviconUrl?: string;
  providerName: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const initial = providerName.charAt(0).toUpperCase();

  // Determine which image source to use
  const showLogo = logo && !imageError;
  const showFavicon = !showLogo && faviconUrl && !faviconError;
  const showInitial = !showLogo && !showFavicon;

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-slate-100"
      aria-hidden="true"
    >
      {showLogo && (
        <Image
          src={logo}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          loading="lazy"
          unoptimized={logo.startsWith('/')}
          onError={() => setImageError(true)}
        />
      )}
      {showFavicon && (
        <Image
          src={faviconUrl}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          loading="lazy"
          unoptimized
          onError={() => setFaviconError(true)}
        />
      )}
      {showInitial && (
        <span className="text-lg font-semibold text-slate-400">
          {initial}
        </span>
      )}
    </div>
  );
}

/**
 * Skeleton loader for PerkCard
 */
function PerkCardSkeleton() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_3px_10px_0px_rgba(0,0,0,0.1)]">
      {/* Header skeleton */}
      <div className="border-b border-slate-100 p-4">
        <div className="flex gap-3">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded bg-slate-200" />
          <div className="flex flex-1 flex-col justify-center gap-1.5 pt-0.5">
            <div className="h-3.5 w-32 animate-pulse rounded-full bg-slate-200" />
            <div className="h-3 w-48 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col gap-4 p-4">
        <div className="h-4 w-56 animate-pulse rounded-full bg-slate-200" />
        <div className="flex flex-col gap-1">
          <div className="h-3.5 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-3.5 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-3.5 w-28 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex h-14 items-center border-t border-slate-100 p-4">
        <div className="h-6 w-6 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

/**
 * Value badge component for displaying discount/value labels
 */
function ValueBadge({
  text,
  variant = 'green',
}: {
  text: string;
  variant?: 'green' | 'blue';
}) {
  const variants = {
    green: 'bg-green-50 border-green-100 text-green-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0 text-sm font-semibold leading-6 tracking-wide ${variants[variant]} border`}
    >
      {text}
    </span>
  );
}

/**
 * Get the value type label for display
 */
function getValueTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    percentage: 'Discount',
    fixed: 'Savings',
    credits: 'Credits',
    custom: 'Offer',
  };
  return labels[type] || 'Offer';
}

export function PerkCard({ perk, isLoading = false }: PerkCardProps) {
  if (isLoading) {
    return <PerkCardSkeleton />;
  }

  // Safely get provider name with fallback
  const providerName = perk.provider?.name?.trim() || 'Unknown Provider';

  // Safely get description with fallback
  const description =
    perk.shortDescription?.trim() || 'No description available';

  // Safely format value with fallback
  const formattedValue = perk.value
    ? formatPerkValue(perk.value)
    : 'Special offer';

  // Get the value type label (e.g., "Discount", "Credits")
  const valueTypeLabel = perk.value?.type
    ? getValueTypeLabel(perk.value.type)
    : 'Offer';

  // Get category name for services display
  const categoryName = perk.category?.name || '';

  // Calculate secondary value badge (e.g., "$3K value")
  const secondaryValue =
    perk.value?.amount && perk.value?.type === 'credits'
      ? formatCurrency(perk.value.amount, perk.value.currency)
      : null;

  return (
    <Link
      href={`/perks/${perk.slug}`}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_3px_10px_0px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0px_6px_20px_0px_rgba(0,0,0,0.15)]">
        {/* Header with vendor info */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex gap-3">
            <VendorIcon
              logo={perk.provider?.logo}
              faviconUrl={perk.provider?.faviconUrl}
              providerName={providerName}
            />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pt-0.5">
              <h3 className="text-sm font-bold leading-5 text-slate-900 tracking-wide">
                {providerName}
              </h3>
              {categoryName && (
                <p className="truncate text-xs leading-[18px] tracking-wide text-slate-500">
                  {categoryName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Value type label */}
          <span className="inline-flex w-fit items-center rounded border border-slate-400 px-2 py-1 text-[8px] font-bold uppercase leading-none tracking-widest text-slate-500">
            {valueTypeLabel}
          </span>

          {/* Title and description */}
          <div className="flex flex-col gap-1">
            <h4 className="text-lg font-bold leading-[27px] text-slate-900 line-clamp-2">
              {perk.title || 'Untitled Perk'}
            </h4>
            <p className="text-sm leading-5 tracking-wide text-slate-500 line-clamp-3">
              {description}
            </p>
          </div>

          {/* Value badges */}
          <div className="flex flex-wrap gap-2.5">
            <ValueBadge text={formattedValue} variant="green" />
            {secondaryValue && (
              <ValueBadge text={`${secondaryValue} value`} variant="blue" />
            )}
          </div>
        </div>

        {/* Footer with action */}
        <div className="border-t border-slate-100 p-4">
          <span className="text-sm font-semibold leading-6 tracking-wide text-blue-600">
            View offer
          </span>
        </div>
      </div>
    </Link>
  );
}
