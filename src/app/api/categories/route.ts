import { NextRequest, NextResponse } from 'next/server';
import { perksService } from '@/lib/api';

/**
 * GET /api/categories
 * Fetch all perk categories
 */
export async function GET(request: NextRequest) {
  const result = await perksService.getCategories();

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error.status }
    );
  }

  return NextResponse.json(result.data);
}
