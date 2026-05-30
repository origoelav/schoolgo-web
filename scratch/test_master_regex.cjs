const fs = require('fs');

const filePath = 'src/pages/SchoolGoMaster.tsx';
let content = fs.readFileSync(filePath, 'utf8');
const normalizedContent = content.replace(/\r\n/g, '\n');

const regex = /<span\s+key=\{d\.user_id\}\s+className=\{[\s\S]+?\}\s+title=\{[\s\S]+?\}\s*>\s*\{d\.display_name\s*\|\|\s*d\.email\}\s*\(\{d\.vehicle_plate\s*\|\|\s*'s\/ placa'\}\)\s*<\/span>/g;

const matched = regex.test(normalizedContent);
console.log("Matches found:", matched);

if (matched) {
  regex.lastIndex = 0;
  const updatedContent = normalizedContent.replace(regex, `<span 
                                  key={d.user_id} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateExtraDriver(d.user_id, !d.is_extra_driver);
                                  }}
                                  className={\`text-[9px] px-2 py-0.5 rounded border cursor-pointer hover:scale-105 transition-all \${d.is_extra_driver ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'} truncate max-w-full\`}
                                  title={\`Clique para alternar. Atual: \${d.is_extra_driver ? 'Extra' : 'Assinante'}\`}
                                >
                                  {d.display_name || d.email} ({d.vehicle_plate || 's/ placa'}) {d.is_extra_driver ? '(Extra)' : '(Assinante)'}
                                </span>`);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log("Interactive tags updated successfully!");
}
