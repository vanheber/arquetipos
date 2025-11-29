const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = 'c:\\MAMP\\htdocs\\arquetipos';
const publicDir = path.join(sourceDir, 'public');
const deployDir = 'C:\\MAMP\\htdocs\\archetypes';

// Ensure deploy directory exists
if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
}

console.log(`Deploying from ${publicDir} to ${deployDir}...`);

// Use robocopy for Windows or cp for others. Since user is on Windows (MAMP), let's try a node-based recursive copy to be safe and cross-platform-ish, or just use fs.cpSync which is available in newer Node versions.
try {
    fs.cpSync(publicDir, deployDir, { recursive: true, force: true });
    console.log('Deploy successful!');
} catch (err) {
    console.error('Deploy failed:', err);
    process.exit(1);
}
