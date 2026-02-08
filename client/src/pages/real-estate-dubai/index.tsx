import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Building2, TrendingUp, MapPin, DollarSign, FileText, HelpCircle, ArrowLeft, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ANSWER_BLOCK = `נדל״ן בדובאי נחשב כיום לאחד מאפיקי ההשקעה המבוקשים בעולם בזכות מיסוי אפסי, רגולציה ידידותית למשקיעים זרים, ותשואות שכירות גבוהות ביחס לשווקים מערביים. העיר מציעה שילוב של יציבות כלכלית, ביקוש בינלאומי וצמיחה מתמשכת.`;

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
    }
  ]
};

const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "נדל״ן בדובאי – מדריך מלא למשקיעים ורוכשים זרים",
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

const clusterLinks = [
  { path: "/real-estate-dubai/investment/", title: "השקעה בנדל״ן בדובאי", icon: TrendingUp, description: "תשואות, אסטרטגיות השקעה וסוגי נכסים" },
  { path: "/real-estate-dubai/areas/", title: "אזורים מובילים בדובאי", icon: MapPin, description: "אזורי יוקרה, השקעה ופיתוח" },
  { path: "/real-estate-dubai/prices/", title: "מחירי נדל״ן בדובאי", icon: DollarSign, description: "מחירים עדכניים לפי אזור וסוג נכס" },
  { path: "/real-estate-dubai/tax-regulation/", title: "מיסוי ורגולציה", icon: FileText, description: "מערכת המס והחוקים למשקיעים זרים" },
  { path: "/real-estate-dubai/faq/", title: "שאלות נפוצות", icon: HelpCircle, description: "תשובות לשאלות הנפוצות ביותר" },
];

export default function RealEstateDubaiPillar() {
  useEffect(() => {
    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.text = JSON.stringify(FAQ_SCHEMA);
    faqScript.id = "faq-schema";
    document.head.appendChild(faqScript);

    const articleScript = document.createElement("script");
    articleScript.type = "application/ld+json";
    articleScript.text = JSON.stringify(ARTICLE_SCHEMA);
    articleScript.id = "article-schema";
    document.head.appendChild(articleScript);

    return () => {
      const faq = document.getElementById("faq-schema");
      const article = document.getElementById("article-schema");
      if (faq) faq.remove();
      if (article) article.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 ml-2" />
                חזרה לדף הבית
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">נדל״ן בדובאי</span>
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
              נדל״ן בדובאי – מדריך מלא למשקיעים ורוכשים זרים
            </h1>

            <div className="glass-card p-6 mb-8 border-r-4 border-primary">
              <p className="text-lg text-foreground leading-relaxed">
                {ANSWER_BLOCK}
              </p>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">למה דובאי מושכת משקיעי נדל״ן</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                דובאי מציעה שילוב ייחודי של צמיחה כלכלית, הגירה חיובית, ותשתיות מתקדמות. העיר ממוקמת כמרכז עסקי גלובלי המחבר בין מזרח למערב, עם נמל תעופה בינלאומי מהגדולים בעולם ואזור סחר חופשי.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                היציבות הפוליטית והכלכלית של איחוד האמירויות, יחד עם מדיניות ידידותית לעסקים וויזות משקיעים, הופכים את דובאי ליעד אטרקטיבי במיוחד למשקיעים בינלאומיים.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">סוגי השקעות נדל״ן בדובאי</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                שוק הנדל״ן בדובאי מציע מגוון רחב של אפשרויות השקעה:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mr-4">
                <li>דירות מגורים – סטודיו ועד פנטהאוזים יוקרתיים</li>
                <li>נכסים להשכרה – תשואות שנתיות של 5%-9%</li>
                <li>פרויקטים על הנייר (Off-Plan) – מחירי כניסה נמוכים ופוטנציאל עליית ערך</li>
                <li>נכסי יוקרה – וילות ואחוזות באזורי פריים</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">למי זה מתאים</h2>
              <p className="text-muted-foreground leading-relaxed">
                השקעות נדל״ן בדובאי מתאימות למשקיעים פרטיים המחפשים גיוון תיק, משפחות המעוניינות בנכס לשימוש אישי ולהשכרה, משקיעי תשואה המחפשים הכנסה פסיבית קבועה, ומשקיעי הון המחפשים עליית ערך לטווח ארוך.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">מדריכים מפורטים</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {clusterLinks.map((link) => (
                  <Link key={link.path} href={link.path}>
                    <Card className="p-5 glass-card hover-elevate cursor-pointer h-full">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <link.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{link.title}</h3>
                          <p className="text-sm text-muted-foreground">{link.description}</p>
                        </div>
                        <ChevronLeft className="h-5 w-5 text-muted-foreground mr-auto" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">שאלות נפוצות</h2>
              <div className="space-y-4">
                {FAQ_SCHEMA.mainEntity.map((faq, index) => (
                  <Card key={index} className="p-5 glass-card">
                    <h3 className="font-semibold text-foreground mb-2">{faq.name}</h3>
                    <p className="text-muted-foreground">{faq.acceptedAnswer.text}</p>
                  </Card>
                ))}
              </div>
            </section>
          </motion.article>
        </div>
      </main>
    </div>
  );
}
