/**
 * API request/response types and error handling
 */

/**
 * Standard API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status: number;
}

/**
 * API response wrapper
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

/**
 * GetProven API specific types
 * Based on actual API response from /offers/
 */

// Nested types within offer response
export interface OfferCategory {
  name: string;
}

export interface OfferInvestmentLevel {
  name: string;
}

/**
 * GetProven Offer (Deal) from /offers/ endpoint
 * This is the RAW API response structure
 */
export interface GetProvenDeal {
  id: number;
  vendor_id: number;
  name: string;                              // Offer title/name
  description: string;                       // HTML description
  picture: string | null;                    // Logo/image URL
  deal_type: string | null;                  // e.g., "discount"
  estimated_value_type: string | null;       // e.g., "fixed"
  estimated_value: number | null;            // Value in dollars
  old_price: number | null;
  new_price: number | null;
  discount_type: string | null;              // e.g., "percentage"
  discount: number | null;                   // Discount amount
  applicable_to_type: string | null;         // Eligibility info
  offer_categories: OfferCategory[];         // Array of {name: string}
  investment_levels: OfferInvestmentLevel[]; // Array of {name: string}
  terms_and_conditions_text: string | null;
  terms_and_conditions: string | null;
  getproven_link: string;                    // Redemption URL
}

/**
 * GetProven API list response
 */
export interface GetProvenListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Request options for API calls
 */
export interface ApiRequestOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  offerCategories?: string;      // Comma-separated category names
  investmentLevels?: string;     // Comma-separated investment level names
}
