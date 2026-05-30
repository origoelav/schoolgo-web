import * as fs from 'fs';

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `  const handleDeleteDriver = async (driverId: string, driverName: string) => {
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

const replacement = `  const handleDeleteDriver = async (driverId: string, driverName: string) => {
    const isSelf = session?.user?.id === driverId;
    if (isSelf) {
      toast.error("Você não pode remover o seu próprio perfil da frota.");
      return;
    }

    if (!confirm(\`Tem certeza que deseja desassociar o motorista "\${driverName}"? Ele continuará com a conta ativa no aplicativo dele, mas será removido da sua frota.\`)) return;

    try {
      const { error } = await supabase.rpc('client_delete_driver', {
        target_user_id: driverId
      });

      if (error) throw error;
      toast.success("Motorista removido da frota com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao remover motorista: " + error.message);
    }
  };`;

const lfTarget = target.replace(/\r?\n/g, '\n');
const crlfTarget = target.replace(/\r?\n/g, '\r\n');

if (content.includes(crlfTarget)) {
  content = content.replace(crlfTarget, replacement.replace(/\r?\n/g, '\r\n'));
  console.log("Replaced CRLF!");
} else if (content.includes(lfTarget)) {
  content = content.replace(lfTarget, replacement.replace(/\r?\n/g, '\n'));
  console.log("Replaced LF!");
} else {
  console.error("Could not find target content!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done!");
