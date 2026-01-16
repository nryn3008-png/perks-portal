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
import { Star } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { formatPerkValue } from '@/lib/utils';
import type { PerkListItem } from '@/types';

interface PerkCardProps {
  perk: PerkListItem;
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
      className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100"
      aria-hidden="true"
    >
      {showLogo && (
        <Image
          src={logo}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
          loading="lazy"
          unoptimized={logo.startsWith('/')} // Local images don't need optimization
          onError={() => setImageError(true)}
        />
      )}
      {showFavicon && (
        <Image
          src={faviconUrl}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
          loading="lazy"
          unoptimized // Google favicon service handles optimization
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

export function PerkCard({ perk }: PerkCardProps) {
  // Safely get provider name with fallback
  const providerName = perk.provider?.name?.trim() || 'Unknown Provider';

  // Safely get description with fallback
  const description = perk.shortDescription?.trim() || 'No description available';

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
            <VendorIcon
              logo={perk.provider?.logo}
              faviconUrl={perk.provider?.faviconUrl}
              providerName={providerName}
            />

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
        </div>
      </Card>
    </Link>
  );
}
