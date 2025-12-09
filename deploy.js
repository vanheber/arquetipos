const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = __dirname;
const publicDir = path.join(sourceDir, 'public');
const deployDir = 'C:\\MAMP\\htdocs\\arquetipos';

// Ensure deploy directory exists
if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
}

console.log(`Deploying from ${publicDir} to ${deployDir}...`);

try {
    // Copy all files and folders from publicDir to deployDir
    fs.cpSync(publicDir, deployDir, { recursive: true, force: true });
    console.log('Deploy successful!');
} catch (err) {
    console.error('Deploy failed:', err);
    process.exit(1);
}
