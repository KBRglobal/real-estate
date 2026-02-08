import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { TrendingUp, ArrowLeft, MapPin, DollarSign, FileText, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ANSWER_BLOCK = `השקעה בנדל״ן בדובאי מאפשרת למשקיעים זרים ליהנות מתשואות שנתיות של 5%–9%, ללא מס הכנסה וללא מס רווחי הון. השוק מתאים להשקעות קצרות וארוכות טווח, בדגש על אזורי ביקוש ותשתיות מתפתחות.`;

const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "השקעה בנדל״ן בדובאי – מדריך מלא למשקיעים",
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
  { path: "/real-estate-dubai/areas/", title: "אזורים מובילים בדובאי", icon: MapPin },
  { path: "/real-estate-dubai/prices/", title: "מחירי נדל״ן בדובאי", icon: DollarSign },
  { path: "/real-estate-dubai/tax-regulation/", title: "מיסוי ורגולציה", icon: FileText },
];

export default function InvestmentPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(ARTICLE_SCHEMA);
    script.id = "article-schema-investment";
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("article-schema-investment");
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
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">השקעה בנדל״ן</span>
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
              השקעה בנדל״ן בדובאי – מדריך מלא למשקיעים
            </h1>

            <div className="glass-card p-6 mb-8 border-r-4 border-primary">
              <p className="text-lg text-foreground leading-relaxed">
                {ANSWER_BLOCK}
              </p>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">למה להשקיע בנדל״ן בדובאי?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                דובאי מציעה למשקיעים זרים יתרונות משמעותיים שאינם קיימים ברוב השווקים המערביים. מיסוי אפסי על הכנסות שכירות ורווחי הון, יחד עם רגולציה ברורה ושקופה, הופכים את ההשקעה לפשוטה ורווחית.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">סוגי השקעות נפוצים</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                משקיעים יכולים לבחור בין מספר אסטרטגיות השקעה:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
                <li>רכישה להשכרה (Buy-to-Let) – הכנסה פסיבית יציבה</li>
                <li>רכישת Off-Plan – מחיר כניסה נמוך ופוטנציאל עליית ערך</li>
                <li>Flip – רכישה ומכירה מהירה ברווח</li>
                <li>השקעה בנכסי יוקרה – תשואות נמוכות יותר אך יציבות גבוהה</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">תשואות צפויות</h2>
              <p className="text-muted-foreground leading-relaxed">
                התשואות בדובאי משתנות לפי אזור וסוג נכס. באזורי השקעה מובילים כמו JVC ו-Dubai South ניתן להשיג תשואות של 7%-9%, בעוד שבאזורי יוקרה כמו Palm Jumeirah התשואות נעות סביב 4%-6% אך עם יציבות גבוהה יותר.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">קישורים רלוונטיים</h2>
              <div className="grid md:grid-cols-3 gap-4">
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
