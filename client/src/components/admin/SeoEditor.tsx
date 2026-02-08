import { useState, useEffect } from "react";
import {
  Sparkles,
  AlertTriangle,
  Check,
  RefreshCw,
  Globe,
  Search,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  generateSeoMetadata,
  analyzeSeoQuality,
} from "@/lib/autoSeo";

interface SeoData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

interface SeoEditorProps {
  value: SeoData;
  onChange: (value: SeoData) => void;
  contentTitle?: string;
  contentText?: string;
  contentType?: "page" | "project" | "mini-site" | "article";
  showPreview?: boolean;
  url?: string;
}

export function SeoEditor({
  value,
  onChange,
  contentTitle = "",
  contentText = "",
  contentType = "page",
  showPreview = true,
  url = "example.com/page",
}: SeoEditorProps) {
  const [generating, setGenerating] = useState(false);
  const [quality, setQuality] = useState<{
    score: number;
    suggestions: string[];
  }>({ score: 0, suggestions: [] });

  // Analyze SEO quality when value changes
  useEffect(() => {
    const analysis = analyzeSeoQuality({
      title: value.title,
      description: value.description,
      keywords: value.keywords || [],
    });
    setQuality(analysis);
  }, [value]);

  const handleAutoGenerate = async () => {
    setGenerating(true);

    // Small delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const metadata = generateSeoMetadata({
        text: contentText,
        title: contentTitle,
        type: contentType,
        locale: "he",
      });

      onChange({
        ...value,
        title: metadata.title,
        description: metadata.description,
        keywords: metadata.keywords,
      });
    } catch (error) {
      console.error("Failed to generate SEO:", error);
    } finally {
      setGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { color: "bg-green-500/20 text-green-400 border-green-500/30", text: "מעולה" };
    if (score >= 60) return { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", text: "בסדר" };
    return { color: "bg-red-500/20 text-red-400 border-red-500/30", text: "לשפר" };
  };

  const scoreBadge = getScoreBadge(quality.score);

  return (
    <div className="space-y-6">
      {/* Header with Score and Auto Generate */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="font-medium text-white flex items-center gap-2">
            <Search className="h-4 w-4" />
            הגדרות SEO
          </h4>
          <Badge className={`${scoreBadge.color} border`}>
            {quality.score}/100 - {scoreBadge.text}
          </Badge>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAutoGenerate}
          disabled={generating || (!contentTitle && !contentText)}
          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 ml-2" />
          )}
          יצירה אוטומטית
        </Button>
      </div>

      {/* Suggestions */}
      {quality.suggestions.length > 0 && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">המלצות לשיפור</span>
          </div>
          <ul className="space-y-1">
            {quality.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-yellow-300/80 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-yellow-400" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SEO Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>כותרת SEO</Label>
          <span className={`text-xs ${value.title.length > 60 ? "text-red-400" : "text-gray-500"}`}>
            {value.title.length}/60
          </span>
        </div>
        <Input
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          className="bg-white/5 border-white/10"
          placeholder="כותרת לתוצאות חיפוש"
          maxLength={70}
        />
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              value.title.length > 60
                ? "bg-red-500"
                : value.title.length > 50
                ? "bg-yellow-500"
                : value.title.length > 30
                ? "bg-green-500"
                : "bg-gray-500"
            }`}
            style={{ width: `${Math.min(100, (value.title.length / 60) * 100)}%` }}
          />
        </div>
      </div>

      {/* Meta Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>תיאור SEO</Label>
          <span className={`text-xs ${value.description.length > 160 ? "text-red-400" : "text-gray-500"}`}>
            {value.description.length}/160
          </span>
        </div>
        <Textarea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          className="bg-white/5 border-white/10 resize-none"
          placeholder="תיאור קצר לתוצאות חיפוש"
          rows={3}
          maxLength={180}
        />
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              value.description.length > 160
                ? "bg-red-500"
                : value.description.length > 120
                ? "bg-green-500"
                : value.description.length > 70
                ? "bg-yellow-500"
                : "bg-gray-500"
            }`}
            style={{ width: `${Math.min(100, (value.description.length / 160) * 100)}%` }}
          />
        </div>
      </div>

      {/* Keywords */}
      {value.keywords && value.keywords.length > 0 && (
        <div className="space-y-2">
          <Label>מילות מפתח (נוצרו אוטומטית)</Label>
          <div className="flex flex-wrap gap-2">
            {value.keywords.map((keyword, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-white/5 border-white/10 text-gray-300"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Google Preview */}
      {showPreview && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            תצוגה מקדימה בגוגל
          </Label>
          <div className="p-4 rounded-lg bg-white border border-gray-200">
            <div className="space-y-1">
              {/* Title */}
              <p className="text-lg text-blue-600 hover:underline cursor-pointer truncate">
                {value.title || contentTitle || "כותרת העמוד"}
              </p>
              {/* URL */}
              <p className="text-sm text-green-700">
                {url}
              </p>
              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {value.description || "תיאור העמוד יופיע כאן..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quality Score Visual */}
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">ציון SEO כללי</span>
          <span className={`text-2xl font-bold ${getScoreColor(quality.score)}`}>
            {quality.score}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              quality.score >= 80
                ? "bg-gradient-to-r from-green-500 to-green-400"
                : quality.score >= 60
                ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                : "bg-gradient-to-r from-red-500 to-red-400"
            }`}
            style={{ width: `${quality.score}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>לשפר</span>
          <span>בסדר</span>
          <span>מעולה</span>
        </div>
      </div>
    </div>
  );
}

export default SeoEditor;
