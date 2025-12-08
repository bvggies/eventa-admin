# Cloudinary Integration Guide

This guide explains how to use Cloudinary for optimized image delivery in the admin dashboard.

## Installation

Cloudinary React SDK is already installed:
- `@cloudinary/url-gen` - For URL generation and transformations
- `@cloudinary/react` - For React components

## Configuration

Cloudinary is configured in `src/utils/cloudinary.ts` with cloud name: `djqhvuyf4`

## Usage

### Option 1: Using CloudinaryImage Component (Recommended)

```tsx
import { CloudinaryImage } from '../components/CloudinaryImage';

// Basic usage
<CloudinaryImage 
  src="event-banner-123" 
  alt="Event Banner"
  width={800}
  height={400}
/>

// With custom options
<CloudinaryImage 
  src="https://res.cloudinary.com/djqhvuyf4/image/upload/v123/event-banner-123.jpg"
  alt="Event Banner"
  width={500}
  height={500}
  format="webp"
  quality="auto"
  gravity="face"
  className="rounded-lg"
  fallback="/default-banner.jpg"
/>
```

### Option 2: Using Utility Functions

```tsx
import { getImageUrl, getOptimizedImage } from '../utils/cloudinary';
import { AdvancedImage } from '@cloudinary/react';

// Get optimized URL string
const imageUrl = getImageUrl('event-banner-123', {
  width: 800,
  height: 400,
  format: 'auto',
  quality: 'auto'
});

// Use in regular img tag
<img src={imageUrl} alt="Event Banner" />

// Or use AdvancedImage component
const optimizedImage = getOptimizedImage('event-banner-123', {
  width: 800,
  height: 400
});

<AdvancedImage cldImg={optimizedImage} alt="Event Banner" />
```

### Option 3: Direct Cloudinary Instance

```tsx
import { cld } from '../utils/cloudinary';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';

const img = cld
  .image('event-banner-123')
  .format('auto')
  .quality('auto')
  .resize(auto().gravity(autoGravity()).width(500).height(500));

<AdvancedImage cldImg={img} alt="Event Banner" />
```

## Features

### Automatic Optimization
- **Format**: Automatically serves WebP when supported, falls back to original format
- **Quality**: Automatically adjusts quality based on device and network
- **Responsive**: Automatically resizes images based on viewport

### Transformations
- **Resize**: Automatically crop/resize to specified dimensions
- **Gravity**: Smart cropping (auto, face detection, center)
- **Format**: Convert to WebP, JPG, PNG, or auto-detect
- **Quality**: Auto-optimize or set specific quality (1-100)

## Examples

### Event Banner
```tsx
<CloudinaryImage 
  src={event.banner}
  alt={event.name}
  width={800}
  height={400}
  className="w-full h-48 object-cover"
/>
```

### User Avatar
```tsx
<CloudinaryImage 
  src={user.avatar}
  alt={user.name}
  width={100}
  height={100}
  format="webp"
  gravity="face"
  className="rounded-full"
  fallback="/default-avatar.png"
/>
```

### Gallery Thumbnail
```tsx
<CloudinaryImage 
  src={galleryItem.url}
  alt={`Gallery ${index + 1}`}
  width={200}
  height={200}
  className="w-full h-24 object-cover rounded-lg"
/>
```

## Public ID vs Full URL

The component accepts both:
- **Public ID**: `"event-banner-123"` (recommended)
- **Full URL**: `"https://res.cloudinary.com/djqhvuyf4/image/upload/v123/event-banner-123.jpg"`

The component automatically extracts the public ID from full URLs.

## Fallback Images

Always provide a fallback for better UX:
```tsx
<CloudinaryImage 
  src={event.banner}
  alt={event.name}
  fallback="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800"
/>
```

## Best Practices

1. **Always specify dimensions** for better performance
2. **Use format: 'auto'** for automatic format optimization
3. **Use quality: 'auto'** for automatic quality adjustment
4. **Provide fallback images** for better error handling
5. **Use face gravity** for profile pictures and avatars
6. **Use center gravity** for banners and backgrounds

