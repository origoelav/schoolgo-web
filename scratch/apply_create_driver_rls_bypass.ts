import * as fs from 'fs';

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `        const { error: profileError } = await supabase
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

const replacement = `        const { error: profileError } = await supabase.rpc('client_create_driver_profile', {
          new_user_id: userId,
          new_email: newDriverEmail.trim(),
          new_display_name: newDriverName.trim(),
          new_plate: formatVehiclePlate(plateSearch),
          new_is_extra: isNewDriverExtra
        });`;

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
