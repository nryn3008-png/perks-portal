import Link from 'next/link';
import {
  Cloud,
  Code,
  Megaphone,
  Briefcase,
  Users,
  Palette,
  Package,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { perksService } from '@/lib/api';

/**
 * Categories Page
 * Browse perks by category with visual cards
 * Powered by real GetProven API data
 */

// Map category slugs to icons
const categoryIcons: Record<string, React.ElementType> = {
  'cloud-infrastructure': Cloud,
  'developer-tools': Code,
  'sales-marketing': Megaphone,
  'finance-legal': Briefcase,
  'hr-operations': Users,
  'design-creative': Palette,
};

// Category card background colors (accessible contrast)
const categoryColors: Record<string, { bg: string; icon: string; hover: string }> = {
  'cloud-infrastructure': {
    bg: 'bg-sky-50',
    icon: 'text-sky-600',
    hover: 'hover:border-sky-200',
  },
  'developer-tools': {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    hover: 'hover:border-violet-200',
  },
  'sales-marketing': {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    hover: 'hover:border-orange-200',
  },
  'finance-legal': {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    hover: 'hover:border-emerald-200',
  },
  'hr-operations': {
    bg: 'bg-pink-50',
    icon: 'text-pink-600',
    hover: 'hover:border-pink-200',
  },
  'design-creative': {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    hover: 'hover:border-amber-200',
  },
};

const defaultColor = {
  bg: 'bg-slate-50',
  icon: 'text-slate-600',
  hover: 'hover:border-slate-300',
};

export default async function CategoriesPage() {
  // Fetch real categories from API
  const result = await perksService.getCategories();
  const categories = result.success ? result.data : [];

  // Calculate total perks across all categories
  const totalPerks = categories.reduce(
    (sum, cat) => sum + (cat.perkCount || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="mt-1 text-slate-600">
          Browse {totalPerks} perks across {categories.length} categories
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = categoryIcons[category.slug] || Package;
          const colors = categoryColors[category.slug] || defaultColor;

          return (
            <Link
              key={category.id}
              href={`/perks?category=${category.slug}`}
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-xl"
            >
              <Card
                className={`h-full transition-all duration-150 ${colors.hover} group-hover:shadow-md`}
              >
                <div className="p-6">
                  {/* Icon */}
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${colors.icon}`} aria-hidden="true" />
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-brand-600">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      {category.perkCount} {category.perkCount === 1 ? 'perk' : 'perks'}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-500"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Empty State (shown if no categories) */}
      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16">
          <Package className="h-12 w-12 text-slate-300" aria-hidden="true" />
          <p className="mt-4 text-slate-600">No categories available</p>
        </div>
      )}
    </div>
  );
}
