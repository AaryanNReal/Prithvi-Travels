// hooks/useMetadata.ts
'use client';

import { useEffect } from 'react';

type ImageMetadata = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
};

type Metadata = {
  title?: string;
  description?: string;
  image?: string | ImageMetadata;
  canonicalUrl?: string;
  keywords?: string;
  openGraph?: {
    type?: 'website' | 'article' | 'profile' | string;
    siteName?: string;
    title?: string;
    description?: string;
    images?: ImageMetadata[];
    url?: string;
    locale?: string;
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    images?: ImageMetadata[];
  };
  facebook?: {
    appId?: string;
  };
};

export function useMetadata(metadata: Metadata) {
  useEffect(() => {
    // Helper function to update or create meta tags
    const updateMeta = (property: string, content: string) => {
      // Try property first (for OpenGraph)
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      
      // Fall back to name attribute
      if (!element) {
        element = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
      }
      
      // Create new element if doesn't exist
      if (!element) {
        element = document.createElement('meta');
        if (property.startsWith('og:')) {
          element.setAttribute('property', property);
        } else {
          element.setAttribute('name', property);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Update document title
    if (metadata.title) {
      document.title = metadata.title;
    }

    // Standard meta tags
    if (metadata.description) {
      updateMeta('description', metadata.description);
    }

    if (metadata.keywords) {
      updateMeta('keywords', metadata.keywords);
    }

    // Handle image metadata (both simple string and object formats)
    const processImage = (image: string | ImageMetadata | undefined): ImageMetadata | null => {
      if (!image) return null;
      if (typeof image === 'string') {
        return { url: image };
      }
      return image;
    };

    // Get primary image (from either root or openGraph)
    const primaryImage = processImage(metadata.image) || 
                        (metadata.openGraph?.images?.[0]) || 
                        (metadata.twitter?.images?.[0]);

    // Open Graph meta tags (essential for sharing previews)
    if (metadata.openGraph || primaryImage) {
      const og = metadata.openGraph || {};
      
      // Basic OG tags
      updateMeta('og:type', og.type || 'website');
      if (og.siteName) updateMeta('og:site_name', og.siteName);
      updateMeta('og:title', og.title || metadata.title || document.title);
      updateMeta('og:description', og.description || metadata.description || '');
      updateMeta('og:url', og.url || metadata.canonicalUrl || window.location.href);
      if (og.locale) updateMeta('og:locale', og.locale);
      
      // Handle dates for articles
      if (og.publishedTime) updateMeta('article:published_time', og.publishedTime);
      if (og.modifiedTime) updateMeta('article:modified_time', og.modifiedTime);
      if (og.author) updateMeta('article:author', og.author);

      // Handle images (with full OG image properties)
      const images = og.images || (primaryImage ? [primaryImage] : []);
      if (images.length > 0) {
        const img = images[0];
        updateMeta('og:image', img.url);
        if (img.width) updateMeta('og:image:width', img.width.toString());
        if (img.height) updateMeta('og:image:height', img.height.toString());
        if (img.alt) updateMeta('og:image:alt', img.alt);
        if (img.type) updateMeta('og:image:type', img.type);
        
        // Additional images (for carousels)
        images.slice(1, 6).forEach((img, idx) => {
          updateMeta(`og:image:${idx + 1}`, img.url);
          if (img.width) updateMeta(`og:image:${idx + 1}:width`, img.width.toString());
          if (img.height) updateMeta(`og:image:${idx + 1}:height`, img.height.toString());
        });
      }
    }

    // Twitter Card meta tags
    if (metadata.twitter || primaryImage) {
      const tw = metadata.twitter || {};
      
      updateMeta('twitter:card', tw.card || (primaryImage?.width && primaryImage.width >= 800 ? 'summary_large_image' : 'summary'));
      if (tw.site) updateMeta('twitter:site', tw.site);
      if (tw.creator) updateMeta('twitter:creator', tw.creator);
      updateMeta('twitter:title', tw.title || metadata.title || document.title);
      updateMeta('twitter:description', tw.description || metadata.description || '');
      
      // Twitter images
      const images = tw.images || (primaryImage ? [primaryImage] : []);
      if (images.length > 0) {
        const img = images[0];
        updateMeta('twitter:image', img.url);
        if (img.alt) updateMeta('twitter:image:alt', img.alt);
      }
    }

    // Facebook App ID (if needed)
    if (metadata.facebook?.appId) {
      updateMeta('fb:app_id', metadata.facebook.appId);
    }

    // Canonical URL
    if (metadata.canonicalUrl) {
      let link = document.querySelector(`link[rel="canonical"]`) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', metadata.canonicalUrl);
    }

    // Cleanup function
    return () => {
      document.title = '';
      // Note: We don't clean up meta tags as they might be used by other components
    };
  }, [metadata]);
}