const fs = require('fs');

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');
const normalizedContent = content.replace(/\r\n/g, '\n');

// Exact target block to replace:
const target = `                             <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2 justify-end">
                                    {d.is_extra_driver ? (
                                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">Extra</span>
                                    ) : (
                                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Assinante</span>
                                    )}
                                    <div className={\`w-1.5 h-1.5 rounded-full \${d.status === 'Ativo' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}\`} />
                                    <span className={\`text-[8px] font-black uppercase \${d.status === 'Ativo' ? 'text-blue-500' : 'text-red-500'}\`}>{d.status}</span>
                                 </div>
                               {d.vehicle_plate ? <PlateBadge plate={d.vehicle_plate} /> : <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">S/ PLACA</p>}
                             </div>
                          </div>
                          <div className="relative z-10 flex flex-col gap-1.5">
                              <p className="font-black text-white group-hover:text-blue-500 transition-colors">{d.name}</p>
                              <div className="flex items-center justify-between gap-2 mt-1">
                                 <div className="flex items-center gap-2 opacity-50">
                                    <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Sincronizado via APK</span>
                                 </div>
                                 <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20 uppercase tracking-wider flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {students.filter(s => s.driver_id === d.user_id || s.tio_perua === d.name).length} Aluno(s)
                                 </span>
                              </div>
                          </div>`;

const replacement = `                             <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2 justify-end">
                                    <div className={\`w-1.5 h-1.5 rounded-full \${d.status === 'Ativo' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}\`} />
                                    <span className={\`text-[8px] font-black uppercase \${d.status === 'Ativo' ? 'text-blue-500' : 'text-red-500'}\`}>{d.status}</span>
                                 </div>
                               {d.vehicle_plate ? <PlateBadge plate={d.vehicle_plate} /> : <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">S/ PLACA</p>}
                             </div>
                          </div>
                          <div className="relative z-10 flex flex-col gap-1.5">
                              <p className="font-black text-white group-hover:text-blue-500 transition-colors">{d.name}</p>
                              <div className="flex items-center justify-between gap-2 mt-1">
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleToggleExtraDriver(d.user_id, !d.is_extra_driver);
                                   }}
                                   className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 \${d.is_extra_driver ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}\`}
                                   title="Clique para alternar tipo de licença"
                                 >
                                   {d.is_extra_driver ? <Zap className="w-3.5 h-3.5 text-orange-400" /> : <Star className="w-3.5 h-3.5 text-emerald-400" />}
                                   {d.is_extra_driver ? 'Extra' : 'Assinante'}
                                 </button>
                                 <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20 uppercase tracking-wider flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {students.filter(s => s.driver_id === d.user_id || s.tio_perua === d.name).length} Aluno(s)
                                 </span>
                              </div>
                          </div>`;

const updated = normalizedContent.replace(target, replacement);
if (normalizedContent.length !== updated.length) {
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log("SUCCESS: SchoolGoAdmin.tsx updated successfully!");
} else {
  console.log("FAILED: Exact target block not found.");
}
