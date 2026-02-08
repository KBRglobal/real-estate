import { useState, useCallback, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://cdn.ddl-uae.com/gallery/mbp-bc-all-assets/mbp-bc-project-images/Exterior%20Images/250850_Binghatti_MasterCommunity_View07.jpg";

interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "placeholder"> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide" | "auto";
  showLoadingState?: boolean;
  priority?: boolean;
  blurUp?: boolean;
  observerLazy?: boolean;
  rootMargin?: string;
  wrapperClassName?: string;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fallbackSrc = FALLBACK_IMAGE,
  aspectRatio = "auto",
  showLoadingState = true,
  priority = false,
  blurUp = false,
  observerLazy = false,
  rootMargin = "200px",
  className,
  wrapperClassName,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isInView, setIsInView] = useState(!observerLazy);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (!observerLazy || priority) {
      setIsInView(true);
      return;
    }
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
      { rootMargin, threshold: 0.01 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [observerLazy, priority, rootMargin]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      setIsLoaded(false);
    } else {
      setIsLoaded(true);
    }
  }, [hasError, currentSrc, fallbackSrc]);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    wide: "aspect-[21/9]",
    auto: "",
  }[aspectRatio];

  const blurBg = "url(" + currentSrc + ")";

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", aspectRatioClass, wrapperClassName)}
      style={style}
    >
      {showLoadingState && !isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse z-[1]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        </div>
      )}
      {blurUp && !isLoaded && isInView && (
        <div
          className="absolute inset-0 z-[2] transition-opacity duration-700"
          style={{
            backgroundImage: blurBg,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(20px)",
            transform: "scale(1.1)",
            opacity: 0.6,
          }}
        />
      )}
      {isInView && (
        <img
          src={currentSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : undefined}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
});

export default OptimizedImage;
