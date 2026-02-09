import { ReactNode } from "react";
import { Link } from "wouter";
import { Globe, Phone, ArrowRight, ArrowLeft, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import ddlLogo from "@assets/ddl_logo_1768141898381.png";

interface LegalPageLayoutProps {
  children: ReactNode;
  title: string;
  titleEn: string;
}

export function LegalPageLayout({ children, title, titleEn }: LegalPageLayoutProps) {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const toggleLanguage = () => {
    setLanguage(language === "he" ? "en" : "he");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background relative" dir={isRTL ? "rtl" : "ltr"}>
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-primary/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 hover-elevate rounded-md p-1"
              data-testid="link-home"
            >
              <img
                src={ddlLogo}
                alt="PropLine Real Estate"
                className="h-12 w-auto"
                loading="eager"
                decoding="async"
              />
              <span className="text-xl font-bold text-primary hidden sm:block">
                PropLine
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="text-foreground"
                data-testid="button-language-toggle"
                aria-label={language === "he" ? "Switch to English" : "עבור לעברית"}
              >
                <Globe className="h-5 w-5" />
              </Button>

              <Link href="/">
                <Button
                  className="hidden sm:flex items-center gap-2"
                  data-testid="button-contact-cta"
                >
                  <Phone className="h-4 w-4" />
                  <span>{t("nav.freeConsultation")}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group"
            data-testid="link-back-home"
          >
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>{isRTL ? "חזרה לדף הבית" : "Back to Home"}</span>
          </Link>

          {/* Premium Glass Card */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 lg:p-10 gold-border-animated">
            {/* Header Section */}
            <div className="mb-8 pb-6 border-b border-primary/20">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-gold mb-3">
                {isRTL ? title : titleEn}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                <span className="font-medium">PropLine Real Estate L.L.C</span>
                <span className="hidden sm:inline text-primary/50">|</span>
                <span className="text-sm">
                  {isRTL ? "עדכון אחרון: פברואר 2026" : "Last Updated: February 2026"}
                </span>
              </div>
            </div>

            {/* Content */}
            <article className="prose prose-lg dark:prose-invert max-w-none 
              prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
              prose-h2:text-xl prose-h2:border-b prose-h2:border-primary/20 prose-h2:pb-2
              prose-p:text-foreground/85 prose-p:leading-relaxed
              prose-li:text-foreground/85 prose-li:marker:text-primary
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:my-4 prose-ul:space-y-2
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              {children}
            </article>
          </div>

          {/* Scroll to Top Button */}
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToTop}
              className="gap-2"
              data-testid="button-scroll-top"
            >
              <ChevronUp className="h-4 w-4" />
              {isRTL ? "חזרה למעלה" : "Back to Top"}
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-muted/30 border-t border-primary/10 py-10 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            {/* Logo & Copyright */}
            <div className="flex flex-col items-center gap-3">
              <img src={ddlLogo} alt="PropLine Real Estate" className="h-10" width={120} height={40} loading="lazy" decoding="async" />
              <p className="text-sm text-muted-foreground text-center">
                © {new Date().getFullYear()} PropLine Real Estate L.L.C. {t("footer.rights")}
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm">
              <Link
                href="/legal/terms"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="footer-terms"
              >
                {t("footer.terms")}
              </Link>
              <Link
                href="/legal/privacy"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="footer-privacy"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                href="/legal/disclaimer"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="footer-disclaimer"
              >
                {t("footer.disclaimer")}
              </Link>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
              <a
                href="mailto:office@ddl-uae.com"
                className="hover:text-primary transition-colors"
              >
                office@ddl-uae.com
              </a>
              <span className="hidden sm:inline text-primary/30">|</span>
              <a
                href="tel:+972508896702"
                className="hover:text-primary transition-colors"
              >
                +972 50-889-6702
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
