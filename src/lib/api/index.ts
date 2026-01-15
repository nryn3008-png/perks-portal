/**
 * API Service Layer
 *
 * Central export for all API services.
 * Import from '@/lib/api' throughout the app.
 */

export { perksService } from './perks-service';
export { getProvenClient, GetProvenApiError } from './getproven-client';

// Re-export mock data for fallback and testing
export { mockCategories, mockPerks, getMockPerk, getMockPerks } from './mock-data';

// Re-export normalizers for advanced use cases
export {
  normalizeDeal,
  normalizeDealToListItem,
  normalizeCategory,
  computeFeaturedPerks,
  computeRecommendedPerks,
} from '../normalizers/getproven';
