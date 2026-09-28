const fs = require('fs');
let content = fs.readFileSync('src/components/profile/settings-form.tsx', 'utf8');

const parts = content.split('await update({ name: data?.name, image: avatar });');
if (parts.length === 3) {
  content = parts[0] + 'await update({ image: data.url });' + parts[1] + 'await update({ name: data.name, image: avatar });' + parts[2];
  fs.writeFileSync('src/components/profile/settings-form.tsx', content);
} else {
  console.log("Not found 2 occurrences", parts.length);
}
