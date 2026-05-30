import * as fs from 'fs';

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Regex para casar o bloco do card do motorista de forma flexível e robusta
const regex = /<div\s+className="relative\s+z-10\s+border-t\s+border-white\/\[0\.03\]\s+pt-2">\s*<p\s+className="font-black\s+text-xs\s+text-white\s+group-hover:text-blue-500\s+transition-colors\s+uppercase\s+tracking-tight">\{\(d\.name\?\.split\('@'\)\s*\|\|\s*\['SEM\s+NOME'\]\)\[0\]\}<\/p>\s*<div\s+className="flex\s+items-center\s+gap-2\s+mt-1\s+opacity-30">\s*<Smartphone\s+className="w-2\.5\s+h-2\.5"\s*\/>\s*<span\s+className="text-\[8px\]\s+font-bold\s+uppercase\s+tracking-widest">Sincronizado\s+via\s+APK<\/span>\s*<\/div>/gi;

if (regex.test(content)) {
  console.log("Matched the JSX card block using regex! Performing replacement...");
  content = content.replace(regex, (match) => {
    return `<div className="relative z-10 border-t border-white/[0.03] pt-2">
                               <p className="font-black text-xs text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight">{(d.name?.split('@') || ['SEM NOME'])[0]}</p>
                                <div className="flex items-center gap-2 mt-1 opacity-30">
                                   <Smartphone className="w-2.5 h-2.5" />
                                   <span className="text-[8px] font-bold uppercase tracking-widest">Sincronizado via APK</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                   <button
                                     onClick={async (e) => {
                                       e.stopPropagation();
                                       await handleToggleExtraDriver(d.user_id, !d.is_extra_driver, d.name);
                                     }}
                                     className={\`text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border transition-all \${
                                       d.is_extra_driver
                                         ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
                                         : 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20'
                                     }\`}
                                     title={d.is_extra_driver ? "Mudar para Motorista Padrão" : "Mudar para Motorista Extra"}
                                   >
                                     {d.is_extra_driver ? "⚡ Extra" : "⭐ Padrão"}
                                   </button>
                                </div>`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("JSX Replacement successful!");
} else {
  console.log("Regex did not match the JSX block.");
}
