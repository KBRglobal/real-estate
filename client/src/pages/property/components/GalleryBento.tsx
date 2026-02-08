import { useState, memo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Images } from "lucide-react";
import type { GalleryItem } from "../types";

interface GalleryBentoProps {
  images: GalleryItem[];
  projectName: string;
  onImageClick: (index: number) => void;
}

type GalleryCategory = "all" | "exterior" | "interior" | "amenities" | "views";

const categoryLabels: Record<GalleryCategory, string> = {
  all: "הכל",
  exterior: "חוץ",
  interior: "פנים",
  amenities: "מתקנים",
  views: "נוף",
};

const getCategoryLabel = (category?: string): string => {
  if (!category) return "תמונה";
  return categoryLabels[category as GalleryCategory] || category;
};

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

const GALLERY_FALLBACK = "https://cdn.ddl-uae.com/gallery/mbp-bc-all-assets/mbp-bc-project-images/Exterior%20Images/250850_Binghatti_MasterCommunity_View07.jpg";

const LazyImage = memo(function LazyImage({ src, alt, className = "" }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isInView, setIsInView] = useState(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return true;
    }
    return false;
  });
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px", threshold: 0.01 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    if (!hasError && currentSrc !== GALLERY_FALLBACK) {
      setHasError(true);
      setCurrentSrc(GALLERY_FALLBACK);
    } else {
      setIsLoaded(true);
    }
  }, [hasError, currentSrc]);

  return (
    <div ref={imgRef} className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 overflow-hidden">
          <div
            className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
            }}
          />
        </div>
      )}
      {isInView && (
        <img
          src={currentSrc}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
});

export const GalleryBento = memo(function GalleryBento({
  images,
  projectName,
  onImageClick,
}: GalleryBentoProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number>(0);
  const touchEndRef = useRef<number>(0);

  // Filter images by category
  const filteredImages = activeCategory === "all"
    ? images
    : images.filter(img => img.category === activeCategory);

  // Fallback to all images if no images match the selected category
  const displayFilteredImages = filteredImages.length > 0 ? filteredImages : images;
  const displayImages = displayFilteredImages.slice(0, 5);
  const remainingCount = displayFilteredImages.length - 5;

  // Get available categories with image counts
  const getCategoryCount = (category: GalleryCategory) => {
    if (category === "all") return images.length;
    return images.filter(img => img.category === category).length;
  };

  // Get available categories (categories that have at least one image)
  const availableCategories: GalleryCategory[] = (["all"] as GalleryCategory[]).concat(
    (Object.keys(categoryLabels) as GalleryCategory[])
      .filter(cat => cat !== "all" && images.some(img => img.category === cat))
  );

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const swipeDistance = touchStartRef.current - touchEndRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;

      if (swipeDistance > 0) {
        // Swipe left - scroll right
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else {
        // Swipe right - scroll left
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }

    touchStartRef.current = 0;
    touchEndRef.current = 0;
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
              <Camera className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                גלריית הפרויקט
              </h2>
              <p className="text-white/60 text-sm">
                {displayFilteredImages.length} תמונות
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => {
              const count = getCategoryCount(category);
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === category
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{categoryLabels[category]}</span>
                  <span className="mr-1.5 text-xs opacity-70">({count})</span>
                  {activeCategory === category && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Mobile Gallery - Horizontal Scrollable */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`mobile-${activeCategory}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="block sm:hidden"
          >
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {displayImages.map((image, idx) => {
                const isLast = idx === displayImages.length - 1 && remainingCount > 0;
                return (
                  <motion.div
                    key={`${activeCategory}-${idx}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative flex-shrink-0 w-[280px] h-[200px] overflow-hidden rounded-xl cursor-pointer snap-center group"
                    onClick={() => onImageClick(idx)}
                    data-testid={`gallery-mobile-image-${idx}`}
                  >
                    <LazyImage
                      src={image.url || ""}
                      alt={image.alt || `${projectName} - תמונה ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-white/90 text-gray-900 px-2.5 py-1 rounded-full text-xs font-medium">
                        {getCategoryLabel(image.category)}
                      </span>
                    </div>
                    {isLast && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">
                            +{remainingCount}
                          </div>
                          <div className="text-white/80 text-sm flex items-center gap-1 justify-center">
                            <Images className="h-4 w-4" />
                            עוד תמונות
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <p className="text-center text-white/50 text-sm mt-2">
              החלק לצפייה בתמונות נוספות
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Desktop Bento Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`desktop-${activeCategory}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="hidden sm:grid grid-cols-4 grid-rows-2 gap-3 sm:gap-4 h-[350px] md:h-[450px] lg:h-[550px] xl:h-[600px]"
          >
            {/* Main Large Image - Takes 2 columns and 2 rows */}
            {displayImages[0] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
                className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl cursor-pointer group"
                onClick={() => onImageClick(0)}
                data-testid="gallery-main-image"
              >
                <LazyImage
                  src={displayImages[0].url || ""}
                  alt={displayImages[0].alt || `${projectName} - תמונה ראשית`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Image count badge - always visible */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                  <Images className="h-4 w-4" />
                  <span>{displayFilteredImages.length} תמונות</span>
                </div>

                {/* Category label - hover only */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-sm font-medium">
                    {getCategoryLabel(displayImages[0].category)}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Smaller images */}
            {displayImages.slice(1, 5).map((image, idx) => {
              const actualIndex = idx + 1;
              const isLast = actualIndex === 4 && remainingCount > 0;

              return (
                <motion.div
                  key={`${activeCategory}-${actualIndex}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: actualIndex * 0.05 + 0.05 }}
                  className="relative overflow-hidden rounded-xl cursor-pointer group"
                  onClick={() => onImageClick(actualIndex)}
                  data-testid={`gallery-image-${actualIndex}`}
                >
                  <LazyImage
                    src={image.url || ""}
                    alt={image.alt || `${projectName} - תמונה ${actualIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Category label on hover */}
                  {!isLast && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-white/90 text-gray-900 px-2.5 py-1 rounded-full text-xs font-medium">
                        {getCategoryLabel(image.category)}
                      </span>
                    </div>
                  )}

                  {/* Show +N overlay on last image if there are more */}
                  {isLast && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold text-white">
                          +{remainingCount}
                        </div>
                        <div className="text-white/80 text-sm flex items-center gap-1 justify-center">
                          <Images className="h-4 w-4" />
                          עוד תמונות
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* View All Button - Only show on mobile or when gallery is larger */}
        {displayFilteredImages.length > 5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mt-6"
          >
            <button
              onClick={() => onImageClick(0)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/80 hover:text-white transition-all duration-200"
            >
              <Images className="h-5 w-5" />
              <span>צפה בכל {displayFilteredImages.length} התמונות</span>
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
});

export default GalleryBento;
