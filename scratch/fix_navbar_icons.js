const fs = require('fs');
let content = fs.readFileSync('src/components/layout/navbar.tsx', 'utf8');

// The replacement was probably broken if the imports were multiline
// Let's just find the lucide-react import and add the ones we need
if (content.includes('lucide-react')) {
  // It's a multiline import:
  // import {
  //   Search,
  //   Globe,
  //   ...
  // } from 'lucide-react';
  
  // just inject them before } from 'lucide-react';
  content = content.replace(/\}\s*from\s*'lucide-react';/, "  Calendar,\n  Star,\n  BarChart3\n} from 'lucide-react';");
}

fs.writeFileSync('src/components/layout/navbar.tsx', content);
