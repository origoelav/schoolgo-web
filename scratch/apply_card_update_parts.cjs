const fs = require('fs');

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Part 1: Remove static license badge from top right of driver card
const part1Target = `                                   {d.is_extra_driver ? (
                                     <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">Extra</span>
                                   ) : (
                                     <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Assinante</span>
                                   )}`;

// We replace it with nothing (just keep the indentation/empty)
const part1Replacement = ``;

// Part 2: Replace "Sincronizado via APK" in bottom left of driver card with the clickable button
const part2Target = `                                 <div className="flex items-center gap-2 opacity-50">
                                    <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Sincronizado via APK</span>
                                 </div>`;

const part2Replacement = `                                 <button
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

const normalizedTarget1 = part1Target.replace(/\r\n/g, '\n');
const normalizedTarget2 = part2Target.replace(/\r\n/g, '\n');
const normalizedContent = content.replace(/\r\n/g, '\n');

let updated = normalizedContent.replace(normalizedTarget1, part1Replacement);
console.log("Part 1 replacement:", normalizedContent.length !== updated.length ? "Success" : "Failed");

const prevLength = updated.length;
updated = updated.replace(normalizedTarget2, part2Replacement);
console.log("Part 2 replacement:", prevLength !== updated.length ? "Success" : "Failed");

if (normalizedContent.length !== updated.length) {
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log("SUCCESS: SchoolGoAdmin.tsx updated!");
} else {
  console.log("FAILED: No replacements were made.");
}
