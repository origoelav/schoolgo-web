const fs = require('fs');

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
const normalizedContent = content.replace(/\r\n/g, '\n');

const targetRegex = /<div className="relative z-10">\s*<p className="font-black text-white group-hover:text-blue-500 transition-colors">\{d\.name\}<\/p>\s*<div className="flex items-center gap-2 mt-2 opacity-50">\s*<Smartphone className="w-3 h-3" \/>\s*<span className="text-\[10px\] font-bold uppercase tracking-widest">Sincronizado via APK<\/span>\s*<\/div>\s*<\/div>/;

const replacement = `<div className="relative z-10 flex flex-col gap-1.5">
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

if (targetRegex.test(normalizedContent)) {
  const updatedContent = normalizedContent.replace(targetRegex, replacement);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log("Driver card visual block replaced successfully using regex.");
} else {
  console.error("Driver card regex did not match!");
}
