import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const [sessionReady, setSessionReady] = useState(false);

  // Establish session from URL hash tokens (recovery link)
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const hashError = params.get('error');
    const hashErrorDesc = params.get('error_description');

    if (hashError) {
      toast({ title: "Link Inválido", description: hashErrorDesc?.replace(/\+/g, ' ') || "O link fornecido expirou ou é inválido.", variant: "destructive" });
      setTimeout(() => window.history.replaceState({}, document.title, window.location.pathname), 100);
      return;
    }

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) {
            console.error('[ResetPassword] Session error:', error.message);
            toast({ title: "Erro ao validar link", description: error.message, variant: "destructive" });
          } else {
            setSessionReady(true);
            setTimeout(() => window.history.replaceState({}, document.title, window.location.pathname), 100);
          }
        });
    } else {
      setTimeout(() => window.history.replaceState({}, document.title, window.location.pathname), 100);
      // No tokens in URL — check if session already exists
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setSessionReady(true);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (!password) { setError("Digite a nova senha"); return; }
    if (password.length < 6) { setError("Mínimo 6 caracteres"); return; }
    if (password !== confirmPassword) { setError("As senhas não coincidem"); return; }
    setError("");
    setLoading(true);
    if (!sessionReady) {
      toast({ title: "Sessão não encontrada", description: "Use o link enviado por e-mail.", variant: "destructive" });
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: "Erro ao redefinir senha", description: error.message, variant: "destructive" });
      } else {
        setSuccess(true);
        toast({ title: "Senha redefinida com sucesso!" });
        setTimeout(() => navigate("/admin"), 2000);
      }
    } catch (err) {
      console.error("Reset error:", err);
      toast({ title: "Erro inesperado", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell bg-background p-6 px-[40px] py-[40px] flex-col flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-6">

        <div className="text-center space-y-2">
          <KeyRound className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Redefinir Senha</h1>
          <p className="text-sm text-muted-foreground">Digite sua nova senha abaixo.</p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-card border-2 border-primary/30 p-6 text-center space-y-2 shadow-md">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
            <p className="font-bold text-foreground">Senha redefinida!</p>
            <p className="text-sm text-muted-foreground">Redirecionando...</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Nova senha"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleReset()}
                className={`rounded-xl border-2 py-4 text-base pr-12 ${error ? "border-destructive" : "border-muted"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
              className={`rounded-xl border-2 py-4 text-base ${error ? "border-destructive" : "border-muted"}`}
            />
            {error && <p className="text-sm text-destructive mt-1 ml-1">{error}</p>}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleReset}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-primary py-4 text-primary-foreground font-bold text-lg transition-all hover:bg-primary/90 disabled:opacity-50 shadow-md">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Redefinir Senha"}
            </motion.button>

            <button
              onClick={() => navigate("/admin/login")}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              Voltar ao login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
