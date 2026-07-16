const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(__dirname, 'www');

// List of files and folders to copy
const assetsToCopy = [
  'index.html',
  'auth.html',
  'dashboard.html',
  'manifest.json',
  'css',
  'js',
  'img'
];

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    // Ensure parent dir exists
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

console.log('Cleaning target directory (www/)...');
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });

// Copy files
assetsToCopy.forEach((item) => {
  const srcPath = path.join(srcDir, item);
  const destPath = path.join(destDir, item);
  if (fs.existsSync(srcPath)) {
    copyRecursiveSync(srcPath, destPath);
    console.log(`Copied ${item} to www/`);
  } else {
    console.warn(`Warning: ${item} not found`);
  }
});
console.log('Build completed successfully!');
