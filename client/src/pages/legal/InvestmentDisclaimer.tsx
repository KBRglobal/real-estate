import { useLanguage } from "@/lib/i18n";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export default function InvestmentDisclaimer() {
  const { isRTL } = useLanguage();

  return (
    <LegalPageLayout title="כתב ויתור - נדל&quot;ן והשקעות" titleEn="Real Estate & Investment Disclaimer">
      {isRTL ? <HebrewContent /> : <EnglishContent />}
    </LegalPageLayout>
  );
}

function HebrewContent() {
  return (
    <>
      <p>
        כתב ויתור זה חל על כל התוכן, המידע, החומרים והתקשורת המפורסמים ב-ddl-uae.com ("האתר") ובאמצעות כל ערוצי השיווק הקשורים המופעלים על ידי D D L REAL ESTATE L.L.C ("החברה").
      </p>

      <h2>1. למטרות מידע בלבד</h2>
      <p>כל המידע המוצג באתר מסופק למטרות מידע ושיווק כלליות בלבד.</p>
      <p>דבר באתר אינו מהווה:</p>
      <ul>
        <li>הצעה מחייבת</li>
        <li>מצג או אחריות</li>
        <li>התחייבות מכל סוג</li>
      </ul>
      <p>כל העסקאות, אם יהיו, מתבצעות מחוץ לאתר וכפופות להסכמים נפרדים.</p>

      <h2>2. אין ייעוץ השקעות, פיננסי או משפטי</h2>
      <p>האתר אינו מספק:</p>
      <ul>
        <li>ייעוץ השקעות</li>
        <li>ייעוץ פיננסי</li>
        <li>ייעוץ מס</li>
        <li>ייעוץ משפטי</li>
      </ul>
      <p>
        כל מידע הנוגע לתשואות פוטנציאליות, הכנסה משכירות, עליית ערך הון או ביצועי השקעה הוא להמחשה בלבד ואין להסתמך עליו.
      </p>
      <p className="font-medium">
        מומלץ מאוד למשתמשים לפנות לייעוץ מקצועי עצמאי לפני קבלת כל החלטת נדל"ן או השקעה.
      </p>

      <h2>3. מידע על נכסים, מחירים וזמינות</h2>
      <ul>
        <li>פרטי הנכס, מפרטים, פריסות, גדלים, מחירים, תוכניות תשלום וזמינות הם אינדיקטיביים בלבד</li>
        <li>מידע עשוי להיות מסופק על ידי יזמים או צדדים שלישיים וכפוף לשינוי ללא הודעה מוקדמת</li>
        <li>מחירים עשויים שלא לכלול מיסים, אגרות רישום, דמי שירות, עמלות, אגרות משפטיות ועלויות נלוות אחרות</li>
      </ul>
      <p>החברה אינה מתחייבת לדיוק, שלמות או עדכניות של מידע כזה.</p>

      <h2>4. חומרים ויזואליים והדמיות</h2>
      <p>תמונות, סרטונים, תוכניות קומה, הדמיות, סימולציות וחומרי שיווק המוצגים באתר:</p>
      <ul>
        <li>מסופקים למטרות המחשה בלבד</li>
        <li>עשויים לכלול תמונות ממוחשבות או חומרים שסופקו על ידי יזמים</li>
        <li>עשויים להיות שונים מהנכס הבנוי הסופי</li>
      </ul>
      <p>אין להסתמך על חומרים ויזואליים כייצוג מדויק של המוצר הסופי.</p>

      <h2>5. אין ערבות לתוצאות</h2>
      <p>ביצועי עבר, תחזיות או דוגמאות אינם מבטיחים תוצאות עתידיות.</p>
      <p>החברה אינה מעניקה ערבויות בנוגע ל:</p>
      <ul>
        <li>תשואות השקעה</li>
        <li>הכנסה משכירות</li>
        <li>שיעורי תפוסה</li>
        <li>עליית ערך נכסים</li>
      </ul>
      <p className="font-medium">כל השקעות הנדל"ן כרוכות בסיכון.</p>

      <h2>6. מידע מצדדים שלישיים</h2>
      <p>
        החברה עשויה להציג או להתייחס למידע שסופק על ידי צדדים שלישיים, כולל יזמים, קבלנים, בנקים או ספקי שירות.
      </p>
      <p>החברה אינה אחראית לאי-דיוקים, שינויים, עיכובים או השמטות במידע מצדדים שלישיים.</p>

      <h2>7. הגבלת אחריות</h2>
      <p>במידה המרבית המותרת על פי החוק החל, החברה לא תהיה אחראית לכל אובדן או נזק, בין אם ישיר או עקיף, הנובע מ:</p>
      <ul>
        <li>שימוש באתר</li>
        <li>הסתמכות על כל מידע שסופק</li>
        <li>חוסר יכולת לגשת או להשתמש באתר</li>
      </ul>
      <p className="font-medium">השימוש באתר ובתוכנו הוא על אחריות המשתמש בלבד.</p>

      <h2>8. דין חל</h2>
      <p>
        כתב ויתור זה יהיה כפוף ויפורש בהתאם לחוקי איחוד האמירויות הערביות, עם סמכות שיפוט בלעדית המוענקת לבתי המשפט בדובאי.
      </p>

      <h2>9. קבלה</h2>
      <p className="font-medium">
        בשימוש באתר, אתה מאשר שקראת, הבנת והסכמת לכתב ויתור זה.
      </p>
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <p>
        This disclaimer applies to all content, information, materials, and communications published on ddl-uae.com (the "Website") and through any related marketing channels operated by D D L REAL ESTATE L.L.C (the "Company").
      </p>

      <h2>1. Informational Purpose Only</h2>
      <p>All information presented on the Website is provided for general informational and marketing purposes only.</p>
      <p>Nothing on the Website constitutes:</p>
      <ul>
        <li>A binding offer</li>
        <li>A representation or warranty</li>
        <li>A commitment of any kind</li>
      </ul>
      <p>All transactions, if any, are conducted outside the Website and subject to separate agreements.</p>

      <h2>2. No Investment, Financial, or Legal Advice</h2>
      <p>The Website does not provide:</p>
      <ul>
        <li>Investment advice</li>
        <li>Financial advice</li>
        <li>Tax advice</li>
        <li>Legal advice</li>
      </ul>
      <p>
        Any information regarding potential returns, rental income, capital appreciation, or investment performance is illustrative only and should not be relied upon.
      </p>
      <p className="font-medium">
        Users are strongly advised to seek independent professional advice before making any real estate or investment decision.
      </p>

      <h2>3. Property Information, Prices, and Availability</h2>
      <ul>
        <li>Property details, specifications, layouts, sizes, prices, payment plans, and availability are indicative only</li>
        <li>Information may be provided by developers or third parties and is subject to change without notice</li>
        <li>Prices may exclude taxes, registration fees, service charges, commissions, legal fees, and other associated costs</li>
      </ul>
      <p>The Company does not guarantee the accuracy, completeness, or timeliness of such information.</p>

      <h2>4. Visual Materials and Renderings</h2>
      <p>Images, videos, floor plans, renderings, simulations, and marketing materials displayed on the Website:</p>
      <ul>
        <li>Are provided for illustrative purposes only</li>
        <li>May include computer-generated images or developer-supplied materials</li>
        <li>May differ from the final built property</li>
      </ul>
      <p>No reliance should be placed on visual materials as an exact representation of the final product.</p>

      <h2>5. No Guarantee of Results</h2>
      <p>Past performance, projections, or examples do not guarantee future results.</p>
      <p>The Company makes no guarantees regarding:</p>
      <ul>
        <li>Investment returns</li>
        <li>Rental income</li>
        <li>Occupancy rates</li>
        <li>Property appreciation</li>
      </ul>
      <p className="font-medium">All real estate investments involve risk.</p>

      <h2>6. Third-Party Information</h2>
      <p>
        The Company may display or reference information provided by third parties, including developers, contractors, banks, or service providers.
      </p>
      <p>The Company is not responsible for inaccuracies, changes, delays, or omissions in third-party information.</p>

      <h2>7. Limitation of Liability</h2>
      <p>To the maximum extent permitted by applicable law, the Company shall not be liable for any loss or damage, whether direct or indirect, arising from:</p>
      <ul>
        <li>Use of the Website</li>
        <li>Reliance on any information provided</li>
        <li>Inability to access or use the Website</li>
      </ul>
      <p className="font-medium">Use of the Website and its content is at the user's sole risk.</p>

      <h2>8. Governing Law</h2>
      <p>
        This disclaimer shall be governed by and construed in accordance with the laws of the United Arab Emirates, with exclusive jurisdiction vested in the courts of Dubai.
      </p>

      <h2>9. Acceptance</h2>
      <p className="font-medium">
        By using the Website, you acknowledge that you have read, understood, and agreed to this disclaimer.
      </p>
    </>
  );
}
