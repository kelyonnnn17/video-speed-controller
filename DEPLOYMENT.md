# Deployment Guide

This guide explains how to package and use the Video Speed Controller Chrome extension.

## Automatic Packaging (Recommended)

### How it works

Every time you push to `main` or `master` branch, GitHub Actions will:

1. ✅ Automatically package the extension into a `.zip` file
2. ✅ Create a GitHub Release with the packaged `.zip` file
3. ✅ Tag the release with the version number from `manifest.json`

### Usage

Simply push your code to GitHub:

```bash
git add .
git commit -m "Update extension"
git push origin main
```

The workflow will automatically:
- Package the extension
- Create a release (e.g., `v2.0.0`)
- Upload the `.zip` file to the release

### Installing from Release

1. Go to your GitHub repository → **Releases**
2. Download the latest `.zip` file
3. Extract the zip file to a folder
4. Open Chrome and go to `chrome://extensions/`
5. Enable **Developer mode** (toggle in top-right)
6. Click **Load unpacked**
7. Select the extracted folder

Your extension is now installed!

## Manual Packaging (Local)

To package the extension locally without GitHub:

```bash
# Make the script executable (first time only)
chmod +x package.sh

# Run the packaging script
./package.sh
```

This will create a `.zip` file (e.g., `video-speed-controller-v2.0.0.zip`) with the version number from `manifest.json`.

Then:
1. Extract the `.zip` file
2. Follow the installation steps above (steps 4-7)

## Version Management

The version is automatically read from `manifest.json`. To update:

1. Edit `manifest.json`:
   ```json
   {
     "version": "2.1.0"
   }
   ```

2. Commit and push:
   ```bash
   git add manifest.json
   git commit -m "Bump version to 2.1.0"
   git push origin main
   ```

The workflow will automatically create a release with the new version.

## File Structure

The packaging process automatically excludes:
- Git files (`.git/`, `.github/`)
- Documentation (`*.md`)
- Build artifacts (`.zip`, `.crx`, `.pem`)
- Node modules
- OS files (`.DS_Store`, etc.)
- Development scripts (`package.sh`)

Only the essential extension files are included in the package.

## Troubleshooting

### GitHub Actions not running?

- Make sure workflows are enabled in repository settings
- Check that you're pushing to `main` or `master` branch
- Verify the workflow files are in `.github/workflows/`

### Package not uploading?

- Check GitHub Actions logs for errors
- Ensure the `.zip` file is being created
- Verify you have write permissions to the repository

### Extension not loading?

- Make sure Developer mode is enabled
- Verify you selected the extracted folder (not the zip file)
- Check Chrome console for errors: right-click extension icon → Inspect popup

## Workflow Files

- `.github/workflows/package.yml` - Automatic packaging and release creation
