import * as fs from 'fs';

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Procurar e substituir o trecho do card do motorista
const targetRegex = /<p\s+className="font-black\s+text-xs\s+text-white\s+group-hover:text-blue-500\s+transition-colors\s+uppercase\s+tracking-tight">\{\(d\.name\?\.split\('@'\)\s+\|\|\s+\['SEM\s+NOME'\]\)\[0\]\}<\/p>\s*<div\s+className="flex\s+items-center\s+gap-2\s+mt-1\s+opacity-30">\s*<Smartphone\s+className="w-2\.5\s+h-2\.5"\s*\/>\s*<span\s+className="text-\[8px\]\s+font-bold\s+uppercase\s+tracking-widest">Sincronizado\s+via\s+APK<\/span>\s*<\/div>/gi;

if (targetRegex.test(content)) {
  console.log("Regex matched! Performing replacement...");
  content = content.replace(targetRegex, (match) => {
    return `<p className="font-black text-xs text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight">{(d.name?.split('@') || ['SEM NOME'])[0]}</p>
                               <div className="flex items-center gap-2 mt-1 opacity-30">
                                  <Smartphone className="w-2.5 h-2.5" />
                                  <span className="text-[8px] font-bold uppercase tracking-widest">Sincronizado via APK</span>
                               </div>
                               {/* Botão de Excluir Motorista */}
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeleteDriver(d.user_id, d.name);
                                 }}
                                 className="absolute bottom-3 right-3 p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all border border-red-500/10 hover:border-red-500 z-20"
                                 title="Excluir Motorista"
                               >
                                 <Trash2 className="w-3.5 h-3.5" />
                               </button>`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replacement successful!");
} else {
  console.log("Regex did not match. Printing a small section to analyze...");
  // Vamos buscar um trecho maior
  const index = content.indexOf('Sincronizado via APK');
  if (index !== -1) {
    console.log("Substring found at index:", index);
    console.log(content.substring(index - 200, index + 200));
  } else {
    console.log("Substring 'Sincronizado via APK' not found at all!");
  }
}
