import React from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { getOptimizedImage, extractPublicId } from '../utils/cloudinary';

interface CloudinaryImageProps {
  src: string; // Can be a Cloudinary URL or public ID
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  quality?: 'auto' | number;
  gravity?: 'auto' | 'face' | 'center';
  fallback?: string; // Fallback image URL if Cloudinary fails
}

/**
 * CloudinaryImage component - Optimized image display using Cloudinary
 * 
 * Usage:
 * <CloudinaryImage 
 *   src="event-banner-123" 
 *   alt="Event Banner"
 *   width={800}
 *   height={400}
 * />
 */
export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  format = 'auto',
  quality = 'auto',
  gravity = 'auto',
  fallback,
}) => {
  // Extract public ID from URL if it's a full Cloudinary URL
  const publicId = extractPublicId(src) || src;

  // Check if it's a Cloudinary URL or public ID
  const isCloudinaryUrl = src.includes('cloudinary.com') || src.includes('res.cloudinary.com');
  const isPublicId = !src.includes('http') && !src.includes('/');

  // If it's not a Cloudinary image, use regular img tag
  if (!isCloudinaryUrl && !isPublicId && !fallback) {
    return <img src={src} alt={alt} className={className} />;
  }

  // If we have a fallback and it's not a Cloudinary image, use fallback
  if (!isCloudinaryUrl && !isPublicId && fallback) {
    return <img src={fallback} alt={alt} className={className} />;
  }

  try {
    // Get optimized Cloudinary image
    const optimizedImage = getOptimizedImage(publicId, {
      width,
      height,
      format,
      quality,
      gravity,
    });

    return (
      <AdvancedImage
        cldImg={optimizedImage}
        alt={alt}
        className={className}
        onError={(e: any) => {
          // Fallback to regular img if Cloudinary fails
          if (fallback) {
            e.target.src = fallback;
          }
        }}
      />
    );
  } catch (error) {
    console.error('Error loading Cloudinary image:', error);
    // Fallback to regular img tag
    return <img src={fallback || src} alt={alt} className={className} />;
  }
};

