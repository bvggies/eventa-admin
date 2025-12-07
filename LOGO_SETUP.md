# Logo and Favicon Setup

The Eventa Admin Dashboard now uses the app logo throughout the application.

## Files Added

1. **`public/logo.png`** - Main logo file (copied from mobile app)
2. **`public/favicon.png`** - Favicon version of the logo
3. **`public/favicon.svg`** - SVG favicon with gradient "E" design
4. **`public/logo.svg`** - SVG logo version

## Where the Logo Appears

### 1. Browser Tab Favicon
- **Location**: Browser tab
- **Files**: `favicon.svg`, `favicon.png`, `favicon.ico`
- **Updated in**: `public/index.html`

### 2. Login Page
- **Location**: Top of login form
- **File**: `public/logo.png`
- **Updated in**: `src/pages/LoginPage.tsx`
- **Fallback**: SVG logo → Text "E" if images fail to load

### 3. Dashboard Navigation
- **Location**: Top-left navigation bar
- **File**: `public/logo.png`
- **Updated in**: `src/components/Layout.tsx`
- **Fallback**: SVG logo → Text "E" if images fail to load

### 4. PWA/Manifest
- **Location**: App icon when installed as PWA
- **Files**: `logo.png`, `logo192.png`, `logo512.png`
- **Updated in**: `public/manifest.json`

### 5. Vercel Deployment
- The favicon and logo files are automatically included in the build
- Vercel will serve these files from the `public/` directory

## Generating Additional Favicon Sizes (Optional)

If you need to generate additional favicon sizes, you can use online tools like:
- https://realfavicongenerator.net/
- https://favicon.io/

Or use ImageMagick/GraphicsMagick:
```bash
# Generate 16x16 favicon
convert logo.png -resize 16x16 favicon-16x16.png

# Generate 32x32 favicon
convert logo.png -resize 32x32 favicon-32x32.png

# Generate .ico file
convert logo.png -resize 16x16 -resize 32x32 -resize 48x48 favicon.ico
```

## Current Setup

The current setup uses:
- **SVG favicon** (modern browsers) - `favicon.svg`
- **PNG favicon** (fallback) - `favicon.png`
- **ICO favicon** (legacy browsers) - `favicon.ico`
- **Logo images** - `logo.png` for all sizes

All files are in the `public/` directory and will be automatically included in the build.

