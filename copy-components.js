const fs = require('fs');
const path = require('path');

// Function buat copy directory secara rekursif
function copyDir(src, dest) {
  // Buat destination directory kalo ga ada
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

// Buat .next/src/components/ui directory kalo ga ada
const uiComponentsSrc = path.join(__dirname, 'src', 'components', 'ui');
const uiComponentsDest = path.join(__dirname, '.next', 'src', 'components', 'ui');

console.log('Copying UI components for build...');
copyDir(uiComponentsSrc, uiComponentsDest);
console.log('UI components copied successfully!'); 