const fs = require('fs');
let content = fs.readFileSync('src/components/ui/tabs.tsx', 'utf8');

content = content.replace(/className=\{cn\(\s*'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',/g, 
  "className={cn(\n    'inline-flex h-10 items-center justify-start sm:justify-center rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto overflow-y-hidden scrollbar-hide whitespace-nowrap w-full',");

fs.writeFileSync('src/components/ui/tabs.tsx', content);
