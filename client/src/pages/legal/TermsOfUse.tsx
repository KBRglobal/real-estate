import { useLanguage } from "@/lib/i18n";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export default function TermsOfUse() {
  const { isRTL } = useLanguage();

  return (
    <LegalPageLayout title="תנאי שימוש" titleEn="Terms of Use">
      {isRTL ? <HebrewContent /> : <EnglishContent />}
    </LegalPageLayout>
  );
}

function HebrewContent() {
  return (
    <>
      <h2>1. כללי</h2>
      <p>ברוכים הבאים ל-ddl-uae.com ("האתר").</p>
      <p>
        האתר מופעל על ידי D D L REAL ESTATE L.L.C, חברה רשומה בדובאי, איחוד האמירויות הערביות (Dubai Mainland) ("החברה").
      </p>
      <p>
        בגישה, גלישה או שימוש באתר, כולל שליחת מידע כלשהו דרכו, אתה מאשר שקראת, הבנת והסכמת להיות כפוף לתנאי שימוש אלה.
      </p>
      <p className="font-medium">אם אינך מסכים לתנאים אלה, עליך להימנע משימוש באתר.</p>

      <h2>2. זהות משפטית ורישוי</h2>
      <ul>
        <li><strong>שם משפטי:</strong> D D L REAL ESTATE L.L.C</li>
        <li><strong>מספר רישיון עסקי:</strong> 1547872</li>
        <li><strong>כתובת רשומה:</strong> Necat Celik – Building Office No: C1804-179 Business Bay, Dubai, U.A.E</li>
        <li><strong>דוא"ל:</strong> office@ddl-uae.com</li>
        <li><strong>טלפון / WhatsApp:</strong> +972 50-889-6702</li>
      </ul>
      <p>החברה פועלת תחת רישיון תיווך נדל"ן תקף בדובאי.</p>
      <p>שירותים מסופקים באמצעות מתווך נדל"ן מורשה המחזיק בכרטיס מתווך RERA (BRN) מס' 90771.</p>

      <h2>3. מטרת האתר</h2>
      <p>האתר מיועד אך ורק כפלטפורמה שיווקית, מיתוגית ואינפורמטיבית.</p>
      <p>למען הסר ספק:</p>
      <ul>
        <li>לא מתבצעות עסקאות דרך האתר</li>
        <li>לא מעובדים תשלומים</li>
        <li>לא נחתמים הסכמים</li>
        <li>לא ניתנות הצעות או התחייבויות מחייבות באמצעות האתר</li>
      </ul>
      <p>כל עסקת נדל"ן, אם תתבצע, תיערך מחוץ לאתר ותהיה כפופה להסכמים נפרדים.</p>

      <h2>4. קהל יעד וזכאות</h2>
      <p>האתר מיועד לאנשים בני 18 ומעלה.</p>
      <p>הוא מכוון לתושבי ישראל בארץ ובחו"ל, כמו גם למשתמשים בינלאומיים.</p>

      <h2>5. הצהרת מידע והסתמכות</h2>
      <p>כל המידע המוצג באתר, כולל אך לא מוגבל לתיאורי נכסים, מחירים, תוכניות תשלום, זמינות, ויזואליה והערכות תשואה:</p>
      <ul>
        <li>מסופק למטרות מידע כללי בלבד</li>
        <li>אינו מהווה הצעה, מצג או התחייבות מחייבת</li>
        <li>עשוי להיות חלקי, אינדיקטיבי או כפוף לשינוי ללא הודעה מוקדמת</li>
      </ul>
      <p className="font-medium">כל הסתמכות על המידע המוצג באתר נעשית על אחריות המשתמש בלבד.</p>

      <h2>6. אין ייעוץ השקעות, פיננסי או משפטי</h2>
      <p>דבר באתר לא ייחשב כ:</p>
      <ul>
        <li>ייעוץ השקעות</li>
        <li>ייעוץ פיננסי</li>
        <li>ייעוץ מס</li>
        <li>ייעוץ משפטי</li>
      </ul>
      <p>מומלץ למשתמשים לפנות לייעוץ מקצועי עצמאי לפני קבלת החלטות השקעה או נדל"ן.</p>

      <h2>7. נכסים, מחירים ותחזיות</h2>
      <ul>
        <li>המחירים המוצגים הם אינדיקטיביים בלבד ועשויים שלא לכלול מיסים, אגרות רישום, דמי שירות, עמלות או עלויות אחרות</li>
        <li>הזמינות כפופה לשינוי על ידי יזמים או צדדים שלישיים</li>
        <li>כל תשואה, החזר או תחזית הם להמחשה בלבד ואינם מובטחים</li>
      </ul>

      <h2>8. קניין רוחני</h2>
      <p>
        כל התוכן באתר, כולל טקסט, גרפיקה, לוגואים, תמונות, סרטונים ואלמנטי עיצוב, הוא רכוש החברה או צדדים שלישיים מורשים.
      </p>
      <p>
        תמונות עשויות לכלול הדמיות, סימולציות, חומרי יזם או תמונות מלאי מורשות והן למטרות המחשה בלבד.
      </p>
      <p>
        אין להעתיק, לשכפל, להפיץ או להשתמש בתוכן כלשהו למטרות מסחריות ללא הסכמה מראש בכתב.
      </p>

      <h2>9. הגבלת אחריות</h2>
      <p>במידה המרבית המותרת על פי חוק:</p>
      <ul>
        <li>החברה לא תהיה אחראית לנזקים עקיפים, מקריים, תוצאתיים או מיוחדים</li>
        <li>החברה אינה אחראית למידע שסופק על ידי צדדים שלישיים, כולל יזמים או ספקי שירות</li>
        <li>החברה שומרת על הזכות לתקן שגיאות, אי-דיוקים או השמטות בכל עת</li>
      </ul>

      <h2>10. כוח עליון</h2>
      <p>
        החברה לא תהיה אחראית לכל כשל או עיכוב הנגרם מאירועים מחוץ לשליטתה הסבירה, כולל אך לא מוגבל לשינויים רגולטוריים, כשלים טכניים, אירועי סייבר או אירועי כוח עליון.
      </p>

      <h2>11. הגבלות שימוש באתר</h2>
      <p>משתמשים מסכימים שלא:</p>
      <ul>
        <li>לספק מידע שקרי או מטעה</li>
        <li>להשתמש באתר למטרות לא חוקיות או גריפה מסחרית</li>
        <li>לנסות גישה לא מורשית או להפריע לפונקציונליות האתר</li>
      </ul>
      <p>החברה שומרת על הזכות להגביל או לחסום גישה לאתר לפי שיקול דעתה.</p>

      <h2>12. דין חל וסמכות שיפוט</h2>
      <p>תנאים אלה יפורשו בהתאם לחוקי איחוד האמירויות הערביות.</p>
      <p>סמכות שיפוט בלעדית תהיה לבתי המשפט המוסמכים בדובאי.</p>

      <h2>13. תיקונים</h2>
      <p>החברה רשאית לעדכן תנאים אלה מעת לעת.</p>
      <p>המשך השימוש באתר לאחר פרסום תנאים מעודכנים מהווה קבלה של הגרסה המתוקנת.</p>

      <h2>14. יצירת קשר</h2>
      <p>לכל שאלה בנוגע לתנאים אלה:</p>
      <p className="font-medium">office@ddl-uae.com</p>
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <h2>1. General</h2>
      <p>Welcome to ddl-uae.com (the "Website").</p>
      <p>
        The Website is operated by D D L REAL ESTATE L.L.C, a company registered in Dubai, United Arab Emirates (Dubai Mainland) (the "Company").
      </p>
      <p>
        By accessing, browsing, or using the Website, including submitting any information through it, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Use.
      </p>
      <p className="font-medium">If you do not agree to these Terms, you must refrain from using the Website.</p>

      <h2>2. Legal Identity and Licensing</h2>
      <ul>
        <li><strong>Legal Name:</strong> D D L REAL ESTATE L.L.C</li>
        <li><strong>Trade License No.:</strong> 1547872</li>
        <li><strong>Registered Address:</strong> Necat Celik – Building Office No: C1804-179 Business Bay, Dubai, U.A.E</li>
        <li><strong>Email:</strong> office@ddl-uae.com</li>
        <li><strong>Phone / WhatsApp:</strong> +972 50-889-6702</li>
      </ul>
      <p>The Company operates under a valid real estate brokerage license in Dubai.</p>
      <p>Services are provided through a licensed real estate broker holding RERA Broker Card (BRN) No. 90771.</p>

      <h2>3. Purpose of the Website</h2>
      <p>The Website is intended solely as a marketing, branding, and informational platform.</p>
      <p>For the avoidance of doubt:</p>
      <ul>
        <li>No transactions are executed through the Website</li>
        <li>No payments are processed</li>
        <li>No agreements are signed</li>
        <li>No binding offers or commitments are made via the Website</li>
      </ul>
      <p>Any real estate transaction, if pursued, shall be conducted outside the Website and governed by separate agreements.</p>

      <h2>4. Target Audience and Eligibility</h2>
      <p>The Website is intended for individuals aged 18 years or older.</p>
      <p>It is directed at Israeli residents in Israel and abroad, as well as international users.</p>

      <h2>5. Information Disclaimer and Reliance</h2>
      <p>All information presented on the Website, including but not limited to property descriptions, prices, payment plans, availability, visuals, and estimated returns:</p>
      <ul>
        <li>Is provided for general informational purposes only</li>
        <li>Does not constitute a binding offer, representation, or commitment</li>
        <li>May be partial, indicative, or subject to change without notice</li>
      </ul>
      <p className="font-medium">Any reliance on the information displayed on the Website is made entirely at the user's own risk.</p>

      <h2>6. No Investment, Financial, or Legal Advice</h2>
      <p>Nothing on the Website shall be construed as:</p>
      <ul>
        <li>Investment advice</li>
        <li>Financial advice</li>
        <li>Tax advice</li>
        <li>Legal advice</li>
      </ul>
      <p>Users are encouraged to seek independent professional advice before making any investment or real estate-related decisions.</p>

      <h2>7. Properties, Prices, and Projections</h2>
      <ul>
        <li>Prices shown are indicative only and may not include taxes, registration fees, service charges, commissions, or other costs</li>
        <li>Availability is subject to change by developers or third parties</li>
        <li>Any yield, return, or projection is illustrative only and not guaranteed</li>
      </ul>

      <h2>8. Intellectual Property</h2>
      <p>
        All content on the Website, including text, graphics, logos, images, videos, and design elements, is the property of the Company or licensed third parties.
      </p>
      <p>
        Images may include renderings, simulations, developer materials, or licensed stock imagery and are for illustration purposes only.
      </p>
      <p>
        No content may be copied, reproduced, distributed, or used for commercial purposes without prior written consent.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>To the maximum extent permitted by applicable law:</p>
      <ul>
        <li>The Company shall not be liable for indirect, incidental, consequential, or special damages</li>
        <li>The Company is not responsible for information provided by third parties, including developers or service providers</li>
        <li>The Company reserves the right to correct errors, inaccuracies, or omissions at any time</li>
      </ul>

      <h2>10. Force Majeure</h2>
      <p>
        The Company shall not be liable for any failure or delay caused by events beyond its reasonable control, including but not limited to regulatory changes, technical failures, cyber incidents, or force majeure events.
      </p>

      <h2>11. Website Use Restrictions</h2>
      <p>Users agree not to:</p>
      <ul>
        <li>Provide false or misleading information</li>
        <li>Use the Website for unlawful or commercial scraping purposes</li>
        <li>Attempt unauthorized access or interfere with Website functionality</li>
      </ul>
      <p>The Company reserves the right to restrict or block access to the Website at its discretion.</p>

      <h2>12. Governing Law and Jurisdiction</h2>
      <p>These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates.</p>
      <p>Exclusive jurisdiction shall lie with the competent courts of Dubai.</p>

      <h2>13. Amendments</h2>
      <p>The Company may update these Terms from time to time.</p>
      <p>Continued use of the Website following publication of updated Terms constitutes acceptance of the revised version.</p>

      <h2>14. Contact</h2>
      <p>For any questions regarding these Terms:</p>
      <p className="font-medium">office@ddl-uae.com</p>
    </>
  );
}
