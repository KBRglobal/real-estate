import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GalleryItem } from "../types";

interface LightboxGalleryProps {
  images: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
}

const getCategoryLabel = (category?: string): string => {
  const categoryLabels: Record<string, string> = {
    exterior: "חוץ",
    interior: "פנים",
    amenities: "מתקנים",
    views: "נוף",
  };
  if (!category) return "";
  return categoryLabels[category] || category;
};

export const LightboxGallery = memo(function LightboxGallery({
  images,
  initialIndex,
  onClose,
}: LightboxGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartDistance = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [images.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const toggleZoom = useCallback(() => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
      setZoomLevel(2);
    }
  }, [isZoomed]);

  // Preload adjacent images
  useEffect(() => {
    const preloadImage = (index: number) => {
      if (images[index]?.url) {
        const img = new Image();
        img.src = images[index].url;
      }
    };

    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    const nextIndex = (currentIndex + 1) % images.length;

    preloadImage(prevIndex);
    preloadImage(nextIndex);
  }, [currentIndex, images]);

  // Scroll thumbnail strip to center current thumbnail
  useEffect(() => {
    if (thumbnailStripRef.current) {
      const thumbnail = thumbnailStripRef.current.children[currentIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isZoomed) {
          toggleZoom();
        } else {
          onClose();
        }
      }
      if (e.key === "ArrowLeft") goToNext();
      if (e.key === "ArrowRight") goToPrevious();
      if (e.key === "i" || e.key === "I") setShowInfo(prev => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, onClose, isZoomed, toggleZoom]);

  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      touchStartDistance.current = getTouchDistance(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistance.current !== null) {
      // Pinch zoom
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / touchStartDistance.current;
      const newZoomLevel = Math.min(Math.max(zoomLevel * scale, 1), 4);
      setZoomLevel(newZoomLevel);
      setIsZoomed(newZoomLevel > 1);
      touchStartDistance.current = currentDistance;
    }
  }, [zoomLevel]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      touchStartDistance.current = null;
    }

    if (touchStartX.current === null || touchStartY.current === null) return;
    if (isZoomed) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }, [goToNext, goToPrevious, isZoomed]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 400 : -400,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 400 : -400,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-0 z-[9999] bg-black"
      onClick={(e) => {
        if (!isZoomed) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: isZoomed ? 'pan-x pan-y' : 'pan-y', direction: 'ltr' }}
    >
      {/* Header controls */}
      <div className="absolute top-0 left-0 right-0 z-[10000] flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/20 h-12 w-12"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          data-testid="button-lightbox-close"
        >
          <X className="h-7 w-7" />
        </Button>

        {/* Image counter */}
        <div className="text-white font-medium text-lg bg-black/50 px-4 py-2 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Zoom controls */}
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/20 h-12 w-12"
          onClick={(e) => {
            e.stopPropagation();
            toggleZoom();
          }}
          data-testid="button-lightbox-zoom"
        >
          {isZoomed ? <ZoomOut className="h-6 w-6" /> : <ZoomIn className="h-6 w-6" />}
        </Button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-14 pt-20 pb-32">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.img
            ref={imageRef}
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            src={images[currentIndex]?.url}
            alt={images[currentIndex]?.alt || `תמונה ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain select-none cursor-pointer"
            style={{
              transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
              transition: isZoomed ? 'none' : 'transform 0.3s ease-out',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isZoomed) {
                toggleZoom();
              }
            }}
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {!isZoomed && (
        <>
          {/* Right Arrow - Next */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="fixed top-1/2 right-4 sm:right-6 z-[10000] -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 bg-white hover:bg-amber-400 text-gray-900 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            data-testid="button-lightbox-next"
            aria-label="תמונה הבאה"
          >
            <ArrowRight className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={2.5} />
          </motion.button>

          {/* Left Arrow - Previous */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="fixed top-1/2 left-4 sm:left-6 z-[10000] -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 bg-white hover:bg-amber-400 text-gray-900 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            data-testid="button-lightbox-prev"
            aria-label="תמונה קודמת"
          >
            <ArrowLeft className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={2.5} />
          </motion.button>
        </>
      )}

      {/* Image info overlay at bottom */}
      <AnimatePresence>
        {showInfo && images[currentIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[10000] bg-black/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg max-w-md text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {images[currentIndex].alt && (
              <p className="text-white text-sm">{images[currentIndex].alt}</p>
            )}
            {images[currentIndex].category && (
              <p className="text-amber-400 text-xs mt-1">
                {getCategoryLabel(images[currentIndex].category)}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thumbnail strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 z-[10000] bg-gradient-to-t from-black/90 to-transparent pt-8 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={thumbnailStripRef}
          className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory"
        >
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                goToImage(idx);
              }}
              className={`relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden snap-center transition-all duration-200 ${
                idx === currentIndex
                  ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-black scale-110"
                  : "opacity-60 hover:opacity-100"
              }`}
              data-testid={`button-lightbox-thumbnail-${idx}`}
            >
              <img
                src={image.url}
                alt={image.alt || `תמונה ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === currentIndex && (
                <div className="absolute inset-0 bg-amber-400/20" />
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
});

export default LightboxGallery;
