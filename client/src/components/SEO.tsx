import { useEffect } from "react";
import { useLocation } from "wouter";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
}

const BASE_URL = "https://ddl-dubai.com";

/**
 * SEO Component - Manages canonical URLs, hreflang tags, and meta tags
 * Dynamically updates based on current route
 */
export function SEO({ title, description, image, type = "website", noindex = false }: SEOProps) {
  const [location] = useLocation();

  useEffect(() => {
    // Generate canonical URL
    const canonicalUrl = `${BASE_URL}${location === "/" ? "" : location}`;

    // Remove existing canonical and hreflang tags
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');

    if (existingCanonical) {
      existingCanonical.remove();
    }
    existingHreflangs.forEach((tag) => tag.remove());

    // Add canonical link
    const canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    canonicalLink.href = canonicalUrl;
    document.head.appendChild(canonicalLink);

    // Add hreflang tags for Hebrew, English, and x-default
    const hreflangs = [
      { lang: "he", url: canonicalUrl },
      { lang: "en", url: `${canonicalUrl}${canonicalUrl.includes("?") ? "&" : "?"}lang=en` },
      { lang: "x-default", url: canonicalUrl },
    ];

    hreflangs.forEach(({ lang, url }) => {
      const hreflangLink = document.createElement("link");
      hreflangLink.rel = "alternate";
      hreflangLink.hreflang = lang;
      hreflangLink.href = url;
      document.head.appendChild(hreflangLink);
    });

    // Update title if provided
    if (title) {
      document.title = title.includes("PropLine") ? title : `${title} | PropLine Real Estate`;
    }

    // Update meta description if provided
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);

      // Also update OG description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement("meta");
        ogDesc.setAttribute("property", "og:description");
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute("content", description);
    }

    // Update OG URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", canonicalUrl);

    // Update OG type
    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement("meta");
      ogType.setAttribute("property", "og:type");
      document.head.appendChild(ogType);
    }
    ogType.setAttribute("content", type);

    // Update OG image if provided
    if (image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute("content", image.startsWith("http") ? image : `${BASE_URL}${image}`);
    }

    // Handle noindex
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute("content", "noindex, nofollow");
    } else if (robotsMeta && robotsMeta.getAttribute("content")?.includes("noindex")) {
      robotsMeta.setAttribute("content", "index, follow");
    }

    // Cleanup on unmount
    return () => {
      // We don't remove tags on unmount since the next component will update them
    };
  }, [location, title, description, image, type, noindex]);

  return null;
}

/**
 * Inject JSON-LD structured data into the page
 */
export function injectJsonLd(schema: object, id?: string): void {
  const schemaId = id || `jsonld-${Math.random().toString(36).substr(2, 9)}`;

  // Remove existing script with same ID
  const existing = document.getElementById(schemaId);
  if (existing) {
    existing.remove();
  }

  const script = document.createElement("script");
  script.id = schemaId;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Generate RealEstateListing Schema
 */
export function generateRealEstateListingSchema(property: {
  name: string;
  description?: string;
  price?: number;
  priceCurrency?: string;
  location?: string;
  image?: string;
  url?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.name,
    "description": property.description || `${property.name} - פרויקט נדל״ן יוקרתי בדובאי`,
    "price": property.price || undefined,
    "priceCurrency": property.priceCurrency || "AED",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.location || "Dubai",
      "addressRegion": "Dubai",
      "addressCountry": "AE"
    },
    "image": property.image || `${BASE_URL}/og-image.jpg`,
    "url": property.url || (typeof window !== "undefined" ? window.location.href : BASE_URL),
    "offers": property.price ? {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": property.priceCurrency || "AED",
      "availability": "https://schema.org/InStock"
    } : undefined,
    "provider": {
      "@type": "RealEstateAgent",
      "name": "PropLine Real Estate",
      "url": BASE_URL,
      "telephone": "+972-50-889-6702"
    }
  };
}

/**
 * Generate BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

export default SEO;
