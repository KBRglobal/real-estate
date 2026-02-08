import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, TrendingUp, DollarSign, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ANSWER_BLOCK = `דובאי מחולקת לאזורי נדל״ן בעלי אופי שונה – אזורי יוקרה, אזורי השקעה מניבים ואזורים מתפתחים. בחירת האזור משפיעה ישירות על תשואה, סיכון ופוטנציאל עליית ערך.`;

const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "אזורים מובילים לנדל״ן בדובאי – מדריך לפי סוג השקעה",
  "description": ANSWER_BLOCK,
  "author": {
    "@type": "Organization",
    "name": "DDL Real Estate"
  },
  "publisher": {
    "@type": "Organization",
    "name": "DDL Real Estate"
  }
};

const internalLinks = [
  { path: "/real-estate-dubai/investment/", title: "השקעה בנדל״ן בדובאי", icon: TrendingUp },
  { path: "/real-estate-dubai/prices/", title: "מחירי נדל״ן בדובאי", icon: DollarSign },
];

export default function AreasPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(ARTICLE_SCHEMA);
    script.id = "article-schema-areas";
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("article-schema-areas");
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/real-estate-dubai/">
              <Button variant="ghost" size="sm" data-testid="button-back-pillar">
                <ArrowLeft className="h-4 w-4 ml-2" />
                חזרה למדריך הראשי
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">אזורים בדובאי</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              אזורים מובילים לנדל״ן בדובאי – מדריך לפי סוג השקעה
            </h1>

            <div className="glass-card p-6 mb-8 border-r-4 border-primary">
              <p className="text-lg text-foreground leading-relaxed">
                {ANSWER_BLOCK}
              </p>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">אזורי יוקרה (Prime)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                אזורים כמו Palm Jumeirah, Downtown Dubai ו-Dubai Marina מציעים נכסי יוקרה עם נוף מרהיב ותשתיות פרימיום. התשואות נמוכות יותר (4%-6%) אך היציבות גבוהה והביקוש קבוע.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">אזורי תשואה גבוהה</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                אזורים כמו JVC (Jumeirah Village Circle), Dubai South ו-Al Furjan מציעים תשואות של 7%-9% עם מחירי כניסה נמוכים יחסית. מתאים למשקיעים המחפשים הכנסה שוטפת.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">אזורים מתפתחים</h2>
              <p className="text-muted-foreground leading-relaxed">
                אזורים כמו Dubai Creek Harbour ו-Mohammed Bin Rashid City נמצאים בפיתוח מואץ עם פוטנציאל עליית ערך משמעותי. מתאים למשקיעים עם אופק השקעה ארוך יותר.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">קישורים רלוונטיים</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {internalLinks.map((link) => (
                  <Link key={link.path} href={link.path}>
                    <Card className="p-4 glass-card hover-elevate cursor-pointer h-full">
                      <div className="flex items-center gap-3">
                        <link.icon className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">{link.title}</span>
                        <ChevronLeft className="h-4 w-4 text-muted-foreground mr-auto" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </motion.article>
        </div>
      </main>
    </div>
  );
}
