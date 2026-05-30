const fs = require('fs');

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to avoid regex mismatches
const normalizedContent = content.replace(/\r\n/g, '\n');

// 1. Insert getTelemetryStudents and handleToggleExtraDriver functions
const stateAnchor = '  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);';
const functionsInsertion = `  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);

  const getTelemetryStudents = () => {
    if (!selectedDriverTelemetry) return [];
    const dbStudents = students.filter(s => s.driver_id === selectedDriverTelemetry.user_id || s.tio_perua === selectedDriverTelemetry.name);
    
    if (selectedDriverTelemetry.realtimeStudents && selectedDriverTelemetry.realtimeStudents.length > 0) {
      return selectedDriverTelemetry.realtimeStudents.map((rt: any) => {
        const dbStudent = dbStudents.find(s => s.id === rt.id || s.name === rt.name) || students.find(s => s.id === rt.id || s.name === rt.name);
        if (dbStudent) {
          return {
            ...dbStudent,
            status: rt.status || dbStudent.status
          };
        }
        return {
          id: rt.id,
          name: rt.name || "Aluno sem cadastro",
          status: rt.status || "pending",
          isOfficial: true
        };
      });
    }
    return dbStudents;
  };

  const handleToggleExtraDriver = async (userId: string, isExtra: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_extra_driver: isExtra })
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Update local state
      setDrivers(prev => prev.map(d => d.user_id === userId ? { ...d, is_extra_driver: isExtra } : d));
      
      // Also update selected telemetry if open
      setSelectedDriverTelemetry(prev => prev && prev.user_id === userId ? { ...prev, is_extra_driver: isExtra } : prev);
      
      toast.success(\`Motorista definido como \${isExtra ? 'Extra' : 'Assinante'} com sucesso!\`);
    } catch (err: any) {
      toast.error("Erro ao atualizar status do motorista: " + err.message);
    }
  };`;

let updatedContent = normalizedContent.replace(stateAnchor, functionsInsertion);

// 2. Add extra/regular badges in the sidebar card list
const sidebarStatusAnchor = `<div className="flex items-center gap-2 justify-end">\\s*<div className={\`w-1\\.5 h-1\\.5 rounded-full \${d\\.status === 'Ativo' \\? 'bg-blue-500 animate-pulse' : 'bg-red-500'}\`} />\\s*<span className={\`text-\\[8px\\] font-black uppercase \${d\\.status === 'Ativo' \\? 'text-blue-500' : 'text-red-500'}\`}>{d\\.status}</span>\\s*</div>`;
const sidebarStatusReplacement = `<div className="flex items-center gap-2 justify-end">
                                   {d.is_extra_driver ? (
                                     <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">Extra</span>
                                   ) : (
                                     <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Assinante</span>
                                   )}
                                   <div className={\`w-1.5 h-1.5 rounded-full \${d.status === 'Ativo' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}\`} />
                                   <span className={\`text-[8px] font-black uppercase \${d.status === 'Ativo' ? 'text-blue-500' : 'text-red-500'}\`}>{d.status}</span>
                                </div>`;

const sidebarStatusRegex = new RegExp(sidebarStatusAnchor, 'g');
updatedContent = updatedContent.replace(sidebarStatusRegex, sidebarStatusReplacement);

// 3. Add seletor dropdown to the telemetry modal driver info card
const modalPlateAnchor = `{selectedDriverTelemetry\\.vehicle_plate \\? \\(\\s*<PlateBadge plate={selectedDriverTelemetry\\.vehicle_plate} />\\s*\\) : \\(\\s*<span className="text-xs text-white/40 italic">Placa não cadastrada</span>\\s*\\)}`;
const modalPlateReplacement = `{selectedDriverTelemetry.vehicle_plate ? (
                      <PlateBadge plate={selectedDriverTelemetry.vehicle_plate} />
                    ) : (
                      <span className="text-xs text-white/40 italic">Placa não cadastrada</span>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-wider">Licença:</span>
                      <select
                        value={selectedDriverTelemetry.is_extra_driver ? "extra" : "regular"}
                        onChange={(e) => handleToggleExtraDriver(selectedDriverTelemetry.user_id, e.target.value === "extra")}
                        className="bg-[#0e131f] border border-white/[0.05] hover:border-blue-500/30 text-white rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider outline-none cursor-pointer"
                      >
                        <option value="regular">Assinante</option>
                        <option value="extra">Extra</option>
                      </select>
                    </div>`;

const modalPlateRegex = new RegExp(modalPlateAnchor, 'g');
updatedContent = updatedContent.replace(modalPlateRegex, modalPlateReplacement);

// 4. Update SchoolMap in the telemetry modal to use getTelemetryStudents()
const mapStudentsAnchor = `students={selectedDriverTelemetry\\.realtimeStudents\\?\\.length > 0 \\? selectedDriverTelemetry\\.realtimeStudents : students\\.filter\\(s => s\\.driver_id === selectedDriverTelemetry\\.user_id\\)}`;
const mapStudentsReplacement = `students={getTelemetryStudents()}`;

const mapStudentsRegex = new RegExp(mapStudentsAnchor, 'g');
updatedContent = updatedContent.replace(mapStudentsRegex, mapStudentsReplacement);

// 5. Add textual list of students in the left panel of the telemetry modal (under speed telemetry, above warnings/history)
const speedBlockEndAnchor = `              <div className="flex justify-between text-\\[10px\\] font-black uppercase text-white/40 tracking-wider">\\s*<span>0 km/h</span>\\s*<span className="text-red-500/80">Limite da Via: 60 km/h</span>\\s*<span>120 km/h</span>\\s*</div>\\s*</div>`;
const speedBlockEndReplacement = `              <div className="flex justify-between text-[10px] font-black uppercase text-white/40 tracking-wider">
                <span>0 km/h</span>
                <span className="text-red-500/80">Limite da Via: 60 km/h</span>
                <span>120 km/h</span>
              </div>
            </div>

            {/* Lista de Alunos no Modal */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <p className="font-black text-xs text-white uppercase italic tracking-tight">Alunos da Rota ({getTelemetryStudents().length})</p>
                </div>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {getTelemetryStudents().length > 0 ? (
                  getTelemetryStudents().map((st: any) => {
                    const isCompleted = st.status === 'delivered' || st.status === 'collected';
                    const isAbsent = st.isAbsent || st.status === 'not_delivered';
                    const statusColor = isAbsent ? 'text-red-400 bg-red-500/10 border-red-500/20' : 
                                        isCompleted ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                        'text-blue-400 bg-blue-500/10 border-blue-500/20';
                    const statusLabel = isAbsent ? 'Ausente' : isCompleted ? 'Concluído' : 'Pendente';
                    
                    return (
                      <div key={st.id || st.name} className="flex items-center justify-between p-2.5 bg-black/20 border border-white/5 rounded-xl hover:border-white/10 transition-all text-[11px]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-blue-500 text-[10px] flex-shrink-0">
                            {(st.name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white leading-none truncate">{st.name}</p>
                            <p className="text-[8px] text-white/40 uppercase font-black tracking-wider mt-0.5 truncate">{st.school || 'Sem Escola'}</p>
                          </div>
                        </div>
                        <span className={\`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 \${statusColor}\`}>
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-[9px] text-white/30 font-black uppercase tracking-widest italic">
                    Nenhum aluno vinculado
                  </div>
                )}
              </div>
            </div>`;

const speedBlockEndRegex = new RegExp(speedBlockEndAnchor, 'g');
updatedContent = updatedContent.replace(speedBlockEndRegex, speedBlockEndReplacement);

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log("SchoolGoAdmin.tsx updated successfully!");
