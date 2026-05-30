import * as fs from 'fs';

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Substituir o handleToggleExtraDriver
const toggleTarget = `  const handleToggleExtraDriver = async (driverId: string, isExtra: boolean, driverName: string) => {
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

const toggleReplacement = `  const handleToggleExtraDriver = async (driverId: string, isExtra: boolean, driverName: string) => {
    try {
      if (!isExtra) {
        // Valida se já possui 2 ou mais motoristas como Assinatura (excluindo o que está sendo alterado)
        const activeAssinaturaCount = drivers.filter(
          d => (d.role === 'driver' || d.role === 'fleet_admin_driver') && !d.is_extra_driver && d.user_id !== driverId
        ).length;
        
        if (activeAssinaturaCount >= 2) {
          toast.error("Você já possui 2 motoristas na Assinatura. Mude um dos atuais para 'Extra' antes de definir este como 'Assinatura'.");
          return;
        }
      }

      const { error } = await supabase.rpc('client_toggle_extra_driver', {
        target_user_id: driverId,
        is_extra: isExtra
      });

      if (error) throw error;
      toast.success(\`Motorista "\${driverName}" configurado como \${isExtra ? 'EXTRA' : 'ASSINATURA'} com sucesso!\`);
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao alterar tipo do motorista: " + error.message);
    }
  };`;

// 2. Substituir a criação do novo motorista para calcular se é extra automaticamente
const upsertTarget = `        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            email: newDriverEmail.trim(),
            display_name: newDriverName.trim(),
            role: 'driver',
            client_id: user.id,
            vehicle_plate: formatVehiclePlate(plateSearch),
            subscription_status: 'trial',
            trial_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });`;

const upsertReplacement = `        // Calcula se o novo motorista deve entrar como extra
        const activeAssinaturaCount = drivers.filter(d => (d.role === 'driver' || d.role === 'fleet_admin_driver') && !d.is_extra_driver).length;
        const isNewDriverExtra = activeAssinaturaCount >= 2;

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            email: newDriverEmail.trim(),
            display_name: newDriverName.trim(),
            role: 'driver',
            client_id: user.id,
            vehicle_plate: formatVehiclePlate(plateSearch),
            subscription_status: 'trial',
            trial_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            is_extra_driver: isNewDriverExtra
          });`;

// 3. Substituir o cálculo de extraDriversCount
const billingTarget = `  const extraDriversCount = Math.max(0, drivers.filter(d => d.role === 'driver' || d.role === 'fleet_admin_driver').length - 2);`;

const billingReplacement = `  const extraDriversCount = drivers.filter(d => (d.role === 'driver' || d.role === 'fleet_admin_driver') && d.is_extra_driver).length;`;

// 4. Substituir as labels visuais de Padrão para Assinatura
const pillTarget = `                                     title={d.is_extra_driver ? "Mudar para Motorista Padrão" : "Mudar para Motorista Extra"}
                                   >
                                     {d.is_extra_driver ? "⚡ Extra" : "⭐ Padrão"}
                                   </button>`;

const pillReplacement = `                                     title={d.is_extra_driver ? "Mudar para Motorista Assinatura" : "Mudar para Motorista Extra"}
                                   >
                                     {d.is_extra_driver ? "⚡ Extra" : "⭐ Assinatura"}
                                   </button>`;

const replaceBlock = (target: string, replacement: string) => {
  const lfTarget = target.replace(/\r?\n/g, '\n');
  const crlfTarget = target.replace(/\r?\n/g, '\r\n');
  if (content.includes(crlfTarget)) {
    content = content.replace(crlfTarget, replacement.replace(/\r?\n/g, '\r\n'));
    console.log(`Replaced CRLF!`);
  } else if (content.includes(lfTarget)) {
    content = content.replace(lfTarget, replacement.replace(/\r?\n/g, '\n'));
    console.log(`Replaced LF!`);
  } else {
    console.error(`FAILED to find: \n${target.slice(0, 100)}...`);
  }
};

replaceBlock(toggleTarget, toggleReplacement);
replaceBlock(upsertTarget, upsertReplacement);
replaceBlock(billingTarget, billingReplacement);
replaceBlock(pillTarget, pillReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Completed applying changes!");
