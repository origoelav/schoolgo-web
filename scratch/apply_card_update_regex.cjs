const fs = require('fs');

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<div className="flex items-center gap-2 opacity-50">\s*<Smartphone[\s\S]+?<\/div>/;

const replacement = `<button
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

if (regex.test(content)) {
  const updated = content.replace(regex, replacement);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log("SUCCESS: Regex replaced target successfully!");
} else {
  console.log("FAILED: Regex did not match target.");
}
