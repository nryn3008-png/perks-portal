/**
 * Perks Service
 *
 * High-level service for perk operations.
 * STRICT: Uses ONLY real GetProven API data.
 * NO mock data. NO fallbacks. NO derived values.
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
import {
  normalizeDeal,
  normalizeDealToListItem,
  normalizeCategory,
} from '../normalizers/getproven';

/**
 * Generate URL-safe slug from text
 */
function generateSlug(text: string, id: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || id;
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
 * STRICT: Real API data only. Returns empty states on failure.
 */
export const perksService = {
  /**
   * Get paginated list of perks
   * Returns empty array if API fails - NO mock fallback
   * Pagination uses API-provided next/previous URLs only
   */
  async getPerks(
    pageSize = 24,
    filters?: PerkFilters,
    nextUrl?: string
  ): Promise<ApiResponse<PaginatedResponse<PerkListItem>>> {
    try {
      let response;

      if (nextUrl) {
        // Fetch using the API-provided next URL directly
        const res = await fetch(nextUrl, {
          headers: {
            Authorization: `Token ${process.env.GETPROVEN_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch next page');
        response = await res.json();
      } else {
        // Initial fetch
        response = await getProvenClient.getDeals({
          pageSize,
          search: filters?.search,
          category: filters?.category,
        });
      }

      // Normalize all deals using the normalizer
      const perks = response.results.map(normalizeDealToListItem);

      return {
        success: true,
        data: {
          data: perks,
          pagination: {
            count: response.count,
            next: response.next,
            previous: response.previous,
          },
        },
      };
    } catch (error) {
      logApiError('getPerks', error);

      // Return empty state - NO mock fallback
      return {
        success: true,
        data: {
          data: [],
          pagination: {
            count: 0,
            next: null,
            previous: null,
          },
        },
      };
    }
  },

  /**
   * Get single perk by ID or slug
   * Returns error if not found - NO mock fallback
   */
  async getPerk(idOrSlug: string): Promise<ApiResponse<Perk>> {
    try {
      // Fetch offers from list and find by ID (API has no single-offer endpoint)
      const response = await getProvenClient.getDeals({ pageSize: 500 });
      const deal = response.results.find(
        (d) => String(d.id) === idOrSlug || generateSlug(d.name, String(d.id)) === idOrSlug
      );

      if (!deal) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Perk not found',
            status: 404,
          },
        };
      }

      const perk = normalizeDeal(deal);
      return { success: true, data: perk };
    } catch (error) {
      logApiError('getPerk', error);

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
   * Returns empty array if API fails - NO mock fallback
   */
  async getCategories(): Promise<ApiResponse<PerkCategory[]>> {
    try {
      const response = await getProvenClient.getCategories();
      const categories = response.results.map(normalizeCategory);
      return { success: true, data: categories };
    } catch (error) {
      logApiError('getCategories', error);
      // Return empty array - NO mock fallback
      return { success: true, data: [] };
    }
  },

  /**
   * Get featured perks
   * Returns first N perks from API - NO computed ranking
   */
  async getFeaturedPerks(limit = 4): Promise<ApiResponse<PerkListItem[]>> {
    const result = await this.getPerks(1, limit);
    if (!result.success) {
      return { success: true, data: [] };
    }
    return { success: true, data: result.data.data };
  },

  /**
   * Get dashboard stats from API data only
   * NO estimated or derived values
   */
  async getDashboardStats(): Promise<{
    totalPerks: number;
    totalValue: string;
  }> {
    const result = await this.getPerks(500);
    if (!result.success) {
      return { totalPerks: 0, totalValue: 'No data' };
    }

    const totalPerks = result.data.pagination.count;

    // Sum only explicit API values
    const totalAmount = result.data.data.reduce((sum, p) => {
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
      totalValue = 'No data';
    }

    return {
      totalPerks,
      totalValue,
    };
  },
};
