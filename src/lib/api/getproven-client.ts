/**
 * GetProven API Client
 *
 * Low-level client for making authenticated requests to the GetProven API.
 * This client handles authentication, error handling, and response parsing.
 *
 * IMPORTANT: This client should only be used server-side to protect the API token.
 */

import {
  ApiError,
  GetProvenDeal,
  GetProvenCategory,
  GetProvenListResponse,
  ApiRequestOptions,
} from '@/types';

const API_BASE_URL =
  process.env.GETPROVEN_API_URL || 'https://provendeals.getproven.com/api/ext/v1';
const API_TOKEN = process.env.GETPROVEN_API_TOKEN;

/**
 * Custom error class for API errors
 */
export class GetProvenApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GetProvenApiError';
  }

  toApiError(): ApiError {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      details: this.details,
    };
  }
}

/**
 * Build query string from options
 */
function buildQueryString(options: ApiRequestOptions): string {
  const params = new URLSearchParams();

  if (options.page) params.set('page', String(options.page));
  if (options.pageSize) params.set('page_size', String(options.pageSize));
  if (options.search) params.set('search', options.search);
  if (options.category) params.set('category', options.category);
  if (options.ordering) params.set('ordering', options.ordering);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Make authenticated request to GetProven API
 */
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_TOKEN) {
    throw new GetProvenApiError(
      'MISSING_API_TOKEN',
      'GetProven API token is not configured',
      500
    );
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Token ${API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData: Record<string, unknown> = {};
    try {
      errorData = await response.json();
    } catch {
      // Response body might not be JSON
    }

    throw new GetProvenApiError(
      'API_ERROR',
      (errorData.detail as string) || `API request failed: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

/**
 * GetProven API Client
 */
export const getProvenClient = {
  /**
   * Fetch list of deals/perks
   */
  async getDeals(
    options: ApiRequestOptions = {}
  ): Promise<GetProvenListResponse<GetProvenDeal>> {
    const query = buildQueryString(options);
    return makeRequest<GetProvenListResponse<GetProvenDeal>>(`/deals/${query}`);
  },

  /**
   * Fetch single deal by ID
   */
  async getDeal(id: string): Promise<GetProvenDeal> {
    return makeRequest<GetProvenDeal>(`/deals/${id}/`);
  },

  /**
   * Fetch list of categories
   */
  async getCategories(): Promise<GetProvenListResponse<GetProvenCategory>> {
    return makeRequest<GetProvenListResponse<GetProvenCategory>>('/categories/');
  },

  /**
   * Fetch deals by category
   */
  async getDealsByCategory(
    categorySlug: string,
    options: ApiRequestOptions = {}
  ): Promise<GetProvenListResponse<GetProvenDeal>> {
    const query = buildQueryString({ ...options, category: categorySlug });
    return makeRequest<GetProvenListResponse<GetProvenDeal>>(`/deals/${query}`);
  },

  // TODO: Add more endpoints as discovered from API documentation
  // - /redeem/ - Track redemptions
  // - /portfolio/ - Portfolio company info
  // - /analytics/ - Usage analytics
};
