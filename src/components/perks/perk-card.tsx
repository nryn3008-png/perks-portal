/**
 * Perk Card component
 * Displays a perk in the listing grid
 * Hardened for real-world API data with graceful fallbacks
 */

import Link from 'next/link';
import { Star } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { formatPerkValue } from '@/lib/utils';
import { PERK_STATUS_CONFIG } from '@/lib/constants';
import type { PerkListItem } from '@/types';

interface PerkCardProps {
  perk: PerkListItem;
}

// Default status config for unknown statuses
const DEFAULT_STATUS_CONFIG = {
  label: 'Unknown',
  color: 'gray',
  bgClass: 'bg-gray-50',
  textClass: 'text-gray-700',
  borderClass: 'border-gray-200',
};

export function PerkCard({ perk }: PerkCardProps) {
  // Guard against unknown status values from API
  const statusConfig = PERK_STATUS_CONFIG[perk.status] || DEFAULT_STATUS_CONFIG;

  // Safely get provider name with fallback
  const providerName = perk.provider?.name?.trim() || 'Unknown Provider';
  const providerInitial = providerName.charAt(0).toUpperCase();

  // Safely get description with fallback
  const description = perk.shortDescription?.trim() || 'No description available';

  // Safely get category name with fallback
  const categoryName = perk.category?.name?.trim() || 'Uncategorized';

  // Safely format value with fallback
  const formattedValue = perk.value
    ? formatPerkValue(perk.value)
    : 'Special offer';

  return (
    <Link
      href={`/perks/${perk.slug}`}
      className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <Card hover className="h-full">
        <div className="p-5">
          {/* Header with logo and featured badge */}
          <div className="mb-4 flex items-start justify-between">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100"
              aria-hidden="true"
            >
              {perk.provider?.logo ? (
                <img
                  src={perk.provider.logo}
                  alt=""
                  className="h-8 w-8 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    // Hide broken image, fallback will show
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-lg font-semibold text-slate-400">
                  {providerInitial}
                </span>
              )}
            </div>

            {perk.featured && (
              <Badge variant="info" className="flex items-center gap-1">
                <Star className="h-3 w-3" aria-hidden="true" />
                Featured
              </Badge>
            )}
          </div>

          {/* Provider name */}
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {providerName}
          </p>

          {/* Title */}
          <h3 className="mt-1 text-lg font-semibold text-slate-900 line-clamp-2">
            {perk.title || 'Untitled Perk'}
          </h3>

          {/* Description */}
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
            {description}
          </p>

          {/* Value highlight */}
          <div className="mt-4">
            <span className="inline-block rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
              {formattedValue}
            </span>
          </div>

          {/* Footer with category and status */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-500">{categoryName}</span>
            <Badge
              variant={perk.status === 'active' ? 'success' : 'default'}
              className={`${statusConfig.bgClass} ${statusConfig.textClass}`}
            >
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
