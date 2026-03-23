import { useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";
import { Button } from "../components/button";
import { api } from "../services/api";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API attend "username" mais le form a "email" - on utilise email comme username
      await api.login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003A8F]/5 via-background to-[#00A3E0]/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold mb-2">SmartKnowledge</h1>
          <p className="text-muted-foreground">Preserve and share expert knowledge with AI</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-xl border border-border shadow-xl p-8">
          <h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm mb-2">
                Username
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Remember me</span>
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2026 SmartKnowledge. Enterprise knowledge management.
        </p>
      </div>
    </div>
  );
}