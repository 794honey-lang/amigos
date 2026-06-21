#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=== Starting Amigos Monorepo Build for GitHub Pages ==="

# 1. Clean and build all applications
echo "Building Customer App..."
npm run customer:build

echo "Building Admin Console..."
npm run admin:build

# 2. Setup consolidated deployment directory
echo "Setting up consolidated 'dist' directory..."
rm -rf dist
mkdir -p dist

# 3. Place the landing page at root
echo "Copying root landing page..."
if [ -f index.html ]; then
  cp index.html dist/
else
  echo "Error: root index.html not found!"
  exit 1
fi

# 4. Copy sub-app builds to their subdirectories
echo "Copying Customer App build..."
mkdir -p dist/customer
cp -r customer-app/dist/* dist/customer/

echo "Copying Admin Console build..."
mkdir -p dist/admin
cp -r admin-app/dist/* dist/admin/

# 5. Place .nojekyll file to bypass Jekyll processing on GitHub Pages
echo "Creating .nojekyll file..."
touch dist/.nojekyll

echo "=== Build Complete! ==="
echo "All assets have been consolidated into the 'dist/' folder."
echo ""
echo "To deploy to GitHub Pages:"
echo "1. Initialize a git repository if you haven't already:"
echo "   git init"
echo "2. Add your GitHub remote repository:"
echo "   git remote add origin <your-github-repo-url>"
echo "3. You can deploy the 'dist' folder to the 'gh-pages' branch using gh-pages npm package or manually:"
echo "   npx -y gh-pages -d dist"
echo "   (or commit/push the 'dist' folder to a repository branch and set it in GitHub repository Pages settings)"
