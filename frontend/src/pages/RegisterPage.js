import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Presentation, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, formatApiError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(email, password, name);
      navigate("/");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="register-page">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Presentation className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground">SlideForge</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Create account
            </h1>
            <p className="text-base text-muted-foreground font-body">
              Start generating beautiful presentations with AI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" data-testid="register-error">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                data-testid="register-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                data-testid="register-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="h-11 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                data-testid="register-password-input"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-primary hover:bg-[#003DCC] text-white font-medium transition-colors duration-200"
              data-testid="register-submit-button"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? "Creating account..." : "Create Account"}
              {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline" data-testid="go-to-login">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-slate-50 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1771846340715-e5f379d91ad9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHdoaXRlJTIwYmx1ZSUyMG1pbmltYWwlMjB0ZWNofGVufDB8fHx8MTc3NDcwNjg5OXww&ixlib=rb-4.1.0&q=85"
          alt="Abstract blue pattern"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 text-center p-12 max-w-lg">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-800 mb-4">
            Three AI Models, One Perfect Deck
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            DeepSeek orchestrates structure. GPT-OSS crafts content. Qwen optimizes layout. You just type.
          </p>
        </div>
      </div>
    </div>
  );
}
