// hooks/useMetadata.ts
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
    // Helper to ensure image URLs are absolute
    const ensureAbsoluteUrl = (url: string) => {
      if (!url) return '';
      return url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;
    };

    // Helper to update or create meta tags
    const updateMeta = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
      }
      if (!element) {
        element = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('article:')) {
          element.setAttribute('property', property);
        } else {
          element.setAttribute('name', property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Set document title
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

    // Process image metadata (string or object)
    const processImage = (image: string | ImageMetadata | undefined): ImageMetadata | null => {
      if (!image) return null;
      if (typeof image === 'string') {
        return { url: ensureAbsoluteUrl(image) };
      }
      return { ...image, url: ensureAbsoluteUrl(image.url) };
    };

    // Get primary image (from root, openGraph, or twitter)
    const primaryImage = processImage(metadata.image) || 
                        (metadata.openGraph?.images?.[0]) || 
                        (metadata.twitter?.images?.[0]);

    // Open Graph (essential for social previews)
    if (metadata.openGraph || primaryImage) {
      const og = metadata.openGraph || {};
      const siteName = og.siteName || 'Prithvi Travels'; // Default to your site name
      
      updateMeta('og:type', og.type || 'website');
      updateMeta('og:site_name', siteName);
      updateMeta('og:title', og.title || metadata.title || document.title);
      updateMeta('og:description', og.description || metadata.description || '');
      updateMeta('og:url', og.url || metadata.canonicalUrl || window.location.href);
      
      // Handle images
      const images = og.images || (primaryImage ? [primaryImage] : []);
      if (images.length > 0) {
        const img = images[0];
        updateMeta('og:image', img.url);
        if (img.width) updateMeta('og:image:width', img.width.toString());
        if (img.height) updateMeta('og:image:height', img.height.toString());
        if (img.alt) updateMeta('og:image:alt', img.alt || og.title || metadata.title || '');
        if (img.type) updateMeta('og:image:type', img.type);
      }

      // Article-specific tags (for blogs/news)
      if (og.type === 'article') {
        if (og.publishedTime) updateMeta('article:published_time', og.publishedTime);
        if (og.modifiedTime) updateMeta('article:modified_time', og.modifiedTime);
        if (og.author) updateMeta('article:author', og.author);
      }
    }

    // Twitter Card (for Twitter previews)
    if (metadata.twitter || primaryImage) {
      const tw = metadata.twitter || {};
      const cardType = tw.card || (primaryImage?.width && primaryImage.width >= 800 ? 'summary_large_image' : 'summary');
      
      updateMeta('twitter:card', cardType);
      if (tw.site) updateMeta('twitter:site', tw.site);
      updateMeta('twitter:creator', tw.creator || tw.site || ''); // Fallback to site handle
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

    // Facebook App ID (optional)
    if (metadata.facebook?.appId) {
      updateMeta('fb:app_id', metadata.facebook.appId);
    }

    // Canonical URL (SEO)
    if (metadata.canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = metadata.canonicalUrl;
    }

    return () => {
      document.title = '';
      // Note: Meta tags are not cleaned up to avoid conflicts
    };
  }, [metadata]);
}