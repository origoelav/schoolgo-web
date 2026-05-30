const fs = require('fs');

const filePath = 'src/pages/SchoolGoMaster.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
const normalizedContent = content.replace(/\r\n/g, '\n');

// 1. Make driver tags interactive in Frotistas tab
const tagAnchor = /<span\s+key=\{d\.user_id\}\s+className=\{\`text-\\[9px\\] px-2 py-0.5 rounded border \$\{d\.is_extra_driver \? 'bg-orange-500\/10 border-orange-500\/20 text-orange-400' : 'bg-primary\/10 border-primary\/20 text-primary'\} truncate max-w-full\`\}\s+title=\{\`\$\{d\.display_name \|\| d\.email\} - Placa: \$\{d\.vehicle_plate \|\| 'N\/A'\}\$\{d\.is_extra_driver \? ' \(Extra\)' : ''\}\`\}\s*>\s*\{d\.display_name \|\| d\.email\} \(\{d\.vehicle_plate \|\| 's\/ placa'\}\)\s*<\/span>/g;

const tagReplacement = `<span 
                                  key={d.user_id} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateExtraDriver(d.user_id, !d.is_extra_driver);
                                  }}
                                  className={\`text-[9px] px-2 py-0.5 rounded border cursor-pointer hover:scale-105 transition-all \${d.is_extra_driver ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'} truncate max-w-full\`}
                                  title={\`Clique para alternar. Atual: \${d.is_extra_driver ? 'Extra' : 'Assinante'}\`}
                                >
                                  {d.display_name || d.email} ({d.vehicle_plate || 's/ placa'}) {d.is_extra_driver ? '(Extra)' : '(Assinante)'}
                                </span>`;

let updatedContent = normalizedContent.replace(tagAnchor, tagReplacement);
const tagMatchCount = normalizedContent.length - updatedContent.length;
console.log("Interactive tags replacement result:", tagMatchCount !== 0 ? "Success" : "Failed (No Match)");

// 2. Add badge to Motoristas list view
const listViewAnchor = /<td className="p-4">\s*<div className="flex items-center gap-2">\s*<div className="w-7 h-7 rounded-full bg-primary\/10 flex items-center justify-center">\s*<Smartphone className="w-3.5 h-3.5 text-primary" \/>\s*<\/div>\s*<span className="font-semibold text-white">\{driver\.display_name \|\| 'Motorista'\}<\/span>\s*<\/div>\s*<\/td>/g;

const listViewReplacement = `<td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Smartphone className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-white">{driver.display_name || 'Motorista'}</span>
                                  <span className={\`text-[8px] font-black uppercase max-w-max px-1.5 py-0.5 rounded border mt-0.5 leading-none \${driver.is_extra_driver ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}\`}>
                                    {driver.is_extra_driver ? 'Extra' : 'Assinante'}
                                  </span>
                                </div>
                              </div>
                            </td>`;

const prevContent = updatedContent;
updatedContent = updatedContent.replace(listViewAnchor, listViewReplacement);
console.log("List view badge replacement result:", prevContent.length !== updatedContent.length ? "Success" : "Failed (No Match)");

// 3. Add badge to Motoristas grid card view
const gridCardAnchor = /<p className="font-semibold text-sm text-white truncate tracking-tight w-full">\{driver\.display_name \|\| "Motorista"\}<\/p>\s*<p className="text-\[11px\] text-gray-400 truncate font-normal w-full mb-1">\{driver\.email\}<\/p>/g;

const gridCardReplacement = `<div className="flex items-center gap-1.5 flex-wrap w-full">
                                    <p className="font-semibold text-sm text-white truncate tracking-tight">{driver.display_name || "Motorista"}</p>
                                    <span className={\`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border leading-none \${driver.is_extra_driver ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}\`}>
                                      {driver.is_extra_driver ? 'Extra' : 'Assinante'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-400 truncate font-normal w-full mb-1">{driver.email}</p>`;

const prevContent2 = updatedContent;
updatedContent = updatedContent.replace(gridCardAnchor, gridCardReplacement);
console.log("Grid card badge replacement result:", prevContent2.length !== updatedContent.length ? "Success" : "Failed (No Match)");

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log("SchoolGoMaster.tsx updated successfully!");
