const fs = require('fs');
let content = fs.readFileSync('src/components/layout/host-sidebar.tsx', 'utf8');

content = content.replace(/\{ href: '\/host\/messages', icon: MessageSquare, label: 'Messages' \}/, "{ href: '/messages', icon: MessageSquare, label: 'Messages' }");
content = content.replace(/<ArrowLeft className="h-4 w-4" \/> Back to traveling/, '<ArrowLeft className="h-4 w-4" /> Guest Dashboard');
content = content.replace(/href="\/"\s*className="flex items-center gap-3/g, 'href="/guest/trips"\n          className="flex items-center gap-3');

fs.writeFileSync('src/components/layout/host-sidebar.tsx', content);
