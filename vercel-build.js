const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure we're in the root directory
process.chdir(path.join(__dirname));

console.log('Starting Vercel build preparation...');

// Create necessary folders
['client/build', 'server/uploads', 'server/temp', 'server/cache'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Check if docs directory exists and copy to client/public/docs if needed
if (fs.existsSync('docs') && !fs.existsSync('client/public/docs')) {
  fs.mkdirSync('client/public/docs', { recursive: true });
  console.log('Created client/public/docs directory');
  
  try {
    console.log('Copying documentation files to client/public/docs...');
    fs.cpSync('docs', 'client/public/docs', { recursive: true });
  } catch (error) {
    console.error('Error copying docs:', error);
  }
}

// Install dependencies
try {
  console.log('Installing dependencies...');
  execSync('npm run install-all', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// Build client
try {
  console.log('Building client application...');
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building client:', error);
  process.exit(1);
}

console.log('Vercel build preparation completed!'); 