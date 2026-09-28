const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const regex = /^(\s*)const body = await request\.json\(\);$/gm;
      
      if (regex.test(content)) {
        content = content.replace(regex, `$1let body;
$1try {
$1  body = await request.json();
$1} catch (e) {
$1  return NextResponse.json({ success: false, error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
$1}`);
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir('src/app/api');
