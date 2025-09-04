#!/usr/bin/env node

// Setup script for Addiction Control Web App
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Setting up Addiction Control Web App...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 16) {
  console.error('❌ Node.js 16 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}
console.log('✅ Node.js version check passed:', nodeVersion);

// Check if .env.local exists
const envPath = path.join(projectRoot, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envTemplate = `# Addiction Control App Environment Variables
# Copy this file to .env.local and fill in your actual values

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Hugging Face API
VITE_HF_API_TOKEN=your_huggingface_api_token_here

# Optional Analytics
VITE_GA_TRACKING_ID=your_google_analytics_id_here
VITE_SENTRY_DSN=your_sentry_dsn_here

# App Configuration
VITE_APP_VERSION=1.0.0
VITE_APP_NAME="Addiction Control"
`;
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env.local created! Please fill in your API keys.');
} else {
  console.log('✅ .env.local already exists');
}

// Check if directories exist
const dirs = ['public/icons', 'public/screenshots'];
dirs.forEach(dir => {
  const dirPath = path.join(projectRoot, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Creating directory: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

// Create placeholder icon files info
const iconInfo = {
  'public/icons/README.md': `# PWA Icons

This directory should contain the following icon files for the PWA:

## Required Icons:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Optional Icons:
- badge-72x72.png
- shortcut-log.png
- shortcut-assistant.png
- shortcut-sos.png
- checkmark.png
- xmark.png

## Generate Icons:
You can use tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- Adobe Photoshop/Illustrator
- GIMP (free alternative)

## Icon Guidelines:
- Use PNG format
- Square aspect ratio
- Simple, recognizable design
- High contrast for visibility
- Consistent color scheme with app theme (#3b82f6)
`
};

Object.entries(iconInfo).forEach(([filePath, content]) => {
  const fullPath = path.join(projectRoot, filePath);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content);
    console.log(`📄 Created: ${filePath}`);
  }
});

// Check dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const requiredDeps = [
    '@supabase/supabase-js',
    'react',
    'react-dom',
    'react-router-dom',
    'recharts',
    'framer-motion',
    'lucide-react',
    'date-fns'
  ];

  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  if (missingDeps.length > 0) {
    console.log('❌ Missing dependencies:', missingDeps.join(', '));
    console.log('💡 Run: npm install to install missing dependencies');
  } else {
    console.log('✅ All required dependencies are present');
  }
} catch (error) {
  console.error('❌ Error checking dependencies:', error.message);
}

// Setup checklist
console.log('\n📋 Setup Checklist:');
console.log('1. ✅ Node.js version check');
console.log('2. ✅ Environment file created');
console.log('3. ✅ Directory structure created');
console.log('4. ✅ Dependencies checked');
console.log('');
console.log('🔧 Next Steps:');
console.log('1. Fill in your API keys in .env.local');
console.log('2. Set up Supabase project and run database/schema.sql');
console.log('3. Generate PWA icons (see public/icons/README.md)');
console.log('4. Run "npm run dev" to start development');
console.log('');
console.log('📚 Documentation:');
console.log('- Setup Guide: SETUP.md');
console.log('- Database Schema: database/schema.sql');
console.log('- PWA Manifest: public/manifest.json');
console.log('');
console.log('🎉 Setup complete! Happy coding!');

// Check if we can run the dev server
const hasEnvVars = fs.readFileSync(envPath, 'utf8').includes('your_supabase_project_url_here');
if (hasEnvVars) {
  console.log('');
  console.log('⚠️  Remember to update .env.local with your actual API keys before running the app!');
}
