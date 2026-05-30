const fs = require('fs');

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const normalizedContent = content.replace(/\r\n/g, '\n');

// Target the exact block of status badge inside drivers sidebar card
const targetRegex = /<div className="flex items-center gap-2 justify-end">\s*<div className=\{\`w-1\.5 h-1\.5 rounded-full \$\{d\.status === 'Ativo' \? 'bg-blue-500 animate-pulse' : 'bg-red-500'\}\`\} \/>\s*<span className=\{\`text-\\[8px\\] font-black uppercase \$\{d\.status === 'Ativo' \? 'text-blue-500' : 'text-red-500'\}\`\}>{d\.status}<\/span>\s*<\/div>/g;

const replacement = `<div className="flex items-center gap-2 justify-end">
                                   {d.is_extra_driver ? (
                                     <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">Extra</span>
                                   ) : (
                                     <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Assinante</span>
                                   )}
                                   <div className={\`w-1.5 h-1.5 rounded-full \${d.status === 'Ativo' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}\`} />
                                   <span className={\`text-[8px] font-black uppercase \${d.status === 'Ativo' ? 'text-blue-500' : 'text-red-500'}\`}>{d.status}</span>
                                </div>`;

if (targetRegex.test(normalizedContent)) {
  const updatedContent = normalizedContent.replace(targetRegex, replacement);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log("Sidebar extra/regular badges added successfully!");
} else {
  console.error("Target regex for sidebar status did not match!");
}
