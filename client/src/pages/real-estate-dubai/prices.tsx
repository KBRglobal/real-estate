import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { DollarSign, ArrowLeft, MapPin, TrendingUp, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ANSWER_BLOCK = `מחירי נדל״ן בדובאי משתנים בהתאם לאזור, סוג הנכס והשלב בפרויקט. קיימים פערים משמעותיים בין אזורי פריים לבין אזורים מתפתחים, מה שמאפשר התאמת השקעה לכל תקציב.`;

const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "מחירי נדל״ן בדובאי – מדריך מחירים עדכני",
  "description": ANSWER_BLOCK,
  "author": {
    "@type": "Organization",
    "name": "PropLine Real Estate"
  },
  "publisher": {
    "@type": "Organization",
    "name": "PropLine Real Estate"
  }
};

const internalLinks = [
  { path: "/real-estate-dubai/areas/", title: "אזורים מובילים בדובאי", icon: MapPin },
  { path: "/real-estate-dubai/investment/", title: "השקעה בנדל״ן בדובאי", icon: TrendingUp },
];

export default function PricesPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(ARTICLE_SCHEMA);
    script.id = "article-schema-prices";
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("article-schema-prices");
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
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">מחירי נדל״ן</span>
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
              מחירי נדל״ן בדובאי – מדריך מחירים עדכני
            </h1>

            <div className="glass-card p-6 mb-8 border-r-4 border-primary">
              <p className="text-lg text-foreground leading-relaxed">
                {ANSWER_BLOCK}
              </p>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">מחירים לפי אזור</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                המחירים בדובאי משתנים משמעותית לפי אזור:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
                <li>Palm Jumeirah – 3,000-6,000 AED למ״ר</li>
                <li>Downtown Dubai – 2,500-4,500 AED למ״ר</li>
                <li>Dubai Marina – 1,800-3,500 AED למ״ר</li>
                <li>JVC – 800-1,400 AED למ״ר</li>
                <li>Dubai South – 700-1,200 AED למ״ר</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">מחירי כניסה מומלצים</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                סטודיו באזור תשואה גבוהה – החל מ-300,000 AED. דירת חדר שינה אחד באזור מרכזי – החל מ-600,000 AED. דירת 2 חדרי שינה יוקרתית – החל מ-1,200,000 AED.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">עלויות נלוות</h2>
              <p className="text-muted-foreground leading-relaxed">
                בנוסף למחיר הנכס, יש להביא בחשבון עלויות רישום (4% DLD), עמלת תיווך (2%), ועלויות משפטיות. בפרויקטים על הנייר נדרשת לרוב מקדמה של 10%-20% בלבד.
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
