#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t };

console.log('Starting deployment configuration check...\n');

const files = {
  // Required files
  required: [
    { path: 'client/src/App.js', description: 'React application entry point' },
    { path: 'client/public/index.html', description: 'HTML template' },
    { path: 'client/package.json', description: 'Client dependencies' },
    { path: 'server/index.js', description: 'Server entry point' },
    { path: 'package.json', description: 'Project configuration' },
    { path: 'README.md', description: 'Project documentation' }
  ],
  
  // Deployment specific files
  deployment: [
    { path: 'netlify.toml', description: 'Netlify configuration' },
    { path: 'vercel.json', description: 'Vercel configuration' },
    { path: 'netlify/functions/api.js', description: 'Netlify serverless function' },
    { path: 'client/public/_redirects', description: 'Netlify redirects' },
    { path: 'vercel-build.js', description: 'Vercel build script' }
  ],
  
  // Optional but recommended files
  recommended: [
    { path: '.env.example', description: 'Environment variables template' },
    { path: '.gitignore', description: 'Git ignore file' },
    { path: 'client/public/robots.txt', description: 'Search engine instructions' },
    { path: 'client/public/sitemap.xml', description: 'Site map for SEO' }
  ]
};

// Check directories
const directories = [
  { path: 'client/build', create: true, description: 'Client build output' },
  { path: 'server/uploads', create: true, description: 'File uploads directory' },
  { path: 'server/temp', create: true, description: 'Temporary files' },
  { path: 'server/cache', create: true, description: 'Cache files' },
  { path: 'docs', create: false, description: 'Documentation files' },
  { path: 'client/public/docs', create: true, description: 'Public documentation files' },
  { path: 'netlify/functions', create: false, description: 'Netlify functions' }
];

// Helper function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Check required files
console.log(chalk.blue('Checking required files:'));
let allRequiredFound = true;
files.required.forEach(file => {
  const exists = fileExists(file.path);
  console.log(`  ${exists ? chalk.green('✓') : chalk.red('✗')} ${file.path} (${file.description})`);
  if (!exists) allRequiredFound = false;
});

// Check deployment files
console.log('\n' + chalk.blue('Checking deployment files:'));
let allDeploymentFound = true;
files.deployment.forEach(file => {
  const exists = fileExists(file.path);
  console.log(`  ${exists ? chalk.green('✓') : chalk.red('✗')} ${file.path} (${file.description})`);
  if (!exists) allDeploymentFound = false;
});

// Check recommended files
console.log('\n' + chalk.blue('Checking recommended files:'));
files.recommended.forEach(file => {
  const exists = fileExists(file.path);
  console.log(`  ${exists ? chalk.green('✓') : chalk.yellow('?')} ${file.path} (${file.description})`);
});

// Check and create directories
console.log('\n' + chalk.blue('Checking directories:'));
directories.forEach(dir => {
  const exists = fileExists(dir.path);
  console.log(`  ${exists ? chalk.green('✓') : (dir.create ? chalk.yellow('?') : chalk.red('✗'))} ${dir.path} (${dir.description})`);
  
  // Create directory if specified
  if (!exists && dir.create) {
    try {
      fs.mkdirSync(dir.path, { recursive: true });
      console.log(`    ${chalk.green('✓')} Created ${dir.path}`);
    } catch (err) {
      console.log(`    ${chalk.red('✗')} Failed to create ${dir.path}: ${err.message}`);
    }
  }
});

// Check package.json scripts
console.log('\n' + chalk.blue('Checking package.json scripts:'));
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['build', 'start', 'install-all', 'netlify-build', 'vercel-build'];
  
  requiredScripts.forEach(script => {
    const hasScript = pkg.scripts && pkg.scripts[script];
    console.log(`  ${hasScript ? chalk.green('✓') : chalk.red('✗')} ${script}`);
  });
  
} catch (err) {
  console.log(`  ${chalk.red('✗')} Error reading package.json: ${err.message}`);
}

// Summary
console.log('\n' + chalk.blue('Deployment readiness summary:'));
console.log(`  Required files: ${allRequiredFound ? chalk.green('All present') : chalk.red('Missing some files')}`);
console.log(`  Deployment files: ${allDeploymentFound ? chalk.green('All present') : chalk.yellow('Some configuration missing')}`);
console.log(`  Overall: ${(allRequiredFound && allDeploymentFound) ? chalk.green('Ready for deployment') : chalk.yellow('Needs attention')}`);

if (!allRequiredFound || !allDeploymentFound) {
  console.log('\n' + chalk.yellow('Please address the missing files before deployment.'));
} else {
  console.log('\n' + chalk.green('Your project is ready for deployment to Netlify and Vercel!'));
}

console.log('\nDeployment instructions:');
console.log(`  1. For Netlify: Connect your GitHub repository and use build command 'npm run netlify-build'`);
console.log(`  2. For Vercel: Connect your GitHub repository and Vercel will use the vercel.json configuration`);
console.log(`  3. Remember to set environment variables in your deployment platform`); 