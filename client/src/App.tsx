import { lazy, Suspense, Component, ErrorInfo, ReactNode, memo } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import { SiteContentProvider } from "@/hooks/useSiteContent";

// Error Boundary to catch React rendering errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Auto-reload on chunk loading failures (stale cache after deployment)
    const msg = error?.message || "";
    if (msg.includes("Failed to fetch dynamically imported module") || msg.includes("Loading chunk")) {
      const key = "chunk_reload";
      const last = sessionStorage.getItem(key);
      const now = Date.now();
      // Only auto-reload once per 30 seconds to avoid loops
      if (!last || now - Number(last) > 30000) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
        return;
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      return (
        <div
          data-testid="error-boundary-fallback"
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: isAdminRoute ? '#f1f5f9' : '#0a0c0e' }}
        >
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: isAdminRoute ? '#fee2e2' : '#1a1c1e' }}>
              <span style={{ fontSize: '2rem' }}>!</span>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: isAdminRoute ? '#1e293b' : '#f5f5f5' }}>
              Something went wrong
            </h2>
            <p className="mb-4" style={{ color: isAdminRoute ? '#64748b' : '#a0a0a0' }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md"
              style={{
                backgroundColor: isAdminRoute ? '#2563eb' : '#2563eb',
                color: isAdminRoute ? '#ffffff' : '#000000'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
// Above-the-fold components loaded eagerly (critical rendering path)
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { SEO } from "@/components/SEO";

// Below-the-fold homepage sections - lazy loaded for faster initial paint.
// Each section gets its own chunk so the browser can parse/execute them incrementally.
const AboutSection = lazy(() => import("@/components/AboutSection").then(m => ({ default: m.AboutSection })));
const StatsSection = lazy(() => import("@/components/StatsSection").then(m => ({ default: m.StatsSection })));
const RoiCalculator = lazy(() => import("@/components/RoiCalculator").then(m => ({ default: m.RoiCalculator })));
const ProcessTimeline = lazy(() => import("@/components/ProcessTimeline").then(m => ({ default: m.ProcessTimeline })));
const ProjectsSection = lazy(() => import("@/components/ProjectsSection").then(m => ({ default: m.ProjectsSection })));
// DubaiZonesSection is especially heavy (includes Leaflet map library)
const DubaiZonesSection = lazy(() => import("@/components/DubaiZonesSection").then(m => ({ default: m.DubaiZonesSection })));
const WhyDubaiSection = lazy(() => import("@/components/WhyDubaiSection").then(m => ({ default: m.WhyDubaiSection })));
const WhyDdlSection = lazy(() => import("@/components/WhyDdlSection").then(m => ({ default: m.WhyDdlSection })));
const CaseStudies = lazy(() => import("@/components/CaseStudies").then(m => ({ default: m.CaseStudies })));
const DeveloperLogos = lazy(() => import("@/components/DeveloperLogos").then(m => ({ default: m.DeveloperLogos })));
const ContactForm = lazy(() => import("@/components/ContactForm").then(m => ({ default: m.ContactForm })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
// Floating overlays - non-critical, can load after main content
const FloatingContactButtons = lazy(() => import("@/components/FloatingContactButtons").then(m => ({ default: m.FloatingContactButtons })));
const PageProgressIndicator = lazy(() => import("@/components/PageProgressIndicator").then(m => ({ default: m.PageProgressIndicator })));
const ChatWidget = lazy(() => import("@/components/ChatWidget"));
// Lazy load AdminPage - heavy bundle with 18+ sub-views, must not block public site
const AdminPage = lazy(() => import("@/pages/admin").then(m => ({ default: m.AdminPage })));
// Lazy load other pages for better performance
const MiniSitePage = lazy(() => import("@/pages/MiniSitePage"));
const PropertyPage = lazy(() => import("@/pages/PropertyPage"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("@/pages/legal/TermsOfUse"));
const InvestmentDisclaimer = lazy(() => import("@/pages/legal/InvestmentDisclaimer"));

// SEO Content Pages - Pillar + Clusters
const RealEstateDubaiPillar = lazy(() => import("@/pages/real-estate-dubai/index"));
const RealEstateInvestment = lazy(() => import("@/pages/real-estate-dubai/investment"));
const RealEstateAreas = lazy(() => import("@/pages/real-estate-dubai/areas"));
const RealEstatePrices = lazy(() => import("@/pages/real-estate-dubai/prices"));
const RealEstateTaxRegulation = lazy(() => import("@/pages/real-estate-dubai/tax-regulation"));
const RealEstateFAQ = lazy(() => import("@/pages/real-estate-dubai/faq"));

function LoadingSpinner() {
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  
  // Apply admin-panel-light class to both html and body immediately for admin routes
  // This ensures CSS variable overrides take effect and portals get the light theme
  if (isAdminRoute && typeof window !== 'undefined') {
    document.documentElement.classList.add('admin-panel-light');
    document.body.classList.add('admin-panel-light');
  }
  
  if (isAdminRoute) {
    return (
      <div data-testid="admin-loading-spinner" className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-4">טוען...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">טוען...</p>
      </div>
    </div>
  );
}

// Minimal skeleton fallback for below-the-fold sections while they lazy load
function SectionSkeleton() {
  return (
    <div className="py-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

const HomePage = memo(function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="PropLine | השקעות נדל״ן בדובאי - ליווי מקצועי ושקוף"
        description="PropLine - סוכנות השקעות נדל״ן מובילה בדובאי. ליווי משקיעים ישראלים מקצה לקצה, תשואות של 6-12%, 0% מס הכנסה. סוכן מקומי מורשה ברישיון RERA."
      />
      <Header />
      <main id="main-content" role="main" aria-label="תוכן ראשי">
        {/* Above the fold - loaded eagerly for instant paint */}
        <HeroSection />
        {/* Below the fold - lazy loaded with individual Suspense boundaries.
            Each section resolves independently so content appears progressively. */}
        <Suspense fallback={<SectionSkeleton />}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <StatsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <RoiCalculator />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <ProcessTimeline />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <ProjectsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <DubaiZonesSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <WhyDubaiSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <WhyDdlSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <CaseStudies />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <DeveloperLogos />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <ContactForm />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      {/* Floating overlays - null fallback since they are non-blocking UI */}
      <Suspense fallback={null}>
        <FloatingContactButtons />
      </Suspense>
      <Suspense fallback={null}>
        <PageProgressIndicator />
      </Suspense>
    </div>
  );
});

function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-foreground mb-8">העמוד לא נמצא</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          חזרה לדף הבית
        </a>
      </div>
    </div>
  );
}

function App() {
  // Check if we're on an admin route - handle separately to avoid SiteContentProvider issues
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  
  // Admin routes are rendered outside SiteContentProvider 
  if (isAdminRoute) {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminPage />
              <Toaster />
            </Suspense>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <SiteContentProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <Switch>
              <Route path="/s/:slug">
                <MiniSitePage />
              </Route>
              <Route path="/project/:slug">
                <PropertyPage />
              </Route>
              <Route path="/legal/privacy">
                <PrivacyPolicy />
              </Route>
              <Route path="/legal/terms">
                <TermsOfUse />
              </Route>
              <Route path="/legal/disclaimer">
                <InvestmentDisclaimer />
              </Route>
              <Route path="/real-estate-dubai/investment">
                <RealEstateInvestment />
              </Route>
              <Route path="/real-estate-dubai/areas">
                <RealEstateAreas />
              </Route>
              <Route path="/real-estate-dubai/prices">
                <RealEstatePrices />
              </Route>
              <Route path="/real-estate-dubai/tax-regulation">
                <RealEstateTaxRegulation />
              </Route>
              <Route path="/real-estate-dubai/faq">
                <RealEstateFAQ />
              </Route>
              <Route path="/real-estate-dubai">
                <RealEstateDubaiPillar />
              </Route>
              <Route path="/" component={HomePage} />
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <Suspense fallback={null}>
            <ChatWidget />
          </Suspense>
          <Toaster />
          </SiteContentProvider>
        </LanguageProvider>
      </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
