import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { scrollToSection } from "@/lib/utils";
import ddlLogo from "@assets/ddl_logo_1768141898381.png";

const WHATSAPP_NUMBER = "972508896702";
const WHATSAPP_MESSAGE = encodeURIComponent("היי, אשמח לשמוע עוד על השקעות נדל״ן בדובאי");

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();

  const navItems = [
    { label: t("nav.home"), href: "#hero" },
    { label: t("nav.process"), href: "#process" },
    { label: t("nav.projects"), href: "#projects" },
    { label: t("nav.whyDubai"), href: "#why-dubai" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    scrollToSection(href.replace("#", ""));
    setIsMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === "he" ? "en" : "he");
  };

  return (
    <>
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:font-semibold focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        data-testid="skip-to-content"
      >
        {isRTL ? "דלג לתוכן הראשי" : "Skip to main content"}
      </a>
      <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled
          ? "top-4 left-4 right-4 navbar-floating"
          : "top-0 left-0 right-0 bg-transparent"
      }`}
      role="banner"
      aria-label={isRTL ? "ניווט ראשי" : "Main navigation"}
      data-testid="header"
    >
      <div className={`max-w-7xl mx-auto ${isScrolled ? "px-6" : "px-4 sm:px-6 lg:px-8"}`}>
        <div className="flex items-center justify-between h-20">
          <button
            onClick={() => handleNavClick("#hero")}
            className="flex items-center hover-elevate rounded-md p-1"
            data-testid="link-home"
          >
            <img
              src={ddlLogo}
              alt="PropLine Real Estate"
              width={56}
              height={56}
              className="h-14 w-auto"
              style={{
                filter: "drop-shadow(0 0 15px rgba(212, 175, 55, 0.4))",
              }}
            />
          </button>

          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label={isRTL ? "ניווט ראשי" : "Main navigation"}>
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`nav-pill text-base font-medium transition-all duration-200 ${
                  isScrolled ? "text-foreground/80 hover:text-primary" : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
                aria-label={isRTL ? `עבור ל${item.label}` : `Go to ${item.label}`}
                data-testid={`nav-${item.href.replace("#", "")}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className={`font-semibold ${isScrolled ? "text-foreground" : "text-white"}`}
              data-testid="button-language-toggle"
              aria-label={language === "he" ? "Switch to English" : "עבור לעברית"}
            >
              {language === "he" ? "EN" : "עב"}
            </Button>

            <Button
              asChild
              className="hidden sm:flex items-center gap-2"
              data-testid="button-cta-header"
            >
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`} target="_blank" rel="noopener noreferrer">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>{t("nav.freeConsultation")}</span>
              </a>
            </Button>

            <button
              className={`lg:hidden p-2 hover-elevate rounded-md ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? (isRTL ? "סגור תפריט" : "Close menu") : (isRTL ? "פתח תפריט" : "Open menu")}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden bg-background/98 backdrop-blur-lg border-t border-border">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2" role="navigation" aria-label={isRTL ? "תפריט נייד" : "Mobile menu"}>
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`w-full px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors ${isRTL ? "text-right" : "text-left"}`}
                data-testid={`mobile-nav-${item.href.replace("#", "")}`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex items-center justify-between mt-2 px-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center gap-2 font-semibold"
                data-testid="button-language-toggle-mobile"
              >
                {language === "he" ? "EN" : "עב"}
              </Button>
            </div>
            <Button
              asChild
              className="mt-4 w-full"
              data-testid="button-cta-mobile"
            >
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`} target="_blank" rel="noopener noreferrer">
                <Phone className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} aria-hidden="true" />
                {t("nav.freeConsultation")}
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
    </>
  );
}
