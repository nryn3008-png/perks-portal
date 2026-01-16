import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Clock,
  CheckCircle,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { VendorIcon } from '@/components/perks';
import { formatPerkValue, formatRelativeTime } from '@/lib/utils';
import { PERK_STATUS_CONFIG } from '@/lib/constants';
import { perksService } from '@/lib/api';

/**
 * Perk Detail Page
 * Shows full perk information with redemption options
 *
 * Visual redesign with improved:
 * - Header hierarchy and spacing
 * - Value presentation
 * - Content readability
 * - Redemption card styling
 *
 * NO changes to data flow, API calls, or business logic.
 */

interface PerkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PerkDetailPage({ params }: PerkDetailPageProps) {
  const { id } = await params;

  // Fetch perk from real API (or mock fallback)
  const result = await perksService.getPerk(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const perk = result.data;

  const statusConfig = PERK_STATUS_CONFIG[perk.status];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back navigation - improved focus state */}
      <Link
        href="/perks"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-md px-1 -ml-1"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Perks
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* ============================================
              HEADER SECTION - Improved hierarchy
              ============================================ */}
          <header className="space-y-4">
            {/* Vendor + Title row */}
            <div className="flex items-start gap-5">
              <VendorIcon
                logo={perk.provider.logo}
                faviconUrl={perk.provider.faviconUrl}
                name={perk.provider.name}
                size="lg"
                className="flex-shrink-0 shadow-sm"
              />

              <div className="flex-1 min-w-0">
                {/* Vendor name - subtle */}
                <p className="text-sm font-medium text-slate-500 mb-1">
                  {perk.provider.name}
                </p>

                {/* Title - strongest visual element */}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {perk.title}
                </h1>
              </div>
            </div>

            {/* Meta row - status, category, expiry */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Badge
                variant={perk.status === 'active' ? 'success' : 'default'}
                className={`${statusConfig.bgClass} ${statusConfig.textClass} ${statusConfig.borderClass} border`}
              >
                {statusConfig.label}
              </Badge>

              <span className="flex items-center gap-1.5 text-sm text-slate-600">
                <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                {perk.category.name}
              </span>

              {perk.expiresAt && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Expires {formatRelativeTime(perk.expiresAt)}
                </span>
              )}
            </div>
          </header>

          {/* ============================================
              VALUE HIGHLIGHT - Improved presentation
              ============================================ */}
          <section
            className="rounded-2xl bg-gradient-to-br from-brand-50 via-brand-50 to-brand-100 p-6 sm:p-8 border border-brand-100"
            aria-labelledby="value-heading"
          >
            <p
              id="value-heading"
              className="text-sm font-semibold uppercase tracking-wide text-brand-600 mb-2"
            >
              Offer Value
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-brand-900">
              {formatPerkValue(perk.value)}
            </p>
          </section>

          {/* ============================================
              ABOUT SECTION - Improved readability
              ============================================ */}
          <section aria-labelledby="about-heading">
            <h2
              id="about-heading"
              className="text-lg font-semibold text-slate-900 mb-4"
            >
              About this Perk
            </h2>
            <div className="prose prose-slate prose-sm sm:prose-base max-w-none">
              <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                {perk.fullDescription}
              </p>
            </div>
          </section>

          {/* ============================================
              ELIGIBILITY SECTION - Improved card styling
              ============================================ */}
          {perk.eligibility && (
            <section aria-labelledby="eligibility-heading">
              <h2
                id="eligibility-heading"
                className="text-lg font-semibold text-slate-900 mb-4"
              >
                Eligibility Requirements
              </h2>
              <Card className="border-slate-200">
                <CardContent className="p-5 sm:p-6">
                  <ul className="space-y-3" role="list">
                    {perk.eligibility.fundingStages && (
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                          aria-hidden="true"
                        />
                        <span className="text-slate-700">
                          <span className="font-medium">Funding stage:</span>{' '}
                          {perk.eligibility.fundingStages.join(', ')}
                        </span>
                      </li>
                    )}
                    {perk.eligibility.maxEmployees && (
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                          aria-hidden="true"
                        />
                        <span className="text-slate-700">
                          <span className="font-medium">Team size:</span>{' '}
                          Maximum {perk.eligibility.maxEmployees} employees
                        </span>
                      </li>
                    )}
                    {perk.eligibility.maxRevenue && (
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                          aria-hidden="true"
                        />
                        <span className="text-slate-700">
                          <span className="font-medium">Revenue:</span>{' '}
                          Under ${(perk.eligibility.maxRevenue / 1000000).toFixed(1)}M
                        </span>
                      </li>
                    )}
                    {perk.eligibility.customRequirements && (
                      <li className="flex items-start gap-3 text-sm">
                        <AlertCircle
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500"
                          aria-hidden="true"
                        />
                        <span className="text-slate-700">
                          {perk.eligibility.customRequirements}
                        </span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        {/* ============================================
            REDEMPTION SIDEBAR - Improved visual grouping
            ============================================ */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-24 border-slate-200 shadow-sm">
            <CardContent className="p-0">
              {/* Card header */}
              <div className="p-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">
                  Redeem this Perk
                </h3>
              </div>

              {/* Card body */}
              <div className="p-6 space-y-5">
                {/* Promo code - if applicable */}
                {perk.redemption.code && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Promo Code
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 font-mono text-sm font-medium text-slate-800">
                        {perk.redemption.code}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label="Copy promo code"
                        className="flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {perk.redemption.instructions && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      How to Redeem
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {perk.redemption.instructions}
                    </p>
                  </div>
                )}

                {/* Primary CTA - visually dominant */}
                {perk.redemption.url && (
                  <a
                    href={perk.redemption.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-brand-700 active:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Redeem Offer
                  </a>
                )}

                {perk.redemption.type === 'contact' && perk.redemption.contactEmail && (
                  <a
                    href={`mailto:${perk.redemption.contactEmail}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-brand-700 active:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    Contact {perk.provider.name}
                  </a>
                )}
              </div>

              {/* Provider footer */}
              <div className="p-6 pt-0">
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                    Provided by
                  </p>
                  <div className="flex items-center gap-3">
                    <VendorIcon
                      logo={perk.provider.logo}
                      faviconUrl={perk.provider.faviconUrl}
                      name={perk.provider.name}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {perk.provider.name}
                      </p>
                      {perk.provider.website && (
                        <a
                          href={perk.provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-600 hover:text-brand-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                        >
                          Visit website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
