import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { FileText, ArrowLeft, TrendingUp, HelpCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ANSWER_BLOCK = `מערכת המיסוי בדובאי נחשבת לאחת הידידותיות בעולם למשקיעי נדל״ן, עם אפס מס על הכנסות שכירות ורווחי הון, ורגולציה ברורה המאפשרת בעלות מלאה לזרים באזורים מוגדרים.`;

const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "מיסוי ורגולציה בנדל״ן דובאי – מדריך למשקיעים זרים",
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
  { path: "/real-estate-dubai/faq/", title: "שאלות נפוצות", icon: HelpCircle },
];

export default function TaxRegulationPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(ARTICLE_SCHEMA);
    script.id = "article-schema-tax";
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("article-schema-tax");
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
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">מיסוי ורגולציה</span>
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
              מיסוי ורגולציה בנדל״ן דובאי – מדריך למשקיעים זרים
            </h1>

            <div className="glass-card p-6 mb-8 border-r-4 border-primary">
              <p className="text-lg text-foreground leading-relaxed">
                {ANSWER_BLOCK}
              </p>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">מיסוי אפסי</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                בדובאי אין מס הכנסה על הכנסות שכירות ואין מס רווחי הון על מכירת נכס. זהו יתרון משמעותי בהשוואה למדינות מערביות שבהן המס יכול להגיע ל-30%-50%.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">אגרות ועלויות חד-פעמיות</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                העלויות העיקריות בעת רכישה:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
                <li>אגרת רישום DLD – 4% ממחיר הנכס</li>
                <li>עמלת תיווך – 2% (משולמת על ידי הקונה לרוב)</li>
                <li>אגרת נאמנות – 0.25%</li>
                <li>עלויות משפטיות – 5,000-15,000 AED</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">בעלות זרה</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                זרים יכולים לרכוש נכסים בבעלות מלאה (Freehold) באזורים מוגדרים. רשימת האזורים כוללת את רוב הפרויקטים החדשים ואזורי ההשקעה המובילים.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">ויזת משקיע</h2>
              <p className="text-muted-foreground leading-relaxed">
                רכישת נכס בשווי 750,000 AED ומעלה מזכה בויזת תושב ל-2 שנים. רכישה בשווי 2,000,000 AED ומעלה מזכה בויזת זהב ל-10 שנים עם הטבות נוספות.
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
