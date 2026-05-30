import * as fs from 'fs';

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      const actualDrivers = drData
        .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      
      setDrivers(actualDrivers);`;

const replacement = `      const actualDrivers = drData
        .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      
      // Auto-correção robusta: Garante que no máximo 2 motoristas fiquem como Assinatura.
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
      });

      setDrivers(healedDrivers);`;

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
