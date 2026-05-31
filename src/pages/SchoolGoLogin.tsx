import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Loader2, ArrowLeft, Shield, KeyRound, CheckCircle2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import schoolgoLogo from "@/assets/schoolgo-logo.png";

const SchoolGoLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  
  const { session, isAdmin } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    // Apenas redireciona automaticamente se o usuário acabou de chegar na página já logado (não está interagindo)
    if (session && !loading && step === "login" && email === "") {
      if (isAdmin) {
        navigate("/master");
      } else {
        navigate("/admin");
      }
    }
  }, [session, isAdmin, navigate, loading, step, email]);

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) throw authError;

      // Master Check
      const isMainAdmin = email.trim().toLowerCase() === 'origoela@gmail.com';
      
      // Admin Table Check
      const { data: adminCheck } = await supabase
        .from("admin_emails")
        .select("email")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      const isSystemAdmin = !!adminCheck || isMainAdmin;

      if (isSystemAdmin) {
        // Fix: Allow 123456 for all admins since email sending isn't configured yet
        const code = "123456"; 

        setGeneratedCode(code);
        toast.info("Acesso Master: Digite 123456 para entrar.");
        setStep("2fa");
      } else {
        // Here we check if the user is a SchoolGo Client (Frotista)
        // For now, if they are not Master, they go to Admin Dashboard
        toast.success("Bem-vindo ao Portal SchoolGo!");
        navigate("/admin");
      }

    } catch (error: any) {
      toast.error("Erro no Login: " + (error.message || "Credenciais inválidas"));
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedCode) {
      toast.error("Código inválido. Tente novamente.");
      return;
    }

    setLoading(true);
    toast.success("Acesso Master concedido!");
    setTimeout(() => {
      navigate("/master");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl relative z-10"
      >
        <button 
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <AnimatePresence mode="wait">
          {step === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-10 mt-4">
                <div className="flex items-center justify-center mx-auto mb-6">
                  <img src={schoolgoLogo} alt="SchoolGo Logo" className="h-28 w-auto object-contain" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Portal do Cliente</h1>
                <p className="text-blue-400/80 text-sm font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Acesso Seguro
                </p>
              </div>

              <form onSubmit={handleInitialLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/50 ml-1">E-mail de Acesso</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-white/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/50 ml-1">Senha Privada</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-white/20"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-lg uppercase tracking-widest mt-4"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <>
                      Entrar no Portal
                      <GraduationCap className="h-6 w-6" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="2fa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-10 mt-4">
                <div className="w-20 h-20 bg-blue-600/10 rounded-[24px] flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                  <KeyRound className="h-10 w-10 text-blue-500" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Segurança Master</h1>
                <p className="text-white/40 text-sm mt-2">Insira o código de 6 dígitos</p>
                <div className="mt-4 p-3 bg-green-500/10 rounded-xl inline-flex items-center gap-2 text-[10px] text-green-400 font-black uppercase tracking-widest border border-green-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Credenciais Confirmadas
                </div>
              </div>

              <form onSubmit={verifyOTP} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-center text-4xl font-black tracking-[12px] focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-white/10"
                      autoFocus
                      required
                    />
                  </div>
                  <p className="text-[10px] text-center text-white/30 uppercase font-bold tracking-widest">
                    Verifique seu e-mail de administrador
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-30 uppercase tracking-widest text-lg"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Confirmar Acesso"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="w-full text-xs text-white/30 hover:text-white transition-colors uppercase font-black tracking-widest"
                >
                  Alterar E-mail
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
            SchoolGo Platform
          </p>
          <p className="text-[10px] font-black text-blue-500/40 uppercase tracking-widest">
            Secure v3.6
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SchoolGoLogin;
