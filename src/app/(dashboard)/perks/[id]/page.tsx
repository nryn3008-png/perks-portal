import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  Tag,
  DollarSign,
  Mail,
  Info,
} from 'lucide-react';
import { Badge, Card, CardContent } from '@/components/ui';
import { CopyButton } from '@/components/perks';
import { perksService } from '@/lib/api';
import type { GetProvenDeal } from '@/types';

/**
 * Offer Detail Page
 * STRICT: Uses ONLY GetProven API data
 *
 * Base content: name, description, deal_type, estimated_value, old_price,
 * new_price, discount, discount_type, applicable_to_type, offer_categories,
 * investment_levels
 *
 * Redemption section: ONLY rendered if at least one redemption field exists
 * (redeem_steps, coupon_code, contact_email, details_url)
 *
 * Terms section: terms_and_conditions_text (render), terms_and_conditions (link)
 *
 * NO user action tracking, NO redemption state storage
 */

interface OfferDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Format value for display
 */
function formatValue(value: number | null): string {
  if (!value) return '';
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

/**
 * Format discount for display
 */
function formatDiscount(discount: number | null, discountType: string | null): string | null {
  if (!discount) return null;
  if (discountType === 'percentage') {
    return `${discount}% off`;
  }
  return `$${discount.toLocaleString()} off`;
}

/**
 * Check if offer has any redemption details
 */
function hasRedemptionDetails(offer: GetProvenDeal): boolean {
  return !!(
    offer.redeem_steps ||
    offer.coupon_code ||
    offer.contact_email ||
    offer.details_url
  );
}

export default async function OfferDetailPage({ params }: OfferDetailPageProps) {
  const { id } = await params;

  // Fetch offer from real API
  const result = await perksService.getOfferById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const offer = result.data;
  const discountDisplay = formatDiscount(offer.discount, offer.discount_type);
  const showRedemption = hasRedemptionDetails(offer);
  const hasTerms = offer.terms_and_conditions_text || offer.terms_and_conditions;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back navigation */}
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
          {/* Header Section */}
          <header className="space-y-4">
            {/* Image + Title row */}
            <div className="flex items-start gap-5">
              {/* Offer image */}
              {offer.picture ? (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 shadow-sm">
                  <Image
                    src={offer.picture}
                    alt=""
                    width={64}
                    height={64}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 shadow-sm">
                  <span className="text-2xl font-semibold text-slate-400">
                    {offer.name.charAt(0)}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Deal type - subtle */}
                {offer.deal_type && (
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-500 mb-1">
                    {offer.deal_type}
                  </p>
                )}

                {/* Name - strongest visual element */}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {offer.name}
                </h1>
              </div>
            </div>

            {/* Meta row - categories, investment levels */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Categories */}
              {offer.offer_categories.length > 0 && (
                offer.offer_categories.map((cat) => (
                  <span
                    key={cat.name}
                    className="flex items-center gap-1.5 text-sm text-slate-600"
                  >
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    {cat.name}
                  </span>
                ))
              )}

              {/* Investment levels */}
              {offer.investment_levels.length > 0 && (
                offer.investment_levels.map((level) => (
                  <Badge key={level.name} variant="default" className="text-xs">
                    {level.name}
                  </Badge>
                ))
              )}
            </div>
          </header>

          {/* Value Highlight */}
          {(offer.estimated_value || discountDisplay || offer.old_price || offer.new_price) && (
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

              <div className="space-y-2">
                {/* Estimated value */}
                {offer.estimated_value && (
                  <p className="text-3xl sm:text-4xl font-bold text-brand-900">
                    {formatValue(offer.estimated_value)}
                    {offer.estimated_value_type && (
                      <span className="ml-2 text-lg font-normal text-brand-600">
                        {offer.estimated_value_type}
                      </span>
                    )}
                  </p>
                )}

                {/* Discount */}
                {discountDisplay && (
                  <Badge variant="success" className="text-sm px-3 py-1">
                    {discountDisplay}
                  </Badge>
                )}

                {/* Price comparison */}
                {(offer.old_price || offer.new_price) && (
                  <div className="flex items-center gap-3 pt-2">
                    {offer.old_price && (
                      <span className="text-lg text-slate-400 line-through">
                        ${offer.old_price.toLocaleString()}
                      </span>
                    )}
                    {offer.new_price && (
                      <span className="text-xl font-semibold text-brand-700">
                        ${offer.new_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Description Section */}
          {offer.description && (
            <section aria-labelledby="about-heading">
              <h2
                id="about-heading"
                className="text-lg font-semibold text-slate-900 mb-4"
              >
                About this Offer
              </h2>
              <div
                className="prose prose-slate prose-sm sm:prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: offer.description }}
              />
            </section>
          )}

          {/* Eligibility / Applicable To */}
          {offer.applicable_to_type && (
            <section aria-labelledby="eligibility-heading">
              <h2
                id="eligibility-heading"
                className="text-lg font-semibold text-slate-900 mb-4"
              >
                Who Can Redeem
              </h2>
              <Card className="border-slate-200">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start gap-3 text-sm">
                    <Info
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500"
                      aria-hidden="true"
                    />
                    <span className="text-slate-700">
                      {offer.applicable_to_type}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Terms and Conditions */}
          {hasTerms && (
            <section aria-labelledby="terms-heading">
              <h2
                id="terms-heading"
                className="text-lg font-semibold text-slate-900 mb-4"
              >
                Terms and Conditions
              </h2>
              <Card className="border-slate-200">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Terms text */}
                  {offer.terms_and_conditions_text && (
                    <div
                      className="prose prose-slate prose-sm max-w-none text-slate-600"
                      dangerouslySetInnerHTML={{ __html: offer.terms_and_conditions_text }}
                    />
                  )}

                  {/* Terms URL link */}
                  {offer.terms_and_conditions && (
                    <a
                      href={offer.terms_and_conditions}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      View Full Terms
                    </a>
                  )}
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        {/* Redemption Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-24 border-slate-200 shadow-sm">
            <CardContent className="p-0">
              {/* Card header */}
              <div className="p-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">
                  Redeem this Offer
                </h3>
              </div>

              {/* Card body */}
              <div className="p-6 space-y-5">
                {/* Redemption details - ONLY if at least one field exists */}
                {showRedemption && (
                  <>
                    {/* Coupon code */}
                    {offer.coupon_code && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Promo Code
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 font-mono text-sm font-medium text-slate-800">
                            {offer.coupon_code}
                          </code>
                          <CopyButton text={offer.coupon_code} />
                        </div>
                      </div>
                    )}

                    {/* Redeem steps */}
                    {offer.redeem_steps && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          How to Redeem
                        </p>
                        <div
                          className="prose prose-slate prose-sm max-w-none text-slate-600"
                          dangerouslySetInnerHTML={{ __html: offer.redeem_steps }}
                        />
                      </div>
                    )}

                    {/* Contact email */}
                    {offer.contact_email && (
                      <a
                        href={`mailto:${offer.contact_email}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        {offer.contact_email}
                      </a>
                    )}

                    {/* Details URL */}
                    {offer.details_url && (
                      <a
                        href={offer.details_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        More Details
                      </a>
                    )}
                  </>
                )}

                {/* Primary CTA - GetProven link (always present) */}
                <a
                  href={offer.getproven_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-brand-700 active:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Redeem Offer
                </a>

                {/* Value highlight in sidebar */}
                {(offer.estimated_value || discountDisplay) && (
                  <div className="border-t border-slate-100 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                      Offer Value
                    </p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                      <span className="font-semibold text-slate-900">
                        {offer.estimated_value
                          ? formatValue(offer.estimated_value)
                          : discountDisplay}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
