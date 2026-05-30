const fs = require('fs');

const filePath = 'src/pages/SchoolGoAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');
const normalizedContent = content.replace(/\r\n/g, '\n');

// 1. Update handleToggleExtraDriver to validate limit of 2 regular drivers
const handleToggleAnchor = /const handleToggleExtraDriver = async \(userId: string, isExtra: boolean\) => \{[\s\S]+?try \{[\s\S]+?const \{ error \} = await supabase[\s\S]+?\.update\(\{ is_extra_driver: isExtra \}\)[\s\S]+?\.eq\('user_id', userId\);[\s\S]+?if \(error\) throw error;[\s\S]+?setDrivers\(prev => prev\.map\(d => d\.user_id === userId \? \{ \.\.\.d, is_extra_driver: isExtra \} : d\)\);[\s\S]+?setSelectedDriverTelemetry\(prev => prev && prev\.user_id === userId \? \{ \.\.\.prev, is_extra_driver: isExtra \} : prev\);[\s\S]+?toast\.success\([\s\S]+?\);[\s\S]+?\} catch \(err: any\) \{[\s\S]+?toast\.error\([\s\S]+?\);[\s\S]+?\}[\s\S]+?\};/;

const handleToggleReplacement = `const handleToggleExtraDriver = async (userId: string, isExtra: boolean) => {
    // 1. Check if user is master
    const isMasterUser = dbProfile?.role === 'master' || ['filipe_origoela@hotmail.com', 'daniel.hp1@hotmail.com', 'dno.gomesps@gmail.com'].includes(dbProfile?.email || '');
    
    if (!isExtra && !isMasterUser) {
      // Count current regular drivers (excluding this one)
      const regularDriversCount = drivers.filter(d => !d.is_extra_driver && d.user_id !== userId).length;
      if (regularDriversCount >= 2) {
        toast.warning("Você atingiu o limite de 2 motoristas padrão inclusos na assinatura. Mude algum motorista ativo para Extra primeiro.");
        return;
      }
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_extra_driver: isExtra })
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Update local state
      setDrivers(prev => prev.map(d => d.user_id === userId ? { ...d, is_extra_driver: isExtra } : d));
      
      // Also update selected telemetry if open
      setSelectedDriverTelemetry(prev => prev && prev.user_id === userId ? { ...prev, is_extra_driver: isExtra } : prev);
      
      toast.success(\`Motorista definido como \${isExtra ? 'Extra' : 'Assinante'} com sucesso!\`);
      
      // Recalculate
      fetchData();
    } catch (err: any) {
      toast.error("Erro ao atualizar status do motorista: " + err.message);
    }
  };`;

let updated = normalizedContent.replace(handleToggleAnchor, handleToggleReplacement);
console.log("handleToggleExtraDriver replacement:", normalizedContent.length !== updated.length ? "Success" : "Failed");

// 2. Update fetchData to calculate isLockedBilling
const fetchDataAnchor = /const drData = allProfiles\.map\(p => \{\s*const tracking = trackingMap\[p\.user_id\];\s*const lastSeen = new Date\(tracking\?.updated_at \|\| p\.updated_at \|\| 0\);\s*const isOnline = \(new Date\(\)\.getTime\(\) - lastSeen\.getTime\(\)\) < 3600000;\s*return \{\s*\.\.\.p,\s*name: p\.display_name \|\| p\.email\?\.split\('@'\)\[0\] \|\| "Motorista",\s*status: isOnline \? 'Ativo' : 'Offline',\s*location: tracking && typeof tracking\.lat === 'number' \? \{ lat: tracking\.lat, lng: tracking\.lng \} : null,\s*isPanic: tracking\?.panic === true,\s*realtimeStudents: tracking\?.students \|\| \[\],\s*scenario: tracking\?.scenario \|\| 'A'\s*\};\s*\}\);/g;

const fetchDataReplacement = `const isMasterUser = profileData?.role === 'master' || ['filipe_origoela@hotmail.com', 'daniel.hp1@hotmail.com', 'dno.gomesps@gmail.com'].includes(profileData?.email || '');

      const driverProfiles = allProfiles.filter(x => x.user_id !== profileData?.user_id);
      
      const regularDrivers = driverProfiles
        .filter(x => !x.is_extra_driver)
        .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        
      const extraDrivers = driverProfiles
        .filter(x => x.is_extra_driver)
        .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

      const drData = allProfiles.map(p => {
        const tracking = trackingMap[p.user_id];
        const lastSeen = new Date(tracking?.updated_at || p.updated_at || 0);
        const isOnline = (new Date().getTime() - lastSeen.getTime()) < 3600000; 
        
        let isLockedBilling = false;
        let billingStatusText = "Ativo";
        
        if (p.user_id === profileData?.user_id) {
          isLockedBilling = false;
        } else if (isMasterUser) {
          isLockedBilling = false;
          billingStatusText = "Master";
        } else {
          const subStatus = profileData?.subscription_status || 'trial';
          const isTrial = subStatus === 'trial';
          const trialExpired = isTrial && profileData?.trial_expires_at && new Date(profileData.trial_expires_at) < new Date();
          
          if (subStatus === 'expired' || subStatus === 'unpaid' || subStatus === 'pending' || subStatus === 'debito' || trialExpired) {
            isLockedBilling = true;
            billingStatusText = "Pendente de Pagamento";
          } else if (subStatus === 'active') {
            if (p.is_extra_driver) {
              const extraIndex = extraDrivers.findIndex(x => x.user_id === p.user_id);
              const licensedExtras = profileData?.licensed_drivers || 0;
              if (extraIndex >= licensedExtras) {
                isLockedBilling = true;
                billingStatusText = "Excedente (Pendente)";
              } else {
                isLockedBilling = false;
                billingStatusText = "Extra Ativo";
              }
            } else {
              const regularIndex = regularDrivers.findIndex(x => x.user_id === p.user_id);
              if (regularIndex >= 2) {
                isLockedBilling = true;
                billingStatusText = "Excedente Assinatura";
              } else {
                isLockedBilling = false;
                billingStatusText = "Incluso";
              }
            }
          }
        }
        
        return {
          ...p,
          name: p.display_name || p.email?.split('@')[0] || "Motorista",
          status: isOnline ? 'Ativo' : 'Offline',
          location: tracking && typeof tracking.lat === 'number' ? { lat: tracking.lat, lng: tracking.lng } : null,
          isPanic: tracking?.panic === true,
          realtimeStudents: tracking?.students || [],
          scenario: tracking?.scenario || 'A',
          isLockedBilling,
          billingStatusText
        };
      });`;

const prevLength = updated.length;
updated = updated.replace(fetchDataAnchor, fetchDataReplacement);
console.log("fetchData replacement:", prevLength !== updated.length ? "Success" : "Failed");

// 3. Update Telemetry Modal dialog to render paywall if locked
const dialogAnchor = /\{selectedDriverTelemetry \? \(\s*<div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">/g;

const dialogReplacement = `{selectedDriverTelemetry ? (
            selectedDriverTelemetry.isLockedBilling ? (
              <div className="flex flex-col items-center justify-center text-center flex-1 space-y-6 max-w-md mx-auto py-12">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
                  <Lock className="w-10 h-10 text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white font-black italic">Veículo Bloqueado</h3>
                  <p className="text-xs font-black uppercase text-amber-500 tracking-wider">Motivo: {selectedDriverTelemetry.billingStatusText || 'Excedente Assinatura'}</p>
                </div>
                <p className="text-xs text-white/60 leading-relaxed font-bold">
                  Este motorista está bloqueado devido ao limite de licenças da sua assinatura ou pendências financeiras. Regularize seu faturamento ou alterne a licença de outro motorista para desbloquear o monitoramento em tempo real.
                </p>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white/70 uppercase">Mudar Licença deste Motorista:</span>
                  <select
                    value={selectedDriverTelemetry.is_extra_driver ? "extra" : "regular"}
                    onChange={(e) => handleToggleExtraDriver(selectedDriverTelemetry.user_id, e.target.value === "extra")}
                    className="bg-[#0e131f] border border-white/[0.05] hover:border-blue-500/30 text-white rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer"
                  >
                    <option value="regular">Assinante</option>
                    <option value="extra">Extra</option>
                  </select>
                </div>

                <div className="flex gap-4 w-full">
                  <Button 
                    onClick={() => {
                      setIsTelemetryModalOpen(false);
                      setActiveTab("subscription");
                      localStorage.setItem("schoolgo_admin_tab", "subscription");
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-6 rounded-2xl shadow-lg shadow-blue-500/20 uppercase tracking-widest text-[10px]"
                  >
                    Gerenciar Assinatura
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => setIsTelemetryModalOpen(false)}
                    className="flex-1 border border-white/10 hover:bg-white/5 text-white font-black py-6 rounded-2xl uppercase tracking-widest text-[10px]"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">`;

const prevLength2 = updated.length;
updated = updated.replace(dialogAnchor, dialogReplacement);
console.log("dialog replacement 1:", prevLength2 !== updated.length ? "Success" : "Failed");

// 4. Since we added a "locked" check that branches the dialog, we need to match the closing part
const dialogClosingAnchor = /<\/div>\s*<\/div>\s*\)\s*:\s*\(\s*<div className="text-center py-12 space-y-4">/g;

const dialogClosingReplacement = `</div>
              </div>
            )
          ) : (
            <div className="text-center py-12 space-y-4">`;

const prevLength3 = updated.length;
updated = updated.replace(dialogClosingAnchor, dialogClosingReplacement);
console.log("dialog replacement 2 (closing):", prevLength3 !== updated.length ? "Success" : "Failed");

fs.writeFileSync(filePath, updated, 'utf8');
console.log("SchoolGoAdmin.tsx updated with billing rules!");
