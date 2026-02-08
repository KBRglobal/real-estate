import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Link } from "wouter";

export default function NotFound() {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6" role="alert">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-foreground">
              {isRTL ? "404 - הדף לא נמצא" : "404 - Page Not Found"}
            </h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {isRTL
              ? "הדף שחיפשת לא קיים או הוסר."
              : "The page you were looking for doesn't exist or has been removed."}
          </p>

          <Link
            href="/"
            className="mt-6 inline-block text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {isRTL ? "חזרה לדף הבית" : "Back to Home"}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
