import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Building2, TrendingUp, Calendar, Scale, X, Check, Sparkles, AlertTriangle } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Project } from "@shared/schema";
import defaultPropertyImage from "@assets/stock_images/modern_apartment_bui_1b25c1b0.jpg";

// Skeleton loader for project cards
function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-56 w-full" />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </Card>
  );
}

export function ProjectsSection() {
  const { t, isRTL, language } = useLanguage();
  const [filter, setFilter] = useState<string>("all");
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const { data: projectsData, isLoading } = useQuery<Project[] | { data: Project[]; total: number }>({
    queryKey: ["/api/projects"],
  });

  const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.data || []);

  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(p => p.location === filter);

  const locations = Array.from(new Set(
    projects
      .map(p => p.location)
      .filter((loc): loc is string => typeof loc === 'string' && loc.trim().length > 0)
  ));

  const toggleCompare = (projectId: string) => {
    if (compareList.includes(projectId)) {
      setCompareList(compareList.filter(id => id !== projectId));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, projectId]);
    }
  };

  const compareProjects = projects.filter(p => compareList.includes(p.id));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isRTL ? "he-IL" : "en-US").format(price);
  };

  return (
    <section
      id="projects"
      className="py-20 md:py-32 bg-muted/50"
      data-testid="section-projects"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20">
            <Building2 className="h-4 w-4" />
            {t("projects.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("projects.heading")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("projects.subheading")}
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]" data-testid="select-filter-location">
              <SelectValue placeholder={t("projects.filter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="option-location-all">{t("projects.all")}</SelectItem>
              {locations.map((location, index) => (
                <SelectItem key={location} value={location} data-testid={`option-location-${index}`}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {compareList.length > 0 && (
            <Button
              onClick={() => setShowCompare(true)}
              variant="outline"
              className="gap-2"
              data-testid="button-compare"
            >
              <Scale className="h-4 w-4" />
              {t("projects.compare")} ({compareList.length})
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">{t("projects.coming")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isSelected={compareList.includes(project.id)}
                onToggleCompare={() => toggleCompare(project.id)}
                t={t}
                isRTL={isRTL}
                language={language}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {showCompare && compareProjects.length > 0 && (
            <CompareModal
              projects={compareProjects}
              onClose={() => setShowCompare(false)}
              formatPrice={formatPrice}
              t={t}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
  isSelected,
  onToggleCompare,
  t,
  isRTL,
  language,
  formatPrice,
}: {
  project: Project;
  index: number;
  isSelected: boolean;
  onToggleCompare: () => void;
  t: (key: string) => string;
  isRTL: boolean;
  language: string;
  formatPrice: (price: number) => string;
}) {
  const projectName = language === "en" && project.nameEn ? project.nameEn : project.name;
  const projectDesc = language === "en" && project.descriptionEn ? project.descriptionEn : project.description;
  const projectLocation = language === "en" && project.locationEn ? project.locationEn : project.location;

  // Determine project detail URL - prefer slug, fallback to ID
  const projectUrl = project.slug ? `/project/${project.slug}` : `/project/${project.id}`;

  // Check if project has limited units (show urgency badge)
  const hasLimitedUnits = project.status === "sold-out";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Link href={projectUrl} className="block h-full">
      <Card
        className="overflow-hidden premium-card group relative shine-effect cursor-pointer h-full flex flex-col"
        data-testid={`card-project-${project.id}`}
      >
        {/* Animated border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(212, 175, 55, 0.3), 0 0 30px rgba(212, 175, 55, 0.15)",
          }}
        />

        {/* Gold gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
          style={{
            background: "linear-gradient(135deg, transparent 0%, rgba(212, 175, 55, 0.08) 50%, transparent 100%)",
          }}
        />

        <div className="relative h-56 overflow-hidden">
          <OptimizedImage
            src={project.imageUrl || project.heroImage || defaultPropertyImage}
            alt={`${projectName} - פרויקט נדל״ן ב${projectLocation}`}
            fallbackSrc={defaultPropertyImage}
            observerLazy
            rootMargin="300px"
            className="transition-transform duration-500 group-hover:scale-105"
            wrapperClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          
          {project.featured && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`absolute top-3 ${isRTL ? "right-3" : "left-3"}`}
            >
              <Badge className="badge-premium">
                <Sparkles className="h-3 w-3 mr-1" />
                {t("projects.featured")}
              </Badge>
            </motion.div>
          )}

          {/* Last Units Badge - Urgency Indicator */}
          {hasLimitedUnits && (
            <motion.div
              initial={{ scale: 0, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.1 }}
              className={`absolute ${project.featured ? "top-12" : "top-3"} ${isRTL ? "right-3" : "left-3"}`}
            >
              <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {isRTL ? "יחידות אחרונות" : "Last Units"}
              </Badge>
            </motion.div>
          )}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCompare();
            }}
            className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm overflow-visible hover-elevate active-elevate-2 ${
              isSelected
                ? "bg-primary text-primary-foreground gold-glow"
                : "bg-background/80 text-foreground hover:bg-background hover:shadow-lg"
            }`}
            data-testid={`button-compare-${project.id}`}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
          </button>

          <div className={`absolute bottom-3 ${isRTL ? "right-3 left-3" : "left-3 right-3"} flex items-center gap-2`}>
            <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm">
              <MapPin className={`h-3 w-3 ${isRTL ? "ml-1" : "mr-1"}`} />
              {projectLocation}
            </Badge>
          </div>
        </div>

        <div className="p-5 relative flex-1 flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-3 gap-2">
              <div>
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                  {projectName}
                </h3>
                <p className="text-sm text-muted-foreground">{project.developer}</p>
              </div>
              {project.roiPercent != null && project.roiPercent > 0 && (
                <Badge 
                  variant="outline" 
                  className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 shrink-0"
                >
                  <TrendingUp className={`h-3 w-3 ${isRTL ? "ml-1" : "mr-1"}`} />
                  {project.roiPercent}% ROI
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {projectDesc}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {project.propertyType}
              </span>
              {project.completionDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {project.completionDate}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
              <div>
                <p className="text-xs text-muted-foreground">{t("projects.startingFrom")}</p>
                <p className="text-xl font-bold gradient-text-gold">
                  {formatPrice(project.priceFrom)} AED
                </p>
              </div>
              <Button
                className="luxury-button"
                data-testid={`button-details-${project.id}`}
              >
                {t("projects.details")}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      </Link>
    </motion.div>
  );
}

function CompareModal({
  projects,
  onClose,
  formatPrice,
  t,
}: {
  projects: Project[];
  onClose: () => void;
  formatPrice: (price: number) => string;
  t: (key: string) => string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap + Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Focus the close button on open
    closeButtonRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("projects.compare.title")}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">{t("projects.compare.title")}</h3>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full"
            aria-label={t("projects.compare.title") + " - close"}
            data-testid="button-close-compare"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th scope="col" className="text-start p-3 bg-muted rounded-tr-lg">{t("projects.compare.param")}</th>
                {projects.map((p) => (
                  <th scope="col" key={p.id} className="p-3 bg-muted text-center last:rounded-tl-lg">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border even:bg-muted/30 hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">{t("projects.compare.price")}</td>
                {projects.map((p) => (
                  <td key={p.id} className="p-3 text-center text-primary font-bold">
                    {formatPrice(p.priceFrom)} AED
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border even:bg-muted/30 hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">{t("projects.compare.roi")}</td>
                {projects.map((p) => (
                  <td key={p.id} className="p-3 text-center">
                    <Badge variant="outline" className="text-green-600">
                      {p.roiPercent ? `${p.roiPercent}%` : "-"}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border even:bg-muted/30 hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">{t("projects.compare.location")}</td>
                {projects.map((p) => (
                  <td key={p.id} className="p-3 text-center">
                    {p.location}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border even:bg-muted/30 hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">{t("projects.compare.developer")}</td>
                {projects.map((p) => (
                  <td key={p.id} className="p-3 text-center font-medium">
                    {p.developer}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border even:bg-muted/30 hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">{t("projects.compare.type")}</td>
                {projects.map((p) => (
                  <td key={p.id} className="p-3 text-center">
                    {p.propertyType}
                  </td>
                ))}
              </tr>
              <tr className="even:bg-muted/30 hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">{t("projects.compare.delivery")}</td>
                {projects.map((p) => (
                  <td key={p.id} className="p-3 text-center">
                    {p.completionDate || t("projects.compare.ready")}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
