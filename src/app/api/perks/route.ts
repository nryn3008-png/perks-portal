import { NextRequest, NextResponse } from 'next/server';
import { perksService } from '@/lib/api';

/**
 * GET /api/perks
 * Fetch paginated list of perks with optional filters
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '12');
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const featured = searchParams.get('featured') === 'true' || undefined;

  const result = await perksService.getPerks(page, pageSize, {
    category,
    search,
    featured,
  });

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
