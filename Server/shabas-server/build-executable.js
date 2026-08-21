const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function buildExecutable() {
  try {
    // Build React app
    console.log('Building React application...');
    await execAsync('npm run build');

    // Package Node.js app
    console.log('Creating executable...');
    await execAsync('pkg .');

    console.log('Build complete! Check the current directory for executables.');
  } catch (error) {
    console.error('Error during build:', error);
  }
}

buildExecutable();