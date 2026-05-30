import * as fs from 'fs';

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Substituir o handlePlateSearch
const plateSearchTarget = `  const handlePlateSearch = async (plate: string) => {
    if (plate.length < 3) return;
    setSearchingPlate(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('vehicle_plate', plate.toUpperCase())
        .or(\`client_id.is.null,client_id.eq.\${user.id}\`);
      
      const driver = data && data.length > 0 ? data[0] : null;

      if (driver) {
        setFoundDriver(driver);
        toast.success("Motorista encontrado: " + (driver.display_name || "Sem nome"));
      } else {
        setFoundDriver(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingPlate(false);
    }
  };`;

const plateSearchReplacement = `  const handlePlateSearch = async (plate: string) => {
    if (plate.length < 3) return;
    setSearchingPlate(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('client_search_driver_by_plate', {
        target_plate: plate.toUpperCase()
      });
      
      const driver = data && data.length > 0 ? {
        user_id: data[0].found_user_id,
        display_name: data[0].found_display_name,
        role: data[0].found_role,
        client_id: data[0].found_client_id,
        email: data[0].found_email,
        vehicle_plate: plate.toUpperCase()
      } : null;

      if (driver) {
        setFoundDriver(driver);
        toast.success("Motorista encontrado: " + (driver.display_name || "Sem nome"));
      } else {
        setFoundDriver(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingPlate(false);
    }
  };`;

// 2. Substituir o foundDriver no handleSaveDriver
const saveDriverTarget = `      if (foundDriver) {
        if (foundDriver.role === 'master') {
          toast.error("Este usuário possui perfil de Administrador Master e não pode ser vinculado como Motorista. Altere a função dele no painel do Master primeiro.");
          return;
        }
        if (foundDriver.role === 'fleet_admin') {
          toast.error("Este usuário possui perfil de Frotista e não pode ser vinculado como Motorista. Altere a função dele no painel do Master primeiro.");
          return;
        }

        const { error } = await supabase
          .from('profiles')
          .update({ 
            client_id: effectiveClientId,
            vehicle_plate: formatVehiclePlate(plateSearch)
          })
          .eq('user_id', foundDriver.user_id);
          
        if (error) throw error;
        toast.success("Motorista vinculado com sucesso!");`;

const saveDriverReplacement = `      if (foundDriver) {
        if (foundDriver.role === 'master') {
          toast.error("Este usuário possui perfil de Administrador Master e não pode ser vinculado como Motorista. Altere a função dele no painel do Master primeiro.");
          return;
        }
        if (foundDriver.role === 'fleet_admin') {
          toast.error("Este usuário possui perfil de Frotista e não pode ser vinculado como Motorista. Altere a função dele no painel do Master primeiro.");
          return;
        }

        const { error } = await supabase.rpc('client_link_driver_secure', {
          target_user_id: foundDriver.user_id,
          driver_plate: formatVehiclePlate(plateSearch)
        });
          
        if (error) throw error;
        toast.success("Motorista encontrado no App e vinculado à sua frota!");`;

const lfPlate = plateSearchTarget.replace(/\r?\n/g, '\n');
const crlfPlate = plateSearchTarget.replace(/\r?\n/g, '\r\n');

if (content.includes(crlfPlate)) {
  content = content.replace(crlfPlate, plateSearchReplacement.replace(/\r?\n/g, '\r\n'));
  console.log("Replaced handlePlateSearch with CRLF!");
} else if (content.includes(lfPlate)) {
  content = content.replace(lfPlate, plateSearchReplacement.replace(/\r?\n/g, '\n'));
  console.log("Replaced handlePlateSearch with LF!");
} else {
  console.log("Could not find handlePlateSearch target. Trying flexible replacement...");
}

const lfSave = saveDriverTarget.replace(/\r?\n/g, '\n');
const crlfSave = saveDriverTarget.replace(/\r?\n/g, '\r\n');

if (content.includes(crlfSave)) {
  content = content.replace(crlfSave, saveDriverReplacement.replace(/\r?\n/g, '\r\n'));
  console.log("Replaced saveDriverTarget with CRLF!");
} else if (content.includes(lfSave)) {
  content = content.replace(lfSave, saveDriverReplacement.replace(/\r?\n/g, '\n'));
  console.log("Replaced saveDriverTarget with LF!");
} else {
  console.log("Could not find saveDriverTarget target. Trying flexible replacement...");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done!");
