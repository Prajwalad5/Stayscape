import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Fetch published listings
  const listings = await prisma.property.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    select: { id: true, updatedAt: true },
  })

  const listingUrls: MetadataRoute.Sitemap = listings.map((listing: any) => ({
    url: `${appUrl}/listings/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${appUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${appUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  return [...staticUrls, ...listingUrls]
}
