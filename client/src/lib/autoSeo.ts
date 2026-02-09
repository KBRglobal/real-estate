/**
 * Auto SEO/AEO Generator - Octypo v2
 * Automatically generates SEO metadata based on content analysis
 */

interface SeoMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  schema?: object;
}

interface ContentAnalysis {
  text: string;
  title?: string;
  type?: "page" | "project" | "mini-site" | "article";
  locale?: string;
}

// Hebrew stopwords to filter out
const hebrewStopwords = new Set([
  "את", "של", "על", "עם", "לא", "כי", "זה", "אני", "הוא", "היא",
  "אבל", "גם", "רק", "או", "כל", "מה", "איך", "למה", "מי", "אם",
  "יש", "אין", "היה", "להיות", "שלא", "לכל", "בכל", "הם", "הן",
  "אנחנו", "אתה", "אותו", "אותה", "עוד", "כמו", "בין", "לפני",
  "אחרי", "תחת", "מעל", "ליד", "בתוך", "מחוץ", "דרך", "בלי",
]);

// English stopwords
const englishStopwords = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
  "be", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "must", "shall", "can", "need",
  "this", "that", "these", "those", "i", "you", "he", "she", "it",
  "we", "they", "what", "which", "who", "whom", "when", "where", "why",
  "how", "all", "each", "every", "both", "few", "more", "most", "other",
  "some", "such", "no", "not", "only", "same", "so", "than", "too",
  "very", "just", "also", "now", "here", "there", "then",
]);

/**
 * Extract keywords from text
 */
function extractKeywords(text: string, locale: string = "he"): string[] {
  const stopwords = locale === "he" ? hebrewStopwords : englishStopwords;

  // Clean and tokenize text
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u0590-\u05FF]/g, " ") // Keep Hebrew chars
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopwords.has(word));

  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Generate a meta description from content
 */
function generateDescription(text: string, maxLength: number = 160): string {
  // Clean the text
  const cleanText = text
    .replace(/<[^>]*>/g, " ") // Remove HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // If text is short enough, use it directly
  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  // Find the last complete sentence within maxLength
  const truncated = cleanText.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastQuestion = truncated.lastIndexOf("?");
  const lastExclaim = truncated.lastIndexOf("!");

  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclaim);

  if (lastSentenceEnd > maxLength / 2) {
    return truncated.slice(0, lastSentenceEnd + 1);
  }

  // If no good sentence end, break at last word
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength / 2) {
    return truncated.slice(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Generate SEO title from content title
 */
function generateSeoTitle(
  title: string,
  type: string = "page",
  maxLength: number = 60
): string {
  // Add suffix based on type
  const suffixes: Record<string, string> = {
    page: " | PropLine",
    project: " - השקעות נדל\"ן בדובאי | PropLine",
    "mini-site": " | PropLine Investments",
    article: " | בלוג PropLine",
  };

  const suffix = suffixes[type] || " | PropLine";
  const availableLength = maxLength - suffix.length;

  if (title.length <= availableLength) {
    return title + suffix;
  }

  // Truncate title at word boundary
  const truncated = title.slice(0, availableLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > availableLength / 2) {
    return truncated.slice(0, lastSpace) + suffix;
  }

  return truncated + suffix;
}

/**
 * Generate structured data schema
 */
function generateSchema(
  content: ContentAnalysis,
  metadata: { title: string; description: string }
): object {
  const baseSchema = {
    "@context": "https://schema.org",
  };

  switch (content.type) {
    case "project":
      return {
        ...baseSchema,
        "@type": "RealEstateListing",
        name: metadata.title,
        description: metadata.description,
        url: typeof window !== "undefined" ? window.location.href : "",
        provider: {
          "@type": "RealEstateAgent",
          name: "PropLine",
          url: "https://ddl-dubai.com",
        },
      };

    case "article":
      return {
        ...baseSchema,
        "@type": "Article",
        headline: metadata.title,
        description: metadata.description,
        author: {
          "@type": "Organization",
          name: "PropLine",
        },
        publisher: {
          "@type": "Organization",
          name: "PropLine",
          logo: {
            "@type": "ImageObject",
            url: "https://ddl-dubai.com/logo.png",
          },
        },
      };

    case "mini-site":
      return {
        ...baseSchema,
        "@type": "WebPage",
        name: metadata.title,
        description: metadata.description,
        isPartOf: {
          "@type": "WebSite",
          name: "PropLine",
          url: "https://ddl-dubai.com",
        },
      };

    default:
      return {
        ...baseSchema,
        "@type": "WebPage",
        name: metadata.title,
        description: metadata.description,
      };
  }
}

/**
 * Main function to generate all SEO metadata
 */
export function generateSeoMetadata(content: ContentAnalysis): SeoMetadata {
  const { text, title = "", type = "page", locale = "he" } = content;

  // Generate base metadata
  const seoTitle = generateSeoTitle(title, type);
  const description = generateDescription(text);
  const keywords = extractKeywords(text, locale);

  // Generate metadata object
  const metadata: SeoMetadata = {
    title: seoTitle,
    description,
    keywords,
    ogTitle: seoTitle,
    ogDescription: description,
    schema: generateSchema(content, { title: seoTitle, description }),
  };

  return metadata;
}

/**
 * Generate SEO suggestions/improvements
 */
export function analyzeSeoQuality(metadata: SeoMetadata): {
  score: number;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let score = 100;

  // Title checks
  if (!metadata.title) {
    suggestions.push("חסרה כותרת SEO");
    score -= 25;
  } else if (metadata.title.length < 30) {
    suggestions.push("כותרת SEO קצרה מדי (מומלץ 50-60 תווים)");
    score -= 10;
  } else if (metadata.title.length > 60) {
    suggestions.push("כותרת SEO ארוכה מדי (מומלץ עד 60 תווים)");
    score -= 10;
  }

  // Description checks
  if (!metadata.description) {
    suggestions.push("חסר תיאור SEO");
    score -= 25;
  } else if (metadata.description.length < 70) {
    suggestions.push("תיאור SEO קצר מדי (מומלץ 120-160 תווים)");
    score -= 10;
  } else if (metadata.description.length > 160) {
    suggestions.push("תיאור SEO ארוך מדי (מומלץ עד 160 תווים)");
    score -= 10;
  }

  // Keywords checks
  if (!metadata.keywords || metadata.keywords.length === 0) {
    suggestions.push("לא נמצאו מילות מפתח");
    score -= 15;
  } else if (metadata.keywords.length < 3) {
    suggestions.push("מומלץ להוסיף יותר מילות מפתח");
    score -= 5;
  }

  // Schema check
  if (!metadata.schema) {
    suggestions.push("חסר Schema markup לתוצאות מועשרות");
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    suggestions,
  };
}

/**
 * Generate AEO (Answer Engine Optimization) content
 * Optimized for voice search and featured snippets
 */
export function generateAeoContent(
  question: string,
  answer: string
): { faqSchema: object; optimizedAnswer: string } {
  // Create FAQ schema for the Q&A
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      },
    ],
  };

  // Optimize answer for featured snippets (concise, direct)
  const optimizedAnswer = answer
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);

  return {
    faqSchema,
    optimizedAnswer,
  };
}

export default {
  generateSeoMetadata,
  analyzeSeoQuality,
  generateAeoContent,
};
