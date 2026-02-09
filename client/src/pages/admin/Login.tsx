import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ddlLogo from "@assets/ddl_logo_1768141898381.png";

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export function AdminLogin({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await onLogin(username, password);
      if (!success) {
        toast({
          title: "שגיאה בהתחברות",
          description: "שם משתמש או סיסמה שגויים",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהתחברות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="admin-panel-light min-h-screen flex items-center justify-center p-4" 
      style={{ backgroundColor: '#f1f5f9' }}
      data-admin-theme="light"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-white border border-slate-200 shadow-lg">
          <div className="text-center mb-8">
            <img
              src={ddlLogo}
              alt="PropLine Real Estate - לוגו מערכת ניהול"
              className="h-16 w-auto mx-auto mb-4"
              style={{
                filter: "drop-shadow(0 0 20px rgba(37, 99, 235, 0.3))",
              }}
            />
            <h1 className="text-2xl font-bold text-slate-900">מערכת ניהול</h1>
            <p className="text-slate-500 mt-2">התחבר כדי להמשיך</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700">שם משתמש</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="הזן שם משתמש"
                  className="pr-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  disabled={isLoading}
                  data-testid="input-username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">סיסמה</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הזן סיסמה"
                  className="pr-10 pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  disabled={isLoading}
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  מתחבר...
                </motion.span>
              ) : (
                <>
                  <LogIn className="h-4 w-4 ml-2" />
                  התחבר
                </>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-4">
          PropLine Admin Panel v1.0
        </p>
      </motion.div>
    </div>
  );
}
