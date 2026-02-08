import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { HelpCircle, ArrowLeft, TrendingUp, FileText, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ANSWER_BLOCK = `רוב השאלות לגבי נדל״ן בדובאי עוסקות בבעלות זרה, מיסוי, תשואות, סיכונים ותהליך הרכישה. הבנה מוקדמת של הנושאים האלו מפחיתה סיכון ומשפרת קבלת החלטות.`;

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "האם זרים יכולים לקנות נדל״ן בדובאי?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כן. זרים יכולים לרכוש נכסים בבעלות מלאה באזורים מוגדרים בדובאי, ללא צורך באזרחות או תושבות."
      }
    },
    {
      "@type": "Question",
      "name": "האם משלמים מס על נדל״ן בדובאי?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "בדובאי אין מס הכנסה ואין מס רווחי הון על נדל״ן, אך קיימות אגרות רכישה ועלויות רישום חד-פעמיות."
      }
    },
    {
      "@type": "Question",
      "name": "מה התשואה הצפויה מהשקעה בדובאי?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ברוב אזורי ההשקעה התשואה השנתית נעה בין 5% ל-9%, תלוי באזור ובסוג הנכס."
      }
    },
    {
      "@type": "Question",
      "name": "מהו הסכום המינימלי להשקעה?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ניתן להתחיל בהשקעה החל מ-300,000 AED (כ-300,000 ש״ח) עבור סטודיו באזור תשואה גבוהה."
      }
    },
    {
      "@type": "Question",
      "name": "האם ניתן לקבל ויזה עם רכישת נכס?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כן. רכישת נכס בשווי 750,000 AED ומעלה מזכה בויזת תושב ל-2 שנים. רכישה בשווי 2,000,000 AED מזכה בויזת זהב ל-10 שנים."
      }
    },
    {
      "@type": "Question",
      "name": "מה הסיכונים בהשקעה בדובאי?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "הסיכונים העיקריים כוללים תנודתיות שוק, עיכובים בפרויקטים על הנייר, ותלות בשוק הבינלאומי. בחירה נכונה של יזם ואזור מפחיתה משמעותית את הסיכון."
      }
    }
  ]
};

const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "שאלות נפוצות על נדל״ן בדובאי",
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
  { path: "/real-estate-dubai/tax-regulation/", title: "מיסוי ורגולציה", icon: FileText },
];

export default function FAQPage() {
  useEffect(() => {
    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.text = JSON.stringify(FAQ_SCHEMA);
    faqScript.id = "faq-schema-page";
    document.head.appendChild(faqScript);

    const articleScript = document.createElement("script");
    articleScript.type = "application/ld+json";
    articleScript.text = JSON.stringify(ARTICLE_SCHEMA);
    articleScript.id = "article-schema-faq";
    document.head.appendChild(articleScript);

    return () => {
      const faq = document.getElementById("faq-schema-page");
      const article = document.getElementById("article-schema-faq");
      if (faq) faq.remove();
      if (article) article.remove();
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
              <HelpCircle className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">שאלות נפוצות</span>
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
              שאלות נפוצות על נדל״ן בדובאי
            </h1>

            <div className="glass-card p-6 mb-8 border-r-4 border-primary">
              <p className="text-lg text-foreground leading-relaxed">
                {ANSWER_BLOCK}
              </p>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">שאלות ותשובות</h2>
              <div className="space-y-4">
                {FAQ_SCHEMA.mainEntity.map((faq, index) => (
                  <Card key={index} className="p-5 glass-card">
                    <h3 className="font-semibold text-foreground mb-3 text-lg">{faq.name}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.acceptedAnswer.text}</p>
                  </Card>
                ))}
              </div>
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
