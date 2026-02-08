import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Calculator, ArrowDown, Sparkles, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { scrollToSection } from "@/lib/utils";
import ddlLogo from "@assets/ddl_logo_1768141898381.png";
import heroVideo from "@assets/generated_videos/dubai_luxury_skyline_sunset.mp4";
import heroFallbackImage from "@assets/stock_images/dubai_luxury_skyline_94fdbb8d.jpg";

// Floating particle - only shown on desktop.
// will-change-transform hints to the browser to composite on GPU for smooth animation.
function FloatingParticle({ delay, duration, x, y, size }: { delay: number; duration: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full hidden md:block will-change-transform"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: "radial-gradient(circle, rgba(212, 175, 55, 0.5) 0%, rgba(212, 175, 55, 0) 70%)",
        boxShadow: "0 0 15px rgba(212, 175, 55, 0.3)",
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Animated counter for stats
function AnimatedValue({ value, duration = 1.5 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Check if value contains a number to animate
    const numMatch = value.match(/(\d+)/);
    if (!numMatch) {
      setDisplayValue(value);
      return;
    }

    const targetNum = parseInt(numMatch[1]);
    
    // If target is 0 or very small, just show the value immediately
    if (targetNum <= 0) {
      setDisplayValue(value);
      return;
    }
    
    const prefix = value.substring(0, numMatch.index);
    const suffix = value.substring((numMatch.index || 0) + numMatch[1].length);

    let start = 0;
    const stepTime = (duration * 1000) / targetNum;
    const minStepTime = 30;
    const actualStepTime = Math.max(stepTime, minStepTime);
    const increment = Math.ceil(targetNum / (duration * 1000 / actualStepTime));

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetNum) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(`${prefix}${start}${suffix}`);
      }
    }, actualStepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{displayValue}</>;
}

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t, isRTL } = useLanguage();

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const heroSlides = [
    { title: t("hero.title1"), subtitle: t("hero.subtitle1") },
    { title: t("hero.title2"), subtitle: t("hero.subtitle2") },
    { title: t("hero.title3"), subtitle: t("hero.subtitle3") },
  ];

  const stats = [
    { value: "0%", label: t("hero.stat.tax") },
    { value: "8-12%", label: t("hero.stat.yield") },
    { value: "100%", label: t("hero.stat.ownership") },
    { value: "24/7", label: t("hero.stat.support") },
  ];

  // Parallax only on desktop and when reduced motion is not preferred
  const { scrollY } = useScroll();
  const shouldDisableParallax = isMobile || prefersReducedMotion;
  const backgroundY = useTransform(scrollY, [0, 1000], [0, shouldDisableParallax ? 0 : 200]);
  const contentY = useTransform(scrollY, [0, 500], [0, shouldDisableParallax ? 0 : 80]);
  const opacity = useTransform(scrollY, [0, 400], [1, shouldDisableParallax ? 1 : 0]);

  // Slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      data-testid="section-hero"
    >
      {/* Video/Image Background */}
      <motion.div
        className="absolute inset-0"
        style={{ y: shouldDisableParallax ? 0 : backgroundY }}
      >
        {isMobile ? (
          // Mobile: Ken Burns effect on static image (disabled if reduced motion preferred)
          prefersReducedMotion ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${heroFallbackImage})`,
              }}
            />
          ) : (
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.1, 1],
                x: [0, -20, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${heroFallbackImage})`,
                  transform: "scale(1.2)", // Prevent edges showing during animation
                }}
              />
            </motion.div>
          )
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover"
            poster={heroFallbackImage}
            style={{ transform: "scale(1.05)" }}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Animated Gold Gradient - simpler on mobile, disabled if reduced motion preferred */}
        {!isMobile && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(ellipse at 30% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)",
                "radial-gradient(ellipse at 70% 80%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)",
                "radial-gradient(ellipse at 30% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>

      {/* Vignette Effect - lighter on mobile */}
      <div
        className="absolute inset-0 pointer-events-none z-[6]"
        style={{
          background: isMobile
            ? "radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.3) 100%)"
            : "radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%)"
        }}
      />

      {/* Floating Particles - Desktop only, disabled if reduced motion preferred */}
      {!isMobile && !prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingParticle delay={0} duration={5} x="10%" y="20%" size={8} />
          <FloatingParticle delay={1} duration={6} x="85%" y="15%" size={6} />
          <FloatingParticle delay={2} duration={5.5} x="75%" y="70%" size={10} />
          <FloatingParticle delay={0.5} duration={6.5} x="20%" y="75%" size={7} />
        </div>
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{ y: shouldDisableParallax ? 0 : contentY, opacity: shouldDisableParallax ? 1 : opacity }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mb-6 sm:mb-8 relative"
        >
          {/* Glow behind logo - smaller on mobile */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-primary/20 blur-3xl" />
          </div>
          <img
            src={ddlLogo}
            alt="DDL Real Estate - לוגו חברת נדל״ן יוקרה בדובאי"
            width={160}
            height={160}
            className="h-20 sm:h-32 md:h-40 w-auto mx-auto relative z-10"
            style={{
              filter: "drop-shadow(0 0 30px rgba(212, 175, 55, 0.4))",
            }}
          />
        </motion.div>

        {/* Animated Title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <h1
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight px-2"
              style={{
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
              }}
            >
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-medium px-4">
              <span className="gradient-text-gold">
                {heroSlides[currentSlide].subtitle}
              </span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed px-4"
        >
          {t("hero.tagline")}
        </motion.p>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-4 flex flex-col items-center gap-3"
        >
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 text-white/70 text-xs sm:text-sm">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span>{t("hero.trust.licensed")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/70 text-xs sm:text-sm">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span>{t("hero.trust.verified")}</span>
            </div>
          </div>
          {/* Social Proof */}
          <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/30">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-white text-sm font-medium">{t("hero.socialProof")}</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
        >
          <Button
            size="lg"
            onClick={() => scrollToSection("contact")}
            className="luxury-button w-full sm:w-auto min-w-[200px] text-base sm:text-lg h-12 sm:h-14 font-semibold"
            data-testid="button-hero-cta"
          >
            <Sparkles className={`h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
            {isRTL ? "קבלו ייעוץ חינם" : "Get Free Consultation"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToSection("calculator")}
            className="w-full sm:w-auto min-w-[200px] text-base sm:text-lg h-12 sm:h-14 bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:border-primary/50 transition-all duration-300"
            data-testid="button-hero-calculator"
          >
            <Calculator className={`h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
            {t("hero.calculator")}
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto px-2"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
              whileHover={isMobile ? {} : { scale: 1.05, y: -2 }}
              className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4"
            >
              <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text-gold mb-0.5 sm:mb-1">
                <AnimatedValue value={stat.value} />
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-white/70 leading-tight">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator - hidden on mobile */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: prefersReducedMotion ? 0 : 1.5 }}
        onClick={() => scrollToSection("about")}
        aria-label={isRTL ? "גלול למטה" : "Scroll down"}
        className="hidden sm:block absolute bottom-24 left-1/2 -translate-x-1/2 text-white/70 hover:text-primary transition-colors z-20"
        data-testid="button-scroll-down"
      >
        {prefersReducedMotion ? (
          <ArrowDown className="h-5 w-5" />
        ) : (
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-5 w-5" />
          </motion.div>
        )}
      </motion.button>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </section>
  );
}
