import { Phone, Mail, MapPin } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiFacebook } from "react-icons/si";
import { useLanguage } from "@/lib/i18n";
import { scrollToSection } from "@/lib/utils";
import { Link } from "wouter";
import ddlLogo from "@assets/ddl_logo_1768141898381.png";

const socialLinks = [
  { icon: SiWhatsapp, href: "https://wa.me/972508896702?text=Hi%2C%20I%20found%20you%20through%20your%20website", label: "WhatsApp" },
  { icon: SiInstagram, href: "https://www.instagram.com/ddlrealestatedubai", label: "Instagram" },
  { icon: SiFacebook, href: "https://www.facebook.com/share/1EpVjGVWkJ/", label: "Facebook" },
];

export function Footer() {
  const { t, isRTL } = useLanguage();

  const quickLinks = [
    { label: t("nav.home"), href: "#hero" },
    { label: t("nav.projects"), href: "#projects" },
    { label: t("nav.process"), href: "#process" },
    { label: t("nav.whyDubai"), href: "#why-dubai" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  const handleNavClick = (href: string) => {
    scrollToSection(href.replace("#", ""));
  };

  return (
    <footer className="glass-footer relative overflow-hidden morphing-gradient" data-testid="footer">
      {/* Decorative Gold Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/3 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <img
              src={ddlLogo}
              alt="PropLine Real Estate"
              className="h-16 w-auto mb-4"
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              style={{
                filter: "drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))",
              }}
            />
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {t("footer.tagline")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("footer.license")}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm hover-underline"
                    data-testid={`footer-link-${link.href.replace("#", "")}`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">{t("footer.contactUs")}</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+972508896702"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                  data-testid="footer-phone"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span dir="ltr">+972 50-889-6702</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@ddl-dubai.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                  data-testid="footer-email"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>info@ddl-dubai.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{t("footer.location")}</span>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">{t("footer.followUs")}</h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 glass-card rounded-lg flex items-center justify-center text-muted-foreground social-glow"
                  aria-label={social.label}
                  data-testid={`footer-social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="section-divider mt-12" />
        
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PropLine. {t("footer.copyright")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <Link
              href="/legal/terms"
              className="hover:text-primary transition-colors"
              data-testid="footer-terms"
            >
              {t("footer.terms")}
            </Link>
            <Link
              href="/legal/privacy"
              className="hover:text-primary transition-colors"
              data-testid="footer-privacy"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/legal/disclaimer"
              className="hover:text-primary transition-colors"
              data-testid="footer-disclaimer"
            >
              {t("footer.disclaimer")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
