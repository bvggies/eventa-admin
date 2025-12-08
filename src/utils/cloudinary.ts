import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';

// Initialize Cloudinary instance
export const cld = new Cloudinary({ 
  cloud: { 
    cloudName: 'djqhvuyf4' // Your Cloudinary cloud name
  } 
});

/**
 * Get optimized image URL from Cloudinary
 * @param publicId - The public ID of the image in Cloudinary
 * @param options - Optional transformation options
 * @returns Cloudinary image instance
 */
export const getOptimizedImage = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    quality?: 'auto' | number;
    gravity?: 'auto' | 'face' | 'center';
  }
) => {
  let img = cld.image(publicId);

  // Set format (default: auto)
  if (options?.format) {
    img = img.format(options.format);
  } else {
    img = img.format('auto');
  }

  // Set quality (default: auto)
  if (options?.quality) {
    if (options.quality === 'auto') {
      img = img.quality('auto');
    } else {
      img = img.quality(options.quality);
    }
  } else {
    img = img.quality('auto');
  }

  // Apply resize transformation if dimensions are provided
  if (options?.width || options?.height) {
    const resizeAction = auto();
    
    if (options.width) {
      resizeAction.width(options.width);
    }
    
    if (options.height) {
      resizeAction.height(options.height);
    }

    // Set gravity (autoGravity handles smart cropping automatically)
    resizeAction.gravity(autoGravity());

    img = img.resize(resizeAction);
  }

  return img;
};

/**
 * Get image URL string (for use in img src or background-image)
 * @param publicId - The public ID of the image in Cloudinary
 * @param options - Optional transformation options
 * @returns URL string
 */
export const getImageUrl = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    quality?: 'auto' | number;
    gravity?: 'auto' | 'face' | 'center';
  }
): string => {
  return getOptimizedImage(publicId, options).toURL();
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - Full Cloudinary URL
 * @returns Public ID or null if not a Cloudinary URL
 */
export const extractPublicId = (url: string): string | null => {
  try {
    // Match Cloudinary URL pattern
    const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp|mp4|mov)/i);
    if (match && match[1]) {
      return match[1];
    }
    
    // If it's already a public ID (no URL format)
    if (!url.includes('http') && !url.includes('/')) {
      return url;
    }
    
    return null;
  } catch {
    return null;
  }
};

