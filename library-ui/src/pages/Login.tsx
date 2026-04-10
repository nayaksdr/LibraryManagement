import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { LibraryBig, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page refresh
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data);
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />

      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 w-full max-w-md border border-slate-100 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-200 mb-4 transform transition-hover hover:rotate-6">
            <LibraryBig size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 font-medium mt-1">Management Portal Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                required
                type="email"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                placeholder="name@library.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
              <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-800">Forgot?</button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                required
                type="password"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Sign In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <footer className="mt-10 text-center">
          <p className="text-sm text-slate-400 font-medium">
            System Authorized Access Only
          </p>
        </footer>
      </div>
    </div>
  );
}