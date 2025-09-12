#!/bin/bash

# Build script for GitHub Pages deployment

echo "Building for GitHub Pages..."

# Run the standard build process
npm run build

# Copy the 404.html file to the build output
if [ -f "client/public/404.html" ]; then
  cp client/public/404.html dist/public/
  echo "Copied 404.html to dist/public/"
else
  echo "Warning: 404.html not found in client/public/"
fi

# Create a CNAME file if you're using a custom domain
# echo "yourdomain.com" > dist/public/CNAME

# List contents of build directory
echo "Contents of build directory:"
ls -la dist/public/

echo "Build completed."