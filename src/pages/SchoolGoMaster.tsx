import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Users, DollarSign, Database, TrendingUp, Activity, 
  Plus, Settings, LogOut, ArrowUpRight, ShieldCheck,
  Server, Smartphone, Search, Trash2, UserPlus, Zap, Loader2
} from "lucide-react";
import schoolgoLogo from "@/assets/schoolgo-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, Cell,
  PieChart, Pie 
} from "recharts";

const SchoolGoMaster = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Real Data States
  const [stats, setStats] = useState([
    { label: "Clientes Totais", value: "0", icon: Users, color: "text-school-blue", trend: "Atualizando..." },
    { label: "Faturamento Bruto", value: "R$ 0", icon: DollarSign, color: "text-emerald-400", trend: "0%" },
    { label: "Custo Infra", value: "R$ 0", icon: Database, color: "text-red-400", trend: "Normal" },
    { label: "Margem Líquida", value: "0%", icon: TrendingUp, color: "text-school-yellow", trend: "0%" },
  ]);

  const [clients, setClients] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  
  // Create Client Form State
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPassword, setNewClientPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch ONLY SchoolGo Clients (Frotistas)
      // We use 'SCHOOLGO_CLIENT' as a discriminator tag in the client_id field
      const { data: clientsData, error: clientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('client_id', 'SCHOOLGO_CLIENT');
      
      if (clientsData) {
        setClients(clientsData);
        
        // Update stats
        setStats(prev => {
          const newStats = [...prev];
          newStats[0].value = clientsData.length.toString();
          newStats[1].value = `R$ ${(clientsData.length * 249).toLocaleString('pt-BR')}`;
          return newStats;
        });
      }

      // 2. Fetch Plans
      const { data: plansData } = await supabase.from('subscription_plans').select('*');
      if (plansData) setPlans(plansData);

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientEmail || !newClientPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsCreating(true);
    try {
      // 1. Create User via Edge Function (to avoid email confirmation)
      const { data, error } = await supabase.functions.invoke("manage-user-auth", {
        body: { 
          action: "create", 
          email: newClientEmail.trim().toLowerCase(), 
          password: newClientPassword,
          autoConfirm: true 
        }
      });

      if (error || data?.error) throw new Error(error?.message || data?.error);

      // 2. Tag this profile as a SchoolGo Client
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          client_id: 'SCHOOLGO_CLIENT',
          display_name: newClientEmail.split('@')[0] // Default name
        })
        .eq('user_id', data.user.id);

      if (updateError) throw updateError;

      toast.success("Acesso Frotista criado com sucesso e isolado na base SchoolGo!");
      setNewClientEmail("");
      setNewClientPassword("");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao criar: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-school-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white font-sans selection:bg-school-blue/30">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-white/5 bg-[#020408]/80 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/schoolgo")}>
            <img src={schoolgoLogo} alt="SchoolGo" className="w-20 h-auto" />
            <div className="text-xl font-black flex items-center">
              <span className="text-school-yellow">S</span>
              <span className="text-school-blue">choolGo</span>
              <span className="ml-2 text-[10px] bg-school-blue/20 text-school-blue px-2 py-0.5 rounded-full border border-school-blue/30">MASTER</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Activity },
              { id: 'clients', label: 'Clientes', icon: Users },
              { id: 'licensing', label: 'Planos & Preços', icon: DollarSign },
              { id: 'infra', label: 'Infraestrutura', icon: Database },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-school-blue text-white shadow-xl' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Sistema Online</p>
            <p className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operação Normal
            </p>
          </div>
          <button onClick={() => navigate("/")} className="bg-white/5 hover:bg-red-500/10 hover:text-red-400 p-3 rounded-2xl border border-white/10 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="p-8 space-y-10 max-w-[1600px] mx-auto">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {/* KPI Banner */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] relative group hover:border-school-blue/50 transition-all">
                  <stat.icon className={`w-8 h-8 ${stat.color} mb-6`} />
                  <p className="text-4xl font-black mb-1 font-mono tracking-tighter">{stat.value}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <span className="text-[10px] font-bold text-emerald-400">{stat.trend}</span>
                  </div>
                </div>
              ))}
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Revenue Area */}
              <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 p-10 rounded-[3rem]">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-emerald-400" />
                      Análise Financeira Global
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">Comparativo entre faturamento bruto e custos de infraestrutura.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase">Receita</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-[10px] font-black text-red-500 uppercase">Custos</span>
                    </div>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Jan', rev: 4000, cost: 2400 },
                      { name: 'Fev', rev: 3000, cost: 1398 },
                      { name: 'Mar', rev: 2000, cost: 9800 },
                      { name: 'Abr', rev: 2780, cost: 3908 },
                      { name: 'Mai', rev: 1890, cost: 4800 },
                      { name: 'Jun', rev: 2390, cost: 3800 },
                      { name: 'Jul', rev: 3490, cost: 4300 },
                    ]}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                      <XAxis dataKey="name" stroke="#444" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis stroke="#444" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                      <Tooltip contentStyle={{backgroundColor: '#0a0f18', border: '1px solid #ffffff10', borderRadius: '20px'}} />
                      <Area type="monotone" dataKey="rev" stroke="#10b981" strokeWidth={4} fill="url(#colorRev)" />
                      <Area type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sidebar Metrics */}
              <div className="space-y-8">
                 <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8">Distribuição de Planos</h3>
                    <div className="h-48 relative">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie
                                data={[
                                  { name: 'Individual', value: clients.length, color: '#FACC15' },
                                ]}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                             >
                                <Cell fill="#4B6BFB" />
                             </Pie>
                             <Tooltip />
                          </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <p className="text-2xl font-black">{clients.length}</p>
                          <p className="text-[8px] font-black uppercase text-muted-foreground">Frotistas</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-school-blue p-10 rounded-[3rem] relative overflow-hidden group">
                    <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:scale-125 transition-transform duration-1000" />
                    <h3 className="text-xl font-black mb-4">Versionamento</h3>
                    <div className="space-y-4 relative z-10">
                       <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                          <span className="text-xs font-bold">Stable Release</span>
                          <span className="text-xs font-mono font-black">v2.1.0</span>
                       </div>
                       <Button className="w-full bg-white text-school-blue font-black rounded-xl py-6 hover:bg-school-yellow">Lançar Nova Versão</Button>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'licensing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Plan Registration Form */}
              <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] shadow-2xl">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-school-yellow/20 flex items-center justify-center">
                       <Plus className="w-6 h-6 text-school-yellow" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Cadastrar Novo Plano</h3>
                       <p className="text-xs text-muted-foreground font-bold">Defina as regras e valores para novos clientes</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nome do Plano</label>
                          <Input placeholder="Ex: Premium Plus" className="bg-white/5 border-white/10 h-14 rounded-2xl" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Valor Mensal (R$)</label>
                          <Input placeholder="0,00" type="number" className="bg-white/5 border-white/10 h-14 rounded-2xl" />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Limite de Veículos</label>
                          <Input placeholder="10" type="number" className="bg-white/5 border-white/10 h-14 rounded-2xl" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Limite de Alunos</label>
                          <Input placeholder="Ilimitado" className="bg-white/5 border-white/10 h-14 rounded-2xl" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Recursos (Separados por vírgula)</label>
                       <textarea 
                          placeholder="App Customizado, Suporte 24h, Relatórios..." 
                          className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] outline-none focus:border-school-yellow transition-all min-h-[120px]"
                       />
                    </div>

                    <Button className="w-full bg-school-yellow text-black font-black py-8 rounded-[2rem] text-lg hover:scale-[1.02] transition-all">
                       Salvar Plano no Sistema
                    </Button>
                 </div>
              </div>

              {/* User Creation Form (No Email Confirmation) */}
              <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-school-blue/10 blur-3xl rounded-full -mr-16 -mt-16" />
                 
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-school-blue/20 flex items-center justify-center">
                       <UserPlus className="w-6 h-6 text-school-blue" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Criar Acesso (Frotista)</h3>
                       <p className="text-xs text-muted-foreground font-bold">Acesso imediato sem confirmação de e-mail</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">E-mail do Cliente</label>
                       <Input 
                        placeholder="cliente@email.com" 
                        className="bg-white/5 border-white/10 h-14 rounded-2xl" 
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Senha de Acesso</label>
                       <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-white/5 border-white/10 h-14 rounded-2xl" 
                        value={newClientPassword}
                        onChange={(e) => setNewClientPassword(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Vincular Plano</label>
                       <select className="w-full bg-white/5 border border-white/10 h-14 px-4 rounded-2xl outline-none focus:border-school-blue appearance-none">
                          <option>Individual</option>
                          <option>Frotista</option>
                          <option>Escolar</option>
                       </select>
                    </div>

                    <div className="p-4 bg-school-blue/10 border border-school-blue/20 rounded-2xl">
                       <p className="text-[10px] text-school-blue font-black uppercase flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3" /> Auto-Confirmação Ativada
                       </p>
                       <p className="text-[11px] text-muted-foreground mt-1">O usuário poderá logar no app imediatamente após a criação.</p>
                    </div>

                    <Button 
                      onClick={handleCreateClient}
                      disabled={isCreating}
                      className="w-full bg-school-blue text-white font-black py-8 rounded-[2rem] text-lg hover:scale-[1.02] transition-all shadow-xl shadow-school-blue/20"
                    >
                       {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Gerar Acesso Imediato"}
                    </Button>
                 </div>
              </div>
            </div>

            {/* Active Licenses Table */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
               <div className="p-10 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Histórico de Licenciamento</h3>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-muted-foreground uppercase">Filtrar:</span>
                     <Button variant="ghost" className="text-[10px] font-black uppercase px-4 h-8 rounded-full border border-white/10">Ativos</Button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-[3px] text-muted-foreground border-b border-white/5">
                        <th className="px-10 py-6">Empresa</th>
                        <th className="px-10 py-6">Plano</th>
                        <th className="px-10 py-6">Início</th>
                        <th className="px-10 py-6">Valor</th>
                        <th className="px-10 py-6 text-right">Controle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((c) => (
                        <tr key={c.id || Math.random()} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                          <td className="px-10 py-8 font-bold">{c.display_name || "Cliente sem Nome"}</td>
                          <td className="px-10 py-8">
                             <span className="text-[10px] font-black bg-school-blue/20 text-school-blue px-3 py-1 rounded-full uppercase">{c.subscription_status || 'Trial'}</span>
                          </td>
                          <td className="px-10 py-8 text-sm text-muted-foreground">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '---'}
                          </td>
                          <td className="px-10 py-8 font-black text-emerald-400">R$ 249,00</td>
                          <td className="px-10 py-8 text-right">
                             <Button variant="ghost" size="icon" className="hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </section>
          </motion.div>
        )}
        {activeTab === 'clients' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
             <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tighter">Frotistas & Escolas</h3>
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input placeholder="Buscar cliente..." className="bg-white/5 border-white/10 pl-10 rounded-xl w-64" />
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-white/5">
                         <th className="p-8">Empresa / Cliente</th>
                         <th className="p-8">Plano</th>
                         <th className="p-8">Status</th>
                         <th className="p-8 text-right">Ações</th>
                      </tr>
                   </thead>
                   <tbody>
                      {clients.map((client) => (
                        <tr key={client.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                           <td className="p-8 font-bold text-sm">
                              {client.display_name}
                              <p className="text-xs font-normal text-muted-foreground">{client.user_id}</p>
                           </td>
                           <td className="p-8 text-xs font-bold">Frotista Base</td>
                           <td className="p-8">
                              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/30">Ativo</span>
                           </td>
                           <td className="p-8 text-right">
                              <Button variant="ghost" size="sm" className="hover:bg-white/5 rounded-xl"><Settings className="w-4 h-4" /></Button>
                           </td>
                        </tr>
                      ))}
                      {clients.length === 0 && (
                        <tr>
                           <td colSpan={4} className="p-20 text-center text-muted-foreground">Nenhum cliente cadastrado ainda.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
           </motion.div>
        )}
      </main>
    </div>
  );
};

export default SchoolGoMaster;
