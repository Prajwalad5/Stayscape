const fs = require('fs');
let c = fs.readFileSync('src/components/layout/navbar.tsx', 'utf8');

if (!c.includes('import { MessageIcon }')) {
  c = c.replace(/import \{ Avatar, AvatarFallback, AvatarImage \} from '@\/components\/ui\/avatar';/, 
    "import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';\nimport { MessageIcon } from '@/components/messages/message-icon';");
  
  c = c.replace(/<DropdownMenu>/, 
    "{isAuthenticated && <MessageIcon userId={currentUser?.id || ''} />}\n          <DropdownMenu>");
    
  fs.writeFileSync('src/components/layout/navbar.tsx', c);
}
