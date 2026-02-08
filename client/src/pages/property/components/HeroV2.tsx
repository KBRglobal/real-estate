import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  MapPin,
  Calendar,
  Banknote,
  BedDouble,
  Ruler,
  Phone,
  Play,
  ChevronDown,
  Award,
  Shield,
  FileCheck,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "../utils";

interface GalleryItem {
  url?: string;
  alt?: string;
  type?: "image" | "video";
  category?: "exterior" | "interior" | "amenities" | "views";
}

interface HeroV2Props {
  projectName: string;
  location: string;
  heroImage: string;
  gallery?: GalleryItem[];
  developer?: string | null;
  developerLogo?: string | null;
  priceFrom?: number | null;
  priceCurrency?: string;
  completionDate?: string | null;
  bedrooms?: string | null;
  sizeRange?: string | null;
  videoUrl?: string | null;
  onContactClick: () => void;
  onVideoClick?: () => void;
  onScrollDown: () => void;
}

export const HeroV2 = memo(function HeroV2({
  projectName,
  location,
  heroImage,
  gallery = [],
  developer,
  developerLogo,
  priceFrom,
  priceCurrency = "AED",
  completionDate,
  bedrooms,
  sizeRange,
  videoUrl,
  onContactClick,
  onVideoClick,
  onScrollDown,
}: HeroV2Props) {
  const hasValidPrice = priceFrom && priceFrom > 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Prepare carousel images (hero + gallery images, max 5)
  const carouselImages = [
    heroImage,
    ...(gallery || []).slice(0, 4).map((item) => item.url).filter(Boolean),
  ].filter(Boolean) as string[];

  // Auto-play carousel
  useEffect(() => {
    if (carouselImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDotClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  // Trust badges data
  const trustBadges = [
    { icon: Shield, label: "יזם מורשה" },
    { icon: CreditCard, label: "תשלום באסקרו" },
    { icon: FileCheck, label: "רשום DLD" },
  ];

  // Quick stats for pills display
  const quickStats = [
    bedrooms && {
      icon: BedDouble,
      label: bedrooms,
    },
    sizeRange && {
      icon: Ruler,
      label: sizeRange,
    },
    completionDate && {
      icon: Calendar,
      label: completionDate,
    },
  ].filter(Boolean) as Array<{
    icon: React.ElementType;
    label: string;
  }>;

  return (
    <section className="relative h-[100svh] min-h-[500px] max-h-[1000px] flex items-end overflow-hidden">
      {/* Background Image Carousel with Crossfade */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {carouselImages.map((image, index) => (
            index === currentImageIndex && (
              <motion.div
                key={image}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0"
                style={{
                  transform: `translateY(${scrollY * 0.5}px)`,
                }}
              >
                <OptimizedImage
                  src={image}
                  alt={`${projectName} - פרויקט נדל״ן יוקרתי בדובאי`}
                  priority={index === 0}
                  blurUp
                  wrapperClassName="w-full h-full"
                />
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
      </div>

      {/* Carousel Dots Indicator */}
      {carouselImages.length > 1 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`transition-all duration-300 ${
                index === currentImageIndex
                  ? "w-8 h-2 bg-amber-400"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              } rounded-full`}
              aria-label={`עבור לתמונה ${index + 1}`}
            />
          ))}
        </div>
      )}


      {/* Main Content */}
      <div className="relative z-10 w-full pb-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Trust Badges Row */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap items-center gap-2 mb-4"
            >
              {trustBadges.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium"
                  >
                    <Icon className="h-3.5 w-3.5 text-amber-400" />
                    <span>{badge.label}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 leading-tight">
              {projectName}
            </h1>

            {/* Developer Name */}
            {developer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mb-3"
              >
                {developerLogo && (
                  <img
                    src={developerLogo}
                    alt={`${developer} logo`}
                    className="h-6 w-auto"
                    width={80}
                    height={24}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                  />
                )}
                <Award className="h-4 w-4 text-emerald-400" />
                <span className="text-white/80 text-sm font-medium">
                  {developer}
                </span>
              </motion.div>
            )}

            {/* Location Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full mb-6"
            >
              <MapPin className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium">{location}</span>
            </motion.div>

            {/* Price Display - Prominent */}
            {hasValidPrice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mb-6"
              >
                <div className="inline-block">
                  <div className="text-amber-400/80 text-sm font-medium mb-1">
                    החל מ-
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent break-words">
                    {formatPrice(priceFrom, priceCurrency)}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Stats Pills */}
            {quickStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-wrap items-center gap-3 mb-8"
              >
                {quickStats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl"
                    >
                      <Icon className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-medium">{stat.label}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                onClick={onContactClick}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-xl shadow-amber-500/25 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14"
              >
                <Phone className="h-5 w-5 ml-2" />
                קבל הצעת מחיר
              </Button>
              {videoUrl && onVideoClick && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onVideoClick}
                  className="border-white/30 text-white hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14"
                >
                  <Play className="h-5 w-5 ml-2" />
                  צפה בסרטון
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Simple Scroll Arrow - No strip! */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.button
          onClick={onScrollDown}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/60 hover:text-white/80 transition-colors cursor-pointer"
        >
          <span className="text-xs tracking-widest uppercase">גלול למטה</span>
          <ChevronDown className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </section>
  );
});

export default HeroV2;
