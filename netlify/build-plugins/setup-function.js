const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = {
  onPreBuild: ({ utils }) => {
    console.log('Setting up API function dependencies...');
    
    const functionDir = path.join(process.cwd(), 'netlify/functions');
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const functionPackageJsonPath = path.join(functionDir, 'package.json');
    
    // Ensure the function directory exists
    if (!fs.existsSync(functionDir)) {
      fs.mkdirSync(functionDir, { recursive: true });
      console.log('Created function directory:', functionDir);
    }
    
    // Copy necessary dependencies to function package.json
    if (fs.existsSync(packageJsonPath)) {
      const rootPackage = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Create a simplified package.json for the functions
      const functionPackage = {
        name: 'converter-api-functions',
        version: rootPackage.version || '1.0.0',
        private: true,
        dependencies: {}
      };
      
      // Copy required dependencies
      const requiredDeps = [
        'express', 'serverless-http', 'cors', 'multer', 'pdf-lib', 
        'sharp', 'uuid', 'fs-extra'
      ];
      
      requiredDeps.forEach(dep => {
        if (rootPackage.dependencies && rootPackage.dependencies[dep]) {
          functionPackage.dependencies[dep] = rootPackage.dependencies[dep];
        }
      });
      
      // Write function package.json
      fs.writeFileSync(
        functionPackageJsonPath, 
        JSON.stringify(functionPackage, null, 2)
      );
      console.log('Created function package.json');
      
      try {
        // Install dependencies in the function directory
        console.log('Installing function dependencies...');
        execSync('npm install', { 
          cwd: functionDir, 
          stdio: 'inherit' 
        });
        console.log('Function dependencies installed successfully');
      } catch (error) {
        utils.build.failBuild('Failed to install function dependencies', { error });
      }
    } else {
      utils.build.failBuild('Root package.json not found');
    }
  }
}; 