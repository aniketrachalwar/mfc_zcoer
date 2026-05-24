const fs = require('fs');
let content = fs.readFileSync('src/lib/AuthContext.tsx', 'utf8');
content = content.replace(
  'setError("Login failed. Please try again or open the app in a new tab.");',
  'setError(`Login failed: ${err.message || err.code || "Unknown error"}`);'
);
content = content.replace(
  'setError("Login failed: " + err.message);',
  'setError(`Login failed: ${err.message || err.code || "Unknown error"}`);'
);
fs.writeFileSync('src/lib/AuthContext.tsx', content);
console.log('Updated AuthContext');
