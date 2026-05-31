import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, GraduationCap, MapPin, Bus, Calendar, 
  CreditCard, TrendingUp, Search, UserPlus, 
  Settings, Bell, LogOut, ArrowLeft, MoreVertical,
  CheckCircle2, AlertCircle, Clock, Smartphone, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, LineChart, Line 
} from "recharts";
import schoolgoLogo from "@/assets/schoolgo-logo.png";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SchoolMap from "@/components/SchoolMap";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const SchoolGoAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data States
  const [students, setStudents] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [fleetStats, setFleetStats] = useState({
    active: 0,
    offline: 0,
    inRoute: 0,
    totalStudents: 0
  });
  
  const [settings, setSettings] = useState<any>({
    notifications: true,
    panicButton: true,
    speedAlerts: false,
    parentAccess: true
  });

  // Modal States
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  const tabs = [
    { id: "dashboard", icon: TrendingUp, label: "Centro de Comando" },
    { id: "students", icon: GraduationCap, label: "Gestão de Alunos" },
    { id: "drivers", icon: Bus, label: "Monitoramento de Frota" },
    { id: "subscription", icon: CreditCard, label: "Faturamento" },
    { id: "settings", icon: Settings, label: "Painel de Controle" },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Students
      const { data: studentsData } = await supabase
        .from('school_students')
        .select('*')
        .eq('client_id', user.id);
      
      const stData = studentsData || [];
      setStudents(stData);

      // 2. Fetch Drivers (Profiles)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('client_id', user.id);

      const drData = profilesData?.map(p => {
        // Simular status baseado no update_at (se < 15min = ativo)
        const lastSeen = new Date(p.updated_at);
        const isOnline = (new Date().getTime() - lastSeen.getTime()) < 900000;
        return {
          ...p,
          name: p.display_name || "Motorista",
          status: isOnline ? 'Ativo' : 'Offline',
          location: p.last_location || { lat: -23.5505 + (Math.random() * 0.01), lng: -46.6333 + (Math.random() * 0.01) }
        };
      }) || [];

      setDrivers(drData);

      // 3. Update Fleet Stats
      setFleetStats({
        active: drData.filter(d => d.status === 'Ativo').length,
        offline: drData.filter(d => d.status === 'Offline').length,
        inRoute: drData.filter(d => d.status === 'Ativo').length, // Simplificado
        totalStudents: stData.length
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Realtime update for location tracking
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-school-navy flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-school-blue" />
      </div>
    );
  }

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const studentData = {
      name: formData.get('name'),
      school: formData.get('school'),
      address: formData.get('address'),
      region: formData.get('region'), // Novo campo
      parent_contact: formData.get('parent_contact'),
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const finalStudentData = { ...studentData, client_id: user.id };

      if (editingStudent) {
        const { error } = await supabase.from('school_students').update(finalStudentData).eq('id', editingStudent.id);
        if (error) throw error;
        toast.success("Dados do aluno atualizados!");
      } else {
        const { error } = await supabase.from('school_students').insert([finalStudentData]);
        if (error) throw error;
        toast.success("Aluno cadastrado com sucesso!");
      }
      setIsStudentModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    }
  };

  // Driver Modal State
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [plateSearch, setPlateSearch] = useState("");
  const [foundDriver, setFoundDriver] = useState<any>(null);
  const [searchingPlate, setSearchingPlate] = useState(false);

  const handlePlateSearch = async (plate: string) => {
    if (plate.length < 3) return;
    setSearchingPlate(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('vehicle_plate', plate.toUpperCase())
        .maybeSingle();
      
      if (data) {
        setFoundDriver(data);
        toast.success("Motorista encontrado: " + (data.display_name || "Sem nome"));
      } else {
        setFoundDriver(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingPlate(false);
    }
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const plate = formData.get('plate') as string;
    const name = formData.get('name') as string;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (foundDriver) {
        // Link existing driver
        const { error } = await supabase
          .from('profiles')
          .update({ client_id: user.id })
          .eq('user_id', foundDriver.user_id);
        if (error) throw error;
        toast.success("Motorista vinculado com sucesso!");
      } else {
        // Create new driver account
        const { data, error } = await supabase.functions.invoke("manage-user-auth", {
          body: { 
            action: "create", 
            email, 
            password,
            autoConfirm: true,
            client_id: user.id 
          }
        });

        if (error || data?.error) throw new Error(error?.message || data?.error);

        if (data?.user?.id) {
           await supabase.from('profiles').update({ 
             display_name: name,
             vehicle_plate: plate.toUpperCase(),
             client_id: user.id 
           }).eq('user_id', data.user.id);
        }
        toast.success("Novo motorista cadastrado e vinculado!");
      }

      setIsDriverModalOpen(false);
      setFoundDriver(null);
      setPlateSearch("");
      fetchData();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  };

  const chartData = [
    { name: "Seg", alunos: 120 },
    { name: "Ter", alunos: 125 },
    { name: "Qua", alunos: 128 },
    { name: "Qui", alunos: 126 },
    { name: "Sex", alunos: 132 },
  ];

  return (
    <div className="min-h-screen bg-school-navy text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-background border-r border-white/5 p-6 space-y-8 z-30">
        <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate("/schoolgo")}>
          <img src={schoolgoLogo} alt="SchoolGo" className="w-24 h-auto" />
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-school-blue text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="pt-20">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut className="w-5 h-5" />
            Sair do Painel
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-12 space-y-12 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-2 h-2 rounded-full bg-school-yellow animate-ping" />
               <h1 className="text-3xl font-black uppercase tracking-tighter">
                 {tabs.find(t => t.id === activeTab)?.label}
               </h1>
            </div>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-60">Operação em Tempo Real • {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === 'students' && (
              <Button 
                onClick={() => { setEditingStudent(null); setIsStudentModalOpen(true); }}
                className="bg-school-blue hover:bg-blue-600 text-white font-black rounded-2xl px-8 h-14 shadow-xl shadow-blue-600/20 transition-all hover:scale-105"
              >
                <UserPlus className="w-5 h-5 mr-2" /> Novo Aluno
              </Button>
            )}
            {activeTab === 'drivers' && (
              <Button 
                onClick={() => setIsDriverModalOpen(true)}
                className="bg-school-yellow hover:bg-yellow-500 text-black font-black rounded-2xl px-8 h-14 shadow-xl shadow-yellow-500/20 transition-all hover:scale-105"
              >
                <Bus className="w-5 h-5 mr-2" /> Vincular Veículo
              </Button>
            )}
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 backdrop-blur-xl">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Status da Assinatura</p>
                <p className="text-xs font-black text-emerald-400">PLANO FROTISTA V3</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Alunos Monitorados", value: fleetStats.totalStudents, icon: GraduationCap, color: "text-school-blue", bg: "bg-school-blue/10" },
                { label: "Frota em Movimento", value: fleetStats.active, icon: Bus, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "Veículos Offline", value: fleetStats.offline, icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
                { label: "Eficiência Operacional", value: "98%", icon: TrendingUp, color: "text-school-yellow", bg: "bg-school-yellow/10" },
              ].map((s, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] group hover:border-school-blue/50 transition-all relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} blur-3xl -mr-12 -mt-12 opacity-50`} />
                  <s.icon className={`w-10 h-10 ${s.color} mb-6 group-hover:scale-110 transition-transform relative z-10`} />
                  <p className="text-4xl font-black mb-1 relative z-10">{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground relative z-10">{s.label}</p>
                </div>
              ))}
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-background border border-white/5 p-8 rounded-[2rem]">
                  <h3 className="text-lg font-bold mb-6">Volume de Alunos / Semana</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                        <XAxis dataKey="name" stroke="#666" fontSize={10} />
                        <Tooltip contentStyle={{backgroundColor: '#000', border: 'none'}} />
                        <Bar dataKey="alunos" fill="#4B6BFB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="bg-school-blue p-8 rounded-[2rem] flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-widest mb-4">Assinatura Ativa</h3>
                    <p className="text-3xl font-black">R$ 249,00<span className="text-sm font-normal opacity-60">/mês</span></p>
                    <p className="text-xs mt-2 opacity-80">Próxima renovação: 12/05/2026</p>
                  </div>
                  <Button className="bg-white text-school-blue font-black rounded-xl mt-6 hover:bg-school-yellow">Gerenciar Plano</Button>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === "students" && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="relative w-full max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                 <Input 
                   placeholder="Buscar por nome, escola ou região..." 
                   className="bg-white/5 border-white/10 pl-12 h-14 rounded-2xl text-sm focus:border-school-blue transition-all"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mr-2">Filtrar por Status:</span>
                  <Button variant="ghost" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5">Em Rota</Button>
                  <Button variant="ghost" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5">Pendente</Button>
               </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-white/5 bg-white/[0.01]">
                      <th className="px-10 py-6 text-left">Identificação do Aluno</th>
                      <th className="px-10 py-6 text-left">Instituição / Escola</th>
                      <th className="px-10 py-6 text-left">Área / Região</th>
                      <th className="px-10 py-6 text-left">Status Operacional</th>
                      <th className="px-10 py-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => 
                      (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                      (s.school?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                      (s.region?.toLowerCase() || "").includes(searchQuery.toLowerCase())
                    ).map((st) => (
                      <tr key={st.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-school-blue/10 border border-school-blue/20 flex items-center justify-center font-black text-school-blue text-sm shadow-inner">
                              {st.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-white group-hover:text-school-blue transition-colors">{st.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">{st.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                           <p className="text-sm font-bold text-white/80">{st.school}</p>
                        </td>
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-school-yellow" />
                              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{st.region || 'Não Definido'}</span>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${st.status === 'Em Rota' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-muted-foreground border-white/10'}`}>
                            {st.status || 'Aguardando'}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button 
                            onClick={() => { setEditingStudent(st); setIsStudentModalOpen(true); }} 
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-school-blue hover:text-white flex items-center justify-center transition-all"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}

        {activeTab === "drivers" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-4 gap-8 h-[700px]">
            <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
               <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Monitoramento em Tempo Real</h3>
                  <div className="flex items-center gap-2 mt-4 p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black uppercase text-emerald-500">{fleetStats.active} Veículos Ativos</span>
                  </div>
               </div>
               <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {drivers.map(d => (
                      <div key={d.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-school-blue/50 cursor-pointer transition-all flex flex-col gap-4 group relative overflow-hidden">
                         <div className={`absolute top-0 right-0 w-16 h-16 ${d.status === 'Ativo' ? 'bg-emerald-500/5' : 'bg-red-500/5'} blur-2xl -mr-8 -mt-8`} />
                         <div className="flex items-center justify-between relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-school-blue/20 transition-all">
                               <Bus className={`w-6 h-6 ${d.status === 'Ativo' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="text-right">
                               <div className="flex items-center gap-2 justify-end">
                                  <div className={`w-1.5 h-1.5 rounded-full ${d.status === 'Ativo' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                  <span className={`text-[8px] font-black uppercase ${d.status === 'Ativo' ? 'text-emerald-500' : 'text-red-500'}`}>{d.status}</span>
                               </div>
                               <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">{d.vehicle_plate || "S/ PLACA"}</p>
                            </div>
                         </div>
                         <div className="relative z-10">
                            <p className="font-black text-white group-hover:text-school-blue transition-colors">{d.name}</p>
                            <div className="flex items-center gap-2 mt-2 opacity-50">
                               <Smartphone className="w-3 h-3" />
                               <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizado via APK</span>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
               </ScrollArea>
            </div>
            <div className="lg:col-span-3 h-full relative">
               <div className="absolute top-8 right-8 z-20 flex flex-col gap-3">
                  <button className="p-4 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl hover:bg-school-blue hover:text-white transition-all text-muted-foreground">
                    <MapPin className="w-5 h-5" />
                  </button>
                  <button className="p-4 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl hover:bg-school-blue hover:text-white transition-all text-muted-foreground">
                    <Users className="w-5 h-5" />
                  </button>
               </div>
               <SchoolMap drivers={drivers} students={students} />
            </div>
          </motion.div>
        )}

        {activeTab === "subscription" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-8">
             {[
               { 
                 title: "Frotista Individual", price: "89", 
                 yes: ["1 Veículo", "Até 20 Alunos", "Monitoramento em Tempo Real", "Histórico de 7 dias"],
                 no: ["Painel Multi-Frota", "Branding Customizado", "Relatórios Geográficos", "Suporte VIP"]
               },
               { 
                 title: "Frotista Business", price: "249", active: true,
                 yes: ["Até 5 Veículos", "Alunos Ilimitados", "Monitoramento em Tempo Real", "Relatórios de Eficiência", "Sincronização APK Direct"],
                 no: ["Gestão de Pátio Digital", "API de Integração"]
               },
               { 
                 title: "Escola Premium", price: "599", 
                 yes: ["Veículos Ilimitados", "Painel da Escola Centralizado", "Roteirização por Densidade", "Treinamento de Condutores", "Suporte 24/7"],
                 no: []
               },
             ].map((plan, i) => (
                <div key={i} className={`p-10 rounded-[3.5rem] border transition-all hover:scale-[1.02] ${plan.active ? 'bg-school-blue border-school-yellow shadow-2xl shadow-blue-600/20' : 'bg-white/[0.02] border-white/5'} relative overflow-hidden group`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${plan.active ? 'bg-white/10' : 'bg-white/5'} blur-3xl -mr-16 -mt-16`} />
                  <h3 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">{plan.title}</h3>
                  <div className="flex items-baseline gap-1 mb-10">
                    <span className="text-sm font-bold opacity-60">R$</span>
                    <span className="text-6xl font-black italic tracking-tighter">{plan.price}</span>
                    <span className="text-sm font-bold opacity-60">/mês</span>
                  </div>
                  
                  <div className="space-y-5 mb-10">
                     {plan.yes.map((f, i) => (
                        <div key={i} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                           <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                           </div>
                           {f}
                        </div>
                     ))}
                     {plan.no.map((f, i) => (
                        <div key={i} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-30">
                           <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                              <AlertCircle className="w-3 h-3" />
                           </div>
                           {f}
                        </div>
                     ))}
                  </div>
                  <Button className={`w-full py-8 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl transition-all ${plan.active ? 'bg-white text-school-blue hover:bg-school-yellow hover:text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                    {plan.active ? 'Plano Operacional' : 'Fazer Upgrade'}
                  </Button>
               </div>
             ))}
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-12 space-y-12">
             <div className="grid gap-8">
                {[
                  { id: 'notifications', title: 'Notificações de Proximidade', desc: 'Alertar pais automaticamente quando o veículo estiver a 500m da residência.' },
                  { id: 'panicButton', title: 'Protocolo de Pânico', desc: 'Habilitar alerta visual imediato no Centro de Comando em caso de emergência.' },
                  { id: 'speedAlerts', title: 'Monitor de Telemetria', desc: 'Notificar gestor sobre excesso de velocidade e frenagens bruscas.' },
                  { id: 'parentAccess', title: 'Portal da Família', desc: 'Permitir que pais vejam a localização do ônibus em tempo real pelo link seguro.' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between group p-6 rounded-[2rem] bg-white/5 hover:bg-white/[0.08] transition-all">
                     <div className="max-w-md">
                        <p className="font-black text-xl mb-1 uppercase italic tracking-tighter">{item.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase tracking-widest opacity-60">{item.desc}</p>
                     </div>
                     <button 
                        onClick={() => setSettings({...settings, [item.id]: !settings[item.id as keyof typeof settings]})}
                        className={`w-16 h-10 rounded-full relative transition-all ${settings[item.id as keyof typeof settings] ? 'bg-school-blue' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1.5 w-7 h-7 bg-white rounded-full transition-all shadow-xl ${settings[item.id as keyof typeof settings] ? 'left-7.5' : 'left-1.5'}`} />
                     </button>
                  </div>
                ))}
             </div>
             <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] text-muted-foreground h-14 px-8 rounded-2xl">Resetar Padrões</Button>
                <Button className="bg-school-blue hover:bg-blue-600 text-white font-black px-12 py-6 h-14 rounded-2xl shadow-xl shadow-blue-600/20">Salvar Alterações</Button>
             </div>
          </motion.div>
        )}
      </main>

      {/* Student Modal */}
      <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
        <DialogContent className="bg-[#0a0f18] border-white/10 text-white rounded-[3rem] max-w-lg p-10 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-school-blue">
               {editingStudent ? 'Atualizar Registro' : 'Cadastrar Aluno'}
            </DialogTitle>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">Preencha os dados operacionais do aluno</p>
          </DialogHeader>
          <form onSubmit={handleSaveStudent} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</label>
                 <Input name="name" defaultValue={editingStudent?.name} required className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-school-blue transition-all" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Instituição de Ensino</label>
                 <Input name="school" defaultValue={editingStudent?.school} required className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-school-blue transition-all" />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Endereço de Embarque / Residência</label>
               <Input name="address" defaultValue={editingStudent?.address} required className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-school-blue transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Região Operacional / Bairro</label>
                 <Input name="region" defaultValue={editingStudent?.region} placeholder="Ex: Zona Norte" required className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-school-blue transition-all" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp Responsável</label>
                 <Input name="parent_contact" defaultValue={editingStudent?.parent_contact} placeholder="(00) 00000-0000" className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-school-blue transition-all" />
               </div>
            </div>
            <DialogFooter className="pt-8">
              <Button type="submit" className="w-full bg-school-blue hover:bg-blue-600 font-black py-8 rounded-[2rem] text-lg uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:scale-[1.02] transition-all">
                {editingStudent ? 'Confirmar Atualização' : 'Finalizar Cadastro'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Driver Modal */}
      <Dialog open={isDriverModalOpen} onOpenChange={setIsDriverModalOpen}>
        <DialogContent className="bg-school-navy border-white/10 text-white rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
               {foundDriver ? 'Vincular Motorista' : 'Novo Motorista'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveDriver} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Placa do Veículo</label>
              <div className="relative">
                 <Input 
                    name="plate" 
                    required 
                    className="bg-white/5 border-white/10 h-12 rounded-xl pr-12 uppercase" 
                    onChange={(e) => {
                       const val = e.target.value.toUpperCase();
                       setPlateSearch(val);
                       if (val.length >= 7) handlePlateSearch(val);
                    }}
                 />
                 {searchingPlate && <Loader2 className="absolute right-4 top-3 w-5 h-5 animate-spin text-school-yellow" />}
              </div>
            </div>

            {foundDriver ? (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-[10px] text-emerald-400 font-black uppercase mb-1">Motorista Encontrado</p>
                  <p className="text-lg font-bold">{foundDriver.display_name || "Usuário do Aplicativo"}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Clique em "Vincular" para adicionar à sua frota.</p>
               </motion.div>
            ) : (
               <>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nome Completo</label>
                    <Input name="name" required className="bg-white/5 border-white/10 h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">E-mail (Login)</label>
                    <Input name="email" type="email" required className="bg-white/5 border-white/10 h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Senha Provisória</label>
                    <Input name="password" type="password" required className="bg-white/5 border-white/10 h-12 rounded-xl" />
                  </div>
                  <div className="p-4 bg-school-blue/10 border border-school-blue/20 rounded-xl">
                     <p className="text-[10px] text-school-blue font-black uppercase">Conta será criada no App</p>
                     <p className="text-[11px] text-muted-foreground mt-1">O motorista poderá logar imediatamente.</p>
                  </div>
               </>
            )}

            <DialogFooter className="pt-4">
              <Button type="submit" className={`w-full font-black py-6 rounded-2xl ${foundDriver ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-school-blue hover:bg-blue-600'}`}>
                {foundDriver ? 'Vincular à Frota' : 'Criar e Vincular'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolGoAdmin;
