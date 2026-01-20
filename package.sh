#!/bin/bash

# Get version from manifest.json
if command -v node &> /dev/null; then
  VERSION=$(node -p "require('./manifest.json').version")
else
  # Fallback to grep if node is not available
  VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)
fi
ZIP_NAME="video-speed-controller-v${VERSION}.zip"

echo "Packaging extension version ${VERSION}..."

# Remove old zip if exists
rm -f *.zip

# Create zip excluding unnecessary files
zip -r "${ZIP_NAME}" . \
  -x "*.git*" \
  -x "*.github*" \
  -x "*.DS_Store*" \
  -x "*node_modules*" \
  -x "*.zip" \
  -x "*.crx" \
  -x "*.pem" \
  -x "*.md" \
  -x "package.sh" \
  -x ".gitignore"

echo "✅ Package created: ${ZIP_NAME}"
echo "📦 Size: $(du -h ${ZIP_NAME} | cut -f1)"
