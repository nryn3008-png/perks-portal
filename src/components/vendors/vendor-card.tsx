'use client';

/**
 * Vendor Card Component
 * Displays a single vendor from the GetProven API
 *
 * STRICT: Shows ONLY API-provided fields
 * - NO ratings or reviews
 * - NO popularity indicators
 */

import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge } from '@/components/ui';
import { Building2, Users, Calendar } from 'lucide-react';
import type { GetProvenVendor } from '@/types';

interface VendorCardProps {
  vendor: GetProvenVendor;
}

/**
 * Strip HTML tags from description
 */
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Truncate text to max length
 */
function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format employee range
 */
function formatEmployeeRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) {
    return `${min}-${max} employees`;
  }
  if (min !== null) {
    return `${min}+ employees`;
  }
  if (max !== null) {
    return `Up to ${max} employees`;
  }
  return null;
}

export function VendorCard({ vendor }: VendorCardProps) {
  const description = truncate(stripHtml(vendor.description || ''), 120);
  const employeeRange = formatEmployeeRange(vendor.employee_min, vendor.employee_max);

  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <Card hover className="h-full">
        <div className="p-5">
          {/* Logo */}
          {vendor.logo ? (
            <div className="mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              <Image
                src={vendor.logo}
                alt=""
                width={48}
                height={48}
                className="h-full w-full object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="h-6 w-6 text-slate-400" />
            </div>
          )}

          {/* Name */}
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
            {vendor.name}
          </h3>

          {/* Primary service */}
          {vendor.primary_service && (
            <p className="mt-1 text-sm font-medium text-brand-600">
              {vendor.primary_service}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {description}
            </p>
          )}

          {/* Meta info */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {/* Employees */}
            {employeeRange && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {employeeRange}
              </span>
            )}

            {/* Founded */}
            {vendor.founded && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Est. {vendor.founded}
              </span>
            )}
          </div>

          {/* Services */}
          {vendor.services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {vendor.services.slice(0, 3).map((service, idx) => (
                <span
                  key={idx}
                  className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                >
                  {service.name}
                </span>
              ))}
              {vendor.services.length > 3 && (
                <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  +{vendor.services.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Vendor groups */}
          {vendor.vendor_groups.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {vendor.vendor_groups.map((group, idx) => (
                <Badge key={idx} variant="info" className="text-xs">
                  {group.name}
                </Badge>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-4">
            <span className="text-sm font-medium text-brand-600 group-hover:text-brand-700">
              View Vendor →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
