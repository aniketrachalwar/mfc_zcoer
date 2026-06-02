const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const regex1 = /<div\s+className=\"w-12\s+h-12\s+border-4\s+border-firefox-orange\s+border-t-transparent\s+rounded-full\s+animate-spin\"\s*\/>/g;
    const regex2 = /<div\s+className=\"w-10\s+h-10\s+border-4\s+border-firefox-orange\s+border-t-transparent\s+rounded-full\s+animate-spin\"\s*\/>/g;
    const regex3 = /<div\s+className=\"w-8\s+h-8\s+border-4\s+border-firefox-orange\s+border-t-transparent\s+rounded-full\s+animate-spin\"\s*\/>/g;
    const regex4 = /<Loader2\s+className=\"text-firefox-orange\s+animate-spin\"\s+size=\{48\}\s*\/>/g;
    const regex5 = /<Loader2\s+className=\"animate-spin\s+text-firefox-orange\"\s+size=\{48\}\s*\/>/g;
    // adding a few more for consistency
    const regex6 = /<Loader2\s+className=\"w-8\s+h-8\s+text-firefox-orange\s+animate-spin\s+mx-auto\"\s*\/>/g;
    const regex7 = /<div\s+className=\"inline-block\s+w-8\s+h-8\s+border-4\s+border-firefox-orange\s+border-t-transparent\s+rounded-full\s+animate-spin\"\s*\/>/g;

    let changed = false;
    [regex1, regex2, regex3, regex4, regex5, regex6, regex7].forEach(r => {
      if (r.test(content)) {
        content = content.replace(r, '<PageLoader fullScreen={false} />');
        changed = true;
      }
    });

    if (changed) {
      if (!content.includes('import PageLoader')) {
        let pathParts = filePath.split(path.sep);
        let importPath = '';
        if (pathParts[1] === 'components') {
            if (pathParts.length === 3) importPath = './PageLoader';
            else if (pathParts.length === 4) importPath = '../PageLoader';
            else if (pathParts.length === 5) importPath = '../../PageLoader';
        } else {
            if (pathParts.length === 2) importPath = './components/PageLoader';
        }
        
        const importRegex = /import [^\n]+;\n/;
        // Try to insert after the last import
        const matches = [...content.matchAll(/import [^\n]+;\n/g)];
        if (matches.length > 0) {
           const lastMatch = matches[matches.length - 1];
           const insertPos = lastMatch.index + lastMatch[0].length;
           content = content.slice(0, insertPos) + `import PageLoader from '${importPath}';\n` + content.slice(insertPos);
        } else {
           content = `import PageLoader from '${importPath}';\n` + content;
        }
      }
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
