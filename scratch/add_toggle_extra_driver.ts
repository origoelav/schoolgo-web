import * as fs from 'fs';

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Adicionar o handleToggleExtraDriver no componente
const targetFunction = `  const handleDeleteDriver = async (driverId: string, driverName: string) => {
    const isSelf = session?.user?.id === driverId;
    if (isSelf) {
      toast.error("Você não pode excluir o seu próprio perfil.");
      return;
    }

    if (!confirm(\`Tem certeza que deseja excluir o motorista "\${driverName}"? Ele será removido da sua frota.\`)) return;

    try {
      const { error } = await supabase.rpc('client_delete_driver', {
        target_user_id: driverId
      });

      if (error) throw error;
      toast.success("Motorista excluído com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao excluir motorista: " + error.message);
    }
  };`;

const replacementFunction = `${targetFunction}

  const handleToggleExtraDriver = async (driverId: string, isExtra: boolean, driverName: string) => {
    try {
      const { error } = await supabase.rpc('client_toggle_extra_driver', {
        target_user_id: driverId,
        is_extra: isExtra
      });

      if (error) throw error;
      toast.success(\`Motorista "\${driverName}" configurado como \${isExtra ? 'EXTRA' : 'PADRÃO'} com sucesso!\`);
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao alterar tipo do motorista: " + error.message);
    }
  };`;

// Normaliza quebras de linha para busca
const lfTargetFunction = targetFunction.replace(/\r?\n/g, '\n');
const crlfTargetFunction = targetFunction.replace(/\r?\n/g, '\r\n');

if (content.includes(crlfTargetFunction)) {
  console.log("Found handleDeleteDriver with CRLF! Replacing...");
  content = content.replace(crlfTargetFunction, replacementFunction.replace(/\r?\n/g, '\r\n'));
} else if (content.includes(lfTargetFunction)) {
  console.log("Found handleDeleteDriver with LF! Replacing...");
  content = content.replace(lfTargetFunction, replacementFunction.replace(/\r?\n/g, '\n'));
} else {
  console.log("Could not find handleDeleteDriver function. Trying with flexible regex...");
  const regex = /const\s+handleDeleteDriver\s*=\s*async\s*\([\s\S]*?\}\s*catch\s*\([\s\S]*?\}\s*\};/g;
  if (regex.test(content)) {
    console.log("Matched handleDeleteDriver with regex!");
    content = content.replace(regex, (match) => {
      return `${match}\n\n  const handleToggleExtraDriver = async (driverId: string, isExtra: boolean, driverName: string) => {
    try {
      const { error } = await supabase.rpc('client_toggle_extra_driver', {
        target_user_id: driverId,
        is_extra: isExtra
      });

      if (error) throw error;
      toast.success(\`Motorista "\${driverName}" configurado como \${isExtra ? 'EXTRA' : 'PADRÃO'} com sucesso!\`);
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao alterar tipo do motorista: " + error.message);
    }
  };`;
    });
  } else {
    console.error("Could not find handleDeleteDriver anywhere!");
  }
}

// 2. Adicionar o botão de alternar tipo no JSX do card
const jsxTarget = `                            <div className="relative z-10 border-t border-white/[0.03] pt-2 flex items-center justify-between">
                               <div>
                                  <p className="font-black text-xs text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight">{(d.name?.split('@') || ['SEM NOME'])[0]}</p>
                                  <div className="flex items-center gap-2 mt-1 opacity-30">
                                     <Smartphone className="w-2.5 h-2.5" />
                                     <span className="text-[8px] font-bold uppercase tracking-widest">Sincronizado via APK</span>
                                  </div>
                               </div>`;

const jsxReplacement = `                            <div className="relative z-10 border-t border-white/[0.03] pt-2 flex items-center justify-between">
                               <div>
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
                                  </div>
                               </div>`;

const lfJsxTarget = jsxTarget.replace(/\r?\n/g, '\n');
const crlfJsxTarget = jsxTarget.replace(/\r?\n/g, '\r\n');

if (content.includes(crlfJsxTarget)) {
  console.log("Found JSX target with CRLF! Replacing...");
  content = content.replace(crlfJsxTarget, jsxReplacement.replace(/\r?\n/g, '\r\n'));
} else if (content.includes(lfJsxTarget)) {
  console.log("Found JSX target with LF! Replacing...");
  content = content.replace(lfJsxTarget, jsxReplacement.replace(/\r?\n/g, '\n'));
} else {
  console.log("Could not find JSX target exactly. Trying regex...");
  const jsxRegex = /<div\s+className="relative\s+z-10\s+border-t\s+border-white\/\[0\.03\]\s+pt-2\s+flex\s+items-center\s+justify-between">[\s\S]*?<Smartphone\s+className="w-2\.5\s+h-2\.5"\s*\/>[\s\S]*?<span\s+className="text-\[8px\]\s+font-bold\s+uppercase\s+tracking-widest">Sincronizado\s+via\s+APK<\/span>[\s\S]*?<\/div>[\s\S]*?<\/div>/gi;
  if (jsxRegex.test(content)) {
    console.log("Matched JSX target with regex!");
  } else {
    console.error("Could not find JSX target anywhere!");
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done!");
