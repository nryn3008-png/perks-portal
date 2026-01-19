import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  Building2,
  Users,
  Calendar,
  Globe,
  Linkedin,
  Facebook,
  Twitter,
  Briefcase,
  Factory,
  Play,
  FileText,
  Mail,
  BadgeCheck,
  User,
} from 'lucide-react';
import { Badge, Card, CardContent } from '@/components/ui';
import { vendorsService } from '@/lib/api';
import type { GetProvenVendor, VendorClient, VendorUser } from '@/types';

/**
 * Vendor Detail Page
 * STRICT: Uses ONLY GetProven API data
 *
 * VENDOR PROFILE: name, logo, description, story, website, video, brochure,
 * services, industries, employee range, founded, social links
 *
 * CLIENTS SECTION: name, logo, verified badge (only if verified=true)
 * Hidden entirely if no clients exist
 *
 * CONTACT SECTION: avatar, full name, position, email CTA
 * Only relevant roles (owner, contact_person)
 * NO phone numbers exposed
 */

interface VendorDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Format employee range for display
 */
function formatEmployeeRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) {
    return `${min} - ${max}`;
  }
  if (min !== null) {
    return `${min}+`;
  }
  if (max !== null) {
    return `Up to ${max}`;
  }
  return null;
}

/**
 * Get YouTube embed URL from video URL
 */
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

export default async function VendorDetailPage({ params }: VendorDetailPageProps) {
  const { id } = await params;

  // Fetch all vendor data in parallel
  const [vendorResult, clientsResult, contactsResult] = await Promise.all([
    vendorsService.getVendorById(id),
    vendorsService.getVendorClients(id),
    vendorsService.getVendorContacts(id),
  ]);

  if (!vendorResult.success || !vendorResult.data) {
    notFound();
  }

  const vendor = vendorResult.data;
  const clients = clientsResult.success ? clientsResult.data : [];
  const contacts = contactsResult.success ? contactsResult.data : [];

  const employeeRange = formatEmployeeRange(vendor.employee_min, vendor.employee_max);
  const hasSocialLinks = vendor.linkedin || vendor.facebook || vendor.twitter;
  const hasClients = clients.length > 0;
  const hasContacts = contacts.length > 0;
  const videoEmbedUrl = vendor.video ? getYouTubeEmbedUrl(vendor.video) : null;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back navigation */}
      <Link
        href="/vendors"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-md px-1 -ml-1"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Vendors
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Section */}
          <header className="space-y-4">
            {/* Logo + Name row */}
            <div className="flex items-start gap-5">
              {/* Vendor logo */}
              {vendor.logo ? (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 shadow-sm">
                  <Image
                    src={vendor.logo}
                    alt=""
                    width={80}
                    height={80}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 shadow-sm">
                  <Building2 className="h-10 w-10 text-slate-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Primary service */}
                {vendor.primary_service && (
                  <p className="text-sm font-medium text-brand-600 mb-1">
                    {vendor.primary_service}
                  </p>
                )}

                {/* Name */}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {vendor.name}
                </h1>

                {/* Vendor groups */}
                {vendor.vendor_groups.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {vendor.vendor_groups.map((group) => (
                      <Badge key={group.name} variant="info" className="text-xs">
                        {group.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-slate-600">
              {/* Employees */}
              {employeeRange && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  {employeeRange} employees
                </span>
              )}

              {/* Founded */}
              {vendor.founded && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  Founded {vendor.founded}
                </span>
              )}

              {/* Website */}
              {vendor.website && (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 hover:underline"
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  Website
                </a>
              )}
            </div>
          </header>

          {/* Description Section */}
          {vendor.description && (
            <section aria-labelledby="about-heading">
              <h2
                id="about-heading"
                className="text-lg font-semibold text-slate-900 mb-4"
              >
                About
              </h2>
              <div
                className="prose prose-slate prose-sm sm:prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: vendor.description }}
              />
            </section>
          )}

          {/* Story Section */}
          {vendor.story && (
            <section aria-labelledby="story-heading">
              <h2
                id="story-heading"
                className="text-lg font-semibold text-slate-900 mb-4"
              >
                Why Choose Us
              </h2>
              <div
                className="prose prose-slate prose-sm sm:prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: vendor.story }}
              />
            </section>
          )}

          {/* Video Section */}
          {videoEmbedUrl && (
            <section aria-labelledby="video-heading">
              <h2
                id="video-heading"
                className="text-lg font-semibold text-slate-900 mb-4"
              >
                <Play className="inline-block h-5 w-5 mr-2 text-slate-400" />
                Video
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                <iframe
                  src={videoEmbedUrl}
                  title={`${vendor.name} video`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {/* Services Section */}
          {vendor.services.length > 0 && (
            <section aria-labelledby="services-heading">
              <h2
                id="services-heading"
                className="text-lg font-semibold text-slate-900 mb-4"
              >
                <Briefcase className="inline-block h-5 w-5 mr-2 text-slate-400" />
                Services
              </h2>
              <div className="flex flex-wrap gap-2">
                {vendor.services.map((service) => (
                  <span
                    key={service.name}
                    className="inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                  >
                    {service.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Industries Section */}
          {vendor.industries.length > 0 && (
            <section aria-labelledby="industries-heading">
              <h2
                id="industries-heading"
                className="text-lg font-semibold text-slate-900 mb-4"
              >
                <Factory className="inline-block h-5 w-5 mr-2 text-slate-400" />
                Industries Served
              </h2>
              <div className="flex flex-wrap gap-2">
                {vendor.industries.map((industry) => (
                  <span
                    key={industry.name}
                    className="inline-block rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                  >
                    {industry.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Clients Section - Only show if clients exist */}
          {hasClients && (
            <section aria-labelledby="clients-heading">
              <h2
                id="clients-heading"
                className="text-lg font-semibold text-slate-900 mb-4"
              >
                <Users className="inline-block h-5 w-5 mr-2 text-slate-400" />
                Clients
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {clients.slice(0, 12).map((client) => (
                  <div
                    key={client.id}
                    className="flex flex-col items-center p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    {client.logo ? (
                      <div className="h-12 w-12 flex items-center justify-center overflow-hidden rounded-lg bg-white mb-2">
                        <Image
                          src={client.logo}
                          alt=""
                          width={48}
                          height={48}
                          className="h-full w-full object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-white mb-2">
                        <Building2 className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-700 text-center line-clamp-2">
                        {client.name}
                      </span>
                      {/* Verified badge - only if verified=true */}
                      {client.verified && (
                        <BadgeCheck
                          className="h-4 w-4 text-blue-500 flex-shrink-0"
                          aria-label="Verified"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {clients.length > 12 && (
                <p className="mt-4 text-sm text-slate-500 text-center">
                  And {clients.length - 12} more clients
                </p>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Contact Card */}
          <Card className="sticky top-24 border-slate-200 shadow-sm">
            <CardContent className="p-0">
              {/* Card header */}
              <div className="p-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">
                  Contact Vendor
                </h3>
              </div>

              {/* Card body */}
              <div className="p-6 space-y-5">
                {/* Primary CTA - GetProven link */}
                <a
                  href={vendor.getproven_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-brand-700 active:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  View on GetProven
                </a>

                {/* Website */}
                {vendor.website && (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    Visit Website
                  </a>
                )}

                {/* Brochure */}
                {vendor.brochure && (
                  <a
                    href={vendor.brochure}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Download Brochure
                  </a>
                )}

                {/* Contact Section - Only if contacts exist */}
                {hasContacts && (
                  <div className="border-t border-slate-100 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
                      Key Contacts
                    </p>
                    <div className="space-y-4">
                      {contacts.slice(0, 3).map((contact) => (
                        <div key={contact.id} className="flex items-start gap-3">
                          {/* Avatar */}
                          {contact.avatar ? (
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
                              <Image
                                src={contact.avatar}
                                alt=""
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100">
                              <User className="h-5 w-5 text-slate-400" />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {contact.first_name} {contact.last_name}
                            </p>
                            {contact.position && (
                              <p className="text-xs text-slate-500 truncate">
                                {contact.position}
                              </p>
                            )}
                            {/* Email CTA */}
                            <a
                              href={`mailto:${contact.email}`}
                              className="inline-flex items-center gap-1 mt-1 text-xs text-brand-600 hover:text-brand-700 hover:underline"
                            >
                              <Mail className="h-3 w-3" />
                              Email
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {hasSocialLinks && (
                  <div className="border-t border-slate-100 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                      Connect
                    </p>
                    <div className="flex gap-3">
                      {vendor.linkedin && (
                        <a
                          href={vendor.linkedin.startsWith('http') ? vendor.linkedin : `https://linkedin.com/company/${vendor.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {vendor.facebook && (
                        <a
                          href={vendor.facebook.startsWith('http') ? vendor.facebook : `https://facebook.com/${vendor.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                          aria-label="Facebook"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {vendor.twitter && (
                        <a
                          href={vendor.twitter.startsWith('http') ? vendor.twitter : `https://twitter.com/${vendor.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                          aria-label="Twitter"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Company info */}
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                    Company Info
                  </p>
                  <dl className="space-y-2 text-sm">
                    {vendor.primary_service && (
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Primary Service</dt>
                        <dd className="font-medium text-slate-900 text-right max-w-[60%] truncate">
                          {vendor.primary_service}
                        </dd>
                      </div>
                    )}
                    {employeeRange && (
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Employees</dt>
                        <dd className="font-medium text-slate-900">{employeeRange}</dd>
                      </div>
                    )}
                    {vendor.founded && (
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Founded</dt>
                        <dd className="font-medium text-slate-900">{vendor.founded}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
