import { useLanguage } from "@/lib/i18n";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export default function PrivacyPolicy() {
  const { isRTL } = useLanguage();

  return (
    <LegalPageLayout title="מדיניות פרטיות" titleEn="Privacy Policy">
      {isRTL ? <HebrewContent /> : <EnglishContent />}
    </LegalPageLayout>
  );
}

function HebrewContent() {
  return (
    <>
      <p>
        מדיניות פרטיות זו מסבירה כיצד D D L REAL ESTATE L.L.C ("החברה", "אנחנו", "אנו") אוספת, משתמשת, מאחסנת ומגינה על מידע אישי באמצעות האתר ddl-uae.com ("האתר").
      </p>
      <p className="font-medium">
        בשימוש באתר או בשליחת המידע שלך, אתה מסכים לנהלים המתוארים במדיניות פרטיות זו.
      </p>

      <h2>1. ישות משפטית</h2>
      <ul>
        <li><strong>שם משפטי:</strong> D D L REAL ESTATE L.L.C</li>
        <li><strong>מספר רישיון עסקי:</strong> 1547872</li>
        <li><strong>כתובת:</strong> Necat Celik – Building Office No: C1804-179 Business Bay, Dubai, U.A.E</li>
        <li><strong>דוא"ל:</strong> office@ddl-uae.com</li>
        <li><strong>טלפון / WhatsApp:</strong> +972 50-889-6702</li>
      </ul>

      <h2>2. תחולה והחלה</h2>
      <p>
        מדיניות פרטיות זו חלה על כל משתמשי האתר, כולל משתמשים הממוקמים בישראל ובתחומי שיפוט אחרים.
      </p>
      <p>מידע אישי מעובד בהתאם ל:</p>
      <ul>
        <li>חוקי הגנת המידע החלים של איחוד האמירויות הערביות</li>
        <li>עקרונות פרטיות כלליים החלים על משתמשים בינלאומיים</li>
      </ul>

      <h2>3. מידע שאנו אוספים</h2>
      <p>אנו עשויים לאסוף את המידע האישי הבא כאשר מסופק מרצון על ידי המשתמשים:</p>
      <ul>
        <li>שם מלא</li>
        <li>מספר טלפון</li>
        <li>כתובת דוא"ל</li>
        <li>טווח תקציב</li>
        <li>העדפות השקעה או נכס</li>
        <li>כל מידע נוסף שנשלח באמצעות טפסי יצירת קשר, הודעות או שיחות</li>
      </ul>
      <p>אנו לא אוספים ביודעין מידע מקטינים מתחת לגיל 18.</p>

      <h2>4. אופי איסוף המידע</h2>
      <ul>
        <li>שליחת מידע היא מרצון</li>
        <li>אי מסירת מידע מסוים עשוי להגביל את יכולתנו להגיב או לספק שירותים</li>
        <li>אנו לא אוספים מידע אישי רגיש אלא אם כן מסופק במפורש על ידי המשתמש</li>
      </ul>

      <h2>5. מטרות עיבוד המידע</h2>
      <p>מידע אישי עשוי לשמש למטרות הבאות:</p>
      <ul>
        <li>מענה לפניות ובקשות</li>
        <li>יצירת קשר עם משתמשים באמצעות טלפון, דוא"ל, WhatsApp או SMS</li>
        <li>מתן מידע על נכסים, פרויקטים או הזדמנויות השקעה</li>
        <li>התאמת משתמשים לנכסים או יזמים רלוונטיים</li>
        <li>שיווק, מעקבים ותקשורת עסקית</li>
        <li>ניהול עסקי פנימי ושמירת רשומות</li>
        <li>עמידה בהתחייבויות משפטיות ורגולטוריות</li>
      </ul>

      <h2>6. שיווק ותקשורת</h2>
      <p>
        בשליחת פרטי ההתקשרות שלך, אתה מסכים שניצור איתך קשר דרך ערוצי התקשורת שסיפקת, כולל:
      </p>
      <ul>
        <li>שיחות טלפון</li>
        <li>דוא"ל</li>
        <li>WhatsApp</li>
        <li>SMS</li>
      </ul>
      <p>באפשרותך לבטל את ההסכמה לתקשורת שיווקית בכל עת על ידי:</p>
      <ul>
        <li>לחיצה על קישור הסרה מרשימת תפוצה (במקרים הרלוונטיים)</li>
        <li>השבה עם בקשת הסרה</li>
        <li>פנייה ישירה אלינו ל-office@ddl-uae.com</li>
      </ul>

      <h2>7. שיתוף מידע עם צדדים שלישיים</h2>
      <p>אנו עשויים לשתף מידע אישי עם צדדים שלישיים רלוונטיים, אך ורק למטרות עסקיות לגיטימיות, כולל:</p>
      <ul>
        <li>יזמי נדל"ן וקבלנים</li>
        <li>בנקים, יועצי משכנתאות ומוסדות פיננסיים</li>
        <li>יועצים משפטיים ומקצועיים</li>
        <li>ספקי CRM, אירוח, אנליטיקס ושירותי IT</li>
      </ul>
      <p>מידע משותף רק במידה הנדרשת ובכפוף להתחייבויות סודיות.</p>

      <h2>8. העברות מידע בינלאומיות</h2>
      <p>
        מידע אישי עשוי להיות מועבר, מאוחסן ומעובד מחוץ למדינת המגורים של המשתמש, כולל מחוץ לישראל, על שרתים ומערכות מאובטחים.
      </p>
      <p>בשימוש באתר, אתה מאשר ומסכים להעברות בינלאומיות כאלה.</p>

      <h2>9. שמירת מידע</h2>
      <p>מידע אישי נשמר רק כל עוד נדרש כדי:</p>
      <ul>
        <li>למלא את המטרות שלשמן נאסף</li>
        <li>לשמור על קשרים עסקיים לגיטימיים</li>
        <li>לעמוד בדרישות משפטיות, רגולטוריות או חוזיות</li>
      </ul>
      <p>כאשר מידע אינו נדרש עוד, הוא יימחק באופן מאובטח או יהפוך לאנונימי.</p>

      <h2>10. אבטחת מידע</h2>
      <p>אנו מיישמים אמצעים טכניים וארגוניים סבירים להגנה על מידע אישי מפני:</p>
      <ul>
        <li>גישה לא מורשית</li>
        <li>אובדן, שימוש לרעה או שינוי</li>
        <li>חשיפה מעבר למטרות מורשות</li>
      </ul>
      <p>עם זאת, אין מערכת שניתן להבטיח שהיא 100% מאובטחת.</p>

      <h2>11. עוגיות וטכנולוגיות מעקב</h2>
      <p>האתר עשוי להשתמש בעוגיות וטכנולוגיות דומות עבור:</p>
      <ul>
        <li>פונקציונליות האתר</li>
        <li>מדידת אנליטיקס וביצועים</li>
        <li>מטרות שיווק ורימרקטינג</li>
      </ul>
      <p>משתמשים יכולים לשלוט בהגדרות העוגיות דרך העדפות הדפדפן שלהם. השבתת עוגיות עשויה להשפיע על פונקציונליות האתר.</p>

      <h2>12. זכויות המשתמש</h2>
      <p>בכפוף לחוק החל, משתמשים רשאים לבקש:</p>
      <ul>
        <li>גישה למידע האישי שלהם</li>
        <li>תיקון מידע לא מדויק</li>
        <li>מחיקת מידע אישי</li>
        <li>הגבלה או התנגדות לפעילויות עיבוד מסוימות</li>
      </ul>
      <p>בקשות ניתן להגיש ל-office@ddl-uae.com.</p>

      <h2>13. אתרי צד שלישי</h2>
      <p>האתר עשוי להכיל קישורים לאתרי צד שלישי.</p>
      <p>אנו לא אחראים לנהלי הפרטיות או לתוכן של צדדים שלישיים כאלה.</p>

      <h2>14. עדכוני מדיניות</h2>
      <p>מדיניות פרטיות זו עשויה להתעדכן מעת לעת.</p>
      <p>הגרסה המעודכנת תפורסם באתר, והמשך השימוש מהווה קבלת המדיניות המתוקנת.</p>

      <h2>15. יצירת קשר</h2>
      <p>לפניות או בקשות הקשורות לפרטיות, אנא פנו ל:</p>
      <p className="font-medium">office@ddl-uae.com</p>
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <p>
        This Privacy Policy explains how D D L REAL ESTATE L.L.C (the "Company", "we", "us") collects, uses, stores, and protects personal data through ddl-uae.com (the "Website").
      </p>
      <p className="font-medium">
        By using the Website or submitting your information, you consent to the practices described in this Privacy Policy.
      </p>

      <h2>1. Legal Entity</h2>
      <ul>
        <li><strong>Legal Name:</strong> D D L REAL ESTATE L.L.C</li>
        <li><strong>Trade License No.:</strong> 1547872</li>
        <li><strong>Address:</strong> Necat Celik – Building Office No: C1804-179 Business Bay, Dubai, U.A.E</li>
        <li><strong>Email (General & Privacy Requests):</strong> office@ddl-uae.com</li>
        <li><strong>Phone / WhatsApp:</strong> +972 50-889-6702</li>
      </ul>

      <h2>2. Scope and Applicability</h2>
      <p>
        This Privacy Policy applies to all users of the Website, including users located in Israel and other jurisdictions.
      </p>
      <p>Personal data is processed in accordance with:</p>
      <ul>
        <li>Applicable data protection laws of the United Arab Emirates</li>
        <li>General privacy principles applicable to international users</li>
      </ul>

      <h2>3. Information We Collect</h2>
      <p>We may collect the following personal data when voluntarily provided by users:</p>
      <ul>
        <li>Full name</li>
        <li>Phone number</li>
        <li>Email address</li>
        <li>Budget range</li>
        <li>Investment or property preferences</li>
        <li>Any additional information submitted via contact forms, messaging, or calls</li>
      </ul>
      <p>We do not knowingly collect data from minors under the age of 18.</p>

      <h2>4. Nature of Data Collection</h2>
      <ul>
        <li>Data submission is voluntary</li>
        <li>Failure to provide certain information may limit our ability to respond or provide services</li>
        <li>We do not collect sensitive personal data unless explicitly provided by the user</li>
      </ul>

      <h2>5. Purpose of Data Processing</h2>
      <p>Personal data may be used for the following purposes:</p>
      <ul>
        <li>Responding to inquiries and requests</li>
        <li>Contacting users via phone, email, WhatsApp, or SMS</li>
        <li>Providing information about properties, projects, or investment opportunities</li>
        <li>Matching users with relevant properties or developers</li>
        <li>Marketing, follow-ups, and business communications</li>
        <li>Internal business management and record keeping</li>
        <li>Compliance with legal and regulatory obligations</li>
      </ul>

      <h2>6. Marketing and Communications</h2>
      <p>
        By submitting your contact details, you consent to being contacted through the communication channels you provided, including:
      </p>
      <ul>
        <li>Phone calls</li>
        <li>Email</li>
        <li>WhatsApp</li>
        <li>SMS</li>
      </ul>
      <p>You may opt out of marketing communications at any time by:</p>
      <ul>
        <li>Clicking an unsubscribe link (where applicable)</li>
        <li>Replying with a removal request</li>
        <li>Contacting us directly at office@ddl-uae.com</li>
      </ul>

      <h2>7. Data Sharing with Third Parties</h2>
      <p>We may share personal data with relevant third parties, strictly for legitimate business purposes, including:</p>
      <ul>
        <li>Real estate developers and contractors</li>
        <li>Banks, mortgage advisors, and financial institutions</li>
        <li>Legal and professional advisors</li>
        <li>CRM, hosting, analytics, and IT service providers</li>
      </ul>
      <p>Data is shared only to the extent necessary and subject to confidentiality obligations.</p>

      <h2>8. International Data Transfers</h2>
      <p>
        Personal data may be transferred to, stored, and processed outside the user's country of residence, including outside Israel, on secure servers and systems.
      </p>
      <p>By using the Website, you acknowledge and consent to such international transfers.</p>

      <h2>9. Data Retention</h2>
      <p>Personal data is retained only for as long as necessary to:</p>
      <ul>
        <li>Fulfill the purposes for which it was collected</li>
        <li>Maintain legitimate business relationships</li>
        <li>Comply with legal, regulatory, or contractual requirements</li>
      </ul>
      <p>When data is no longer required, it will be securely deleted or anonymized.</p>

      <h2>10. Data Security</h2>
      <p>We implement reasonable technical and organizational measures to protect personal data against:</p>
      <ul>
        <li>Unauthorized access</li>
        <li>Loss, misuse, or alteration</li>
        <li>Disclosure beyond authorized purposes</li>
      </ul>
      <p>However, no system can be guaranteed to be 100% secure.</p>

      <h2>11. Cookies and Tracking Technologies</h2>
      <p>The Website may use cookies and similar technologies for:</p>
      <ul>
        <li>Website functionality</li>
        <li>Analytics and performance measurement</li>
        <li>Marketing and remarketing purposes</li>
      </ul>
      <p>Users may control cookie settings through their browser preferences. Disabling cookies may affect Website functionality.</p>

      <h2>12. User Rights</h2>
      <p>Subject to applicable law, users may request:</p>
      <ul>
        <li>Access to their personal data</li>
        <li>Correction of inaccurate data</li>
        <li>Deletion of personal data</li>
        <li>Restriction or objection to certain processing activities</li>
      </ul>
      <p>Requests may be submitted to office@ddl-uae.com.</p>

      <h2>13. Third-Party Websites</h2>
      <p>The Website may contain links to third-party websites.</p>
      <p>We are not responsible for the privacy practices or content of such third parties.</p>

      <h2>14. Policy Updates</h2>
      <p>This Privacy Policy may be updated from time to time.</p>
      <p>The updated version will be published on the Website, and continued use constitutes acceptance of the revised policy.</p>

      <h2>15. Contact</h2>
      <p>For privacy-related inquiries or requests, please contact:</p>
      <p className="font-medium">office@ddl-uae.com</p>
    </>
  );
}
