const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/host/listings/page.tsx', 'utf8');

if (!c.includes('import { HostDeleteListingButton }')) {
  c = c.replace(/import \{ HostPublishButton \} from '\.\/host-publish-button';/, 
    "import { HostPublishButton } from './host-publish-button';\nimport { HostDeleteListingButton } from './delete-button';");
    
  c = c.replace(/<Link href=\{`\/host\/listings\/\$\{property\.id\}\/edit`\}>\s*<Button variant="outline" size="icon"><Edit className="h-4 w-4" \/><\/Button>\s*<\/Link>/g, 
    `<Link href={\`/host/listings/\${property.id}/edit\`}>
                      <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                    </Link>
                    <HostDeleteListingButton propertyId={property.id} />`);

  fs.writeFileSync('src/app/(dashboard)/host/listings/page.tsx', c);
}
