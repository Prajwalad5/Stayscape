const fs = require('fs');
let c = fs.readFileSync('src/lib/crypto.ts', 'utf8');

c += `\n
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-insecure-32-byte-key-xyz!!'; // Must be 32 bytes
const ALGORITHM = 'aes-256-gcm';

export function encryptProfileData(text: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:encryptedData
    return \`\${iv.toString('hex')}:\${authTag}:\${encrypted}\`;
  } catch (e) {
    return text; // Fallback for safety if somehow called improperly
  }
}

export function decryptProfileData(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText;
    
    const [ivHex, authTagHex, encryptedData] = parts;
    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), 
      Buffer.from(ivHex, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (e) {
    return encryptedText; // If it fails, maybe it wasn't encrypted
  }
}
`;

fs.writeFileSync('src/lib/crypto.ts', c);
