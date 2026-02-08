import { useState, useRef, useCallback, useMemo } from "react";
import DOMPurify from "dompurify";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Undo,
  Redo,
  Palette,
  Type,
  Minus,
  Plus,
  X,
  Check,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WYSIWYGEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

const colors = [
  "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6", "#FFFFFF",
  "#DC2626", "#EA580C", "#D97706", "#CA8A04", "#65A30D", "#16A34A", "#059669",
  "#0D9488", "#0891B2", "#0284C7", "#2563EB", "#4F46E5", "#7C3AED", "#9333EA",
  "#C026D3", "#DB2777", "#E11D48",
];

const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"];

// Escape HTML special characters to prevent XSS attacks
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function WYSIWYGEditor({
  value,
  onChange,
  placeholder = "התחל לכתוב כאן...",
  minHeight = "200px",
  maxHeight = "500px",
  onImageUpload,
}: WYSIWYGEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [fontSize, setFontSize] = useState("16px");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  }, []);

  const updateContent = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Tab key for indentation
    if (e.key === "Tab") {
      e.preventDefault();
      execCommand(e.shiftKey ? "outdent" : "indent");
    }

    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          execCommand("underline");
          break;
        case "z":
          e.preventDefault();
          execCommand(e.shiftKey ? "redo" : "undo");
          break;
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    updateContent();
  };

  const insertLink = () => {
    if (linkUrl) {
      const escapedUrl = escapeHtml(linkUrl);
      const escapedText = linkText ? escapeHtml(linkText) : escapedUrl;
      const html = `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${escapedText}</a>`;
      document.execCommand("insertHTML", false, html);
      updateContent();
    }
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let imageUrl: string;
      if (onImageUpload) {
        imageUrl = await onImageUpload(file);
      } else {
        // Fallback to local blob URL
        imageUrl = URL.createObjectURL(file);
      }
      document.execCommand("insertImage", false, imageUrl);
      updateContent();
    } catch (error) {
      console.error("Failed to upload image:", error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const insertHeading = (level: number) => {
    execCommand("formatBlock", `h${level}`);
  };

  const setTextColor = (color: string) => {
    setSelectedColor(color);
    execCommand("foreColor", color);
  };

  const setTextSize = (size: string) => {
    setFontSize(size);
    // Use a span with inline style for font size
    document.execCommand("fontSize", false, "7");
    // Find all font elements with size 7 and replace with span
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const fonts = editorRef.current?.querySelectorAll('font[size="7"]');
      fonts?.forEach((font) => {
        const span = document.createElement("span");
        span.style.fontSize = size;
        span.innerHTML = font.innerHTML;
        font.parentNode?.replaceChild(span, font);
      });
      updateContent();
    }
  };

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedValue = useMemo(() => {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'b', 'i', 'u', 's', 'strong', 'em', 'strike',
        'a', 'img',
        'blockquote', 'pre', 'code',
        'span', 'div', 'font',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel',
        'src', 'alt', 'width', 'height',
        'style', 'class',
        'size', 'color', 'face',
        'colspan', 'rowspan',
      ],
      ALLOW_DATA_ATTR: false,
    });
  }, [value]);

  const ToolbarButton = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-8 w-8 p-0 ${
        active ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
      }`}
      title={title}
    >
      {children}
    </Button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-white/10 mx-1" />
  );

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-[#12121a]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-[#0a0a0f]">
        {/* Undo/Redo */}
        <ToolbarButton onClick={() => execCommand("undo")} title="בטל (Ctrl+Z)">
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("redo")} title="בצע שוב (Ctrl+Shift+Z)">
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton onClick={() => insertHeading(1)} title="כותרת 1">
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => insertHeading(2)} title="כותרת 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => insertHeading(3)} title="כותרת 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text Style */}
        <ToolbarButton onClick={() => execCommand("bold")} title="מודגש (Ctrl+B)">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("italic")} title="נטוי (Ctrl+I)">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("underline")} title="קו תחתון (Ctrl+U)">
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("strikeThrough")} title="קו חוצה">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Font Size */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-gray-400 hover:text-white hover:bg-white/10"
              title="גודל טקסט"
            >
              <Type className="h-4 w-4 ml-1" />
              <span className="text-xs">{fontSize}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-1 bg-[#1a1a24] border-white/10">
            <div className="space-y-1">
              {fontSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`w-full text-right px-2 py-1 rounded text-sm ${
                    fontSize === size
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
              title="צבע טקסט"
            >
              <Palette className="h-4 w-4" style={{ color: selectedColor }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 bg-[#1a1a24] border-white/10">
            <div className="grid grid-cols-7 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  className={`w-7 h-7 rounded border-2 transition-all ${
                    selectedColor === color
                      ? "border-blue-500 scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton onClick={() => execCommand("justifyRight")} title="יישור לימין">
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("justifyCenter")} title="יישור למרכז">
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("justifyLeft")} title="יישור לשמאל">
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("justifyFull")} title="יישור מלא">
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton onClick={() => execCommand("insertUnorderedList")} title="רשימה">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("insertOrderedList")} title="רשימה ממוספרת">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Quote & Code */}
        <ToolbarButton onClick={() => execCommand("formatBlock", "blockquote")} title="ציטוט">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("formatBlock", "pre")} title="קוד">
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <Popover open={showLinkModal} onOpenChange={setShowLinkModal}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
              title="הוספת קישור"
            >
              <Link className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 bg-[#1a1a24] border-white/10" dir="rtl">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">טקסט</label>
                <Input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="טקסט הקישור (אופציונלי)"
                  className="bg-[#0a0a0f] border-white/10"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">כתובת URL</label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-[#0a0a0f] border-white/10"
                  dir="ltr"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLinkModal(false)}
                >
                  <X className="h-4 w-4 ml-1" />
                  ביטול
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={insertLink}
                  disabled={!linkUrl}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Check className="h-4 w-4 ml-1" />
                  הוסף
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="הוספת תמונה">
          <Image className="h-4 w-4" />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <ToolbarDivider />

        {/* Clear Formatting */}
        <ToolbarButton onClick={() => execCommand("removeFormat")} title="הסר עיצוב">
          <X className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        dir="rtl"
        className="p-4 outline-none text-white prose prose-invert max-w-none overflow-y-auto"
        style={{
          minHeight,
          maxHeight,
        }}
        onInput={updateContent}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: sanitizedValue }}
        data-placeholder={placeholder}
      />

      <style>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #6B7280;
          pointer-events: none;
        }

        .prose blockquote {
          border-right: 4px solid #3B82F6;
          padding-right: 1rem;
          margin-right: 0;
          font-style: italic;
          color: #9CA3AF;
        }

        .prose pre {
          background: #1a1a24;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: monospace;
        }

        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }

        .prose h1 { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; }
        .prose h2 { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.75rem; }
        .prose h3 { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; }

        .prose ul { list-style-type: disc; padding-right: 1.5rem; }
        .prose ol { list-style-type: decimal; padding-right: 1.5rem; }
      `}</style>
    </div>
  );
}

export default WYSIWYGEditor;
