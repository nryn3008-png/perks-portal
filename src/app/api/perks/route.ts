import { NextRequest, NextResponse } from 'next/server';
import { perksService } from '@/lib/api';

/**
 * GET /api/perks
 * Fetch paginated list of perks with optional filters
 * Pagination: Use 'next' URL from response to load more (DO NOT calculate pages)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '24'), 1000);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const nextUrl = searchParams.get('next') || undefined;

  const result = await perksService.getPerks(pageSize, {
    category,
    search,
  }, nextUrl);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error.status }
    );
  }

  return NextResponse.json(result.data);
}

// TODO: Implement POST for creating custom perks (admin only)
// export async function POST(request: NextRequest) {
//   // Verify admin auth
//   // Validate request body
//   // Create perk
// }
