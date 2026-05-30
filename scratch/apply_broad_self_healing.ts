import * as fs from 'fs';

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Substituir o bloco de autocorreção no fetchData
const selfHealingTarget = `      // Auto-correção robusta: Garante que no máximo 2 motoristas fiquem como Assinatura.
      // Qualquer excedente (a partir do 3º) é alterado para Extra automaticamente.
      let standardCount = 0;
      const healedDrivers = actualDrivers.map(d => {
        if (d.role === 'driver' || d.role === 'fleet_admin_driver') {
          if (!d.is_extra_driver) {
            standardCount++;
            if (standardCount > 2) {
              console.log(\`[Self-Healing] Ajustando motorista \${d.name} para EXTRA (excedeu limite de 2 na assinatura)\`);
              supabase.rpc('client_toggle_extra_driver', {
                target_user_id: d.user_id,
                is_extra: true
              }).catch(err => console.error("Erro na auto-correção:", err));
              return { ...d, is_extra_driver: true };
            }
          }
        }
        return d;
      });`;

const selfHealingReplacement = `      // Auto-correção robusta: Garante que no máximo 2 motoristas fiquem como Assinatura.
      // Qualquer excedente (a partir do 3º) é alterado para Extra automaticamente.
      let standardCount = 0;
      const healedDrivers = actualDrivers.map(d => {
        if (!d.is_extra_driver) {
          standardCount++;
          if (standardCount > 2) {
            console.log(\`[Self-Healing] Ajustando motorista \${d.name} para EXTRA (excedeu limite de 2 na assinatura)\`);
            supabase.rpc('client_toggle_extra_driver', {
              target_user_id: d.user_id,
              is_extra: true
            }).catch(err => console.error("Erro na auto-correção:", err));
            return { ...d, is_extra_driver: true };
          }
        }
        return d;
      });`;

// 2. Substituir o activeAssinaturaCount no handleToggleExtraDriver
const toggleCountTarget = `        const activeAssinaturaCount = drivers.filter(
          d => (d.role === 'driver' || d.role === 'fleet_admin_driver') && !d.is_extra_driver && d.user_id !== driverId
        ).length;`;

const toggleCountReplacement = `        const activeAssinaturaCount = drivers.filter(
          d => !d.is_extra_driver && d.user_id !== driverId
        ).length;`;

// 3. Substituir o activeAssinaturaCount no handleSaveDriver (criação)
const saveCountTarget = `        const activeAssinaturaCount = drivers.filter(d => (d.role === 'driver' || d.role === 'fleet_admin_driver') && !d.is_extra_driver).length;`;

const saveCountReplacement = `        const activeAssinaturaCount = drivers.filter(d => !d.is_extra_driver).length;`;

// 4. Substituir o extraDriversCount no cálculo de faturamento
const billingCountTarget = `  const extraDriversCount = drivers.filter(d => (d.role === 'driver' || d.role === 'fleet_admin_driver') && d.is_extra_driver).length;`;

const billingCountReplacement = `  const extraDriversCount = drivers.filter(d => d.is_extra_driver).length;`;

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

replaceBlock(selfHealingTarget, selfHealingReplacement);
replaceBlock(toggleCountTarget, toggleCountReplacement);
replaceBlock(saveCountTarget, saveCountReplacement);
replaceBlock(billingCountTarget, billingCountReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done applying broad self-healing!");
