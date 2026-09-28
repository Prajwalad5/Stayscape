const fs = require('fs');
const file = 'src/app/(public)/properties/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('application/ld+json')) {
  const jsonLdBlock = `
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: property.title,
    description: property.description.substring(0, 160),
    image: property.images.map(img => img.url),
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressRegion: property.state || '',
      addressCountry: property.country,
      postalCode: property.postalCode || '',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: property.lat,
      longitude: property.lng,
    },
    aggregateRating: property.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: property.averageRating,
      reviewCount: property.reviewCount,
    } : undefined,
    offers: {
      '@type': 'Offer',
      price: property.pricePerNight / 100,
      priceCurrency: 'NPR',
      availability: 'https://schema.org/InStock'
    }
  };
`;

  content = content.replace(
    'return (',
    jsonLdBlock + '\n  return (\n    <>\n      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />'
  );
  content = content.replace(
    /^  \);$/m,
    '    </>\n  );'
  );
  fs.writeFileSync(file, content);
}
