import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button, Input, Badge, Card } from '@/components/ui';
import { mockPerks } from '@/lib/api';
import { formatPerkValue, formatDate } from '@/lib/utils';
import { PERK_STATUS_CONFIG } from '@/lib/constants';

/**
 * Admin Perks Management Page
 * Table view for managing perks with actions
 */
export default function AdminPerksPage() {
  // TODO: Implement actual data fetching and state management
  const perks = mockPerks;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Perks</h1>
          <p className="text-slate-600">
            View, edit, and control which perks are visible to your portfolio
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Perk
        </Button>
        {/* TODO: Implement add custom perk modal */}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search perks..."
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          {/* TODO: Implement filter dropdown */}
        </div>
      </div>

      {/* Perks Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm font-medium text-slate-500">
                <th className="px-6 py-4">Perk</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4">Redemptions</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {perks.map((perk) => {
                const statusConfig = PERK_STATUS_CONFIG[perk.status];
                // Mock visibility status
                const isVisible = Math.random() > 0.3;

                return (
                  <tr key={perk.id} className="hover:bg-slate-50">
                    {/* Perk */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          {perk.provider.logo ? (
                            <img
                              src={perk.provider.logo}
                              alt={perk.provider.name}
                              className="h-6 w-6 object-contain"
                            />
                          ) : (
                            <span className="text-sm font-medium text-slate-400">
                              {perk.provider.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {perk.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {perk.provider.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {perk.category.name}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">
                        {formatPerkValue(perk.value)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge
                        variant={perk.status === 'active' ? 'success' : 'default'}
                        className={`${statusConfig.bgClass} ${statusConfig.textClass}`}
                      >
                        {statusConfig.label}
                      </Badge>
                    </td>

                    {/* Visibility */}
                    <td className="px-6 py-4">
                      <button
                        className={`flex items-center gap-1.5 text-sm ${
                          isVisible ? 'text-green-600' : 'text-slate-400'
                        }`}
                      >
                        {isVisible ? (
                          <>
                            <Eye className="h-4 w-4" />
                            Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Hidden
                          </>
                        )}
                      </button>
                      {/* TODO: Toggle visibility on click */}
                    </td>

                    {/* Redemptions */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {perk.redemptionCount || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {/* TODO: Implement edit and more actions */}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer with pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            Showing {perks.length} of {perks.length} perks
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
          {/* TODO: Implement pagination */}
        </div>
      </Card>

      {/* Bulk Actions (shown when items selected) */}
      {/* TODO: Implement bulk selection and actions */}
    </div>
  );
}
