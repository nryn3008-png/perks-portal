import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Gift,
  DollarSign,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { perksService } from '@/lib/api';
import type { GetProvenDeal } from '@/types';

/**
 * Dashboard Home Page
 * STRICT: Uses ONLY real GetProven API data
 */

/**
 * Strip HTML and truncate text
 */
function truncateDescription(html: string, maxLength: number): string {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format estimated value for display
 */
function formatValue(value: number | null): string {
  if (!value) return 'Special offer';
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K value`;
  }
  return `$${value.toLocaleString()} value`;
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

export default async function DashboardPage() {
  // Fetch data from real API
  const [featuredResult, stats] = await Promise.all([
    perksService.getFeaturedOffers(4),
    perksService.getDashboardStats(),
  ]);

  const featuredOffers: GetProvenDeal[] = featuredResult.success ? featuredResult.data : [];

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
        <div className="relative z-10">
          <Badge className="mb-4 border-brand-400/30 bg-brand-500/20 text-brand-300">
            <Sparkles className="mr-1 h-3 w-3" />
            Portfolio Exclusive
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, Founder
          </h1>
          <p className="mt-2 max-w-lg text-lg text-slate-300">
            Your portfolio gives you access to {stats.totalPerks}+ exclusive perks
            worth over {stats.totalValue} in savings.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/perks"
              className={[
                'inline-flex items-center justify-center gap-2',
                'min-h-[44px] px-5 rounded-lg font-medium text-sm',
                'bg-white text-slate-900',
                'hover:bg-slate-100',
                'active:bg-slate-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                'transition-colors duration-150',
              ].join(' ')}
            >
              Browse All Perks
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
      </section>

      {/* Stats Cards */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Total Value */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Total Perks Value</p>
                  <p className="mt-1 text-3xl font-bold text-emerald-900">{stats.totalValue}</p>
                  <p className="mt-1 text-sm text-emerald-600/70">in potential savings</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </Card>

          {/* Available Perks */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Available Perks</p>
                  <p className="mt-1 text-3xl font-bold text-blue-900">{stats.totalPerks}</p>
                  <p className="mt-1 text-sm text-blue-600/70">ready to explore</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Perks */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Featured Perks</h2>
            <p className="mt-1 text-sm text-slate-500">
              Hand-picked offers with the highest value for founders
            </p>
          </div>
          <Link href="/perks">
            <Button variant="ghost" size="sm" className="text-slate-600">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {featuredOffers.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredOffers.map((offer) => (
              <Link key={offer.id} href={`/perks/${offer.id}`}>
                <Card hover className="group h-full">
                  <div className="p-5">
                    {/* Offer image - only show if picture exists */}
                    <div className="mb-4 flex items-center justify-between">
                      {offer.picture ? (
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                          <Image
                            src={offer.picture}
                            alt=""
                            width={44}
                            height={44}
                            className="h-full w-full object-contain"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
                          <span className="text-base font-semibold text-slate-500">
                            {offer.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Deal type */}
                    {offer.deal_type && (
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {offer.deal_type}
                      </p>
                    )}

                    {/* Name */}
                    <h3 className="mt-1 font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-600">
                      {offer.name}
                    </h3>

                    {/* Description */}
                    {offer.description && (
                      <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                        {truncateDescription(offer.description, 80)}
                      </p>
                    )}

                    {/* Value badges */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {formatDiscount(offer.discount, offer.discount_type) && (
                        <Badge variant="success" className="text-xs">
                          {formatDiscount(offer.discount, offer.discount_type)}
                        </Badge>
                      )}
                      {offer.estimated_value && (
                        <Badge variant="info" className="text-xs">
                          {formatValue(offer.estimated_value)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-slate-600">Perks are temporarily unavailable</p>
              <p className="mt-1 text-sm text-slate-400">Please check back later</p>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
