#!/usr/bin/env node

/**
 * Advanced File Converter Setup Script
 * 
 * This script guides users through the setup process for the Advanced File Converter application.
 * Run this script with: node setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for prettier output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

/**
 * Helper function to log colorful messages
 */
function log(message, type = 'info') {
  switch(type) {
    case 'error':
      console.log(`${colors.fg.red}${message}${colors.reset}`);
      break;
    case 'success':
      console.log(`${colors.fg.green}${message}${colors.reset}`);
      break;
    case 'warning':
      console.log(`${colors.fg.yellow}${message}${colors.reset}`);
      break;
    case 'title':
      console.log(`\n${colors.fg.cyan}${colors.bright}${message}${colors.reset}\n`);
      break;
    case 'subtitle':
      console.log(`\n${colors.fg.blue}${message}${colors.reset}`);
      break;
    default:
      console.log(message);
  }
}

/**
 * Helper function to run shell commands safely
 */
function runCommand(command) {
  try {
    log(`Running: ${command}`, 'subtitle');
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Failed to execute: ${command}`, 'error');
    log(error.message, 'error');
    return false;
  }
}

/**
 * Check if a directory exists, and create it if specified
 */
function ensureDirectoryExists(dirPath, create = false) {
  try {
    if (fs.existsSync(dirPath)) {
      return true;
    } else if (create) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`Created directory: ${dirPath}`, 'success');
      return true;
    }
    return false;
  } catch (error) {
    log(`Error checking directory ${dirPath}: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Display welcome message
 */
function welcome() {
  console.clear();
  log('=========================================================', 'title');
  log('             ADVANCED FILE CONVERTER SETUP               ', 'title');
  log('=========================================================', 'title');
  log('This script will guide you through setting up the Advanced File Converter application.');
  log('It will check prerequisites, install dependencies, and prepare the environment.');
  log('\nPress Enter to continue or Ctrl+C to exit.', 'warning');
  
  return new Promise(resolve => {
    rl.question('', answer => {
      resolve();
    });
  });
}

/**
 * Check system requirements
 */
async function checkPrerequisites() {
  log('Checking system prerequisites...', 'title');
  
  let allRequirementsMet = true;
  
  // Check Node.js version
  try {
    const nodeVersion = execSync('node -v').toString().trim();
    const versionMatch = nodeVersion.match(/v(\d+)\./);
    const majorVersion = versionMatch ? parseInt(versionMatch[1]) : 0;
    
    if (majorVersion >= 18) {
      log(`✓ Node.js version: ${nodeVersion} (Compatible)`, 'success');
    } else {
      log(`✗ Node.js version: ${nodeVersion} (Requires v18 or higher)`, 'error');
      allRequirementsMet = false;
    }
  } catch (error) {
    log('✗ Node.js not found. Please install Node.js v18 or higher.', 'error');
    allRequirementsMet = false;
  }
  
  // Check npm version
  try {
    const npmVersion = execSync('npm -v').toString().trim();
    const majorVersion = parseInt(npmVersion.split('.')[0]);
    
    if (majorVersion >= 9) {
      log(`✓ npm version: ${npmVersion} (Compatible)`, 'success');
    } else {
      log(`✗ npm version: ${npmVersion} (Requires v9 or higher)`, 'error');
      allRequirementsMet = false;
    }
  } catch (error) {
    log('✗ npm not found. Please install npm v9 or higher.', 'error');
    allRequirementsMet = false;
  }
  
  if (!allRequirementsMet) {
    log('\nSome system requirements are not met. Would you like to continue anyway? (y/n)', 'warning');
    return new Promise(resolve => {
      rl.question('', answer => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          log('Continuing setup despite unmet requirements...', 'warning');
          resolve(true);
        } else {
          log('Setup aborted. Please install the required dependencies and try again.', 'error');
          resolve(false);
        }
      });
    });
  }
  
  return true;
}

/**
 * Install application dependencies
 */
async function installDependencies() {
  log('Installing application dependencies...', 'title');
  
  // Check if node_modules exists and if user wants to reinstall
  if (fs.existsSync('node_modules')) {
    log('Dependencies appear to be already installed.', 'warning');
    log('Would you like to reinstall dependencies? (y/n)');
    
    const answer = await new Promise(resolve => {
      rl.question('', ans => {
        resolve(ans.toLowerCase());
      });
    });
    
    if (answer !== 'y' && answer !== 'yes') {
      log('Skipping dependency installation.', 'warning');
      return true;
    }
  }
  
  // Install server dependencies
  if (!runCommand('npm install')) {
    log('Failed to install server dependencies. Would you like to continue? (y/n)', 'error');
    const answer = await new Promise(resolve => {
      rl.question('', ans => {
        resolve(ans.toLowerCase());
      });
    });
    
    if (answer !== 'y' && answer !== 'yes') {
      return false;
    }
  }
  
  // Install client dependencies
  if (fs.existsSync('client/package.json')) {
    if (!runCommand('cd client && npm install')) {
      log('Failed to install client dependencies. Would you like to continue? (y/n)', 'error');
      const answer = await new Promise(resolve => {
        rl.question('', ans => {
          resolve(ans.toLowerCase());
        });
      });
      
      if (answer !== 'y' && answer !== 'yes') {
        return false;
      }
    }
  } else {
    log('Client package.json not found. Skipping client dependencies.', 'warning');
  }
  
  return true;
}

/**
 * Set up directory structure
 */
function setupDirectories() {
  log('Setting up directory structure...', 'title');
  
  const directories = [
    { path: 'client/build', create: true, description: 'Client build output' },
    { path: 'server/uploads', create: true, description: 'File uploads directory' },
    { path: 'server/temp', create: true, description: 'Temporary files' },
    { path: 'server/cache', create: true, description: 'Cache files' },
    { path: 'docs', create: false, description: 'Documentation files' },
    { path: 'client/public/docs', create: true, description: 'Public documentation files' },
    { path: 'netlify/functions', create: false, description: 'Netlify functions' }
  ];
  
  for (const dir of directories) {
    const exists = ensureDirectoryExists(dir.path, dir.create);
    log(`${exists ? '✓' : '✗'} ${dir.path} (${dir.description})`, exists ? 'success' : 'warning');
  }
  
  return true;
}

/**
 * Build the client application for production
 */
async function buildClientApplication() {
  log('Building the client application...', 'title');
  
  log('Would you like to build the client application for production? (y/n)');
  const answer = await new Promise(resolve => {
    rl.question('', ans => {
      resolve(ans.toLowerCase());
    });
  });
  
  if (answer !== 'y' && answer !== 'yes') {
    log('Skipping client build.', 'warning');
    return true;
  }
  
  // Check if we're on Windows or Unix
  const isWindows = process.platform === 'win32';
  const buildCommand = isWindows ? 'npm run win-build' : 'npm run build';
  
  return runCommand(buildCommand);
}

/**
 * Start the application
 */
async function startApplication() {
  log('Starting the application...', 'title');
  
  log('Would you like to start the application now? (y/n)');
  const answer = await new Promise(resolve => {
    rl.question('', ans => {
      resolve(ans.toLowerCase());
    });
  });
  
  if (answer !== 'y' && answer !== 'yes') {
    log('Application setup complete. You can start it later with: npm run dev (for development) or npm start (for production)', 'success');
    return true;
  }
  
  log('Choose startup mode:', 'subtitle');
  log('1. Development mode (with hot reloading)');
  log('2. Production mode');
  
  const modeAnswer = await new Promise(resolve => {
    rl.question('Enter your choice (1 or 2): ', ans => {
      resolve(ans.trim());
    });
  });
  
  if (modeAnswer === '1') {
    log('Starting in development mode...', 'success');
    runCommand('npm run dev');
  } else {
    log('Starting in production mode...', 'success');
    runCommand('npm start');
  }
  
  return true;
}

/**
 * Main setup function
 */
async function setup() {
  try {
    await welcome();
    const prereqOk = await checkPrerequisites();
    if (!prereqOk) return;
    
    const dependenciesOk = await installDependencies();
    if (!dependenciesOk) return;
    
    const directoriesOk = setupDirectories();
    if (!directoriesOk) return;
    
    const buildOk = await buildClientApplication();
    if (!buildOk) return;
    
    const startOk = await startApplication();
    if (!startOk) return;
    
    log('\nSetup completed successfully!', 'success');
  } catch (error) {
    log(`Setup failed with error: ${error.message}`, 'error');
  } finally {
    rl.close();
  }
}

// Run the setup function
setup(); 