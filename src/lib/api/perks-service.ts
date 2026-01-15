/**
 * Perks Service
 *
 * High-level service for perk operations.
 * Real GetProven API is the PRIMARY data source.
 * Mock data is ONLY used as fallback when API is unavailable.
 */

import type {
  Perk,
  PerkListItem,
  PerkCategory,
  PerkFilters,
  PaginatedResponse,
  ApiResponse,
} from '@/types';
import { getProvenClient, GetProvenApiError } from './getproven-client';
import { mockCategories, getMockPerks, getMockPerk } from './mock-data';
import {
  normalizeDeal,
  normalizeDealToListItem,
  normalizeCategory,
  computeFeaturedPerks,
  computeRecommendedPerks,
} from '../normalizers/getproven';

/**
 * Check if we should use mock data
 * Mock is ONLY used when:
 * - Explicitly enabled via USE_MOCK_DATA=true (dev without credentials)
 * - API token is missing (local dev fallback)
 */
function shouldUseMockData(): boolean {
  const forceMock = process.env.USE_MOCK_DATA === 'true';
  const hasToken = Boolean(process.env.GETPROVEN_API_TOKEN &&
    process.env.GETPROVEN_API_TOKEN !== 'mock_token');

  if (forceMock) {
    logFallback('USE_MOCK_DATA is enabled');
    return true;
  }

  if (!hasToken) {
    logFallback('GETPROVEN_API_TOKEN is not configured');
    return true;
  }

  return false;
}

/**
 * Log when fallback to mock data is used (server-side only)
 */
function logFallback(reason: string): void {
  if (typeof window === 'undefined') {
    console.warn(`[Perks Service] Using mock data fallback: ${reason}`);
  }
}

/**
 * Log API errors (server-side only, never expose details to client)
 */
function logApiError(operation: string, error: unknown): void {
  if (typeof window === 'undefined') {
    console.error(`[Perks Service] ${operation} failed:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof GetProvenApiError ? error.code : undefined,
    });
  }
}

/**
 * Perks Service - Main API for perk operations
 */
export const perksService = {
  /**
   * Get paginated list of perks
   */
  async getPerks(
    page = 1,
    pageSize = 12,
    filters?: PerkFilters
  ): Promise<ApiResponse<PaginatedResponse<PerkListItem>>> {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      const result = getMockPerks(page, pageSize, filters);
      return { success: true, data: result };
    }

    try {
      const response = await getProvenClient.getDeals({
        page,
        pageSize,
        search: filters?.search,
        category: filters?.category,
      });

      // Normalize all deals using the normalizer
      const perks = response.results.map(normalizeDealToListItem);

      return {
        success: true,
        data: {
          data: perks,
          pagination: {
            page,
            pageSize,
            totalItems: response.count,
            totalPages: Math.ceil(response.count / pageSize),
            hasMore: response.next !== null,
          },
        },
      };
    } catch (error) {
      logApiError('getPerks', error);

      // Fallback to mock data on API failure
      if (error instanceof GetProvenApiError) {
        logFallback(`API error: ${error.message}`);
        const result = getMockPerks(page, pageSize, filters);
        return { success: true, data: result };
      }

      // Return empty state for unknown errors
      return {
        success: true,
        data: {
          data: [],
          pagination: {
            page,
            pageSize,
            totalItems: 0,
            totalPages: 0,
            hasMore: false,
          },
        },
      };
    }
  },

  /**
   * Get single perk by ID or slug
   */
  async getPerk(idOrSlug: string): Promise<ApiResponse<Perk>> {
    if (shouldUseMockData()) {
      const perk = getMockPerk(idOrSlug);
      if (!perk) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Perk not found',
            status: 404,
          },
        };
      }
      return { success: true, data: perk };
    }

    try {
      const deal = await getProvenClient.getDeal(idOrSlug);
      const perk = normalizeDeal(deal);
      return { success: true, data: perk };
    } catch (error) {
      logApiError('getPerk', error);

      // Try mock data as fallback
      const mockPerk = getMockPerk(idOrSlug);
      if (mockPerk) {
        logFallback(`Perk ${idOrSlug} fetch failed, using mock`);
        return { success: true, data: mockPerk };
      }

      if (error instanceof GetProvenApiError && error.status === 404) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Perk not found',
            status: 404,
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Unable to load perk details',
          status: 500,
        },
      };
    }
  },

  /**
   * Get all categories
   */
  async getCategories(): Promise<ApiResponse<PerkCategory[]>> {
    if (shouldUseMockData()) {
      return { success: true, data: mockCategories };
    }

    try {
      const response = await getProvenClient.getCategories();
      const categories = response.results.map(normalizeCategory);
      return { success: true, data: categories };
    } catch (error) {
      logApiError('getCategories', error);
      logFallback('Categories fetch failed');
      // Fallback to mock categories
      return { success: true, data: mockCategories };
    }
  },

  /**
   * Get featured perks (computed from real data)
   */
  async getFeaturedPerks(limit = 4): Promise<ApiResponse<PerkListItem[]>> {
    const result = await this.getPerks(1, 50); // Fetch enough to compute featured
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const featured = computeFeaturedPerks(result.data.data, limit);
    return { success: true, data: featured };
  },

  /**
   * Get recommended perks (computed from real data, excludes featured)
   */
  async getRecommendedPerks(
    featuredIds: string[],
    limit = 3
  ): Promise<ApiResponse<PerkListItem[]>> {
    const result = await this.getPerks(1, 50);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const featuredSet = new Set(featuredIds);
    const recommended = computeRecommendedPerks(result.data.data, featuredSet, limit);
    return { success: true, data: recommended };
  },

  /**
   * Get dashboard stats (computed from real data)
   */
  async getDashboardStats(): Promise<{
    totalPerks: number;
    totalValue: string;
    newThisMonth: number;
  }> {
    const result = await this.getPerks(1, 100);
    if (!result.success) {
      return { totalPerks: 0, totalValue: '$0', newThisMonth: 0 };
    }

    const perks = result.data.data;
    const activePerks = perks.filter((p) => p.status === 'active');

    // Calculate total value
    const totalAmount = activePerks.reduce((sum, p) => {
      return sum + (p.value.amount || 0);
    }, 0);

    // Format total value
    let totalValue: string;
    if (totalAmount >= 1000000) {
      totalValue = `$${(totalAmount / 1000000).toFixed(1)}M+`;
    } else if (totalAmount >= 1000) {
      totalValue = `$${(totalAmount / 1000).toFixed(0)}K+`;
    } else if (totalAmount > 0) {
      totalValue = `$${totalAmount}+`;
    } else {
      totalValue = 'Exclusive offers';
    }

    // Estimate new perks (mock - would need created_at from API)
    const newThisMonth = Math.min(Math.floor(activePerks.length * 0.2), 12);

    return {
      totalPerks: activePerks.length,
      totalValue,
      newThisMonth,
    };
  },
};
