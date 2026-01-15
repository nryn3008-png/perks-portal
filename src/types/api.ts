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
  id: string;
  title: string;
  description: string;
  company_name: string;
  company_logo?: string;
  category?: string;
  discount_type?: string;
  discount_value?: string;
  redemption_url?: string;
  promo_code?: string;
  expiration_date?: string;
  is_active: boolean;
  // Add more fields as discovered from API
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
