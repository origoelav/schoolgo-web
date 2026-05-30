const fs = require('fs');

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');
const normalizedContent = content.replace(/\r\n/g, '\n');

// 1. Replace getTelemetryStudents
const getTelemetryAnchor = /const getTelemetryStudents = \(\) => \{[\s\S]+?return dbStudents;\s*\};/;

const getTelemetryReplacement = `const getTelemetryStudents = () => {
    if (!selectedDriverTelemetry) return [];
    
    // 1. Get all official/db students assigned to this driver
    const dbStudents = students.filter(s => 
      s.driver_id === selectedDriverTelemetry.user_id || 
      s.tio_perua === selectedDriverTelemetry.name
    );
    
    const normName = (n: string) => (n || '').toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim();
    
    // 2. Build a map of realtime updates
    const rtMap = new Map();
    if (selectedDriverTelemetry.realtimeStudents && Array.isArray(selectedDriverTelemetry.realtimeStudents)) {
      selectedDriverTelemetry.realtimeStudents.forEach((rt) => {
        if (rt.id) rtMap.set(rt.id, rt);
        const nameKey = normName(rt.name);
        if (nameKey) rtMap.set(\`name_\${nameKey}\`, rt);
      });
    }
    
    // 3. Map dbStudents, merging status from realtime if available
    const mergedStudents = dbStudents.map(s => {
      let rtMatch = rtMap.get(s.id);
      if (!rtMatch) {
        const nameKey = normName(s.name);
        rtMatch = rtMap.get(\`name_\${nameKey}\`);
      }
      
      return {
        ...s,
        status: rtMatch?.status || s.status || 'pending'
      };
    });
    
    // 4. If there are students in realtime that are NOT in dbStudents, include them too as fallback
    if (selectedDriverTelemetry.realtimeStudents && Array.isArray(selectedDriverTelemetry.realtimeStudents)) {
      selectedDriverTelemetry.realtimeStudents.forEach((rt) => {
        const alreadyIncluded = mergedStudents.some(s => s.id === rt.id || normName(s.name) === normName(rt.name));
        if (!alreadyIncluded) {
          mergedStudents.push({
            id: rt.id,
            name: rt.name || "Aluno sem cadastro",
            status: rt.status || "pending",
            isOfficial: true
          });
        }
      });
    }
    
    return mergedStudents;
  };`;

let updated = normalizedContent.replace(getTelemetryAnchor, getTelemetryReplacement);
console.log("getTelemetryStudents replacement:", normalizedContent.length !== updated.length ? "Success" : "Failed");

// 2. Replace the driver card rendering in activeTab === "drivers" sidebar
const cardAnchor = /<div key=\{d\.id\} onClick=\{\(\) => \{ \s*setSelectedDriverTelemetry\(d\);\s*setIsTelemetryModalOpen\(true\);\s*\}\} className=\{`p-6 rounded-\[2rem\] bg-\[#151c2c\]\/5 border cursor-pointer transition-all flex flex-col gap-4 group relative overflow-hidden active:scale-95 \${d\.isLockedBilling \? 'border-amber-500\/30 bg-amber-500\/\[0\.02\]' : d\.isPanic \? 'border-red-500 shadow-\[0_0_20px_rgba\(239,68,68,0\.3\)\] animate-pulse' : 'border-white\/5 hover:border-blue-500\/55?'\}`\}>([\s\S]+?)<\/div>\s*<\/div>\s*<\/div>\s*\}\)\}/;

// Let's do a more precise replacement target to avoid regex mismatch.
const cardContentAnchor = /<div className="flex flex-col items-end">\s*<div className="flex items-center gap-2 justify-end">\s*\{d\.is_extra_driver \? \([\s\S]+?Ativo' : 'Offline'\}\}\s*<\/span>\s*<\/div>[\s\S]+?S\/ PLACA'\}\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="relative z-10 flex flex-col gap-1\.5">\s*<p className="font-black text-white group-hover:text-blue-500 transition-colors">\{d\.name\}<\/p>\s*<div className="flex items-center justify-between gap-2 mt-1">\s*<div className="flex items-center gap-2 opacity-52?">\s*<Smartphone className="w-3.5 h-3.5 text-indigo-400" \/>\s*<span className="text-\[10px\] font-bold uppercase tracking-widest text-indigo-300">Sincronizado via APK<\/span>\s*<\/div>/;

const cardContentReplacement = `<div className="flex flex-col items-end">
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
                                 </button>`;

const prevLength = updated.length;
updated = updated.replace(cardContentAnchor, cardContentReplacement);
console.log("card content replacement:", prevLength !== updated.length ? "Success" : "Failed");

fs.writeFileSync(filePath, updated, 'utf8');
console.log("SchoolGoAdmin.tsx updated!");
