import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { formatPerkValue, formatDate, formatRelativeTime } from '@/lib/utils';
import { PERK_STATUS_CONFIG } from '@/lib/constants';
import { getMockPerk } from '@/lib/api';

/**
 * Perk Detail Page
 * Shows full perk information with redemption options
 */

interface PerkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PerkDetailPage({ params }: PerkDetailPageProps) {
  const { id } = await params;

  // TODO: Replace with actual API call
  const perk = getMockPerk(id);

  if (!perk) {
    notFound();
  }

  const statusConfig = PERK_STATUS_CONFIG[perk.status];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back button */}
      <Link
        href="/perks"
        className="mb-6 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Perks
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
              {perk.provider.logo ? (
                <img
                  src={perk.provider.logo}
                  alt={perk.provider.name}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <span className="text-2xl font-semibold text-slate-400">
                  {perk.provider.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">
                {perk.provider.name}
              </p>
              <h1 className="text-2xl font-bold text-slate-900">{perk.title}</h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant={perk.status === 'active' ? 'success' : 'default'}
                  className={`${statusConfig.bgClass} ${statusConfig.textClass}`}
                >
                  {statusConfig.label}
                </Badge>

                <span className="text-sm text-slate-500">{perk.category.name}</span>

                {perk.expiresAt && (
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Expires {formatRelativeTime(perk.expiresAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Value Highlight */}
          <div className="rounded-xl bg-gradient-to-r from-brand-50 to-brand-100 p-6">
            <p className="text-sm font-medium text-brand-700">Offer Value</p>
            <p className="text-3xl font-bold text-brand-900">
              {formatPerkValue(perk.value)}
            </p>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              About this Perk
            </h2>
            <div className="prose prose-slate max-w-none">
              {/* TODO: Render markdown content properly */}
              <p className="whitespace-pre-wrap text-slate-600">
                {perk.fullDescription}
              </p>
            </div>
          </div>

          {/* Eligibility */}
          {perk.eligibility && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                Eligibility
              </h2>
              <Card>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {perk.eligibility.fundingStages && (
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <span>
                          Funding stage:{' '}
                          {perk.eligibility.fundingStages.join(', ')}
                        </span>
                      </li>
                    )}
                    {perk.eligibility.maxEmployees && (
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <span>
                          Maximum {perk.eligibility.maxEmployees} employees
                        </span>
                      </li>
                    )}
                    {perk.eligibility.maxRevenue && (
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <span>
                          Revenue under $
                          {(perk.eligibility.maxRevenue / 1000000).toFixed(1)}M
                        </span>
                      </li>
                    )}
                    {perk.eligibility.customRequirements && (
                      <li className="flex items-start gap-2 text-sm">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                        <span>{perk.eligibility.customRequirements}</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar - Redemption Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold text-slate-900">
                Redeem this Perk
              </h3>

              {/* Promo code if applicable */}
              {perk.redemption.code && (
                <div className="mb-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Promo Code
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm">
                      {perk.redemption.code}
                    </code>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    {/* TODO: Implement copy to clipboard */}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {perk.redemption.instructions && (
                <div className="mb-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    How to Redeem
                  </p>
                  <p className="text-sm text-slate-600">
                    {perk.redemption.instructions}
                  </p>
                </div>
              )}

              {/* CTA Button */}
              {perk.redemption.url && (
                <Button className="w-full" size="lg">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Redeem Offer
                </Button>
              )}

              {perk.redemption.type === 'contact' && perk.redemption.contactEmail && (
                <Button className="w-full" size="lg">
                  Contact {perk.provider.name}
                </Button>
              )}

              {/* TODO: Track redemption clicks */}

              {/* Provider info */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Provided by
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100">
                    {perk.provider.logo ? (
                      <img
                        src={perk.provider.logo}
                        alt={perk.provider.name}
                        className="h-5 w-5 object-contain"
                      />
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        {perk.provider.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {perk.provider.name}
                    </p>
                    {perk.provider.website && (
                      <a
                        href={perk.provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Visit website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
