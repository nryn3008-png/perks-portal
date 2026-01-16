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
 * TODO: Update these based on actual API documentation
 */
export interface GetProvenDeal {
  id: number;
  vendor_id: number;
  name: string;                    // Offer title/name
  description: string;             // HTML description
  picture: string | null;          // Logo/image URL
  deal_type: string | null;
  estimated_value_type: string | null;  // "fixed", etc.
  estimated_value: number | null;       // Value in dollars
  old_price: number | null;
  new_price: number | null;
  discount_type: string | null;    // "percentage", etc.
  discount: number | null;         // Discount amount
  applicable_to_type: string | null;    // Eligibility info
  offer_categories: string[];      // Category slugs
  investment_levels: string[];     // Funding stages
  terms_and_conditions_text: string | null;
  terms_and_conditions: string | null;
  getproven_link: string;          // Redemption URL
}

export interface GetProvenCategory {
  id: string;
  name: string;
  slug: string;
  deal_count: number;
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
  category?: string;
  ordering?: string;
}
