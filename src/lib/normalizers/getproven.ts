/**
 * GetProven Data Normalizer
 *
 * Transforms raw GetProven API responses into our internal Perk interface.
 * This is the ONLY place where GetProven-specific field names should appear.
 * If GetProven changes their API, only this file needs updates.
 */

import type {
  Perk,
  PerkListItem,
  PerkCategory,
  PerkValue,
  PerkStatus,
  RedemptionType,
  GetProvenDeal,
  GetProvenCategory,
} from '@/types';

// Server-side only logging (never expose to client)
const logWarning = (message: string, context?: Record<string, unknown>) => {
  if (typeof window === 'undefined') {
    console.warn(`[GetProven Normalizer] ${message}`, context || '');
  }
};

/**
 * Sanitize and truncate text
 */
function sanitizeText(text: unknown, maxLength?: number): string {
  if (text === null || text === undefined) return '';
  const str = String(text).trim();
  if (maxLength && str.length > maxLength) {
    return str.slice(0, maxLength - 3) + '...';
  }
  return str;
}

/**
 * Generate a URL-safe slug from text
 */
function generateSlug(text: string, id: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || id;
}

/**
 * Normalize category name from deal data (internal helper)
 */
function normalizeCategoryFromDeal(category: unknown): { id: string; name: string; slug: string } {
  const name = sanitizeText(category) || 'Uncategorized';
  const slug = generateSlug(name, 'uncategorized');
  return {
    id: slug,
    name,
    slug,
  };
}

/**
 * Parse discount/value information into structured format
 */
function parseValue(deal: GetProvenDeal): PerkValue {
  const discountValue = sanitizeText(deal.discount_value);
  const discountType = sanitizeText(deal.discount_type);

  // Try to extract numeric value
  const numericMatch = discountValue.match(/[\d,]+/);
  const amount = numericMatch ? parseInt(numericMatch[0].replace(/,/g, ''), 10) : undefined;

  // Determine value type
  if (discountValue.includes('%') || discountType?.toLowerCase().includes('percent')) {
    return {
      type: 'percentage',
      amount,
      description: discountValue || 'Discount available',
    };
  }

  if (discountValue.includes('$') || discountValue.toLowerCase().includes('credit')) {
    return {
      type: 'credits',
      amount,
      currency: 'USD',
      description: discountValue || 'Credits available',
    };
  }

  return {
    type: 'custom',
    amount,
    description: discountValue || 'Special offer available',
  };
}

/**
 * Determine perk status from deal data
 */
function parseStatus(deal: GetProvenDeal): PerkStatus {
  if (!deal.is_active) return 'expired';

  if (deal.expiration_date) {
    const expirationDate = new Date(deal.expiration_date);
    if (expirationDate < new Date()) return 'expired';
  }

  return 'active';
}

/**
 * Determine redemption type from deal data
 */
function parseRedemptionType(deal: GetProvenDeal): RedemptionType {
  if (deal.promo_code) return 'code';
  if (deal.redemption_url) return 'link';
  return 'contact';
}

/**
 * Check for missing required fields and log warnings
 */
function validateDeal(deal: GetProvenDeal): void {
  const missingFields: string[] = [];

  if (!deal.title) missingFields.push('title');
  if (!deal.description) missingFields.push('description');
  if (!deal.company_name) missingFields.push('company_name');

  if (missingFields.length > 0) {
    logWarning(`Deal ${deal.id} missing fields: ${missingFields.join(', ')}`, {
      dealId: deal.id,
      title: deal.title,
    });
  }
}

/**
 * Normalize a single GetProven deal into our Perk interface
 */
export function normalizeDeal(deal: GetProvenDeal): Perk {
  validateDeal(deal);

  const title = sanitizeText(deal.title) || 'Untitled Perk';
  const slug = generateSlug(title, deal.id);
  const description = sanitizeText(deal.description);
  const category = normalizeCategoryFromDeal(deal.category);
  const value = parseValue(deal);
  const status = parseStatus(deal);

  return {
    id: String(deal.id),
    title,
    slug,
    shortDescription: sanitizeText(description, 200),
    fullDescription: description || 'No description available.',
    category,
    provider: {
      id: generateSlug(sanitizeText(deal.company_name), 'unknown'),
      name: sanitizeText(deal.company_name) || 'Unknown Provider',
      logo: deal.company_logo || undefined,
      website: undefined, // GetProven may not provide this
    },
    value,
    status,
    createdAt: new Date().toISOString(), // GetProven may not provide this
    updatedAt: new Date().toISOString(),
    redemption: {
      type: parseRedemptionType(deal),
      code: deal.promo_code || undefined,
      url: deal.redemption_url || undefined,
      instructions: deal.promo_code
        ? `Use code ${deal.promo_code} at checkout`
        : deal.redemption_url
        ? 'Click the button below to redeem'
        : 'Contact the provider to redeem',
    },
    expiresAt: deal.expiration_date || undefined,
    featured: false, // Will be computed separately
  };
}

/**
 * Normalize a deal into a list item (lighter version)
 */
export function normalizeDealToListItem(deal: GetProvenDeal): PerkListItem {
  const perk = normalizeDeal(deal);
  return {
    id: perk.id,
    title: perk.title,
    slug: perk.slug,
    shortDescription: perk.shortDescription,
    category: perk.category,
    provider: {
      id: perk.provider.id,
      name: perk.provider.name,
      logo: perk.provider.logo,
    },
    value: perk.value,
    status: perk.status,
    featured: perk.featured,
    expiresAt: perk.expiresAt,
  };
}

/**
 * Normalize a GetProven category
 */
export function normalizeCategory(category: GetProvenCategory): PerkCategory {
  return {
    id: String(category.id),
    name: sanitizeText(category.name) || 'Uncategorized',
    slug: category.slug || generateSlug(category.name, category.id),
    perkCount: category.deal_count || 0,
  };
}

/**
 * Compute featured perks from a list
 * Logic: Active perks with highest value, prefer cloud/devtools/payments categories
 */
export function computeFeaturedPerks(perks: PerkListItem[], limit = 4): PerkListItem[] {
  const priorityCategories = ['cloud', 'infrastructure', 'developer', 'payment', 'finance'];

  return perks
    .filter((p) => p.status === 'active')
    .sort((a, b) => {
      // Prioritize high-value perks
      const aValue = a.value.amount || 0;
      const bValue = b.value.amount || 0;

      // Prioritize certain categories
      const aHasPriority = priorityCategories.some((cat) =>
        a.category.slug.toLowerCase().includes(cat)
      );
      const bHasPriority = priorityCategories.some((cat) =>
        b.category.slug.toLowerCase().includes(cat)
      );

      if (aHasPriority && !bHasPriority) return -1;
      if (!aHasPriority && bHasPriority) return 1;

      return bValue - aValue;
    })
    .slice(0, limit)
    .map((p) => ({ ...p, featured: true }));
}

/**
 * Compute recommended perks (different from featured)
 * Logic: Active perks, varied categories, not already featured
 */
export function computeRecommendedPerks(
  perks: PerkListItem[],
  featuredIds: Set<string>,
  limit = 3
): PerkListItem[] {
  const seen = new Set<string>();

  return perks
    .filter((p) => p.status === 'active' && !featuredIds.has(p.id))
    .filter((p) => {
      // Ensure category variety
      if (seen.has(p.category.slug)) return false;
      seen.add(p.category.slug);
      return true;
    })
    .slice(0, limit);
}
