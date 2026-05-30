import * as fs from 'fs';

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `        // v3.8: Tentar vincular automaticamente se o e-mail já existir
        const { data: existingProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', (newDriverEmail || '').trim().toLowerCase())
          .maybeSingle();

        if (existingProf) {
          if (existingProf.role === 'master') {
            toast.error("Este usuário possui perfil de Administrador Master e não pode ser vinculado como Motorista. Altere a função dele no painel do Master primeiro.");
            return;
          }
          if (existingProf.role === 'fleet_admin') {
            toast.error("Este usuário possui perfil de Frotista e não pode ser vinculado como Motorista. Altere a função dele no painel do Master primeiro.");
            return;
          }

          const { error: linkErr } = await supabase
            .from('profiles')
            .update({ 
              client_id: effectiveClientId,
              vehicle_plate: formatVehiclePlate(plateSearch)
            })
            .eq('user_id', existingProf.user_id);
          
          if (linkErr) throw linkErr;
          toast.success("Motorista encontrado no App e vinculado à sua frota!");
          setIsDriverModalOpen(false);
          fetchData();
          return;
        }`;

const replacementStr = `        // v3.8: Tentar vincular automaticamente se o e-mail já cadastrado no App existir, bypassando RLS via RPC segura
        const { data: linkedData, error: linkErr } = await supabase.rpc('client_link_existing_driver', {
          driver_email: newDriverEmail.trim().toLowerCase(),
          driver_plate: formatVehiclePlate(plateSearch)
        });

        if (linkErr) {
          toast.error(linkErr.message);
          return;
        }

        if (linkedData && (linkedData as any).length > 0) {
          const driverName = (linkedData as any)[0].linked_display_name || "Motorista";
          toast.success(\`Motorista "\${driverName}" encontrado no App e vinculado à sua frota com sucesso!\`);
          setIsDriverModalOpen(false);
          setFoundDriver(null);
          setPlateSearch("");
          setNewDriverEmail("");
          setNewDriverPassword("");
          setNewDriverName("");
          fetchData();
          return;
        }`;

const lfTarget = targetStr.replace(/\r?\n/g, '\n');
const crlfTarget = targetStr.replace(/\r?\n/g, '\r\n');

if (content.includes(crlfTarget)) {
  content = content.replace(crlfTarget, replacementStr.replace(/\r?\n/g, '\r\n'));
  console.log("Replaced CRLF!");
} else if (content.includes(lfTarget)) {
  content = content.replace(lfTarget, replacementStr.replace(/\r?\n/g, '\n'));
  console.log("Replaced LF!");
} else {
  console.log("Could not find exact block in file. Trying regex...");
  const regex = /\/\/\s*v3\.8:\s*Tentar\s*vincular\s*automaticamente[\s\S]*?fetchData\(\);\s*return;\s*\}/gi;
  if (regex.test(content)) {
    console.log("Matched the block using regex!");
    content = content.replace(regex, replacementStr);
  } else {
    console.error("Could not find the target block anywhere.");
  }
}

fs.writeFileSync(filePath, content, 'utf8');
