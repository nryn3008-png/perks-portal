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
import { perksService, vendorsService } from '@/lib/api';
import type { GetProvenDeal, GetProvenVendor } from '@/types';
import { Building2, Globe, Hash, Database } from 'lucide-react';

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

/**
 * Placeholder Gift Icon - Figma design system fallback for vendor logo
 * Figma Source: https://www.figma.com/design/nKM13OcIYIJhSyop1XhjRC/?node-id=4982-15336
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

  // Fetch vendor data if vendor_id exists
  let vendor: GetProvenVendor | null = null;
  if (offer.vendor_id) {
    const vendorResult = await vendorsService.getVendorById(String(offer.vendor_id));
    if (vendorResult.success && vendorResult.data) {
      vendor = vendorResult.data;
    }
  }

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
            {/* Vendor logo + name row - Figma design pattern */}
            <div className="flex items-center gap-3">
              {/* Vendor logo - 48x48 with Figma placeholder fallback */}
              {vendor?.logo ? (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-[#ecedf0]">
                  <Image
                    src={vendor.logo}
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-[#ecedf0]">
                  <PlaceholderGiftIcon />
                </div>
              )}

              {/* Vendor name - only if available */}
              {vendor?.name && (
                <p className="flex-1 text-base font-bold leading-[22px] text-[#3d445a]">
                  {vendor.name}
                </p>
              )}
            </div>

            {/* Title row */}
            <div className="space-y-1">
              {/* Deal type - subtle */}
              {offer.deal_type && (
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                  {offer.deal_type}
                </p>
              )}

              {/* Name - strongest visual element */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {offer.name}
              </h1>
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

          {/* Vendor Information Section */}
          {vendor && (
            <section aria-labelledby="vendor-heading">
              <h2
                id="vendor-heading"
                className="text-lg font-semibold text-slate-900 mb-4"
              >
                <Building2 className="inline-block h-5 w-5 mr-2 text-slate-400" />
                Vendor Information
              </h2>
              <Card className="border-slate-200">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Vendor Logo */}
                    {vendor.logo ? (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={vendor.logo}
                          alt=""
                          width={56}
                          height={56}
                          className="h-full w-full object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <Building2 className="h-7 w-7 text-slate-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Vendor Name */}
                      <h3 className="text-base font-semibold text-slate-900">
                        {vendor.name}
                      </h3>

                      {/* Vendor ID */}
                      <p className="text-xs text-slate-500 mt-0.5">
                        Vendor ID: {vendor.id}
                      </p>

                      {/* Vendor Website */}
                      {vendor.website && (
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-sm text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          {vendor.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      )}

                      {/* Primary Service */}
                      {vendor.primary_service && (
                        <p className="text-sm text-slate-600 mt-2">
                          {vendor.primary_service}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* API Data Section - Shows all raw offer fields */}
          <section aria-labelledby="api-data-heading">
            <h2
              id="api-data-heading"
              className="text-lg font-semibold text-slate-900 mb-4"
            >
              <Database className="inline-block h-5 w-5 mr-2 text-slate-400" />
              All Offer Data (API)
            </h2>
            <Card className="border-slate-200">
              <CardContent className="p-5 sm:p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {/* Offer ID */}
                  <div>
                    <dt className="text-slate-500 font-medium">Offer ID</dt>
                    <dd className="text-slate-900 font-mono">{offer.id}</dd>
                  </div>

                  {/* Vendor ID */}
                  <div>
                    <dt className="text-slate-500 font-medium">Vendor ID</dt>
                    <dd className="text-slate-900 font-mono">{offer.vendor_id}</dd>
                  </div>

                  {/* Deal Type */}
                  {offer.deal_type && (
                    <div>
                      <dt className="text-slate-500 font-medium">Deal Type</dt>
                      <dd className="text-slate-900">{offer.deal_type}</dd>
                    </div>
                  )}

                  {/* Estimated Value Type */}
                  {offer.estimated_value_type && (
                    <div>
                      <dt className="text-slate-500 font-medium">Estimated Value Type</dt>
                      <dd className="text-slate-900">{offer.estimated_value_type}</dd>
                    </div>
                  )}

                  {/* Estimated Value - only show if > 0 */}
                  {offer.estimated_value !== null && offer.estimated_value > 0 && (
                    <div>
                      <dt className="text-slate-500 font-medium">Estimated Value</dt>
                      <dd className="text-slate-900">${offer.estimated_value?.toLocaleString()}</dd>
                    </div>
                  )}

                  {/* Old Price */}
                  {offer.old_price !== null && (
                    <div>
                      <dt className="text-slate-500 font-medium">Old Price</dt>
                      <dd className="text-slate-900">${offer.old_price?.toLocaleString()}</dd>
                    </div>
                  )}

                  {/* New Price */}
                  {offer.new_price !== null && (
                    <div>
                      <dt className="text-slate-500 font-medium">New Price</dt>
                      <dd className="text-slate-900">${offer.new_price?.toLocaleString()}</dd>
                    </div>
                  )}

                  {/* Discount */}
                  {offer.discount !== null && (
                    <div>
                      <dt className="text-slate-500 font-medium">Discount</dt>
                      <dd className="text-slate-900">
                        {offer.discount}{offer.discount_type === 'percentage' ? '%' : ''}
                        {offer.discount_type && ` (${offer.discount_type})`}
                      </dd>
                    </div>
                  )}

                  {/* Applicable To Type */}
                  {offer.applicable_to_type && (
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500 font-medium">Applicable To</dt>
                      <dd className="text-slate-900">{offer.applicable_to_type}</dd>
                    </div>
                  )}

                  {/* Offer Categories */}
                  {offer.offer_categories.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500 font-medium">Offer Categories</dt>
                      <dd className="flex flex-wrap gap-1 mt-1">
                        {offer.offer_categories.map((cat, idx) => (
                          <Badge key={idx} variant="default">{cat.name}</Badge>
                        ))}
                      </dd>
                    </div>
                  )}

                  {/* Investment Levels */}
                  {offer.investment_levels.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500 font-medium">Investment Levels</dt>
                      <dd className="flex flex-wrap gap-1 mt-1">
                        {offer.investment_levels.map((level, idx) => (
                          <Badge key={idx} variant="info">{level.name}</Badge>
                        ))}
                      </dd>
                    </div>
                  )}

                  {/* GetProven Link */}
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500 font-medium">GetProven Link</dt>
                    <dd>
                      <a
                        href={offer.getproven_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 hover:underline break-all"
                      >
                        {offer.getproven_link}
                      </a>
                    </dd>
                  </div>

                  {/* Terms and Conditions URL */}
                  {offer.terms_and_conditions && (
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500 font-medium">Terms URL</dt>
                      <dd>
                        <a
                          href={offer.terms_and_conditions}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-700 hover:underline break-all"
                        >
                          {offer.terms_and_conditions}
                        </a>
                      </dd>
                    </div>
                  )}

                  {/* Coupon Code */}
                  {offer.coupon_code && (
                    <div>
                      <dt className="text-slate-500 font-medium">Coupon Code</dt>
                      <dd className="font-mono text-slate-900">{offer.coupon_code}</dd>
                    </div>
                  )}

                  {/* Contact Email */}
                  {offer.contact_email && (
                    <div>
                      <dt className="text-slate-500 font-medium">Contact Email</dt>
                      <dd className="text-slate-900">{offer.contact_email}</dd>
                    </div>
                  )}

                  {/* Details URL */}
                  {offer.details_url && (
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500 font-medium">Details URL</dt>
                      <dd>
                        <a
                          href={offer.details_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-700 hover:underline break-all"
                        >
                          {offer.details_url}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </section>
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
