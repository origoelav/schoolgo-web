import { motion } from "framer-motion";
import { 
  GraduationCap, ShieldCheck, MapPin, Clock, Users, 
  Smartphone, Bell, ChevronRight, CheckCircle2, Star, 
  Send, Loader2, ArrowLeft, Bus, DollarSign
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import schoolgoLogo from "@/assets/schoolgo-logo.png";
import mapMockup from "@/assets/schoolgo-map-mockup.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const }
  })
};

const SectionTitle = ({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) => (
  <div className="text-center mb-16">
    <h2 className="text-3xl md:text-5xl font-black mb-4">{children}</h2>
    {subtitle && <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const PricingCard = ({ title, price, features, highlighted = false }: { title: string, price: string, features: string[], highlighted?: boolean }) => (
  <motion.div 
    className={`p-8 rounded-3xl border transition-all duration-300 ${highlighted ? 'bg-school-navy border-school-yellow shadow-2xl scale-105 z-10' : 'bg-card border-border hover:border-school-blue'}`}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
    <h3 className="text-2xl font-bold mb-2">{title}</h3>
    <div className="flex items-baseline gap-1 mb-6">
      <span className="text-4xl font-black">{price}</span>
      <span className="text-muted-foreground">/mês</span>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-3">
          <CheckCircle2 className={`w-5 h-5 ${highlighted ? 'text-school-yellow' : 'text-school-blue'}`} />
          <span className="text-sm">{f}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-4 rounded-xl font-bold transition-all ${highlighted ? 'bg-school-yellow text-school-navy hover:bg-yellow-400' : 'bg-school-blue text-white hover:bg-blue-600'}`}>
      Começar Agora
    </button>
  </motion.div>
);

const SchoolGo = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={schoolgoLogo} alt="SchoolGo" className="w-24 h-auto" />
            <div className="text-2xl font-black flex items-center">
              <span className="text-school-yellow">S</span>
              <span className="text-school-blue">choolGo</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#funciona" className="text-sm font-bold uppercase tracking-widest hover:text-school-yellow transition-colors">Como Funciona</a>
            <a href="#planos" className="text-sm font-bold uppercase tracking-widest hover:text-school-yellow transition-colors">Planos</a>
            <button 
              onClick={() => navigate("/login")}
              className="bg-school-blue hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
            >
              Área do Cliente
            </button>
          </div>
          <button className="md:hidden" onClick={() => navigate("/")}>
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-school-blue/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-school-yellow/10 rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-school-yellow/10 border border-school-yellow/20 px-4 py-2 rounded-full mb-6">
              <ShieldCheck className="w-4 h-4 text-school-yellow" />
              <span className="text-xs font-bold uppercase tracking-[2px] text-school-yellow">Segurança em Primeiro Lugar</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              A tranquilidade que os <span className="text-school-yellow">pais</span> precisam.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-lg">
              Sistema completo de monitoramento escolar. Acompanhe em tempo real, gerencie alunos e garanta a segurança de cada trajeto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-school-blue hover:bg-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-black transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3">
                Agendar Demonstração
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="bg-white/5 border border-border hover:bg-white/10 px-10 py-5 rounded-2xl text-lg font-bold transition-all backdrop-blur-sm">
                Ver Planos
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-school-blue to-school-yellow opacity-20 blur-2xl rounded-full animate-pulse" />
            <img 
              src={mapMockup} 
              alt="App Mockup" 
              className="relative rounded-[3rem] shadow-2xl border border-white/10"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funciona" className="py-24 bg-school-navy/30">
        <div className="container mx-auto px-6">
          <SectionTitle subtitle="Tecnologia de ponta para transportadores e escolas">
            Por que escolher o <span className="text-school-yellow">SchoolGo</span>?
          </SectionTitle>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: "Rastreamento Real", desc: "Pais e escolas acompanham o veículo em tempo real pelo mapa com precisão de metros." },
              { icon: Bell, title: "Notificações Inteligentes", desc: "Aviso automático quando o transporte está chegando na residência ou escola." },
              { icon: Users, title: "Gestão de Alunos", desc: "Lista de chamada digital, controle de presença e histórico de embarque/desembarque." },
              { icon: Clock, title: "Otimização de Tempo", desc: "Rotas automáticas que consideram o trânsito e a localização de cada aluno." },
              { icon: ShieldCheck, title: "Segurança Total", desc: "Botão de pânico, histórico de velocidade e documentos do condutor sempre em dia." },
              { icon: Smartphone, title: "App para Todos", desc: "Interfaces dedicadas para motoristas, monitores e responsáveis (Pais)." },
            ].map((f, i) => (
              <motion.div 
                key={i} 
                className="bg-card border border-border p-8 rounded-3xl hover:border-school-yellow/50 transition-colors"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <div className="w-14 h-14 bg-school-blue/10 rounded-2xl flex items-center justify-center mb-6">
                  <f.icon className="w-7 h-7 text-school-blue" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-24">
        <div className="container mx-auto px-6">
          <SectionTitle subtitle="Escolha o plano ideal para o tamanho da sua frota">
            Planos e <span className="text-school-blue">Valores</span>
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard 
              title="Individual"
              price="R$ 89"
              features={[
                "Até 1 Veículo",
                "Até 20 Alunos",
                "Rastreamento em Tempo Real",
                "Suporte via WhatsApp",
                "Histórico de 7 dias"
              ]}
            />
            <PricingCard 
              title="Frotista"
              price="R$ 249"
              highlighted={true}
              features={[
                "Até 5 Veículos",
                "Alunos Ilimitados",
                "App Personalizado (Branding)",
                "Relatórios de Performance",
                "Suporte Prioritário 24/7",
                "Histórico Ilimitado"
              ]}
            />
            <PricingCard 
              title="Escolar"
              price="R$ 599"
              features={[
                "Veículos Ilimitados",
                "Painel Administrativo Escola",
                "Integração com Sistemas Escolares",
                "Monitoramento de Pátio",
                "Treinamento de Condutores",
                "Gestão de Documentação"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-dark">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-school-blue/10 border border-school-blue/20 rounded-[3rem] p-12 text-center overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-school-yellow/20 rounded-full blur-3xl" />
            <SectionTitle subtitle="Nossa equipe entrará em contato em até 24h">
              Ficou com alguma <span className="text-school-yellow">dúvida</span>?
            </SectionTitle>
            <div className="max-w-md mx-auto">
              <form className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Seu melhor e-mail" 
                  className="w-full bg-background border border-border px-6 py-4 rounded-2xl focus:ring-2 focus:ring-school-blue outline-none"
                />
                <textarea 
                  placeholder="Como podemos ajudar?" 
                  className="w-full bg-background border border-border px-6 py-4 rounded-2xl focus:ring-2 focus:ring-school-blue outline-none h-32 resize-none"
                />
                <button className="w-full bg-school-blue hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3">
                  Enviar Mensagem
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src={schoolgoLogo} alt="SchoolGo" className="w-24 h-auto" />
          </div>
          <p className="text-muted-foreground text-sm mb-8">© 2026 SchoolGo. Uma solução para um futuro mais seguro.</p>
          <div className="flex items-center justify-center gap-6">
            <a href="/delivery" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Acessar OrigGO</a>
            <div className="w-1 h-1 rounded-full bg-border" />
            <a href="/master" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-school-yellow transition-colors">Acesso Master</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SchoolGo;
