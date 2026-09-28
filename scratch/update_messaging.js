const fs = require('fs');
let content = fs.readFileSync('src/components/messages/message-thread.tsx', 'utf8');

// Add Lucide map pin
content = content.replace(/import { (.*?) } from 'lucide-react';/, "import { $1, MapPin } from 'lucide-react';");

// Add button for location
const locationBtn = `
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="shrink-0 text-muted-foreground hover:text-primary"
          onClick={async () => {
            if (!conversation.propertyId) return toast.error("No property associated with this conversation");
            const res = await fetch(\`/api/v1/messages/\${conversationId}\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                content: JSON.stringify({ 
                  propertyId: conversation.propertyId,
                  text: "Property Location"
                }),
                messageType: 'LOCATION' 
              })
            });
            if (res.ok) fetchMessages();
          }}
          disabled={!conversation?.propertyId}
          title="Share Property Location"
        >
          <MapPin className="h-5 w-5" />
        </Button>
`;
content = content.replace(/<form onSubmit=\{sendMessage\} className="p-4 border-t flex items-end gap-2">/, '<form onSubmit={sendMessage} className="p-4 border-t flex items-end gap-2">\n' + locationBtn);

// Handle rendering LOCATION message
const locationRender = `
                {msg.messageType === 'LOCATION' ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4" /> 
                      Property Location
                    </div>
                    <a href={\`/properties/\${JSON.parse(msg.content).propertyId}\`} className="text-xs bg-black/10 hover:bg-black/20 text-black px-3 py-1.5 rounded-full text-center transition-colors">
                      View Property
                    </a>
                  </div>
                ) : (
                  msg.content.split('\\n').map((line: string, i: number) => (
                    <span key={i} className="block">{line}</span>
                  ))
                )}
`;
content = content.replace(/msg\.content\.split\('\\\\n'\)\.map\(\(line: string, i: number\) => \([\s\S]*?<\/span>\n\s*\)\)/, locationRender);

fs.writeFileSync('src/components/messages/message-thread.tsx', content);
