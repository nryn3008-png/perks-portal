import Link from 'next/link';
import {
  ArrowRight,
  Gift,
  DollarSign,
  Sparkles,
  TrendingUp,
  Star,
  AlertCircle,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { perksService } from '@/lib/api';
import { formatPerkValue } from '@/lib/utils';

/**
 * Dashboard Home Page
 * Powered by real GetProven API data
 * Founder-first experience with visual hierarchy
 */
export default async function DashboardPage() {
  // Fetch all data from real API
  const [featuredResult, stats] = await Promise.all([
    perksService.getFeaturedPerks(4),
    perksService.getDashboardStats(),
  ]);

  const featuredPerks = featuredResult.success ? featuredResult.data : [];

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
            {/*
              Navigation styled as button. Using Link (not Button inside Link)
              to avoid nested interactive elements. Focus ring uses white with
              offset for visibility on dark gradient background.
            */}
            <Link
              href="/perks"
              className={[
                // Base button styles
                'inline-flex items-center justify-center gap-2',
                'min-h-[44px] px-5 rounded-lg font-medium text-sm',
                // Colors with sufficient contrast (white bg, slate-900 text = 15.4:1)
                'bg-white text-slate-900',
                // Interaction states
                'hover:bg-slate-100',
                'active:bg-slate-200',
                // Focus: white ring visible on dark background
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                // Transition
                'transition-colors duration-150',
              ].join(' ')}
            >
              Browse All Perks
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        {/* Background decoration */}
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
                  <p className="mt-1 text-sm text-blue-600/70">ready to redeem</p>
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
          <Link href="/perks?featured=true">
            <Button variant="ghost" size="sm" className="text-slate-600">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {featuredPerks.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPerks.map((perk) => (
              <Link key={perk.id} href={`/perks/${perk.slug}`}>
                <Card hover className="group h-full">
                  <div className="p-5">
                    {/* Provider logo */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
                        <span className="text-base font-semibold text-slate-500">
                          {perk.provider.name.charAt(0)}
                        </span>
                      </div>
                      <Badge variant="info" className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3" aria-hidden="true" />
                        Featured
                      </Badge>
                    </div>

                    {/* Provider name */}
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {perk.provider.name}
                    </p>

                    {/* Title */}
                    <h3 className="mt-1 font-semibold text-slate-900 line-clamp-1 group-hover:text-brand-600">
                      {perk.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                      {perk.shortDescription}
                    </p>

                    {/* Value */}
                    <div className="mt-4">
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                        <TrendingUp className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                        {formatPerkValue(perk.value)}
                      </span>
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
