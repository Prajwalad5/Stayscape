const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/page.tsx', 'utf8');

content = "import { HomepageMap } from '@/components/map/homepage-map';\n" + content;
content = content.replace("import { SearchBar } from '@/components/search/search-bar';", "import { SearchBar } from '@/components/search/search-bar';\nimport { APIProvider } from '@vis.gl/react-google-maps';");

const mapSection = `
      <section className="py-16 md:py-24 bg-slate-50 border-y">
        <div className="container mx-auto px-4">
          <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Live Availability Map</h2>
              <p className="mt-2 text-muted-foreground">Explore available properties right now on the map.</p>
            </div>
            <Link href="/search">
              <Button variant="outline" className="hidden md:flex">Explore All on Map <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
            <HomepageMap properties={properties} />
          </APIProvider>
          <div className="mt-6 text-center md:hidden">
            <Link href="/search">
              <Button variant="outline" className="w-full">Explore All on Map</Button>
            </Link>
          </div>
        </div>
      </section>
`;

content = content.replace(/<section className="py-16 md:py-24 bg-muted\/30">/, mapSection + '\n      <section className="py-16 md:py-24 bg-muted/30">');

fs.writeFileSync('src/app/(public)/page.tsx', content);
