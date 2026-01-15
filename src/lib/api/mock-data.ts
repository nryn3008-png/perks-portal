/**
 * Mock data for development and testing
 *
 * Use this data when USE_MOCK_DATA=true in environment
 * This allows development without a live GetProven API connection
 */

import {
  Perk,
  PerkListItem,
  PerkCategory,
  PaginatedResponse,
} from '@/types';

export const mockCategories: PerkCategory[] = [
  {
    id: 'cat-1',
    name: 'Cloud & Infrastructure',
    slug: 'cloud-infrastructure',
    description: 'Cloud computing, hosting, and infrastructure services',
    icon: 'cloud',
    perkCount: 12,
  },
  {
    id: 'cat-2',
    name: 'Developer Tools',
    slug: 'developer-tools',
    description: 'Tools and services for software development',
    icon: 'code',
    perkCount: 8,
  },
  {
    id: 'cat-3',
    name: 'Sales & Marketing',
    slug: 'sales-marketing',
    description: 'CRM, marketing automation, and sales tools',
    icon: 'megaphone',
    perkCount: 15,
  },
  {
    id: 'cat-4',
    name: 'Finance & Legal',
    slug: 'finance-legal',
    description: 'Accounting, banking, and legal services',
    icon: 'briefcase',
    perkCount: 6,
  },
  {
    id: 'cat-5',
    name: 'HR & Operations',
    slug: 'hr-operations',
    description: 'HR, payroll, and operational tools',
    icon: 'users',
    perkCount: 9,
  },
  {
    id: 'cat-6',
    name: 'Design & Creative',
    slug: 'design-creative',
    description: 'Design tools and creative software',
    icon: 'palette',
    perkCount: 5,
  },
];

export const mockPerks: Perk[] = [
  {
    id: 'perk-1',
    title: 'AWS Activate',
    slug: 'aws-activate',
    shortDescription: 'Up to $100,000 in AWS credits for startups',
    fullDescription: `AWS Activate provides startups with a range of benefits including AWS credits, technical support, and training to help you get started on AWS.

## What You Get
- Up to $100,000 in AWS credits (for portfolio companies)
- AWS Business Support (1 year)
- Access to AWS technical resources
- Training and certification opportunities

## Eligibility
- Must be a funded startup
- New to AWS or existing customer with less than $100k lifetime spend
- Must apply through your VC's portfolio link`,
    category: mockCategories[0],
    tags: ['cloud', 'credits', 'infrastructure', 'popular'],
    provider: {
      id: 'provider-aws',
      name: 'Amazon Web Services',
      logo: '/logos/aws.svg',
      website: 'https://aws.amazon.com',
      description: 'Cloud computing platform',
    },
    value: {
      type: 'credits',
      amount: 100000,
      currency: 'USD',
      description: 'Up to $100,000 in AWS credits',
    },
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    redemption: {
      type: 'link',
      url: 'https://aws.amazon.com/activate',
      instructions: 'Click the link and apply with your portfolio company details',
    },
    eligibility: {
      fundingStages: ['pre-seed', 'seed', 'series-a', 'series-b'],
      maxEmployees: 1000,
    },
    featured: true,
    viewCount: 1250,
    redemptionCount: 89,
  },
  {
    id: 'perk-2',
    title: 'Google Cloud for Startups',
    slug: 'google-cloud-startups',
    shortDescription: '$200,000 in Google Cloud credits over 2 years',
    fullDescription: `Google Cloud for Startups provides cloud credits, technical training, and business support to help startups build and scale.

## What You Get
- $200,000 in cloud credits over 2 years
- Technical training and certifications
- Dedicated startup support team
- Access to Google Cloud Partner ecosystem

## How to Apply
1. Click the redemption link
2. Fill out the application form
3. Our team will review within 5 business days`,
    category: mockCategories[0],
    tags: ['cloud', 'credits', 'infrastructure'],
    provider: {
      id: 'provider-gcp',
      name: 'Google Cloud',
      logo: '/logos/google-cloud.svg',
      website: 'https://cloud.google.com',
      description: 'Cloud computing services',
    },
    value: {
      type: 'credits',
      amount: 200000,
      currency: 'USD',
      description: '$200,000 in cloud credits over 2 years',
    },
    status: 'active',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    redemption: {
      type: 'link',
      url: 'https://cloud.google.com/startup',
      instructions: 'Apply through the Google Cloud Startup Program',
    },
    eligibility: {
      fundingStages: ['seed', 'series-a', 'series-b'],
    },
    featured: true,
    viewCount: 980,
    redemptionCount: 67,
  },
  {
    id: 'perk-3',
    title: 'HubSpot for Startups',
    slug: 'hubspot-startups',
    shortDescription: '90% off HubSpot software for your first year',
    fullDescription: `HubSpot for Startups gives eligible startups up to 90% off HubSpot's full suite of marketing, sales, and service software.

## What You Get
- 90% off Year 1, 50% off Year 2, 25% off ongoing
- Full access to Marketing, Sales, and Service Hubs
- Free onboarding and training
- Dedicated startup support

## Requirements
- Less than $2M in funding
- New HubSpot customers only`,
    category: mockCategories[2],
    tags: ['crm', 'marketing', 'sales', 'popular'],
    provider: {
      id: 'provider-hubspot',
      name: 'HubSpot',
      logo: '/logos/hubspot.svg',
      website: 'https://hubspot.com',
      description: 'CRM and marketing platform',
    },
    value: {
      type: 'percentage',
      amount: 90,
      description: '90% off for your first year',
    },
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
    redemption: {
      type: 'code',
      code: 'VCPORTFOLIO90',
      url: 'https://hubspot.com/startups',
      instructions: 'Apply using code VCPORTFOLIO90 at checkout',
    },
    eligibility: {
      maxRevenue: 2000000,
    },
    featured: false,
    viewCount: 756,
    redemptionCount: 45,
  },
  {
    id: 'perk-4',
    title: 'Notion for Startups',
    slug: 'notion-startups',
    shortDescription: '$1,000 in Notion credits + unlimited AI',
    fullDescription: `Get $1,000 in credits toward Notion Plus plan, giving your team unlimited AI features and advanced collaboration tools.

## What You Get
- $1,000 credit (~6 months free for teams up to 15)
- Unlimited Notion AI
- Advanced permissions and admin tools
- Priority support`,
    category: mockCategories[1],
    tags: ['productivity', 'collaboration', 'documentation'],
    provider: {
      id: 'provider-notion',
      name: 'Notion',
      logo: '/logos/notion.svg',
      website: 'https://notion.so',
      description: 'All-in-one workspace',
    },
    value: {
      type: 'credits',
      amount: 1000,
      currency: 'USD',
      description: '$1,000 in Notion credits',
    },
    status: 'active',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z',
    redemption: {
      type: 'link',
      url: 'https://notion.so/startups',
      instructions: 'Apply through the Notion for Startups program',
    },
    featured: false,
    viewCount: 632,
    redemptionCount: 52,
  },
  {
    id: 'perk-5',
    title: 'Stripe Atlas',
    slug: 'stripe-atlas',
    shortDescription: 'Waived incorporation fee + $5,000 in Stripe processing credits',
    fullDescription: `Stripe Atlas helps you incorporate your company in Delaware and set up your business banking, all in a few clicks.

## What You Get
- Waived $500 incorporation fee
- $5,000 in Stripe processing credits
- Delaware C-Corp formation
- Business bank account setup
- Tax and legal document templates`,
    category: mockCategories[3],
    tags: ['finance', 'legal', 'incorporation', 'payments'],
    provider: {
      id: 'provider-stripe',
      name: 'Stripe',
      logo: '/logos/stripe.svg',
      website: 'https://stripe.com',
      description: 'Payment infrastructure',
    },
    value: {
      type: 'custom',
      description: 'Waived $500 fee + $5,000 credits',
    },
    status: 'active',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-11T00:00:00Z',
    redemption: {
      type: 'link',
      url: 'https://stripe.com/atlas',
      instructions: 'Use your portfolio invite link to get started',
    },
    featured: true,
    viewCount: 890,
    redemptionCount: 34,
  },
  {
    id: 'perk-6',
    title: 'Figma for Startups',
    slug: 'figma-startups',
    shortDescription: 'Free Figma Organization plan for 2 years',
    fullDescription: `Design and prototype with Figma Organization - free for 2 years for qualifying startups.

## What You Get
- Organization plan (normally $45/editor/month)
- Unlimited projects and files
- Advanced design systems
- Organization-wide libraries
- SSO and advanced security`,
    category: mockCategories[5],
    tags: ['design', 'prototyping', 'collaboration'],
    provider: {
      id: 'provider-figma',
      name: 'Figma',
      logo: '/logos/figma.svg',
      website: 'https://figma.com',
      description: 'Collaborative design platform',
    },
    value: {
      type: 'custom',
      description: 'Free Organization plan for 2 years',
    },
    status: 'active',
    createdAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-13T00:00:00Z',
    redemption: {
      type: 'contact',
      contactEmail: 'startups@figma.com',
      instructions: 'Email startups@figma.com with your company details and VC reference',
    },
    eligibility: {
      fundingStages: ['pre-seed', 'seed', 'series-a'],
      maxEmployees: 50,
    },
    featured: false,
    viewCount: 445,
    redemptionCount: 23,
  },
];

/**
 * Convert full Perk to PerkListItem
 */
export function toPerkListItem(perk: Perk): PerkListItem {
  return {
    id: perk.id,
    title: perk.title,
    slug: perk.slug,
    shortDescription: perk.shortDescription,
    category: {
      id: perk.category.id,
      name: perk.category.name,
      slug: perk.category.slug,
    },
    provider: {
      id: perk.provider.id,
      name: perk.provider.name,
      logo: perk.provider.logo,
    },
    value: perk.value,
    status: perk.status,
    featured: perk.featured,
    imageUrl: perk.imageUrl,
    expiresAt: perk.expiresAt,
  };
}

/**
 * Get paginated mock perks
 */
export function getMockPerks(
  page = 1,
  pageSize = 10,
  filters?: { category?: string; search?: string; featured?: boolean }
): PaginatedResponse<PerkListItem> {
  let filtered = [...mockPerks];

  if (filters?.category) {
    filtered = filtered.filter((p) => p.category.slug === filters.category);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.shortDescription.toLowerCase().includes(searchLower) ||
        p.provider.name.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.featured) {
    filtered = filtered.filter((p) => p.featured);
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = filtered.slice(startIndex, endIndex).map(toPerkListItem);

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Get single mock perk by ID or slug
 */
export function getMockPerk(idOrSlug: string): Perk | null {
  return (
    mockPerks.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null
  );
}
